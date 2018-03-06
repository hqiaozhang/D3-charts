/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-20 11:45:39
 * @Description: 三角形图表
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-20 11:45:39
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, getMousePosition } from '../../util/util'
import AddAxis from './addAxis'
import { showTips, hideTips } from './tips.js'
import filterHbs from './hbs/filter.hbs'

export default class TriangleBar {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700, // svg的宽
      height: 300, // svg的高
      dur: 750, // 动画过渡时间
      itemStyle: { // 图表样式
        width: 15,
        margin: {
          top: 20,
          right: 40,
          bottom: 40,
          left: 20
        },
        fill: '#008eff',
        hover: {
          fill: '#00ffa2'
        }
      },
      tooltip: {
        show: true
      },
      topText: {
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'middle'
      },
      yAxis: {
        show: false,
        axisLine: {
          show: true // 轴线
        },
        gridLine: { 
          show: true // 网格线
        },
        ticks: 5 // 刻度  
      },
      xText: {
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'middle'
      }
    }
  }

  /**
   * Creates an instance of triangleBar
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列Id
    this.gId = genSVGDocID()
    this.markId = genSVGDocID()
    this.filterId = genSVGDocID()

    const { width, height, itemStyle } = this.config 
    // 获取margin的值
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 

    // 创建svg元素
    const svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    // 创建defs元素  
    const defs = svg.append('defs')  
    defs.html(filterHbs({
      filterId: this.filterId
    }))

    this.addElement(defs)

    this.svg = svg
    // x轴比例尺
    this.xScale = null  
    // y轴比例尺
    this.yScale = null
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)
    // 初始化定义
    this.isInit = true
  }

  /**
   * 渲染
   * @example: [
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
    self.config.datalen = data.length
    self.config.unit = xWidth / data.length

    // 获取所有value
    let dataset = []
    data.map((d) => dataset.push(d.value))

    // 渲染x轴
    self.xScale = this.addAxis.renderXAxis(data)  
    // 渲染y轴  
    self.yScale = this.addAxis.renderYAxis(dataset) 
    // 渲染多边形
    self.renderData(data)
    // 重置初始化值
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
    let update = svg.selectAll(`.group-${self.gId}`)
      .data(data)

    // 获取enter部分  
    let enter = update.enter().append('g')  
    // 添加多边形(数据)  
    enter.append('polygon')
    // 添加圆点  
    enter.append('use')
    // 添加顶部文字  
    enter.append('text')

    /**
     *  处理update部分 
     */
    // 组元素属性设置
    update.call(::self.setGroupAttribute)
    // 选择数据部分
    update.select('polygon')
      .call(::self.setPolygonAttribute)
    // 选择图片  
    update.select('use')
      .call(::self.setTopCircleAttribute)  
    // 选择顶部文字  
    update.select('text')
      .call(::self.setTopTextAttribute)   

    // 获取并处exit部分  
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
    const { itemStyle, tooltip, dur } = self.config
    const { left } = itemStyle.margin
    let transX = left - itemStyle.width / 2
    // g元素属性设置
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(${transX + self.xScale(i)}, 0)`)
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(${transX + self.xScale(i)}, 0)`)
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
    group.select('.top-circle')
      .attr('fill', opt.fill)
  }

  /**
   *  设置多边形(polygon)属性
   *  @param    {array}  polygon polygon元素
   *  @return   {void}  
   */
  setPolygonAttribute(polygon) {
    const self = this
    const { yHeight, itemStyle, dur } = self.config
    const { fill, width, margin } = itemStyle
    polygon.attr('class', 'polygon-data')
      .attr('fill', fill)
      .attr('filter', `url(#${self.filterId})`)
      // 初始化属性设置    
    self.initSetAttribute(() => {
      polygon.attr('points', () => {
        let p1 = 0
        let p5 = width
        let p2 = yHeight + margin.top
        return `${p1} ${p2}, ${p5 / 2} ${p2}, ${p5} ${p2}`
      })
    })
    // 动画过渡设置  
    polygon.transition()
      .duration(dur)
      .attr('points', (d) => {
        let p1 = 0
        let p5 = width
        let p2 = yHeight + margin.top
        return `${p1} ${p2}, ${p5 / 2} ${ self.yScale(d.value) + 20}, ${p5} ${p2}`
      })
  }

  /**
   *  设置顶部小圆点属性
   *  @param    {array}  use use元素
   *  @return   {void}
   */
  setTopCircleAttribute(use) {
    const self = this
    const { dur, itemStyle, yHeight } = self.config
    use.attr('class', 'top-circle')
      .attr('xlink:href', `#${self.markId}`)
      .attr('x', itemStyle.width / 2)
      .attr('fill', itemStyle.fill)
      .attr('opacity', 0)
    // 初始化属性设置    
    self.initSetAttribute(() => use.attr('y', yHeight))
    // 动画过渡设置
    use.transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d.value) + 20 )
      .attr('opacity', 1)
  }

  /**
   *  设置顶部text属性
   *  @param    {array}  text text属性
   *  @return   {void}
   */
  setTopTextAttribute(text) {
    const self = this
    const { topText, dur, itemStyle, yHeight } = self.config
    text.attr('class', 'top-text')
      .attr('font-size', topText.fontSize)
      .attr('fill', topText.fill)
      .attr('text-anchor', topText.textAnchor)
      .attr('x', itemStyle.width / 2)
      .text((d) => d.value )
    // 初始化属性设置    
    self.initSetAttribute(() => text.attr('y', yHeight))
    // 动画过渡设置
    text.transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d.value) + 20 - 16 )
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
    const { width } = self.config.itemStyle
    defs.append('circle')
      .attr('id', self.markId)
      .attr('filter', `url(#${self.filterId})`)
      .attr('r', width / 2 )
  }
}
