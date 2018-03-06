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
    const { width, height, itemStyle, xAxis, leftYAxis } = this.config // 宽、高
    const { bottom, left, right, top } = itemStyle.margin
    // X轴g元素
    this.axisXGroup = svg.insert('g','defs')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${left}, ${height - bottom})`)
    // X轴线    
    this.axisXLine = this.axisXGroup.append('path')
    // 是否显示X轴网格线
    this.isXGridLine = xAxis.gridLine.show
    if(this.isXGridLine) {
      this.gridXLine = svg.insert('g','defs')
        .attr('class', 'grid-line-x')
    }

    // 创建左边y轴g元素
    this.axisLeftYGroup = svg.insert('g','defs')
      .attr('class', 'axis axis-y axis-y-left')
      .attr('transform', `translate(${left}, ${top})`) 
    // 创建右边y轴g元素    
    this.axisRightYGroup = svg.insert('g','defs')
      .attr('class', 'axis axis-y axis-y-right')
      .attr('transform', `translate(${width - right}, ${top})`)  

    // 是否显示Y轴网格线
    this.isYGridLine = leftYAxis.gridLine.show
    if(this.isYGridLine) {
      this.gridYLine = svg.insert('g','defs')
        .attr('class', 'grid-line-y')
    }

    // x轴比例尺
    this.xScale = null
    // y轴比例尺
    this.yScale = null  
  }

  /**
   *  渲染x轴
   *  @param    {array}     data 图表数据
   *  @return   {function}  x轴比例尺
   */
  renderXAxis(data) {
    const self = this
    const { xWidth, yHeight, dataLen, xAxis, itemStyle } = self.config // 宽、高
    const { left } = itemStyle.margin

    // 创建x轴比例尺
    self.xScale = d3.scale.linear()
      .domain([0, data.length - 1])
      .range([left, xWidth - left])

    // 获取x轴g元素
    const axisG = this.axisXGroup
    // 轴线
    const { show } = xAxis.axisLine
    if(show){
      self.axisXLine.attr('d', `M0, 0V0H${xWidth + left / 2}V0`) 
    }
     
    // 获取并处理update部分
    let update = axisG.selectAll('text')
      .data(data)
      .call(::self.setXAxisTextAttribute)
    // 获取并处理enter部分  
    update.enter()
      .append('text')
      .call(::self.setXAxisTextAttribute) 
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
    const { xText, dur } = self.config
    text.attr('font-size', xText.fontSize)
      .attr('text-anchor', xText.textAnchor)
      .attr('x', (d, i) => self.xScale(i))
      .attr('y', 20)
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
    const { height, itemStyle } = this.config
    const { left, bottom } = itemStyle.margin
    g.attr('class', 'grid-line grid-line-x')
      .attr('transform', `translate(${left}, ${height - bottom})`)
      .call(grid) 
  }

  /**
   *  渲染Y轴
   *  @param    {array}  data 图表数据
   *  @param    {string} direction 方向(left, right)
   *  @return   {function}  y轴比例尺
   */
  renderYAxis(data, direction) {
    const self = this
    // 获取一系列配置项
    const { xWidth, yHeight } = self.config
    const { ticks, format } = self.config[`${direction}YAxis`]

    // 定义y轴比例尺
    let yScale = d3.scale.linear()  
      .domain([0, d3.max(data) * 1.1])  
      .range([yHeight, 0])
 
    // 定义y轴样式
    let axis = d3.svg.axis()
      .scale(yScale)
      .orient(direction)
      .tickFormat((d) => `${d}${format}`)
      .ticks(ticks)

    // 添加Y轴g元素
    let axisG = null
    // 判断是左边轴线还是右边轴线
    direction === 'left' ? axisG = this.axisLeftYGroup 
      : axisG = this.axisRightYGroup 
    axisG.call(::self.setYAxisAttribute, axis)  

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
    const { left, top } = this.config.itemStyle.margin
    g.attr('class', 'grid-line grid-line-y')
      .attr('transform', `translate(${left}, ${top})`)
      .call(grid) 
  }
}
