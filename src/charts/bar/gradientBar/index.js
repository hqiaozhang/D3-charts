/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-07 09:54:19
 * @Description: 渐变柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-07 09:54:19
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, getMousePosition } from '../../util/util'
import filterHbs from './hbs/filter.hbs'
import { showTips, hideTips } from './tips.js'

export default class GradienBar {
  /**
   * 图表组件默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting() {
    return{
      width: 465,
      height: 400,
      dur: 750,
      itemStyle: {
        fillBg: '#43484d',
        rx: 5,
        ry: 5,
        height: 10,
        min: 10, // 柱子小宽度
        color: ['#9936e8', '#49aefe'],
        // 渐变配置项
        gradient: {
          x1: '30%',
          y1: '0%',
          x2: '100%',
          y2: '0%',
          offset1: '0%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 1
        }, 
        radius: 0, // 条形图两边的半径,
        margin: {
          top: 6,
          right: 70, 
          bottom: 0,
          left: 40
        },
        hover: {
          fillBg: '#3b4046',
          color: ['#ff8a00', '#49aefe']
        }
      },
      tooltip: {
        show: true
      },
      // 左边文字配置项
      leftText: {
        show: true,
        fontSize: 12,
        fill: '#fff',
        textAlign: 'start'
      },
      // 右边文字配置项
      rightText: {
        show: true,
        fontSize: 12,
        fill: '#fff',
        textAlign: 'middle',
        unit: ''
      }
    }
  }

  /**
   * Creates an instance of gradienBar.
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列的id
    this.gId = genSVGDocID()
    this.useId = genSVGDocID()
    // 渐变色ID
    this.gradientId = [genSVGDocID(), genSVGDocID()]
    // 比例尺
    this.xScale = null
    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
    // 创建defs元素  
    const defs = this.svg.append('defs')  
    const { itemStyle } = this.config
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
    // 调用添加数据背景矩形
    this.addElement(defs)
    // 初始化定义
    this.isInit = true
  }
  
  /**
   * 渲染
   *  @example: [
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
    const { width, height, itemStyle } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    const { margin } = itemStyle 
    const dataMaxWidth = width - margin.left - margin.right

    // 取value值用比例尺计算最大值
    let dataset = []
    data.map((d) => dataset.push(d.value))
    // 比例尺
    self.xScale = d3.scale.pow()
      .domain([0, d3.max(dataset)] )
      .range([0, dataMaxWidth])
      .exponent(0.25)

    // 渲染图表数据
    self.renderData(data)
    // 重置初始化的值
    this.isInit = false
  }

  /**
   *  渲染数据
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderData(data) {
    const self = this
    const svg = self.svg
    const { height } = self.config
    // 计算行高
    let lineHeight = height / data.length
    // 获取update部分
    let update = svg.selectAll(`.group-${self.gId}`)
      .data(data)
    // 获取enter部分
    let enter = update.enter().append('g')
    // 添加左边文字
    enter.append('text').classed('left-text', true)
    // 添加矩形背景, use引用
    enter.append('use').classed('data-bg', true)
    // 添加数据部分
    enter.append('rect').classed('rect-data', true)  
    // 添加右边文字部分  
    enter.append('text').classed('right-text', true) 

    /*
      处理update部分
     */
    // 组元素属性设置
    update.call(::self.setGroupAttribute, lineHeight)
    // 选择左边文字部分
    update.select('.left-text')  
      .call(::self.setLeftTextAttribute, data)
    // 选择矩形背景, use引用
    update.select('.data-bg')
      .call(::self.setDataBgAttribute)
    // 选择数据部分
    update.select('.rect-data')  
      .call(::self.setRectAttribute)
    // 选择右边文字部分  
    update.select('.right-text')
      .call(::self.setRightTextAttribute, data) 

