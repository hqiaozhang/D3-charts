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
    const { height, itemStyle } = this.config // 宽、高
    const { bottom, left } = itemStyle.margin
    // X轴g元素
    this.axisXGroup = svg.insert('g','defs')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(${left}, ${height - bottom})`)
    // X轴线    
    this.axisXLine = this.axisXGroup.append('path')  
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
}
