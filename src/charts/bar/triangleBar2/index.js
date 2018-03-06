/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-07 09:54:19
 * @Description: 三角形柱状图(横向)
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-07 09:54:19
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, getMousePosition } from '../../util/util'
import { showTips, hideTips } from './tips.js'
import filterHbs from './hbs/filter.hbs'

export default class TriangleBar2 {
  /**
   * 图表组件默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting() {
    return{
      width: 465,
      height: 400,
      dur: 750,
      tooltip: {
        show: true
      },
      itemStyle: {
        fill: '#008eff',
        height: 15,
        min: 10, // 柱子小宽度
        radius: 0, // 条形图两边的半径,
        margin: {
          top: 6,
          right: 70, 
          bottom: 0,
          left: 40
        },
        hover: {
          fill: '#00ffa2'
        }
      },
      // 左边文字配置项
      leftText: {
        show: true,
        fontSize: 12,
        fill: '#fff',
        textAlign: 'start'
      },
      // 右边文字配置项
      rightText: {
        show: true,
        fontSize: 12,
        fill: '#fff',
        textAlign: 'middle',
        unit: ''
      }
    }
  }

  /**
   * Creates an instance of TriangleBar2.
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列id
    this.gId = genSVGDocID()
    this.markId = genSVGDocID()
    this.filterId = genSVGDocID()

    const { width, height, itemStyle } = this.config 
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 

    // 比例尺
    this.xScale = null
    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    // 创建defs元素  
    const defs = this.svg.append('defs')  
    
    defs.html(filterHbs({
      filterId: this.filterId
    }))
    this.addElement(defs)  
    // 初始化定义
    this.isInit = true
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
    const { width, height, xWidth } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }

    // 取value值用比例尺计算最大值
    let dataset = []
    data.map((d) => dataset.push(d.value))
    // 比例尺
    self.xScale = d3.scale.pow()
      .domain([0, d3.max(dataset)] )
      .range([0, xWidth])
      .exponent(0.25)

    // 渲染图表数据
    self.renderData(data)
    // 改变初始化值
    this.isInit = false
  }

  /**
   *  渲染数据
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderData(data) {
    const self = this
    const svg = self.svg
    const { height } = self.config

    // 计算行高
    let lineHeight = height / data.length
    // 获取update部分
    let update = svg.selectAll(`.group-${self.gId}`)
      .data(data)

    /*
      获取并处理append部分
     */
    let enter = update.enter().append('g')
    // 添加左边文字
    enter.append('text').classed('left-text', true) 
    // 添加数据部分
    enter.append('polygon').classed('polygon-data', true)  
    // 添加圆点  
    enter.append('use').classed('right-circle', true)
    // 添加右边文字部分  
    enter.append('text').classed('right-text', true)  

    /*
      处理update部分
    */
    // 组元素属性设置 
    update.call(::self.setGroupAttribute, lineHeight)
    // 选择左边文字部分
    update.select('.left-text')  
      .call(::self.setLeftTextAttribute, data)
    // 选择数据部分
    update.select('.polygon-data')  
      .call(::self.setPolygonAttribute)
    // 左边圆点
    update.select('.right-circle')  
      .call(::self.setRightCircleAttribute)  
    // 选择右边文字部分  
    update.select('.right-text')
      .call(::self.setRightTextAttribute, data) 
      