    // 获取并处理exit部分
    update.exit().remove()    
  }

  /**
   *  组元素样式设置
   *  @param    {array}   g           g元素
   *  @param    {number}  lineHeight  行高
   *  @return   {void}
   */
  setGroupAttribute(g, lineHeight) {
    const self = this
    const selector = self.selector
    const { itemStyle, tooltip, dur } = this.config
    const { hover } = itemStyle
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    // 初始化判断
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(0, ${lineHeight * i})`)
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(0, ${lineHeight * i})`)
    }
    // 是否显示提示框
    if(tooltip.show) {
      g.style('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, hover.fillBg, self.gradientId[1])
          // 显示提示框  
          showTips(selector, d, getMousePosition())  
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          self.mouseEventStyle(i, itemStyle.fillBg, self.gradientId[0])
          // 隐藏提示框  
          hideTips(selector)  
        })
    }
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {string}  fill    填充色
   *  @param    {string}  gradientFill 渐变填充色
   *  @return   {void}
   */
  mouseEventStyle(i, fill, gradientFill) {
    const group = d3.select(`.group-${this.gId}-${i}`)
    // 选择背景矩形条
    group.select('.data-bg')
      .attr('fill', fill)
    // 选择数据矩形条    
    group.select('.rect-data')
      .attr('fill', `url(#${gradientFill})`)
  }

  /**
   *  数据背景矩形样式设置
   *  @param    {array}   use    use元素
   *  @return   {void}
   */
  setDataBgAttribute(use) {
    const { fillBg } = this.config.itemStyle
    use.attr('xlink:href', `#${this.useId}`)
      .attr('class', 'data-bg')
      .attr('fill', fillBg)
  }

  /**
   *  设置数据矩形的样式
   *  @param {any} rect 表示数据量大小的矩形元素
   *  @return   {void}
   */
  setRectAttribute(rect) {
    const self = this
    const { itemStyle, dur } = self.config
    const { margin } = itemStyle
    let xScale = this.xScale
    rect.attr('x', margin.left)
      .attr('height', itemStyle.height)
      .attr('rx', itemStyle.rx)
      .attr('ry', itemStyle.ry)
      .attr('fill', `url(#${self.gradientId[0]})`)
      .attr('class', 'rect-data')
    // 初始化属性设置
    self.initSetAttribute(() => rect.attr('width', 0))
    // 动画过渡设置
    rect.transition()
      .duration(dur)
      .attr('width', (d) => xScale(d.value) )
  } 

  /**
   *  设置左边文本的样式
   *  @param {array} text 右边文本元素
   *  @param {array} data 数据项
   *  @return   {void}
   */
  setLeftTextAttribute(text, data) {
    const { leftText,dur } = this.config
    const top = this.config.itemStyle.height
    text.attr('class', 'left-text')
      .attr('x', 0)
      .attr('y', top)
      .attr('font-size', leftText.fontSize)
      .attr('fill', leftText.fill)
      .attr('text-anchor', leftText.textAlign)  
    // 初始化属性设置
    this.initSetAttribute(() => text.attr('opacity', 0))
    // 动画过渡设置
    text.transition()
      .duration(dur)
      .attr('opacity', 1)
      .text((d, i) => `${data[i].name}`)
  }   

  /**
   *  设置右边文本的样式
   *  @param {array} text 右边文本元素
   *  @param {array} data 数据项
   *  @return   {void}
   */
  setRightTextAttribute(text, data) {
    const { rightText, width, dur, itemStyle } = this.config
    const { right } = itemStyle.margin
    const top = itemStyle.height
    text.attr('class', 'right-text')
      .attr('y', top)
      .attr('font-size', rightText.fontSize)
      .attr('fill', rightText.fill)
      .attr('text-anchor', rightText.textAlign)
    // 初始化属性设置
    this.initSetAttribute(() => text.attr('x', 0))
    // 动画过渡设置
    text.transition()
      .duration(dur)
      .attr('x', width - right / 2)
      .text((d, i) => `${data[i].value} ${rightText.unit}`)
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
    const { width, itemStyle } = this.config
    const { margin } = itemStyle 
    let dataMaxWidth = width - margin.left - margin.right
    defs.append('rect')
      .attr('width', dataMaxWidth)
      .attr('height', itemStyle.height)
      .attr('rx', itemStyle.rx)
      .attr('ry', itemStyle.ry)
      .attr('x', margin.left)
      .attr('id', this.useId)
  }
}
