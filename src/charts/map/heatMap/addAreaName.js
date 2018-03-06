/**
 * @Author:      zhanghq
 * @DateTime:    2017-12-12 14:48:06
 * @Description: 添加地区名字
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-12-12 14:48:06
 */

import d3 from 'd3'
import _ from 'lodash'
import { showTips, hideTips } from './tips.js'

export default class AddAreaName {

  /**
   * 地图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      itemStyle: {
        rect: {
          width: 60,
          height: 25,
          slice: 2 // 字符截取位数
        }
      },
      fontStyle: {
        size: 16,
        color: '#fff'
      }

    }  
  }

  /**
   * Creates an instance of AddAreaName
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    const { width, height, mapClass } = this.config  
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height) 
      .attr('class', `${mapClass}-names-svg`)
  }

  /**
   *  渲染地区名字
   *  @param    {object}  data 区域数据
   *  @return   {void}  
   */
  render(data) {
    const self = this
    // 获取update部分
    let update = self.svg.selectAll('g')
      .data(data)
    // 获取enter部分  
    let enter = update.enter().append('g')
    // 处理enter部分
    enter.append('rect')

    enter.append('text') 
    // 处理update部分 
    update.call(::self.setGroupAttribute) 
    update.select('rect')
      .call(::self.setRectAttribute)
    update.select('text')
      .call(::self.setTextAttribute)  
  }

  /**
   *  g元素属性设置
   *  @param    {g}  g g元素
   *  @return   {void}  
   */
  setGroupAttribute(g) {
    const self = this 
    const selector = self.selector
    const { fill } = self.config.itemStyle.hover
    const { width: rWidth, height: rHeight } = self.config.itemStyle.rect
    g.attr('class', (d) => `name-${d.id} name-group`)
      .attr('fill', 'rgba(17, 27, 142, 0.9)')
      .attr('transform', (d) => `translate(${d.x - rWidth / 2}, ${d.y - rHeight / 2})`)
      .attr('value', 0)
      .on('click', (d) => {
        const $this = d3.select(`.name-${d.id}`)
        $this.attr('fill', fill)
        let name = $this.select('.area-name').text()
        // 获取数据
        let data = {
          name: name,
          value: $this.attr('value')
        }
        data.curArea = self.svg.attr('curArea')
        // 获取位置
        let posi = {
          x: d.x - 25,
          y: d.y - 280
        }
        showTips(selector, data, posi)  
      })
      .on('mouseout', (d) => {
        const $this = d3.select(`.name-${d.id}`)
        hideTips(selector)  
        $this.attr('fill', 'rgba(17, 27, 142, 0.9)')
      })
  }

  /**
   *  rect元素属性设置
   *  @param    {rect}  rect rect元素
   *  @return   {void}  
   */
  setRectAttribute(rect) {
    const self = this
    const { itemStyle } = self.config
    const { width: rWidth, height: rHeight } = itemStyle.rect
    rect.attr('class', 'rect-bg')
      .attr('width', rWidth)
      .attr('height', rHeight)
      .attr('stroke', '#1866cc')
      .attr('stroke-width', 2)
      .style('display', (d) => {
        if(d.name === '北部新区'){
          return 'none'
        }
      })
  }

  /**
   *  text元素属性设置
   *  @param    {text}  text text元素
   *  @return   {void}  
   */
  setTextAttribute(text) {
    const self = this
    const { itemStyle, fontStyle } = self.config
    const { width: rWidth, height: rHeight, slice } = itemStyle.rect
    const { size, color } = fontStyle
    text.attr('class', 'area-name')
      .attr('fill', color)
      .attr('font-size', size)
      .attr('text-anchor', 'middle')
      .attr('x', rWidth / 2)
      .attr('y', rHeight / 2 + 5)
      .text((d) => d.name.slice(0, slice))
      .style('display', (d) => {
        if(d.name === '北部新区'){
          return 'none'
        }
      })
  }
}
