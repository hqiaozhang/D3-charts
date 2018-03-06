/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-08 10:58:52
 * @Description: 圆点柱状图(六边形圆点)
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-08 10:58:52
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, 
  interpolate, countScale, getMousePosition} from '../../util/util'
import AddAxis from './addAxis'
import { showTips, hideTips } from './tips.js'

export default class PointBar {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      dur: 750,
      tooltip: {
        show: true
      },
      itemStyle: {
        margin: {
          top: 20,
          right: 40,
          bottom: 40,
          left: 20
        },
        min: 1, // 最小值
        strokeWidth: 1,
        stroke: 'none',
        zoom: 14, // 决定了六边形的大小
        color: ['#846ffb', '#fce76e'],
        rectBg: {
          fill: '#191e32'
        },
        hover: {
          color: ['#008efc', '#1f75ff']
        }
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
   * Creates an instance of PointBar
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
    this.polygonId = genSVGDocID()
    this.rectId = genSVGDocID()

    const { width, height, itemStyle } = this.config 
    // 获取margin的值
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 
    itemStyle.scale = 140 / itemStyle.zoom
    // 创建svg元素
    const svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    // 创建defs元素  
    const defs = svg.append('defs') 
      
    // 添加元素  
    this.addElement(defs)  

    this.svg = svg  
    // x轴比例尺
    this.xScale = null  
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)
    // 线性填充
    this.fillLinear = d3.scale.linear()
      .domain([0, 4])
      .range([0, 1])
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
    const { width, height, yHeight, itemStyle } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    self.rangeArr = []
    // 获取所有value
    let dataset = []
    data.map((d) => dataset.push(d.value))

    let shapeMax = Math.floor(yHeight / itemStyle.scale)    
    self.config.max = shapeMax
    // 画多边形的个数比例尺
    self.countLinear = countScale(dataset, shapeMax)
    // 渲染x轴
    self.xScale = self.addAxis.renderXAxis(data) 
    // 渲染图表数据
    self.renderData(data) 
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

    let g = update.enter()
      .append('g')  

    // 添加矩形背景
    g.append('use')
    // 添加数据 
    g.append('g').classed('group-data', true)
    // 添加顶部文字  
    g.append('text')
    /* 
     * 处理update部分   
     */ 
    // 组元素 update部分
    update.call(::self.setGroupAttribute)
    // 选择矩形背景  
    g.select('use')
      .call(::self.setDataBgAttribute)    
    // 选择数据部分
    update.select('.group-data')
      .call(::self.setDataGroupAttribute, data)
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
    const { itemStyle, height, tooltip } = self.config
    const { bottom, left } = itemStyle.margin
    let hoverFill = interpolate(itemStyle.hover.color)
    let fill = interpolate(itemStyle.color)
    let transX = left - itemStyle.scale
    g.attr('transform', (d, i) => `translate(${transX + self.xScale(i)}, ${height - bottom})`)
      .attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
      
    // 是否显示提示框
    if(tooltip.show) {
      g.attr('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, hoverFill)
          // 显示提示框
          showTips(selector, d, getMousePosition())
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, fill)
          // 隐藏提示框  
          hideTips(selector)  
        })
    }  
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {function}  compute 颜色插值
   *  @return   {void}
   */
  mouseEventStyle(i, compute) {
    const group = d3.select(`.group-${this.gId}-${i}`)
    // 选择数据
    group.select('.group-data')
      .selectAll('.data-use')
      .attr('fill', (dd) => compute(this.fillLinear(dd)))
  }

  /**
   *  矩形背景元素属性设置
   *  @param    {array}  use  use元素
   *  @return   {void}
   */
  setDataBgAttribute(use) {
    const self = this
    use.attr('class', 'data-bg')
      .attr('xlink:href', `#${self.rectId}`)
  }

  /**
   *  设置矩形属性
   *  @param    {array}  g g元素
   *  @param    {array}  data 图表数据
   *  @return   {void}  
   */
  setDataGroupAttribute(g, data) {
    const self = this
    self.rangeArr = []
    const { max, itemStyle } = self.config
 
    g.attr('class', 'group-data')
      .attr('transform', `translate(4, ${-itemStyle.scale})`)
    // 获取update部分
    let update = g.selectAll('use')
      .data(function(d, i) {
        let range = parseInt(self.countLinear(data[i].value).toFixed(0), 10)
        if(range <= 0) {
          range = itemStyle.min
        }
        if(range > max) {
          range = max
        }
        self.rangeArr.push(range)
        return d3.range(0, range)
      }) 

    // 获取并处理enter部分  
    update.enter()
      .append('use')
    // 处理update部分  
    update.call(::self.setUseAttribute)  
    // 选择并处理exit部分  
    update.exit().remove()  

  }

  /**
   *  设置use属性(引用六边形)
   *  @param    {array}  use use属性
   *  @return   {void}
   */
  setUseAttribute(use) {
    const self = this
    const { dur, itemStyle } = self.config
    const { color } = itemStyle
    let fill = interpolate(color)
    use.attr('class', 'data-use')
      .attr('xlink:href', `#${self.polygonId}`)
      .attr('fill', (d) => fill(self.fillLinear(d)))
      .attr('y', 0)
      .transition()
      .duration(dur)
      .attr('y', (d, i) => {
        return -itemStyle.scale * i
      })
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
      .attr('x', itemStyle.scale)
      .text((d) => d.value )
      .attr('y', 0)
      .transition()
      .duration(dur)
      .attr('y', -yHeight - 5)
  }

  /**
   *  添加元素
   *  @param    {object}  defs defs元素
   */
  addElement(defs) {
    const self = this
    const { itemStyle, yHeight } = self.config
    const { stroke, strokeWidth, zoom, rectBg, scale } = itemStyle
    // 六边形的六个坐标点
    let points = '60,20, 20,90, 60,160, 140,160, 180,90, 140,20'
    points = points.split(',')
    let zoomPoints = []
    points.map((d) => zoomPoints.push(d / zoom) )

    // 添加多边形(六边形)
    defs.append('polygon')
      .attr('id', self.polygonId)
      .attr('stroke-width', strokeWidth)
      .attr('stroke', stroke)
      .attr('points', zoomPoints)

    // 添加矩形背景
    defs.append('rect')
      .attr('id', self.rectId)
      .attr('width', scale + 10)  
      .attr('height', yHeight)
      .attr('fill', rectBg.fill)
      .attr('y', -yHeight)
  }
}