    // 获取并处理exit部分
    update.exit().remove()    
  }

  /**
   *  组元素样式设置
   *  @param    {array}   g           g元素
   *  @param    {number}  lineHeight  行高
   *  @return   {void}
   */
  setGroupAttribute(g, lineHeight) {
    const self = this
    const selector = self.selector
    const { itemStyle, tooltip, dur } = self.config
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(0, ${lineHeight * i})`)
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(0, ${lineHeight * i})`)
    }
    
    // 是否显示提示框  
    if(tooltip.show) {
      g.attr('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, itemStyle.hover)
          // 显示提示框
          showTips(selector, d, getMousePosition())
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, itemStyle)
          // 隐藏提示框  
          hideTips(selector)  
        })
    }
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {object}  opt 样式配置项
   *  @return   {void}
   */
  mouseEventStyle(i, opt) {
    // 选择当前g元素
    const group = d3.select(`.group-${this.gId}-${i}`)
    // 选择数据条
    group.select('.polygon-data')
      .attr('fill', opt.fill)
    // 选择右边小圆点
    group.select('.right-circle')
      .attr('fill', opt.fill)
  }
 
  /**
   *  设置数据的属性样式
   *  @param {object} polygon 表示数据量大小的矩形元素
   *  @return   {void}
   */
  setPolygonAttribute(polygon) {
    const self = this
    const { itemStyle, dur } = self.config
    const { margin, height, fill } = itemStyle
    polygon.attr('class', 'polygon-data')
      .attr('fill', fill)
      .attr('filter', `url(#${self.filterId})`)
      // 初始化属性设置  
    self.initSetAttribute(() => {
      polygon .attr('points', `${margin.left}, ${height}, 0, ${height / 2}, ${margin.left}, 0`)
    })
    // 动画过渡设置  
    polygon.transition()
      .duration(dur)
      .attr('points', (d) => {
        let p0 = margin.left
        let p5 = height
        return `${p0}, ${p5}, ${self.xScale(d.value)}, ${p5 / 2}, ${p0}, 0`
      })
  } 

  /**
   *  设置顶部线条图片属性
   *  @param    {array}  use use元素
   *  @return   {void}
   */
  setRightCircleAttribute(use) {
    const self = this
    const { dur, itemStyle } = self.config
    const { left } = itemStyle.margin
    use.attr('class', 'right-circle')
      .attr('xlink:href', `#${self.markId}`)
      .attr('fill', itemStyle.fill)
      .attr('y', itemStyle.height / 2)
      .attr('opacity', 0)
    // 初始化属性设置  
    self.initSetAttribute(() => use.attr('x', left))
    // 动画过渡设置  
    use.transition()
      .duration(dur)
      .attr('x', (d) => self.xScale(d.value))
      .attr('opacity', 1)
  }

  /**
   *  设置左边文本的样式
   *  @param {array} text 右边文本元素
   *  @param {array} data 数据项
   *  @return   {void}
   */
  setLeftTextAttribute(text, data) {
    const { leftText, dur, itemStyle } = this.config
    const top = itemStyle.height
    text.attr('class', 'left-text')
      .attr('x', 0)
      .attr('y', top)
      .attr('font-size', leftText.fontSize)
      .attr('fill', leftText.fill)
      .attr('text-anchor', leftText.textAlign)
      .attr('opacity', 0)
      .transition()
      .duration(dur)
      .attr('opacity', 1)
      .text((d, i) => `${data[i].name}`)
  }   

  /**
   *  设置右边文本的样式
   *  @param {array} text 右边文本元素
   *  @param {array} data 数据项
   *  @return   {void}
   */
  setRightTextAttribute(text, data) {
    const { rightText, width, dur, itemStyle } = this.config
    const { right } = itemStyle.margin
    const top = itemStyle.height
    text.attr('class', 'right-text')
      .attr('y', top)
      .attr('font-size', rightText.fontSize)
      .attr('fill', rightText.fill)
      .attr('text-anchor', rightText.textAlign)
    // 初始化属性设置  
    this.initSetAttribute(() => text.attr('x', 0))  
    // 动画过渡设置  
    text.transition()
      .duration(dur)
      .attr('x', width - right / 2)
      .text((d, i) => `${data[i].value} ${rightText.unit}`)
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
   *  添加元素
   *  @param    {object}  defs defs元素
   *  @return   {void}
   */
  addElement(defs) {
    const self = this
    const { height } = self.config.itemStyle
    defs.append('circle')
      .attr('id', self.markId)
      .attr('filter', `url(#${self.filterId})`)
      .attr('r', height / 2 )
  }
}
