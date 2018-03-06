/**
 * @Author:      zhanghq
 * @DateTime:    2017-12-01 16:39:59
 * @Description: 雷达区域
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-12-01 16:39:59
 */

import d3 from 'd3'
import _ from 'lodash'
import { showTips, hideTips } from './tips.js'
import { originToDeformation } from '@/util/zoom/zoom'

export default class RadarArea {

  /**
   * Creates an instance of addAxis
   * @param {object} areasG 雷达图容器
   * @param {object} opt 配置项
   */
  constructor(areasG, opt) {
    this.config = opt
    this.areasG = areasG
  }

  /**
   *  渲染雷达图区域
   *  @param    {array}  data 图表数据
   *  @param    {array}  areasData 雷达图区域数据
   *  @return   {void}
   */
  render(data, areasData) {
    const self = this
    // 添加g分组包含所有雷达图区域
    let areas = self.areasG
    // 依次循环每个雷达图区域  
    areasData.map((ds, i) => {
      // 添加g分组用来包含一个雷达图区域下的多边形以及圆点 
      let area = areas.select(`.area${i + 1}`)
      if(area.node()) {
        area = areas.select(`.area${i + 1}`)
      }else{
        area = areas.append('g')
          .attr('class',() => `area${i + 1}`)
      }
      let areaData = ds
      // 绘制雷达图区域下的多边形
      let polygon = area.select('polygon')
      // 判断多边形是否存在
      if(polygon.node()) {
        polygon
          .call(::self.setPolygonAttribute, areaData, i)
      }else {
        polygon = area.append('polygon')
          .call(::self.setPolygonAttribute, areaData, i)
      }

      // 雷达区域鼠标事件(雷达图高亮)
      area.on('mouseover', () => {
        polygon.attr('fill-opacity', 0.8)
      })
        .on('mouseout', () => {
          polygon.attr('fill-opacity', 0.5)
        })
 
      // 绘制雷达图区域下的点  
      let circles = area.select('.circles')
      // 判断雷达图区域点的g元素是否存在
      if(circles.node()) {
        // 存在选择
        circles = area.select('.circles')
      }else {
        // 不存在创建
        circles = area.append('g')
          .classed('circles', true)
      }       
      // 选择并处理圆点的update部分  
      let updateCircle = circles.selectAll('circle')
        .data(areaData.points)
      // 选择并处理圆点的enter部分    
      updateCircle.enter().append('circle')
      // 处理update部分
      updateCircle.call(::self.setAreaCircleAttribute, data, i)
      // 选择并处理圆点的exit部分    
      updateCircle.exit().remove()  
    })   
  }

  /**
   *  describe
   *  @example: [example]
   *  @param    {[type]}  polygon  [description]
   *  @param    {[type]}  areaData [description]
   *  @param    {[type]}  i        [description]
   *  @return   {void}
   */
  setPolygonAttribute(polygon, areaData, i) {
    const { dur } = this.config
    polygon.attr('points', areaData.polygon)
      .attr('stroke', () => this.getColor(i))
      .attr('fill', () => this.getColor(i))
      .attr('fill-opacity', 0.5)
      .attr('transform', 'scale(0.5)')
      .transition()
      .duration(dur)
      .attr('transform', 'scale(1)')
  }

  /**
   *  雷达图区域圆点的属性设置
   *  @param    {object}  circle circle元素
   *  @param    {array}  data   图表数据
   *  @param    {number}  i 当前circle下标
   *  @return   {void}
   */
  setAreaCircleAttribute(circle, data, i) {
    const self = this
    const selector = self.config.selector
    const { dur, tooltip } = this.config
    circle.attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 5)
      .attr('stroke', () => this.getColor(i))
      .attr('fill', () => this.getColor(i))
      .attr('transform', 'scale(0.5)')
      .transition()
      .duration(dur)
      .attr('transform', 'scale(1)')
    // 是否显示提示框 
    if(tooltip.show) {
      circle.style('cursor', 'pointer')
        .on('mouseover', (d, j) => showTips(selector, data[j], self.getMousePosition()))
        .on('mousemove', (d, j) => showTips(selector, data[j], self.getMousePosition()))
        .on('mouseout', () => hideTips(selector))
    }  
  }

  /**
   *  获取饼图填充色
   *  @param    {numbter}  idx [下标]
   *  @return   {string}  填充色
   */
  getColor(idx) {
    let defauleColor = [
      '#f36b26', '#fcea4f', '#5ab1ef', '#ffb980', '#d87a80',
      '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
      '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
      '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
    ]
    let palette = _.merge([], defauleColor, this.config.itemStyle.colors)
    return palette[idx % palette.length]  
  }

  /**
   * 获取鼠标真实位置，缩放后鼠标位置可能会存在偏差，需要进行适当的转换
   *  @return   {array}  x,y坐标位置
   */
  getMousePosition() {
    let pos = originToDeformation([d3.event.offsetX , d3.event.offsetY - 60])
    return{
      x: pos[0],
      y: pos[1]
    }
  }
}
