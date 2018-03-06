/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-22 11:50:40
 * @Description: 柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-22 11:50:40
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID } from '../../util/util'

const gId = genSVGDocID()

export default class BarChart {
  /**
   * Creates an instance of areaChart
   * @param {object} svg svg容器
   * @param {object} opt 图表组件配置项
   */
  constructor(svg, opt) {
    // 获取配置项
    this.config = _.merge({}, this.defaultSetting, opt)
    // 是否显示柱子,创建g元素
    this.barGroup = svg.insert('g','defs')
      .attr('class', 'bar-group')
    // x轴比例尺
    this.xScale = null
    // y轴比例尺
    this.yScale = null
    // 初始化值定义
    this.isInit = true
  }

  render(data, xScale, yScale) {
    const self = this
    const { type } = self.config.itemStyle.barStyle
    // x轴比例尺
    self.xScale = xScale
    // y轴比例尺
    self.yScale = yScale
    // 两种柱子形状(柱子，小圆点)
    type === 'rect' ? self.renderData1(data) : self.renderData2(data)
    // 重置初始化值
    this.isInit = false
  }

  /**
   *  渲染数据(样式为矩形)
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderData1(data) {
    const self = this
    const { textShow } = self.config.itemStyle.barStyle
    // 获取并处理update部分
    let update = this.barGroup.selectAll(`.group-${gId}`)
      .data(data)
      .call(::self.setGroupAttribute)
    // 获取并处理enter部分  
    let g = update.enter()
      .append('g')
      .call(::self.setGroupAttribute)
    // 添加数据柱子  
    g.append('rect')
      .call(::self.setRectAttribute)
    // 选择数据柱子  
    update.select('.rect-data')
      .call(::self.setRectAttribute)    
    // 是否显示底部文字  
    if(textShow){
      // 添加top文字
      g.append('text')  
        .call(::self.setTopTextAttribute)
      // 选择top文字  
      update.select('.top-text')  
        .call(::self.setTopTextAttribute)    
    } 
    // 处理exit部分  
    update.exit().remove()  
  }

  /**
   *  渲染数据(样式为小圆点)
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderData2(data) {
    const self = this
    const { yHeight, itemStyle } = self.config
    const { r, textShow } = itemStyle.barStyle
    let update = self.barGroup.selectAll(`.group-${gId}`)
      .data(data)
      .call(::self.setGroupAttribute)
    let g = update.enter()
      .append('g')
      .call(::self.setGroupAttribute)
    const max = yHeight / r * 2
    let total = 0
    data.map((d) => {
      total += d
    })
    let nums = []
    for(let i = 0, len = data.length; i < len; i++) {
      let num = Math.floor(max * (data[i] / total )) 
      nums.push(num)
    }

    // 获取并处理小圆点的update
    let update2 = g.selectAll('.circle-data')  
      .data((d, i) => d3.range(0, nums[i]))
    // 获取并处理小圆点的enter
    update2.enter().append('circle')
      .call(::self.setCircleAttribute)
    // 获取并处理小圆点的exit()部分    
    update2.exit().remove()  
    // 是否显示底部文字  
    if(textShow){
      // 添加top文字
      g.append('text')  
        .call(::self.setTopTextAttribute)
      // 选择top文字  
      update.select('.top-text')  
        .call(::self.setTopTextAttribute)    
    } 
    // 获取并处理exit()部分  
    update.exit().remove()  
  }

  /**
   *  设置矩形的属性
   *  @param    {object}  rect rect元素
   *  @return   {void}
   */
  setRectAttribute(rect) {
    const self = this
    const { yHeight, dur, itemStyle } = self.config
    const { fill, width } = itemStyle.barStyle
    rect.attr('class', 'rect-data')
      .attr('x', 0)
      .attr('fill', fill)
      .attr('width', width)
      // 初始化属性设置  
    this.initSetAttribute(() => {
      rect.attr('y', yHeight)
        .attr('height', 0)
    })
    // 动画过渡设置
    rect.transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d))
      .attr('height', (d) => yHeight - self.yScale(d))
  }

  /**
   *  设置圆点的属性
   *  @param    {object}  circle circle元素
   *  @return   {void}
   */
  setCircleAttribute(circle) {
    const self = this
    const { yHeight, dur, itemStyle } = self.config
    const { r } = itemStyle.barStyle
    const fill = self.colorFill()

    circle.attr('calss', 'circle-data')
      .attr('fill', (d) => fill(d))
      .attr('r', r)
      .attr('cx', r * 2)
      
    // 初始化属性设置  
    this.initSetAttribute(() => circle.attr('y', yHeight))
    // 动画过渡设置
    circle.transition()
      .duration(dur)
      .attr('cy', (d, i) => yHeight - r * 2 * i - r )
  }

  /**
   *  设置顶部文字属性
   *  @param    {object}  text text元素
   *  @return   {void}
   */
  setTopTextAttribute(text) {
    const self = this
    const { yHeight, dur } = self.config
    text.attr('class', 'top-text')
      .attr('font-size', 16)
      .attr('fill', '#fff')
      .attr('text-anchor', 'start')
    // 初始化属性设置  
    this.initSetAttribute(() => text.attr('y', yHeight))
    // 动画过渡设置
    text.transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d) )
      .text((d) => d )
  }

  /**
   *  设置g元素属性
   *  @param    {object}  g g元素
   *  @return   {void}
   */
  setGroupAttribute(g) {
    const { top, left } = this.config.itemStyle.margin
    const barW = this.config.itemStyle.barStyle.width
    // translate x = x比例尺的值 + 离左边的距离 - 柱子的宽度的一半
    g.attr('class', `group-${gId}`)
      .attr('transform', (d, i) => `translate(${this.xScale(i) + left - barW / 2 },${top})`)
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
   *  渐变色填充
   *  @param    {array}  color 填充色
   */
  colorFill() {
    let a = d3.hcl('#f7b830')    
    let b = d3.hcl('#cc39d2')    
    return d3.interpolate(a, b)
  }
}
