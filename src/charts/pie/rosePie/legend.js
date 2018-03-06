/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-10 11:07:55
 * @Description: 饼图图例
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-10 11:07:55
 */

import { genSVGDocID } from '../../util/util'

export default class Legend {
  /**
   * Creates an instance of Legend
   * @param {object} svg svg容器
   * @param {object} opt 配置项
   */
  constructor(svg, opt) {
    this.config = opt
    const { width, height, itemStyle } = this.config
    const { right, bottom } = itemStyle.margin
    this.gId = genSVGDocID()
    this.legend = svg.append('g')
      .attr('calss', 'charts-legend') 
      .attr('transform', `translate(${width - right}, ${height / 2 - bottom})`)
  }

  /**
   *  渲染图例
   *  @param    {array}  data 图例数据
   *  @return   {void}
   */
  render(data) {
    const self = this
    self.data = data
    // 获取update部分
    let updata = self.legend.selectAll(`.legend-group-${self.gId}`)
      .data(data)
    // 获取enter部分  
    let enter = updata.enter().append('g')
    /**
     *  处理enter部分
     */
    enter.append('circle')
    // 添加name  
    enter.append('text').classed('text-name', true)
    // 添加value  
    enter.append('text').classed('text-value', true) 

    /**
     *  处理update部分
     */
    // 组元素update部分
    updata.call(::self.setGroupAttribute)
    // 选择圆点
    updata.select('circle')
      .call(::self.setCircleAttribute)
    // 选择name  
    updata.select('.text-name')
      .call(::self.setTextAttribute, 1)  
    // 选择value  
    updata.select('.text-value')
      .call(::self.setTextAttribute, 2) 

    // 处理exit部分
    updata.exit().remove()     
  }

  /**
   *  g元素属性设置
   *  @param    {object}  g g元素
   *  @return   {void}
   */
  setGroupAttribute(g) {
    g.attr('class', `legend-group-${this.gId}`)
      .attr('transform', (d, i) => `translate(0, ${i * 30})`)
  }

  /**
   *  circle元素属性设置
   *  @param    {object}  circle circle元素
   *  @return   {void}
   */
  setCircleAttribute(circle) {
    const { itemStyle, legend } = this.config
    const { colors } = itemStyle
    circle.attr('class', 'legend-icon')
      .attr('r', legend.radius)
      .attr('fill', (d, i) => colors[i])
  }

  /**
   *  text元素属性设置
   *  @param    {object}  text text元素
   *  @param    {number}  type text类型(1 是name, 2是value)
   *  @return   {void}
   */
  setTextAttribute(text, type) {
    const { itemStyle, legend } = this.config
    const { colors } = itemStyle
    text.attr('class', `${type === 1 ? 'text-name' : 'text-value'}`)
      .attr('fill', (d, i) => type === 1 ? colors[i] : legend.fill)
      .attr('font-size', legend.fontSize)
      .attr('x', type === 1 ? legend.radius * 2 : legend.radius * 10)
      .attr('y', 4)
      .text((d) => type === 1 ? d.name : d.value)
  }
}
