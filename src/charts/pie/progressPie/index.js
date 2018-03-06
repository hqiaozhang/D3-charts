/**
 * @Author:      zhanghq
 * @DateTime:    2017-12-01 10:12:50
 * @Description: 进进加载饼图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-12-01 10:12:50
 */

import './styles/index.css'
import d3 from 'd3'
import _ from 'lodash'
import { isNoData, genSVGDocID } from '../../util/util'
import filterHbs from './hbs/filter.hbs'
import bgImg from './images/bg.png'

export default class ProgressPie {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      dur: 1500, // 动画过度时间
      itemStyle: {
        innerRadius: 50,
        outerRadius: 55,
        colors: ['#de3171', '#8143d0'],
        // 渐变配置项
        gradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
          offset1: '0%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 1
        }, 
        margin: {
          top: 20,
          right: 20,
          bottom: 100,
          left: 20
        }
      }
    }
  }
  /**
   * Creates an instance of areaChart
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.gId = genSVGDocID()
    this.gradientId = genSVGDocID()

    const { width, height, itemStyle } = this.config  
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
    // 渐变配置项
    let gradientCfg = {
      stopColor: itemStyle.colors[0],
      endColor: itemStyle.colors[1],
      gradient: itemStyle.gradient,
      id: this.gradientId
    }  
    defs.html(filterHbs({
      config: [gradientCfg]
    }))

    // 获取内半径、外半径
    const { innerRadius, outerRadius } = itemStyle 
    // 创建弧生成器
    this.arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)    
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
    
    // let total = 80 // 暂保留,实际从后端取值
    let dataset = []
    data.map((d) => dataset.push(d.value))
    /*
     *  比例尺两种情况 1:所有值跟总数比 .domain([0, total])
     *  2: 所有值拉通比 .domain([0, d3.max(dataset)])
    */ 
    this.scale = d3.scale.linear()
      .domain([0, d3.max(dataset)])
      .range([0, 2 * Math.PI])
    // 渲染数据
    self.renderData(data)
  }

  /**
   *  渲染数据
   *  @param    {array}  data 图表数据
   *  @return   {void} 
   */
  renderData(data) {
    const self = this
    
    let update = self.svg.selectAll('.arc-group')
      .data(data)
    // 获取enter部分
    let enter = update.enter().append('g')
    // 添加背景图片  
    enter.append('image')
    // 添加数据 path  
    enter.append('path')
    // 添加文字  
    enter.append('text')
      
    /**
     *  处理update部分
     */
    // 组元素update部分处理
    update.call(::self.setGroupAttribute, data.length)
    // 选择背景图片  
    update.select('image')
      .call(::self.setImageAttribute)
    // 选择数据 path  
    update.select('path')
      .call(::self.setPathAttribute)
    // 选择文字  
    update.select('text')
      .call(::self.setTextAttribute)
      
    // 获取并处exit部分
    update.exit().remove()  
  }

  /**
   *  组元素属性设置
   *  @param    {object}  g g元素
   *  @param    {number}  len 数据长度
   *  @return   {void}
   */
  setGroupAttribute(g, len) {
    const { yHeight, xWidth, itemStyle } = this.config
    const { left } = itemStyle.margin
    g.attr('class', (d, i) => `arc-group arc-group-${i}`)
      .attr('transform', (d, i) => {
        let x = i * xWidth / len + itemStyle.outerRadius + left
        return `translate(${x}, ${yHeight})`
      })
  }

  /**
   *  背景图片属性设置
   *  @param    {object}  image image元素
   *  @return   {void}
   */
  setImageAttribute(image) {
    image.attr('class', 'arc-bg')
      .attr('xlink:href', bgImg)
      .attr('width', 110)
      .attr('height', 110)
      .attr('x', -55)
      .attr('y', -55)
  }

  /**
   *  数据弧度(path)属性设置
   *  @param    {object}  path path元素
   *  @return   {void}
   */
  setPathAttribute(path) {
    const self = this
    path.attr('class', 'data-path')
      .attr('fill', `url(#${self.gradientId})`)
      .attr('d', (d) => {
        d.startAngle = 0
        d.endAngle = self.scale(d.value)
        return self.arc(d)
      })
      .transition() // 设置动画  
      .duration(1200) // 持续时间  
      .attrTween('d', (d) => {
        let start = { startAngle: 0, endAngle: 0 }
        let end = { startAngle: 0,
          endAngle: self.scale(d.value)
        }
        let inter = d3.interpolate(start, end)
        return (t) => self.arc(inter(t))
      })
  }

  /**
   *  文字属性设置
   *  @param    {object}  text text元素
   *  @return   {void}
   */
  setTextAttribute(text) {
    const self = this
    text .attr('class', 'texts')
    // 获取并处理upate部分  
    let update = text.selectAll('tspan')
      .data((d) => [d.value, d.name])
      .call(::self.setTspanAttirbute)
    // 获取并处理enter部分  
    update.enter()
      .append('tspan')
      .call(::self.setTspanAttirbute)
    // 获取并处理exit部分
    update.exit().remove()  
      
  }

  /**
   *  文字（tspan）属性设置
   *  @param    {object}  tspan tspan元素
   *  @return   {void}
   */
  setTspanAttirbute(tspan) {
    tspan.attr('x', 0)
      .attr('dy', (d, i) => `${i === 1 ? 20 : 0}px`)
      .text((d) => d)
  }
}
