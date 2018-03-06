/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-20 11:45:39
 * @Description: 三角形图表
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-20 11:45:39
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData } from '../../util/util'
import filterHbs from './hbs/filter.hbs'
import lineImg from './images/line.png'
import AddAxis from './addAxis'

export default class Triangle {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      dur: 750,
      itemStyle: {
        pattern: 1, // 取值1-5
        transX: 120, // pattern 取值4、5该值有效
        margin: {
          top: 20,
          right: 40,
          bottom: 40,
          left: 60
        },
        color: ['#9936e8', '#49aefe'],
        gradient: {
          x1: '0%',
          y1: '30%',
          x2: '0%',
          y2: '100%',
          offset1: '0%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 1
        }
      },
      topText: {
        show: true,
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'start'
      },
      yAxis: {
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
   * Creates an instance of triangle
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)

    // 获取一系列Id
    this.gId = genSVGDocID()
    // 渐变色ID
    this.gradientId = genSVGDocID()

    const { width, height, itemStyle, topText } = this.config 
    
    const { pattern, transX } = itemStyle
    
    if(pattern === 4 || pattern === 5){
      itemStyle.margin.left = transX
    }
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
    this.defs = svg.append('defs')  
    // 创建多边形g元素
    this.polygonGroup = svg.append('g')
      .attr('class', `polygon-group-${this.gId}`) 
    // 是否显示顶部文字  
    this.isShowTopText = topText.show  
    if(this.isShowTopText) {
      // 创建图片g元素(顶部文字背景)
      this.imageGroup = svg.append('g')
        .attr('class', `image-group-${this.gId}`)  
      // 创建顶部文字g元素
      this.TopTextGroup = svg.append('g')
        .attr('class', `top-text-group-${this.gId}`)
    }
    this.svg = svg
    // x轴比例尺
    this.xScale = null  
    // y轴比例尺
    this.yScale = null
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)
    // 创建defs元素  
    const defs = this.svg.append('defs') 

    // 渐变配置项
    let gradientCfg = {
      stopColor: itemStyle.color[0],
      endColor: itemStyle.color[1],
      gradient: itemStyle.gradient,
      id: this.gradientId
    }
    
    defs.html(filterHbs({
      config: [gradientCfg]
    })) 
    // 初始化判断
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
    self.renderPolygon(data)

    // 是否显示顶部文字
    if(this.isShowTopText){
      // 渲染顶部文字背景图片
      self.renderTopImage(data)
      // 渲染顶部文字
      self.renderTopText(data)
    }
    // 初始化判断
    this.isInit = false
  }

  /**
   *  渲染多边形
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderPolygon(data) {
    const self = this
    const polygonGroup = this.polygonGroup
      .call(::self.setGroupAttribute)  
    // 选择并处理update部分
    let update = polygonGroup.selectAll('polygon')
      .data(data)
    // 选择并处理enter部分
    update.enter().append('polygon')
    // 处理update部分
    update.call(::self.setPolygonAttribute) 
    // 选择并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  渲染顶部文字背景图片
   *  @param    {array}  data 图表数据
   *  @return   {void}  
   */
  renderTopImage(data) {
    const self = this
    const imageGroup = this.imageGroup
      .call(::self.setGroupAttribute)  

    // 选择并处理update部分
    let update = imageGroup.selectAll('image')
      .data(data)
    // 选择并处理enter部分
    update.enter().append('image')
    // 处理update部分  
    update.call(::self.setImageAttribute) 
    // 选择并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  渲染顶部文字
   *  @param    {array}  data 图表数据
   *  @return   {void}   
   */
  renderTopText(data) {
    const self = this
    const TopTextGroup = this.TopTextGroup
      .call(::self.setGroupAttribute)  
 
    // 选择update部分
    let update = TopTextGroup.selectAll('text')
      .data(data)
    // 选择并处理enter部分
    update.enter().append('text')
    // 处理update部分
    update.call(::self.setTopTextAttribute) 
    // 选择并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  设置多边形(polygon)属性
   *  @param    {array}  polygon polygon元素
   *  @return   {void}  
   */
  setPolygonAttribute(polygon) {
    const self = this
    const { unit, yHeight, itemStyle, dur } = self.config
    const { pattern, transX } = itemStyle
    let num = 1
    switch(pattern) {
    case 1: 
      num = unit / 4
      break
    case 2:
      num = unit / 2.5
      break
    case 3:
      num = unit / 2
      break
    case 4:
      num = unit / 1.5 + transX
      break     
    default:
      break  
    }
    polygon.attr('class', 'polygon-data')
      .attr('fill', (d, i) => {
        // 双色填充
        if(pattern > 2) {
          if(i % 2 === 0) {
            return '#04a0b0'
          }
          return '#164e7c'
        }
        // 渐变填充
        return `url(#${self.gradientId})`
      })
      .attr('opacity', 0.6)
    // 初始化属性设置
    self.initSetAttribute(() => {
      polygon.attr('points', (d, i) => {
        let curX = self.xScale(i)
        let p5 = curX + num
        let p1 = curX - num
        if(pattern === 5) {
          p5 = self.xScale(i + 1 )
          p1 = self.xScale(i - 1 ) 
        }
        return `${p1} 0, ${curX} 0, ${p5} 0`
      })
    }) 
    // 动画过渡设置  
    polygon.transition()
      .duration(dur)
      .attr('points', (d, i) => {
        let curX = self.xScale(i)
        let p5 = curX + num
        let p1 = curX - num
        if(pattern === 5) {
          p5 = self.xScale( i + 1 )  
          p1 = self.xScale( i - 1 ) 
        }
        return `${p1} 0, ${curX} ${self.yScale(d.value) - yHeight}, ${p5} 0`
      })
  }

  /**
   *  设置顶部线条图片属性
   *  @param    {array}  image image元素
   *  @return   {void}
   */
  setImageAttribute(image) {
    const self = this
    const { yHeight, dur } = self.config
    const [imgW, imgH] = [75, 16]
    image.attr('class', 'text-bg-img')
      .attr('xlink:href', lineImg)
      .attr('width', imgW)
      .attr('height', imgH)
      .attr('x', (d, i) => self.xScale(i) )
    // 初始化属性设置 
    self.initSetAttribute(() => {
      image.attr('y', 0)
        .attr('opacity', 0) 
    }) 
    // 动画过渡设置
    image.transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d.value) - yHeight - imgH )
      .attr('opacity', 1)
  }

  /**
   *  设置X轴text属性
   *  @param    {array}  text text属性
   *  @return   {void}
   */
  setTopTextAttribute(text) {
    const self = this
    const { yHeight, topText, dur } = self.config
    text.attr('class', 'top-text')
      .attr('font-size', topText.fontSize)
      .attr('fill', topText.fill)
      .attr('text-anchor', topText.textAnchor)
      .attr('x', (d, i) => self.xScale(i) + 5 )
      .text((d) => d.value )
    // 初始化属性设置 
    self.initSetAttribute(() => text.attr('y', 0)) 
    // 动画过渡设置
    text.transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d.value) - yHeight - 16 )
  }

  /**
   * 初始化的属性设置 
   * @param {function} fn 初始化的属性设置 
   *  @return   {void}
   */
  initSetAttribute(fn) {
    this.isInit ? fn() : ''
  }

  /**
   *  设置数据g元素属性
   *  @param    {array}  g  g元素
   *  @return   {void}
   */
  setGroupAttribute(g) {
    const self = this
    const { itemStyle, height, dur } = self.config
    const { bottom, left } = itemStyle.margin
    if(!this.isInit){
      g.transition()
        .duration(dur)
        .attr('transform', () => `translate(${left}, ${height - bottom})`)
    }else{
      g.attr('transform', () => `translate(${left}, ${height - bottom})`)
    }
  }
}
