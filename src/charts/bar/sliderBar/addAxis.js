/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-21 08:56:13
 * @Description: 添加轴线
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-21 08:56:13
 */
import d3 from 'd3'
import xMakr from './images/mark.png'
import { genSVGDocID } from '../../util/util'

export default class AddAxis {

  /**
   * Creates an instance of addAxis
   * @param {object} svg svg容器
   * @param {object} opt 配置项
   * @param {string} filterId 滤镜id
   */
  constructor(svg, opt, filterId) {
    this.config = opt
    this.filterId = filterId
    const { height, itemStyle, yAxis } = this.config // 宽、高
    const { bottom, left, top } = itemStyle.margin
    const { show } = yAxis
    // 获取id
    this.gId = genSVGDocID()
    // 创建X轴g元素
    this.axisXGroup = svg.insert('g','defs')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${left}, ${height - bottom})`)
    // 添加X轴线    
    this.addXAxisRect(this.axisXGroup)  
    // 是否显示Y轴
    if(show) {
      // Y轴g元素
      this.axisYGroup = svg.insert('g','defs')
        .attr('class', 'axis axis-y')
        .attr('transform', `translate(${left}, ${top })`)  

      // 是否显示X轴网格线
      this.isYGridLine = yAxis.gridLine.show
      // Y轴网络线
      if(this.isYGridLine) {
        this.gridYLine = svg.insert('g','defs')
          .attr('class', 'grid-line-y')
      }
    }
    
    // x轴比例尺
    this.xScale = null
    
  }

  /**
   *  渲染x轴小圆点
   *  @param    {array}  data 图表数据
   *  @return   {function}  x轴比例尺
   */
  renderXAxis(data) {
    const self = this
    const { itemStyle, xWidth } = self.config 
    const { left } = itemStyle.margin
    // 创建x轴比例尺
    self.xScale = d3.scale.linear()
      .domain([0, data.length - 1])
      .range([left, xWidth])

    // 添加x轴g元素
    let axisG = this.axisXGroup
    
    // 获取并处理x轴小圆点的update部分  
    let update = axisG.selectAll(`.x-group-${self.gId}`)
      .data(data)
      .call(::self.setXGAttribute)   
      
    // 获取并处理x轴小圆点的enter部分  
    let enter = update.enter().append('g')
    // 添加小圆点  
    enter.append('image')
    // 添加文字  
    enter.append('text')
    /**
     *  处理updata部分
     */
    // 组元素处理
    update.call(::self.setXGAttribute) 
    // 选择小圆点
    update.select('image')
      .call(::self.setXAxisPointAttribute)  
    // 选择文字  
    update.select('text')
      .call(::self.setXtextAttribute)   
    // 获取并处理x轴小圆点的exit部分  
    update.exit().remove()  

    return self.xScale 
  }

  /**
   *  设置x轴g元素样式
   *  @param    {array}  g g元素
   *  @return   {void}
   */
  setXGAttribute(g) {
    g.attr('class', `x-group-${this.gId}`)
  }

  /**
   *  添加x轴小圆点元素
   *  @param    {array}  image image元素
   *  @return   {void}
   */
  setXAxisPointAttribute(image) {
    const { itemStyle, dur } = this.config
    const { width } = itemStyle
    const { left } = itemStyle.margin
    image.attr('xlink:href', xMakr)
      .attr('width', 16)
      .attr('height', 16)
      .attr('x', (d, i) => this.xScale(i) - (16 - width) / 2 - left / 2 )
      .attr('y', -5)
      .attr('opacity', 0)
      .transition()
      .duration(dur)
      .attr('opacity', 1)
  }

  /**
   *  x轴文字属性设置
   *  @param    {array}  text text元素
   *  @return   {void}
   */
  setXtextAttribute(text) {
    const { xText, itemStyle, dur } = this.config
    const { bottom, left } = itemStyle.margin
    text.attr('font-size', xText.fontSize)
      .attr('fill', xText.fill)
      .attr('text-anchor', 'middle')
      .attr('x', (d, i) => this.xScale(i) - left / 2 )
      .attr('y', bottom - 5)
      .text((d) => d.name )
      .attr('opacity', 0)
      .transition()
      .duration(dur)
      .attr('opacity', 1)
  }

  /**
   *  添加x轴的线条
   *  @param    {array}  g g元素
   *  @return   {void}
   */
  addXAxisRect(g) {
    const { xWidth } = this.config
    g.append('rect')
      .attr('width', xWidth)
      .attr('height', 6)
      .attr('rx', 5)  
      .attr('ry', 5) 
      .attr('x', 0)
      .attr('fill', '#172853') 
      .attr('stroke', '#285387')
      .attr('stroke-width', 2)
      .attr('filter', `url(#${this.filterId})`) 
  }

  /**
   *  渲染Y轴
   *  @param    {array}  data 图表数据
   *  @return   {function}  y轴比例尺
   */
  renderYAxis(data) {
    const self = this
    // 获取一系列配置项
    const { xWidth, yHeight } = this.config
    const { ticks, show } = this.config.yAxis
    
    // 定义y轴比例尺
    let yScale = d3.scale.linear()  
      .domain([0, d3.max(data) * 1.1])  
      .range([yHeight, 0])

    if(show) {
      // 定义y轴样式
      let axis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(ticks)

      // 添加y轴g元素
      this.axisYGroup
        .call(::self.setYAxisAttribute, axis)
    }  
 
    // 是否显示网格线
    if(this.isYGridLine && show) {
      // 定义纵轴网格线
      let grid = d3.svg.axis()
        .scale(yScale)
        .tickSize(-xWidth, 0)
        .tickFormat('')
        .orient('left')
        .ticks(ticks)

      // 添加纵轴网格线
      this.gridYLine
        .call(::self.setYGridLineAttribute, grid)
    }
    // 返回主轴比例尺
    return yScale
  }

  /**
   *  设置Y轴属性
   *  @param    {array}  g     g元素
   *  @param    {function}  axis 定义y轴样式的方法
   *  @return   {void}
   */
  setYAxisAttribute(g, axis) {
    const { dur } = this.config
    g.attr('opacity', 0)
      .transition()
      .duration(dur)
      .attr('opacity', 1)
      .call(axis)
  }

  /**
   *  设置Y轴网格线属性
   *  @param    {array}     g     g元素
   *  @param    {function}  grid  定义网格线的方法
   *  @return   {object}    null
   */
  setYGridLineAttribute(g, grid) {  
    const { left, top } = this.config.itemStyle.margin
    g.attr('class', 'grid-line grid-line-y')
      .attr('transform', `translate(${left},  ${top - 5})`)
      .call(grid) 
  }
}
