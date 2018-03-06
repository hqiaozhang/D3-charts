/*
 * @Author: liqi@hiynn.com 
 * @Date: 2018-01-25 11:09:06 
 * @Description: 绘制坐标系统
 * @Last Modified by: liqi@hiynn.com
 * @Last Modified time: 2018-01-25 15:35:24
 */
import d3 from 'd3'
import $ from 'jquery'
import _ from 'lodash'
import { randomString } from '../util'

export default class Axis {
  /**
   * 初始化配置项
   * @param  {Object} option 配置项
   * @return {void}   void
   */
  initConfig(option) {
    // 配置主题栅格布局信息
    let svg = _.merge({
      width: 700,
      height: 400
    }, option.grid)

    let padding = {
      left: svg.width * 0.1,
      right: svg.width * 0.1,
      top: svg.height * 0.15,
      bottom: svg.height * 0.1
    }

    this.grid = _.merge({
      width: svg.width,
      height: svg.height,
      left: padding.left,
      right: padding.right,
      top: padding.top,
      bottom: padding.bottom
    }, option.grid)

    let { width, height, left, right, top, bottom } = this.grid
    this.AXIS = {
      width: width - (left + right),
      height: height - (top + bottom)
    }

    // 配置动画信息
    this.duration = option.duration || 300
    this.easing = option.easing || 'cubicIn' 

    // 配置坐标系统
    this.xAxis = _.merge({
      axisLine: {
        stroke: '#6C6C6F',
        strokeWidth: 1
      },
      axisTick: {
        size: 5,
        stroke: '#6C6C6F',
        strokeWidth: 1
      },
      axisLabel: {
        fill: '#DEDEE1',
        fontSize: 12,
        offsetX: 0,
        offsetY: 0,
        rotate: 0
      }
    }, option.xAxis)

    this.yAxis = _.merge({
      axisLine: {
        stroke: '#606062',
        strokeWidth: 1
      },
      axisTick: {
        ticks: 10,
        size: -5,
        stroke: '#6C6C6F',
        strokeWidth: 1
      },
      axisLabel: {
        fill: '#DEDEE1',
        fontSize: 12,
        offsetX: -5,
        offsetY: 0,
        rotate: 0,
        formatter: '{value}'
      }
    }, option.yAxis)
  }  

  /**
   * 初始化容器
   * @param  {Object} selector svg 容器
   * @return {void}   void
   */
  initGroup(selector) {
    let { left, top } = this.grid

    this.yAxisG = selector.append('g')
      .classed('y-axis', true)
      .attr('transform', `translate(
        ${left} ${top}
      )`)
    this.xAxisG = selector.append('g')
      .classed('x-axis', true)
  }

  /**
   * 初始化 style 标签
   * @param  {Object} selector svg 容器
   * @return {void}   void
   */
  initStyle(selector) {
    this.svgid = selector.attr('id')

    // x 轴样式
    let xAxis = `
      #${this.svgid} .x-axis .domain {
        fill: none;
        stroke: ${this.xAxis.axisLine.stroke};
        stroke-width: ${this.xAxis.axisLine.strokeWidth};
      }
      #${this.svgid} .x-axis .tick line {
        fill: none;
        stroke: ${this.xAxis.axisTick.stroke};
        stroke-width: ${this.xAxis.axisTick.strokeWidth};
      }
      #${this.svgid} .x-axis .tick text {
        fill: ${this.xAxis.axisLabel.fill};
        font-size: ${this.xAxis.axisLabel.fontSize}px;
        text-anchor: middle;
      }
    `

    // y 轴样式
    let yAxis = `
      #${this.svgid} .y-axis .domain {
        fill: none;
        stroke: ${this.yAxis.axisLine.stroke};
        stroke-width: ${this.yAxis.axisLine.strokeWidth};
      }
      #${this.svgid} .y-axis .tick line {
        fill: none;
        stroke: ${this.yAxis.axisTick.stroke};
        stroke-width: ${this.yAxis.axisTick.strokeWidth};
      }
      #${this.svgid} .y-axis .tick text {
        fill: ${this.yAxis.axisLabel.fill};
        font-size: ${this.yAxis.axisLabel.fontSize}px;
        transform: 
          rotate(${this.yAxis.axisLabel.rotate}deg) 
          translateX(${this.yAxis.axisLabel.offsetX}px)
          translateY(${this.yAxis.axisLabel.offsetY}px);
      }
    `
    
    this.styleid = `style${randomString(10)}`
    $('head').append(`
      <style id="${this.styleid}">
        ${xAxis}
        ${yAxis}
      </style>
    `)
  }

