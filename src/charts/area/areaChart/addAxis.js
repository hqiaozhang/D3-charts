/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-21 08:56:13
 * @Description: 添加轴线
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-21 08:56:13
 */
import d3 from 'd3'

export default class AddAxis {
  /**
   * Creates an instance of addAxis
   * @param {object} svg svg容器
   * @param {object} opt 配置项
   * @return   {void}
   */
  constructor(svg, opt) {
    this.config = opt
    // 创建X轴g元素
    const { height, itemStyle, xAxis, yAxis } = this.config // 宽、高
    const { bottom, top, left } = itemStyle.margin
    // X轴g元素
    this.axisXGroup = svg.insert('g','defs')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${yAxis.left + left}, ${height - bottom})`)
    // X轴线    
    this.axisXLine = this.axisXGroup.append('path')

    // 是否显示X轴网格线
    this.isXGridLine = xAxis.gridLine.show
    if(this.isXGridLine) {
      this.gridXLine = svg.insert('g','defs')
        .attr('class', 'grid-line-x')
    }

    // Y轴g元素
    this.axisYGroup = svg.insert('g','defs')
      .attr('class', 'axis axis-y')
      .attr('transform', `translate(${yAxis.left}, ${top})`)

    // 是否显示X轴网格线
    this.isYGridLine = yAxis.gridLine.show
    if(this.isYGridLine) {
      this.gridYLine = svg.insert('g','defs')
        .attr('class', 'grid-line-y')
    }  

    // x轴比例尺
    this.xScale = null
  }

  /**
   *  渲染x轴
   *  @param    {array}     data 图表数据
   *  @return   {function}  x轴比例尺
   */
  renderXAxis(data) {
    const self = this
    const { xWidth, yHeight, dataLen, xAxis } = self.config // 宽、高
    const { left, right } = self.config.itemStyle.margin

    // 创建x轴比例尺
    self.xScale = d3.scale.linear()
      .domain([0, data.length - 1])
      .range([0, xWidth - right - left])

    // 如果面积图要紧挨着y轴, 将range改为[0, xWidth - right]  

    // 添加x轴g元素
    const axisG = this.axisXGroup
    const { show } = xAxis.axisLine
    if(show){
      self.axisXLine.attr('d', `M0, 0V0H${xWidth + left / 2}V0`) 
    }

    // 获取并处理update部分
    let update = axisG.selectAll('text')
      .data(data)
    // 获取enter部分  
    update.enter().append('text')
      
    // 处理update部分
    update.call(::self.setXAxisTextAttribute) 
    // 获取并处理exit部分    
    update.exit().remove()  

    // 是否显示网格线
    if(this.isXGridLine) {
      // 定义纵轴网格线
      let grid = d3.svg.axis()
        .scale(self.xScale)
        .tickSize(-yHeight, 0)
        .tickFormat('')
        .orient('bottom')
        .ticks(dataLen - 1)
      // 添加纵轴网格线
      this.gridXLine
        .call(::self.setXGridLineAttribute, grid)
    } 
    // 返回比例尺
    return self.xScale
  }

  /**
   *  设置X轴text属性
   *  @param    {array}  text text属性
   *  @return   {void}
   */
  setXAxisTextAttribute(text) {
    const self = this 
    const { xText, dur, itemStyle } = self.config
    const { bottom } = itemStyle.margin
    text.attr('font-size', xText.fontSize)
      .attr('text-anchor', xText.textAnchor)
      .attr('x', (d, i) => self.xScale(i))
      .attr('y', bottom / 2)
      .text((d) => d.name)  
      .attr('opacity', 0)
      .transition()
      .duration(dur)
      .attr('opacity', 1)
  }

  /**
   *  设置Y轴网格线属性
   *  @param    {array}  g     g元素
   *  @param    {function}  grid 定义网格线的方法
   *  @return   {void}
   */
  setXGridLineAttribute(g, grid) {  
    const { height, itemStyle, yAxis } = this.config
    const { bottom, left } = itemStyle.margin
    g.attr('class', 'grid-line grid-line-x')
      .attr('transform', `translate(${yAxis.left + left}, ${height - bottom})`)
      .call(grid) 
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
    const { ticks } = this.config.yAxis

    // 定义y轴比例尺
    let yScale = d3.scale.linear()  
      .domain([0, d3.max(data) * 1.1])  
      .range([yHeight, 0])
 
    // 定义y轴样式
    let axis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(ticks)

    // 添加y轴g元素
    this.axisYGroup
      .call(::self.setYAxisAttribute, axis)
    
    // 是否显示网格线
    if(this.isYGridLine) {
      // 定义纵轴网格线
      let grid = d3.svg.axis()
        .scale(yScale)
        .tickSize(-xWidth, 0)
        .tickFormat('')
        .orient('left')
        .ticks(ticks)
      // 添加纵轴网格线
      this.gridYLine
        .call(::self.setYgridLineAttribute, grid)
    }
    // 返回比例尺
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
   *  @param    {array}  g     g元素
   *  @param    {function}  grid 定义网格线的方法
   *  @return   {void}
   */
  setYgridLineAttribute(g, grid) {  
    const { yAxis, itemStyle } = this.config
    const { top } = itemStyle.margin
    g.attr('class', 'grid-line grid-line-y')
      .attr('transform', `translate(${yAxis.left}, ${top})`)
      .call(grid) 
  }
}
