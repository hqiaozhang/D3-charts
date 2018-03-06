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
   */
  constructor(svg, opt) {
    this.config = opt

    // 创建X轴g元素
    const { height, itemStyle, yAxis } = this.config // 宽、高
    const { bottom, left, top } = itemStyle.margin
    const { show } = yAxis
    // X轴g元素
    this.axisXGroup = svg.insert('g','defs')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${left}, ${height - bottom})`)
    // X轴线    
    this.axisXLine = this.axisXGroup.append('path')  

    // 是否创建y轴g元素
    if(show){
      // Y轴g元素
      this.axisYGroup = svg.insert('g','defs')
        .attr('class', 'axis axis-y')
        .attr('transform', `translate(${left}, ${top})`)
      // 是否显示X轴网格线
      this.isYGridLine = yAxis.gridLine.show
    }
    
    if(this.isYGridLine) {
      this.gridYLine = svg.insert('g','defs')
        .attr('class', 'grid-line-y')
    }

    // x轴比例尺
    this.xScale = null
  }

  /**
   *  渲染x轴
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderXAxis(data) {
    const self = this
    const { itemStyle, xWidth } = self.config // 宽、高
    const { left } = itemStyle.margin
    // x轴比例尺
    self.xScale = d3.scale.linear()
      .domain([0, data.length - 1])
      .range([left, xWidth - left])
    // 添加x轴g元素
    let axisG = this.axisXGroup
    // X轴线
    // 6V0H${xWidth}V6 start:6V  end:V6为两头的刻度
    this.axisXLine.attr('d', `M0, 0V0H${xWidth}V0`)  
    // 获取并处理update部分
    let update = axisG.selectAll('text')
      .data(data)
    // 获取并处理enter部分  
    update.enter().append('text')
    // 处理update部分  
    update.call(::self.setXAxisTextAttribute) 
    // 获取并处理exit部分    
    update.exit().remove()  
    // 返回x轴比例尺
    return self.xScale
  }

  /**
   *  设置x轴文字属性
   *  @param    {array}  text  text元素
   *  @return   {void}
   */
  setXAxisTextAttribute(text) {
    const self = this 
    const { xText, dur } = self.config
    text.attr('font-size', xText.fontSize)
      .attr('text-anchor', xText.textAnchor)
      .attr('x', (d, i) => self.xScale(i) )
      .attr('y', 20)
      .text((d) => d.name )  
      .attr('opacity', 0)
      .transition()
      .duration(dur)
      .attr('opacity', 1)
  }

  /**
   *  渲染Y轴
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderYAxis(data) {
    const self = this
    // 获取一系列配置项
    const { xWidth, yHeight } = this.config
    const { ticks, show } = this.config.yAxis

    // 定义y轴比例尺
    let yScale = d3.scale.pow()  
      .domain([0, d3.max(data) * 1.1])  
      .range([yHeight, 0])
      .exponent(0.5)

    // 是否显示y轴  
    if(show){
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
   *  设置网格线属性
   *  @param    {array}  g     g元素
   *  @param    {function}  grid 定义网格线的方法
   *  @return   {void}
   */
  setYGridLineAttribute(g, grid) {  
    const { left, top } = this.config.itemStyle.margin
    g.attr('class', 'grid-line grid-line-y')
      .attr('transform', `translate(${left}, ${top})`)
      .call(grid) 
  }
}
