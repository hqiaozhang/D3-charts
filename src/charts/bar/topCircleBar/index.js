/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-20 11:45:39
 * @Description: 顶部圆角矩形
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-20 11:45:39
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, getMousePosition } from '../../util/util'
import AddAxis from './addAxis'
import filterHbs from './hbs/filter.hbs'
import { showTips, hideTips } from './tips.js'
 
export default class TopCircleBar {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      dur: 750,
      itemStyle: {
        width: 15,
        margin: {
          top: 20,
          right: 40,
          bottom: 40,
          left: 20
        },
        color: ['#2ccef9', '#09226f'],
        gradient: {
          x1: '0%',
          y1: '0%',
          x2: '0%',
          y2: '100%',
          offset1: '20%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 0.8
        },
        hover: {
          color: ['#1bb7d3', '#1bd390']
        }
      },
      topMarkStyle: {
        fill: '#2ccef9', // #000000
        radius: 7.5, // 矩形s的宽除2，改成5试试
        strokeWidth: 0, // 改成5效果不样哦
        stroke: 'none', // #28d9ff
        hover: {
          stroke: '#1bb7d3',
          fill: '#1bb7d3'
        }
      },
      tooltip: {
        show: true
      },
      topText: {
        show: true,
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'middle'
      },
      yAxis: {
        show: false,
        axisLine: {
          show: true // 轴线
        },
        gridLine: { 
          show: true // 网格线
        },
        ticks: 5 // 刻度  
      },
      xText: {
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'middle'
      }
    }
  }

  /**
   * Creates an instance of triangleBar
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列Id
    this.gId = genSVGDocID()
    this.markId = genSVGDocID()
    this.gradientId = [genSVGDocID(), genSVGDocID()]
    const { width, height, itemStyle } = this.config 
    // 获取margin的值
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 

    // 创建svg元素
    const svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    // 创建defs元素  
    const defs = svg.append('defs')  
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

    this.svg = svg
    // x轴比例尺
    this.xScale = null  
    // y轴比例尺
    this.yScale = null
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)
    // 定义初始化值
    this.isInit = true
  }

  /**
   * 渲染
   * @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'value|10-100': 1
   *    }
   *  ]
   * @param {array} data 渲染组件需要的数据项
   * @return   {void}
   */
  render(data) {
    const self = this
    const { width, height, xWidth } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    self.config.datalen = data.length
    self.config.unit = xWidth / data.length

    // 获取所有value
    let dataset = []
    data.map((d) => dataset.push(d.value))

    // 渲染x轴
    self.xScale = this.addAxis.renderXAxis(data)  
    // 渲染y轴  
    self.yScale = this.addAxis.renderYAxis(dataset) 
    // 渲染多边形
    self.renderData(data)
    // 重置初始化值
    this.isInit = false
 
  }

  renderData(data) {
    const self = this
    const svg = self.svg
    // 获取update部分
    let update = svg.selectAll(`.group-${self.gId}`)
      .data(data)
    /**
     *  获取并处理enter部分
     */
    let enter = update.enter().append('g')    
    // 添加矩形数据 
    enter.append('rect')
    // 添加顶部小圆点
    enter.append('circle')
    // 添加顶部文字  
    enter.append('text')
    /**
     *  处理update部分
     */
    // 组元素update部分处理
    update.call(::self.setGroupAttribute)
    // 选择数据矩形
    update.select('rect')
      .call(::self.setRectAttribute)
    // 添加图片  
    update.select('circle')
      .call(::self.setTopMarkAttribute)  
    // 添加顶部文字  
    update.select('text')
      .call(::self.setTopTextAttribute) 
        
    // 获取并处exit部分  
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
    const { itemStyle, tooltip, topMarkStyle, dur } = self.config
    const { top, left } = itemStyle.margin
    let { hover } = topMarkStyle
    hover.radius = topMarkStyle.radius
    let transX = left - itemStyle.width / 2
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    // 初始化判断
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(${transX + self.xScale(i)}, ${top})`)
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(${transX + self.xScale(i)}, ${top})`)
    }
      
    // 是否显示提示框
    if(tooltip.show) {
      g.attr('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, 1, hover)
          // 显示提示框
          showTips(selector, d, getMousePosition())
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, 2, topMarkStyle)
          // 隐藏提示框  
          hideTips(selector)
        })
    }
  }

  /**
   *  鼠标事件图表样式设置
   *  @param    {number}  i 当前下标
   *  @param    {object}  type 鼠标事件类型
   *  @param    {object}  opt   样式配置项
   *  @return   {void}  
   */
  mouseEventStyle(i, type, opt) {
    const { width } = this.config.itemStyle
    // 选择当前g元素
    const group = d3.select(`.group-${this.gId}-${i}`)
    // 顶部小圆点
    group.select('.top-mark') 
      .attr('fill', opt.fill) 
      .attr('stroke', opt.stroke)
      .attr('r', `${type === 1 ? opt.radius : opt.radius + 1}`)
      .transition()
      .duration(200)
      .attr('r', `${type === 1 ? opt.radius + 1 : opt.radius}`)
    group.select('.rect-data')
      .attr('fill', `url(#${type === 1 ? this.gradientId[1] : this.gradientId[0]})`)
      .attr('width', `${type === 1 ? width : width + 2}`)
      .transition()
      .duration(200)
      .attr('x', `${type === 1 ? -1 : 0}`)
      .attr('width', `${type === 1 ? width + 2 : width }`)
  }

  /**
   *  设置多边形(rect)属性
   *  @param    {array}  rect rect元素
   *  @return   {void}  
   */
  setRectAttribute(rect) {
    const self = this
    const { yHeight, itemStyle, dur } = self.config
    rect.attr('class', 'rect-data')
      .attr('fill', `url(#${self.gradientId[0]})`)
      .attr('width', itemStyle.width)
    // 初始化属性设置
    this.initSetAttribute(() => {
      rect.attr('height', 0)
        .attr('y', yHeight)
    })
    // 动画过渡设置  
    rect.transition()
      .duration(dur)
      .attr('height', (d) => - (this.yScale(d.value) - yHeight))
      .attr('y', (d) => this.yScale(d.value))
  }

  /**
   *  设置顶部小圆点属性
   *  @param    {array}  circle circle元素
   *  @return   {void}
   */
  setTopMarkAttribute(circle) {
    const self = this
    const { yHeight, dur, itemStyle, topMarkStyle } = self.config
    const { strokeWidth, radius, stroke, fill } = topMarkStyle
    circle.attr('class', 'top-mark')
      .attr('stroke-width', strokeWidth)
      .attr('stroke', stroke)
      .attr('r', radius)
      .attr('fill', fill)
      .attr('cx', itemStyle.width / 2)
    // 初始化属性设置
    this.initSetAttribute(() =>{
      circle.attr('opacity', 0)
        .attr('cy', yHeight)
    })
    // 动画过渡设置  
    circle.transition()
      .duration(dur)
      .attr('cy', (d) => self.yScale(d.value))
      .attr('opacity', 1)
  }

  /**
   *  设置X轴text属性
   *  @param    {array}  text text属性
   *  @return   {void}
   */
  setTopTextAttribute(text) {
    const self = this
    const { yHeight, topText, dur, itemStyle } = self.config
    text.attr('class', 'top-text')
      .attr('font-size', topText.fontSize)
      .attr('fill', topText.fill)
      .attr('text-anchor', topText.textAnchor)
      .attr('x', itemStyle.width / 2)
      .text((d) => d.value )
    // 初始化属性设置
    this.initSetAttribute(() =>{
      text.attr('y', yHeight)
    })
    // 动画过渡设置
    text.transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d.value) - 16)
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
    const { strokeWidth, radius, stroke } = self.config.topMarkStyle
    defs.append('circle')
      .attr('id', self.markId)
      .attr('stroke-width', strokeWidth)
      .attr('stroke', stroke)
      .attr('r', radius)
  }
}
