/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-25 20:53:26
 * @Description: 矩阵柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-25 20:53:26
 */

import d3 from 'd3'
import _ from 'lodash'
import AddAxis from './addAxis'
import { genSVGDocID, isNoData, 
  interpolate, getMousePosition } from '../../util/util'
import { showTips, hideTips } from './tips.js'

export default class MatrixBar {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      dur: 750, // 动画过度时间
      tooltip: {
        show: true
      },
      itemStyle: {
        margin: {
          top: 20,
          right: 60,
          bottom: 40,
          left: 20
        },
        width: 3,
        spacing: 2,
        fillBg: ['#2c75e1', '#2c75e1'],
        fill: ['#2c75e1', '#e953ff'],
        hover: {
          fill: ['#feef00', '#88c6f6']
        }
      },
      yAxis: {
        show: false,
        axisLine: {
          show: false // 轴线
        },
        gridLine: { 
          show: false // 网格线
        },
        pow: 0.5,
        ticks: 5 // 刻度  
      },
      xText: {
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'middle'
      },
      topText: {
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'middle'
      }
    }
  }

  /**
   * Creates an instance of MatrixBar.
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列的id
    this.gId = genSVGDocID()
    this.useId = genSVGDocID()

    const { width, height, itemStyle } = this.config  
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
    // 添加元素,use引用
    this.addElement(defs)
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)  
    // 线性填充
    this.fillLinear = d3.scale.linear()
      .domain([0, 4])
      .range([0, 1])
    // x轴比例尺
    this.xScale = null
    // 定义初始化值
    this.isInit = true
  }

  render(data) {
    const self = this
    const { width, height, yHeight, itemStyle } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    // 获取所有value
    let dataset = []
    data.map((d) => dataset.push(d.value))

    // 最大值
    let max = Math.floor( yHeight / (itemStyle.width * 2 - 2))
    let unit = Math.floor(d3.max(dataset) / max)
    itemStyle.max = max
    itemStyle.unit = unit
    
    // 渲染x轴
    self.xScale = this.addAxis.renderXAxis(data)  
    // 渲染y轴  
    this.addAxis.renderYAxis(dataset) 
    // 渲染数据
    self.renderData(data)
    // 重置初始化值
    this.isInit = false
  }

  /**
   *  渲染数据
   *  @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'value|10-100': 1
   *    }
   *  ]
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderData(data) {
    const self = this
    // 获取update部分
    let update = self.svg.selectAll(`.group-${self.gId}`)
      .data(data)
    // 获取并处理enter部分  
    let enter = update.enter().append('g')  
    // 添加背景  
    enter.append('g').classed('use-bg-group', true)  
    // 添加数据  
    enter.append('g').classed('use-data-group', true)   
    // 添加顶部文字  
    enter.append('text')  

    /**
     *  处理update部分
     */
    // 组元素update 处理
    update.call(::self.setGroupAttribute)
    // 选择背景    
    update.select('.use-bg-group')  
      .call(::self.setDataBgAttribute)
    // 选择数据  
    update.select('.use-data-group')  
      .call(::self.setDataAttribute, data)   
    // 选择顶部文字  
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
    let hoverFill = interpolate(itemStyle.hover.fill)
    let fill = interpolate(itemStyle.fill)
    const { left, top } = itemStyle.margin
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    // 初始化判断  
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(${this.xScale(i) + left }, ${top})`) 
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(${this.xScale(i) + left }, ${top})`) 
    }
    // 是否显示提示框
    if(tooltip.show) {
      g.attr('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, hoverFill)
          // 显示提示框
          showTips(selector, d, getMousePosition())
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, fill)
          // 隐藏提示框  
          hideTips(selector)  
        })
    }  
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {function}  compute 颜色插值
   *  @return   {void}
   */
  mouseEventStyle(i, compute) {
    const group = d3.select(`.group-${this.gId}-${i}`)
    group.select('.use-data-group')
      .selectAll('.use-rect')
      .attr('fill', (d) => compute(this.fillLinear(d)))
  }

  /**
   *  设置数据背景属性
   *  @param    {object}  g g元素
   *  @return   {void}
   */
  setDataBgAttribute(g) {
    const self = this
    const { max, fillBg } = self.config.itemStyle
    let fills = interpolate(fillBg)
    // 获取update部分
    let update = g.attr('class', 'use-bg-group')
      .selectAll('use')
      .data(() => d3.range(0, max))
    // 获取并处理enter部分  
    update.enter().append('use')
    // 处理update部分
    update.call(::self.setUseAttribute, fills)
    // 处理exit部分  
    update.exit().remove()  
  }

  /**
   *  设置数据小矩形的属性
   *  @param    {object}  g    g元素
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  setDataAttribute(g, data) {
    const self = this
    const { unit, fill, max } = self.config.itemStyle
    // 获取并处理update部分
    let update = g.attr('class', 'use-data-group')
      .selectAll('use')
      .data((d, i) => {
        let range = Math.floor(data[i].value / unit)
        if(range > max){
          range = max
        }
        return d3.range(0, range)
      })

    // 处理enter部分 
    update.enter().append('use')
    // 处理update部分
    update.call(::self.setUseAttribute, interpolate(fill))
    // 处理exit部分
    update.exit().remove()  
  }

  /**
   *  设置use的属性
   *  @param    {object}  use  use元素
   *  @param    {function}  fill 颜色插值函数
   *  @return   {void}
   */
  setUseAttribute(use, fill) {
    const self = this
    const { itemStyle, dur, yHeight } = self.config
    const { width: iWidth, spacing } = itemStyle
    use.attr('class', 'use-rect')
      .attr('x', -10) // y的间距i* 单个矩形的2倍-2 (减2是为了间距再小一点) // itemStyle.spacing = 可配置
      .attr('fill', (d) => fill(self.fillLinear(d)))
      .attr('xlink:href', `#${self.useId}`)
    // 初始化属性设置
    this.initSetAttribute(() => use.attr('y', yHeight))
    // 动画过渡设置
    use.transition()
      .duration(dur)
      .attr('y', (d, i) => -i * (iWidth * 2 - spacing) + yHeight - iWidth) 
  }

  /**
   *  设置顶部文字属性
   *  @param    {object}  text text属性
   *  @return   {void}
   */
  setTopTextAttribute(text) {
    const self = this
    const { topText, yHeight, dur } = self.config
    text.attr('class', 'top-text')
      .attr('font-size', topText.fontSize)
      .attr('fill', topText.fill)
      .attr('fill', topText.fill)
      .attr('text-anchor', topText.textAnchor)
    // 初始化属性设置
    this.initSetAttribute(() => text.attr('y', yHeight))
    // 动画过渡设置
    text.transition()
      .duration(dur)
      .attr('y', 0)
      .text((d) => d.value)
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
   *  添加标记点
   *  @param    {object} defs defs元素
   *  @return   {void}
   */
  addElement(defs) {
    const self = this
    const { itemStyle } = self.config
    defs.append('g')
      .attr('id', self.useId)
      .selectAll('rect')
      .data(() => d3.range(0, 4))
      .enter()
      .append('rect')
      .attr('width', itemStyle.width)
      .attr('height', itemStyle.width)
      .attr('x', (d, i) => itemStyle.width + i * 4 )
  }
} 
