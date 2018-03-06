/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-21 08:56:13
 * @Description: 折线图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-21 08:56:13
 */

import d3 from 'd3'
import _ from 'lodash'
import $ from 'jquery'
import { genSVGDocID, isNoData } from '../../util/util'
import { addFilter } from './filter'
import AddAxis from './addAxis'
import BarChart from './barChart'
// 图表提示框
import tipsHtml from './hbs/charts-tips.hbs'

// 获取一系列id
const gId = genSVGDocID()
let filterId = null

export default class AreaChart {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      dur: 750, // 动画过度时间
      itemStyle: {
        margin: {
          top: 20,
          right: 60,
          bottom: 40,
          left: 60
        },
        // 柱子样式
        barStyle: {
          show: true, // 是否显示柱子
          fill: '#32c0c5',
          width: 20,
          type: 'rect', // 取值为:rect、circle
          r: 5,
          textShow: false
        },
        // 线条path样式
        pathStyle:[
          {
            areaPath: { 
              fill: ['#3ee57a', '#3ee57a'],
              stroke: 'none'
            },
            linePath: {
              stroke: '#3ee57a',
              strokeWidth: 2
            }
          }, { // 环比
            areaPath: {
              fill: ['#8b3cc4', '#8b3cc4'],
              stroke: 'none'
            },
            linePath: {
              stroke: '#8b3cc4',
              strokeWidth: 2
            }
          }
        ]
      },
      topMark: {
        show: true,
        radius: 4,
        fill: '#fff',
        stroke: ['#3ee57a', '#8b3cc4'],
        strokeWidth: 1
      },
      topText: {
        show: true,
        fill: ['#fff', '#fff'],
        fontSize: 16,
        textAnchor: 'middle'
      },
      // 左边y轴样式
      leftYAxis: {
        axisLine: {
          show: true // 轴线
        },
        gridLine: { 
          show: true // 网格线
        },
        ticks: 5, // 刻度
        format: ''   
      },
      // 右边y轴样式
      rightYAxis: {
        axisLine: {
          show: true // 轴线
        },
        gridLine: { 
          show: false // 网格线
        },
        ticks: 5, // 刻度 
        format: '%' 
      },
      xAxis: {
        axisLine: {
          show: true // 轴线
        },
        gridLine: { 
          show: true // 网格线
        }
      },
      xText: {
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'middle'
      }
    }
  }

  /**
   * Creates an instance of areaChart.
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)

    const { width, height, itemStyle, topMark, topText } = this.config  
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 

    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    // 创建defs元素  
    const defs = this.svg.append('defs')  

    // 创建折线g元素
    this.lineGroup = this.svg.append('g')
      .attr('class', `line-group-${gId}`)

    // 是否显示标记点
    this.isShowMark = topMark.show
    if(this.isShowMark) {
      // 创建mark g元素
      this.markGroup = this.svg.append('g')
        .attr('class', `mark-group-${gId}`) 
    }
    // 是否显示标记点 
    this.isShowTopText = topText.show 
    if(this.isShowTopText) {
      // 创建text g元素
      this.textGroup = this.svg.append('g')
        .attr('class', `text-group-${gId}`)
    } 
     
    // x轴比例尺
    this.xScale = null  
    // y轴比例尺
    this.yScale = null  
    // 线条生成器
    this.linePath = null 
    // 调用滤镜 path使用
    filterId = addFilter(defs)
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)
    // 实例化柱状图
    this.barChart = new BarChart(this.svg, this.config)
  }  

  /**
   *  渲染
   *  @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'tongbi|1-100': 1, // 同比数据
   *     'huanbi|1-100': 1, // 环比数据
   *     'value|1-100': 1 // 数值
   *   }
   *  ]
   *  @param    {array}  data 图表数据
   *  @return   {[type]}  null
   */
  render(data) {
    const self = this
    const { width, height, itemStyle } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    self.config.dataLen = data.length
    // 保存一组空数组,用于折线动画过度
    self.nullData = []
    let tongbiData = [] // 同比数据
    let huanbiData = [] // 环比数据
    let valueData = [] // 数值
    data.map((d) => {  
      tongbiData.push(d.tongbi)
      huanbiData.push(d.huanbi)
      valueData.push(d.value)
      this.nullData.push(0)
    })
    // 获取所有value
    let dataset = [...tongbiData, ...huanbiData]
    // 同比环比取出来
    let newData = [tongbiData, huanbiData]
    // 线条生成器
    self.linePath = d3.svg.line()
      .x( (d, i) => self.xScale(i) )
      .y( (d) => self.yScale(d) )
      .interpolate('linear')

    // 渲染x轴
    self.xScale = self.addAxis.renderXAxis(data)  
    // 渲染左边y轴  
    self.yScale = self.addAxis.renderYAxis(dataset, 'right') 
    // 渲染右边y轴
    const rightYScale = self.addAxis.renderYAxis(valueData, 'left') 

    // 是否显示柱子  
    const isShowBar = itemStyle.barStyle.show  
    if(isShowBar){
      // 渲染数值的数据(柱子)
      self.barChart.render(valueData, self.xScale, rightYScale)  
    }

    // 渲染同/环比数据
    for(let i = 0, len = newData.length; i < len; i++) {
      self.renderLinePath(newData[i], i)
      // 是否显示顶部mark  
      if(self.isShowMark){
        self.renderTopMark(newData[i], i) 
      }
      // 是否显示顶部文字
      if(self.isShowTopText){
        self.renderTextData(newData[i], i) 
      }
    } 
    // this.addOverlay(data)
  }

  /**
   *  渲染线条path
   *  @param    {array}   data 数据
   *  @param    {number}  i    下标
   *  @return   {void}
   */
  renderLinePath(data, i) {
    const self = this
    // 获取path g元素
    const lineGroup = this.lineGroup
      .call(::self.setGroupAttribute)  

    // 创建path元素
    let linePath = lineGroup.selectAll(`.line-path-${i}`)
    if(linePath.node()) {
      lineGroup.select(`.line-path-${i}`)
        .call(::self.setLinePathAttribute, data, i)    
    } else{
      lineGroup.append('path')
        .call(::self.setLinePathAttribute, data, i)  
    }
  }

  /**
   *  设置线条path属性
   *  @param    {array}  path   path元素
   *  @param    {array}  data   数据
   *  @param    {number}  i     下标
   *  @return   {void}
   */
  setLinePathAttribute(path, data, i) {
    const self = this
    const { dur, itemStyle } = self.config
    const { pathStyle } = itemStyle
    path.attr('class', `line-path-${i}`)
      .attr('fill', 'none')
      .attr('stroke', pathStyle[i].linePath.stroke)
      .attr('stroke-width', pathStyle[i].linePath.strokeWidth)
      .attr('filter', `url(#${filterId})`)
      .attr('d', self.linePath(this.nullData))
      .transition()
      .duration(dur)
      .attr('d', self.linePath(data))
  }

  /**
   *  渲染文字数据
   *  @param    {array}   data 数据
   *  @param    {number}  i    下标
   *  @return   {void}
   */
  renderTextData(data, i) {
    const self = this
    // 创建text g元素
    const textGroup = self.textGroup
      .call(::self.setGroupAttribute)  
    // 获取并处理update部分
    let update = textGroup.selectAll(`.text-${i}`)
      .data(data)

    // 获取并处理enter部分
    update.enter().append('text')
    // 处理update部分  
    update.call(::self.setTextDataAttribute, i)  
    // 获取并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  设置文字属性
   *  @param    {array}   text text元素
   *  @param    {number}  i    下标
   *  @return   {void}
   */
  setTextDataAttribute(text, i) {
    const self = this
    const { topText, dur, yHeight } = self.config
    text.attr('class', `text-${i}`)
      .attr('font-size', topText.fontSize)
      .attr('fill', topText.fill[i])
      .attr('text-anchor', topText.textAnchor)
      .attr('x', (d, j) => self.xScale(j) )
      .attr('y', yHeight)
      .transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d) - 10 )
      .text((d) => `${d}%`)
  }

  /**
   *  渲染顶部小圆点
   *  @example: [example]
   *  @param    {[type]}  data [description]
   *  @param    {[type]}  i    [description]
   *  @return   {void}
   */
  renderTopMark(data, i) {
    const self = this

    const markGroup = this.markGroup
      .call(::self.setGroupAttribute)  

    // 获取并处理update部分
    let update = markGroup.selectAll(`.mark-${i}`)
      .data(data)
      .call(::self.setMarkAttribute, i)  
    // 获取并处理enter部分
    update.enter()
      .append('circle')
      .call(::self.setMarkAttribute, i)  
    // 获取并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  设置圆点属性
   *  @param    {array}   circle  circle元素
   *  @param    {number}  i       下标
   *  @return   {void}
   */
  setMarkAttribute(circle, i) {
    const self = this
    const { topMark, yHeight, dur } = self.config
    circle.attr('class', `mark-${i}`)
      .attr('r', topMark.radius)
      .attr('fill', topMark.fill)
      .attr('stroke', topMark.stroke[i])
      .attr('stroke-width', topMark.strokeWidth)
      .attr('cx', (d, j) => self.xScale(j))
      .attr('cy', yHeight)
      .transition()
      .duration(dur)
      .attr('cy', (d) => self.yScale(d))
  }

  /**
   *  设置g元素属性
   *  @param    {array}  g  g元素
   *  @return   {void}
   */
  setGroupAttribute(g) {
    const { top, left } = this.config.itemStyle.margin
    g.attr('transform', `translate(${left}, ${top})`)
  }

  /**
   *  设置提示内容
   *  @param    {array}  data   提示数据
   *  @param    {object} x      提示框x坐标位置
   *  @param    {object} y      提示框y坐标位置
   *  @return   {void}
   */
  showTips(data, {x, y}) {
    const container = $(this.selector)
    const tipSelector = container.find('.charts-tooltip')
    if(tipSelector.length > 0) {
      tipSelector.show()
      tipSelector.find('.name').text(data.name)
      tipSelector.find('.value').text(data.value || 0)
    } else{
      container.append(tipsHtml({
        data: data
      }))
    }
    container.find('.charts-tooltip')
      .css({
        left: `${x}px`,
        top: `${y}px`
      })
  }

  /**
   * 鼠标移出地图外，隐藏提示框
   *  @return   {void}
   */
  hideTips() {
    const container = $(this.selector)
    const tipSelector = container.find('.charts-tooltip')
    tipSelector.hide()
  }
}
