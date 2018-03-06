/**
 * @Author:      zhanghq
 * @DateTime:    2017-12-04 17:21:38
 * @Description: 进度条柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-12-04 17:21:38
 */

import './styles/index.css'
import d3 from 'd3'
import _ from 'lodash'
import AddAxis from './addAxis'
import { isNoData, genSVGDocID, appendSVG } from '../../util/util'

export default class ProgressBar {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 450,
      dur: 750,
      tooltip: {
        show: true
      },
      itemStyle: {
        height: 20,
        radius: 12,
        margin: {
          top: 20,
          right: 40,
          bottom: 30,
          left: 50
        }
      },
      xAxis: {
        gridLine: { 
          show: true // 网格线
        }
      },
      yAxis: {
        show: true,
        axisLine: {
          show: true // 轴线
        },
        gridLine: { 
          show: true // 网格线
        },
        pow: 1,
        ticks: 5 // 刻度  
      },
      xText: {
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'end'
      }
    }
  } 
  /**
   * Creates an instance of ProgressBar
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    this.gId = genSVGDocID()
 
    const { width, height, itemStyle } = this.config 
    // 获取margin的值
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 
    // 创建svg元素
    this.svg = appendSVG(selector, {width, height})
    // 实例化坐标轴  
    this.addAxis = new AddAxis(this.svg, this.config) 
    // 定义初始值
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
    const { width, height } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    let dataset = []
    for(let i = data.length - 1; i >= 0; i--) {
      dataset.push(data[i].value)
    }
    // data.map((d) => dataset.push(d.value))
    // 渲染x轴
    self.xScale = self.addAxis.renderXAxis(dataset) 
    self.yScale = self.addAxis.renderYAxis(data) 
    // 渲染数据
    self.renderData(dataset)
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
    // 选择update部分
    let update = self.svg.selectAll(`.group-${this.gId}`)
      .data(data)
    // 选择enter部分  
    let enter = update.enter().append('g')    
    // 添加矩形
    enter.append('rect')
    // 添加foreignObject
    enter.append('foreignObject')

    // 处理update部分
    // 选择组元素
    update.call(::self.setGroupAttribute)
    // 选择矩形背景
    update.select('rect')
      .call(::self.setRectAttribute)
    // 选择foreignObject
    update.select('foreignObject') 
      .call(::self.appendDiv) 
    
    // 处理exit部分
    update.exit().remove()

  }

  /**
   *  背景矩形属性设置
   *  @param    {object}  rect rect元素
   *  @return   {void} 
   */
  setRectAttribute(rect) {
    const self = this
    const { xWidth, itemStyle } = self.config
    const { height: itemHeight, radius } = itemStyle
    rect.attr('width', xWidth)
      .attr('height', itemHeight + 4)
      .attr('fill', '#000')
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('class', 'rect')
  }

  /**
   *  添加div
   *  @param    {object}  foreignObject foreignObject元素
   *  @return   {void} 
   */
  appendDiv(foreignObject) {
    const { dur, itemStyle } = this.config
    const { height: itemHeight } = itemStyle
    foreignObject.attr('width', '100%')
      .attr('height', itemHeight)
      .attr('y', 2)
      .attr('x', 2)
      .attr('class', (d, i) => `foreignObject-${i}`)  
      .each((d, i) => {
        // 选择update部分
        let foreign = d3.select(`.foreignObject-${i}`)
          .data([0])
        foreign.append(function () {
          return document.createElementNS('http://www.w3.org/1999/xhtml', 'body')
        }).attr('class', () => `charts-body-${i}`)

        let body = d3.select(`.charts-body-${i}`)
        // 矩形条数据
        let updateBar = body.selectAll('.data-bar')
          .data([1])
        // 选择并处理enter部分  
        updateBar.enter().append('div').attr('class', 'data-bar')
        // 处理update部分
        updateBar.style('height', `${itemHeight}px`)
        // 初始化属性设置
        this.initSetAttribute(() => updateBar.style('width', 0))
        // 动画过渡设置  
        updateBar.transition()
          .duration(dur)
          .style('width', () => `${this.xScale(d)}px`)
        // 右边圆圈  
        let updateC = body.selectAll('.rect-data-circle')
          .data([1])   
        // 选择并处理enter部分    
        updateC.enter().append('div').attr('class', 'rect-data-circle')  
        // 处理update部分
        updateC.style('margin-left', '-8px')
        // 添加span
        let span = updateC.select('span')
        if(span.node()){
          span.html(() => d) 
        }else{
          updateC.append('span')
            .html(() => d) 
        }
      })
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
   *  组元素设置
   *  @param    {object}  g g元素
   *  @return   {void} 
   */
  setGroupAttribute(g) {
    const { left } = this.config.itemStyle.margin
    g.attr('class', `group-${this.gId}`)
      .attr('transform', (d, i) => `translate(${left + 5}, ${this.yScale(i)})`)
  }
}
