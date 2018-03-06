/**
 * @Author:      zhanghq
 * @DateTime:    2017-10-06 15:47:15
 * @Description: 带箭头的柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-10-06 15:47:15
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, getMousePosition } from '../../util/util'
import AddAxis from './addAxis'
import filterHbs from './hbs/filter.hbs'
import { showTips, hideTips } from './tips.js'

export default class ArrowBar {

  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return {
      width: 700,
      height: 300,
      dur: 750, // 动画过度时间
      tooltip: { // 是否需要提示框
        show: true
      },
      itemStyle: {
        margin: {
          top: 20,
          right: 60,
          bottom: 40,
          left: 60
        },
        width: 8,
        radius: 5,
        bgFill: '#bdbfc5',
        color: ['#00d2ff', '#0048ff'],
        gradient: {
          x1: '0%',
          y1: '0%',
          x2: '0%',
          y2: '100%',
          offset1: '20%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 1
        },
        hover: {
          color: ['#03a9ff', '#4c11c4']
        }
      },
      topMark: {
        fill: '#ebeef1'
      },
      yAxis: {
        axisLine: {
          show: true // 轴线
        },
        gridLine: { 
          show: true // 网格线
        },
        pow: 0.5,
        ticks: 5 // 刻度  
      },
      xText: {
        fontSize: 16,
        fill: '#000',
        textAnchor: 'middle'
      },
      xItemStyle: {
        width: 50,
        height: 18,
        fill: '#ebeef1'
      },
      topText: {
        fontSize: 16,
        fill: '#8cffff'
      }
    }
  }
  /**
   * Creates an instance of arrowBar
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector

    this.gId = genSVGDocID()
    this.useId1 = genSVGDocID()
    this.useId2 = genSVGDocID()
    this.gradientId = [genSVGDocID(), genSVGDocID()]
    const { width, height, itemStyle } = this.config // 宽、高
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 

    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    const defs = this.svg.append('defs')  
    // 渐变配置项
    let gradientCfg = {
      stopColor: itemStyle.color[0],
      endColor: itemStyle.color[1],
      gradient: itemStyle.gradient,
      id: this.gradientId[0]
    }
    // hover事件配置项
    const { hover } = itemStyle
    let hoverCfg = {
      stopColor: hover.color[0],
      endColor: hover.color[1],
      gradient: itemStyle.gradient,
      id: this.gradientId[1]
    }
    defs.html(filterHbs({
      config: [gradientCfg, hoverCfg]
    })) 
    this.addElement(defs) 
    // y轴比例尺
    this.yScale = null
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)  
    // 定义初始化值
    this.isInit = true
  }

  render(data) {
    const self = this
    const { width, height } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    // 渲染x轴
    self.xScale = this.addAxis.renderXAxis(data)
    // 获取所有value 用于渲染y轴
    let dataset = []
    data.map((d) => dataset.push(d.value))  
    // 渲染y轴
    self.yScale = this.addAxis.renderYAxis(dataset)
    self.renderData(data)
    // 重置初始化值
    this.isInit = false
  }

  /**
   *  渲染数据
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderData(data) {
    const self = this
    // 获取update部分  
    let update = this.svg.selectAll(`.group-${self.gId}`)
      .data(data)

    // 获取并处理enter部分  
    let enter = update.enter()
      .append('g')
    // 添加矩形背景
    enter.append('use').classed('data-bg', true)
    // 添加数据矩形  
    enter.append('rect')
    // 添加顶部小三角  
    enter.append('use').classed('top-mark', true) 
    // 添加顶部文字
    enter.append('text')

    // 处理update部分
    // 处理group update部分
    update.call(::self.setGroupAttribute) 
    // 添加矩形背景
    update.select('.data-bg')  
      .call(::self.setDataBgAttribute) 
    // 添加数据矩形  
    update.select('rect')
      .call(::self.setRectAttribute)
    // 添加顶部小三角  
    update.select('.top-mark')  
      .call(::self.setTopMarkAttribute)   
    // 添加顶部文字
    update.select('text')
      .call(::self.setTopTextAttribute)  

    // 获取并处理exit部分
    update.exit().remove()      
  }

  /**
   *  设置数据g元素属性
   *  @param    {array}  g  g元素
   *  @return   {void}
   */
  setGroupAttribute(g) {
    const self = this
    const selector = self.selector
    const { itemStyle, tooltip, dur } = self.config
    const { left, top } = itemStyle.margin
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(${this.xScale(i) + left }, ${top})`) 
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(${this.xScale(i) + left }, ${top})`) 
    }
    // 是否显示提示框
    if(tooltip.show){
      g.style('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, self.gradientId[1])
          // 显示提示框  
          showTips(selector, d, getMousePosition())  
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, self.gradientId[0])
          // 隐藏提示框  
          hideTips(selector)  
        })

    }  
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {object}  fill 样式填充
   *  @return   {void}
   */
  mouseEventStyle(i, fill) {
    const group = d3.select(`.group-${this.gId}-${i}`)
    // 选择数据矩形条    
    group.select('.rect-data')
      .attr('fill', `url(#${fill})`)
  }

  /**
   *  背景属性设置
   *  @param    {object}  use use元素
   *  @return   {void}
   */
  setDataBgAttribute(use) {
    use.attr('xlink:href', `#${this.useId1}`)
      .attr('y', 0)
      .attr('class', 'data-bg')
  }

  /**
   *  矩形属性设置
   *  @param    {object}  rect rect元素
   *  @return   {void}
   */
  setRectAttribute(rect) {
    const self = this
    const { yHeight, itemStyle, dur } = self.config
    rect.attr('class', 'rect-data')
      .attr('width', itemStyle.width)
      .attr('fill', `url(#${self.gradientId[0]})`)
    // 初始化属性设置
    this.initSetAttribute(() =>{
      rect.attr('y', yHeight)
        .attr('height', 0)
    }) 
    // 动画过渡设置 
    rect.transition()
      .duration(dur)
      .attr('height', (d) => yHeight - this.yScale(d.value))
      .attr('y', (d) => this.yScale(d.value))
  }

  /**
   *  设置顶部矩形属性
   *  @param    {use}  use use元素
   *  @return   {void}
   */
  setTopMarkAttribute(use) {
    const { dur, itemStyle, yHeight } = this.config
    use.attr('class', 'top-mark')
      .attr('x', -itemStyle.width / 2)
      .attr('xlink:href', `#${this.useId2}`)
    // 初始化属性设置
    this.initSetAttribute(() => use.attr('y', yHeight))
    // 动画过渡设置
    use.transition()
      .duration(dur)
      .attr('y', (d) => this.yScale(d.value) - 5)
  }

  /**
   *  设置顶部文字属性
   *  @param    {array}  text text元素
   *  @return   {void}
   */
  setTopTextAttribute(text) {
    const { yHeight, topText, dur } = this.config
    text.attr('class', 'top-text')
      .attr('font-size', topText.fontSize)
      .attr('text-anchor', 'middle')
      .attr('fill', topText.fill)
      .attr('x', 2)
    // 初始化属性设置
    this.initSetAttribute(() => text.attr('y', yHeight))
    // 动画过渡设置
    text.transition()
      .duration(dur)
      .attr('y', (d) => this.yScale(d.value) - 10)
      .text((d) => d.value )
  }

  /**
   * 初始化的属性设置 
   * @param {function} fn 初始化的属性设置 
   * @return   {void}
   */
  initSetAttribute(fn) {
    this.isInit ? fn() : ''
  }

  /**
   *  添加元素
   *  @param    {object}  defs defs元素
   *  @return   {void}
   */
  addElement(defs) {
    const self = this
    const { yHeight, itemStyle, topMark } = self.config
    const { bgFill, width, radius } = itemStyle
    // 添加背景柱子
    defs.append('rect')
      .attr('width', width / 2)
      .attr('height', yHeight)
      .attr('x', width / 4)
      .attr('fill', bgFill)
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('id', self.useId1)

    // 添加顶部三角形
    defs.append('path')
      .attr('d', 'M5.000,7.999 L0.001,0.001 L9.999,0.001 L5.000,7.999')
      .attr('fill', topMark.fill)
      .attr('id', self.useId2) 
      .attr('transform', 'scale(1.5)') 
  }
}