  /**
   * 实例化
   * @param {Object} selector svg 容器
   * @param {Object} option   完整的配置项
   */
  constructor(selector, option) {
    this.initConfig(option)
    this.initGroup(selector)   
    this.initStyle(selector)

    this.domain = null
    this.max = null    
    this.min = null
  }

  /**
   * 创建 x 轴比例尺
   * @param  {Array} series 集合
   * @return {Func}  返回比例尺函数 
   */
  createXScale(series) {
    if (series.length > 0) {
      this.domain = series[0].data.map(d => d.name)
    } else {
      this.domain = []
    }

    this.xScale = d3.scale.ordinal()
      .domain(this.domain)
      .rangeBands([0, this.AXIS.width])
  }

  /**
   * 创建 y 轴比例尺
   * @param  {Array} series 集合
   * @return {Func}  返回比例尺函数
   */
  createYScale(series) {
    let arr = []
    for (let chunk of series) {
      for (let d of chunk.data) {
        arr.push(d.value)
      }
    }

    this.min = d3.min(arr)
    this.max = d3.max(arr)

    this.yScale = d3.scale.linear()
      .domain([this.min > 0 ? this.min / 2 : this.min * 1.1, this.max * 1.1])
      .rangeRound([this.AXIS.height, 0])
  }

  /**
   * 创建百分比单位的比例尺
   * @param  {Array} series 集合
   * @return {Func}  返回比例尺函数
   */
  createYScalePercent(series) {
    console.log(series)
  }

  /**
   * 外部获取比例尺的方法
   * @return {Object} 将比例尺封装成对象返回
   */
  getScale() {
    return {
      xScale: this.xScale,
      yScale: this.yScale
    }
  }

  /**
   * 外部获取最小值最大值范围的方法
   * @return {Object} 将范围封装成对象返回
   */
  getRange() {
    return {
      min: this.min,
      max: this.max
    }
  }

  /**
   * 绘制坐标轴的方法
   * @param  {Array} series 数据集合
   * @return {void}  void
   */
  render(series) {
    // 创建比例尺
    this.createXScale(series)
    this.createYScale(series)

    // 开始绘制坐标系统
    let xAxis = d3.svg.axis()
      .scale(this.xScale)
      .outerTickSize(0)
      .innerTickSize(this.xAxis.axisTick.size)
      .orient('bottom')

    let yAxis = d3.svg.axis()
      .scale(this.yScale)
      .ticks(this.yAxis.axisTick.ticks)
      .outerTickSize(0)
      .innerTickSize(this.yAxis.axisTick.size)
      .tickFormat(d => {
        let formatter = this.yAxis.axisLabel.formatter
        let indexOf = formatter.indexOf('{value}')
        let unit = formatter.replace('{value}', '')
        if (indexOf === 0) {
          return d + unit
        } 
        return unit + d        
      })
      .orient('left')

    // 绘制 x 轴
    let { left, top } = this.grid
    let { height } = this.AXIS
    this.xAxisG
      .call(xAxis)
      .attr('transform', `translate(
        ${left} ${this.min < 0 ? this.yScale(0) + top : height + top}
      )`)

    // 1. 将整个刻度按照正常的比例尺偏移
    $(`#${this.svgid} .x-axis .tick`)
      .each((i, e) => {
        $(e).attr('transform', `translate(${this.xScale(this.domain[i])}, 0)`)
      })
    // 2. 移动单个刻度
    $(`#${this.svgid} .x-axis .tick`).find('line')
      .each((i, e) => {
        $(e)
          .attr('x1', this.xScale.rangeBand())
          .attr('x2', this.xScale.rangeBand())
      })
    // 3. 移动文字到中心位置
    $(`#${this.svgid} .x-axis .tick`).find('text')
      .each((i, e) => {
        $(e)
          .attr('style', `transform:
            translateX(${this.xScale.rangeBand() / 2 + this.xAxis.axisLabel.offsetX}px)
            translateY(${this.xAxis.axisLabel.offsetY}px)
            rotate(${this.xAxis.axisLabel.rotate}deg) 
          `)
      })

    this.yAxisG
      .transition()
      .duration(this.duration)
      .ease(this.easing)
      .call(yAxis)
  }
}
