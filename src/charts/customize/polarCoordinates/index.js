/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-16 09:43:09
 * @Description: 极坐标旋转图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-16 09:43:09
 */

import d3 from 'd3'
import _ from 'lodash'
import { isNoData, genSVGDocID, getMousePosition } from '../../util/util'
import { showTips, hideTips } from './tips.js'

export default class PolarCoordinates {

  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 500,
      height: 500,
      dur: 750,
      tooltip: {
        show: true
      },
      itemStyle: {
        circleStroke: '#6a1491', 
        lineWidth: 10,
        color: '#ec44ff',
        borderColor: '#fff',
        radius: 150,
        max: 80,
        min: 10,
        hover: {
          color: '#b025ea'
        }
      },
      textStyle: {
        distance: 20,
        fontSize: 12,
        color: '#fff'
      }
    }
  }
  
  /**
   * Creates an instance of PolarCoordinates
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    this.gId = genSVGDocID()

    const { width, height, itemStyle } = this.config 
 
    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    const { circleStroke, radius } = itemStyle
    this.svg.append('circle')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)  
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', circleStroke)
      .attr('stroke-width', 3)

    this.pie = d3.layout.pie()
      .value(() => 1) 
  }

  /**
   * 渲染
   *  @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'value|10-100': 1
   *    }
   *  ]
   * @param {array} data 渲染组件需要的数据项
   * @return   {void}
   */
  render(data) {
    const self = this
    const { width, height, itemStyle } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    itemStyle.dataLen = data.length
    let dataset = []
    data.map((d) => dataset.push(d.value))
    // 定义比例尺
    self.linear = d3.scale.linear()
      .domain([d3.min(dataset), d3.max(dataset)])
      .range([itemStyle.min, itemStyle.max])  

    self.renderData(data)  
  }

  /**
   *  渲染数据
   *  @param    {array}  data 图表数据
   *  @return   {void} 
   */
  renderData(data) {
    const self = this
    let pieData = self.pie(data)  
    let update = self.svg.selectAll(`.group-${self.gId}`)
      .data(pieData)
    // 选择并处理enter部分  
    let g = update.enter().append('g')  
    // 选择path背景
    g.append('path').classed('path-bg', true)
    // 添加path数据
    g.append('path').classed('path-data', true) 
    // 添加text
    g.append('text')

    /**
     *  处理update部分
     */
    // 组元素update 部分
    update.call(::self.setGroupAttribute)
    // 选择背景
    update.select('.path-bg')
      .call(::self.setPathBgAttribute)  
    // 选择数据  
    update.select('.path-data')
      .call(::self.setPathAttribute)   
    // 添加text
    update.select('text')
      .call(::self.setTextAttribute)    

    // 处理exit部分  
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
    const { width, height, tooltip, itemStyle } = self.config
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
      .attr('transform', `translate(${width / 2}, ${height / 2})`)
      // 是否显示提示框
    if(tooltip.show) {
      g.attr('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, itemStyle.hover.color)
          // 显示提示框
          showTips(selector, d.data, getMousePosition())
        })
        .on('mousemove', (d) => showTips(selector, d.data, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, itemStyle.color)
          // 隐藏提示框  
          hideTips(selector)  
        })
    }  
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {string}  fill 颜色插值
   *  @return   {void}
   */
  mouseEventStyle(i, fill) {
    const group = d3.select(`.group-${this.gId}-${i}`)
    // 选择数据
    group.select('.path-data')
      .attr('fill', fill)
  }

  /**
   *  设置path背景属性
   *  @param    {object}  path path元素
   *  @return   {void} 
   */
  setPathBgAttribute(path) {
    const self = this
    const { dur, itemStyle } = self.config
    const { radius, borderColor, min, max, lineWidth } = itemStyle
    path.attr('stroke', borderColor)
      .attr('stroke-width', 1)
      .attr('fill', borderColor) // fill本身应该是none的，但为了鼠标好捕获，因此把fill-opacity设置为0
      .attr('fill-opacity', 0)
      .attr('d', () => {
        let x1 = 0
        let y1 = 0 - radius
        let y2 = 0 - radius - min - max
        let coorPoint = `M${x1} ${y1} ${x1} ${y2} ${x1 + lineWidth} ${y2} ${x1 + lineWidth} ${y1}`
        return coorPoint
      })
      .attr('transform', 'rotate(0)')
      .transition()
      .duration(dur)
      .attr('transform', (d, i) => {
        let ds = self.setRoatteAngle(i)
        return `rotate(${ds})`
      })
      .attr('class', 'path-bg')
  }

  /**
   *  数据path属性设置
   *  @param    {object}  path path元素
   *  @return   {void} 
   */
  setPathAttribute(path) {
    const self = this
    const { dur, itemStyle } = self.config
    const { radius, min, color, lineWidth } = itemStyle
    path.attr('stroke', 'none')
      .attr('stroke-width', 'none')
      .attr('fill', color)
      .attr('d', (d) => {
        let x1 = 0
        let y1 = 0 - radius
        let y2 = 0 - radius - min - self.linear(d.data.value )
        let coorPoint = `M${x1} ${y1} ${x1} ${y2} ${x1 + lineWidth} ${y2} ${x1 + lineWidth} ${y1}`
        return coorPoint
      })
      .attr('transform', 'rotate(0)')
      .transition()
      .duration(dur)
      .attr('transform', (d, i) => {
        let ds = self.setRoatteAngle(i)
        return `rotate(${ds})`
      })
      .attr('class', 'path-data')
  }

  /**
   *  设置旋转角度
   *  @param    {number}  i 下标
   *  @return   {number}  旋转的角度 
   */
  setRoatteAngle(i) {
    const { dataLen } = this.config.itemStyle
    let angle = 360 / dataLen
    return Math.floor(angle * i)
  }

  /**
   *  数据path属性设置
   *  @param    {object}  text text元素
   *  @return   {void} 
   */
  setTextAttribute(text) {
    const self = this
    const { itemStyle, textStyle, dur } = self.config
    text.text((d) => d.data.name)
      .attr('width', 100)
      .attr('height', 50)
      .style('writing-mode', 'tb-rl')
      .attr('x', () => { // ie?
        if (!!window.ActiveXObject || 'ActiveXObject' in window) {
          return -5
        }
        return 0
      })
      .attr('y', () => {
        return 0 - itemStyle.radius + textStyle.distance
      })
      .style('font-size', textStyle.fontSize)
      .attr('fill', textStyle.color)
      .attr('transform', 'rotate(0)')
      .transition()
      .duration(dur)
      .attr('transform', (d, i) => {
        let ds = self.setRoatteAngle(i)
        return `rotate(${ds})`
      })
      .attr('class', 'text')
  }
}
