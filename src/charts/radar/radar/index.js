/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-29 17:43:11
 * @Description: 雷达图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-29 17:43:11
 */

import './styles/index.css'
import d3 from 'd3'
import $ from 'jquery'
import _ from 'lodash'
import { genSVGDocID } from '../../util/util'
import RadarArea from './radarArea.js'
import legendHbs from './hbs/legend.hbs'
import mainBg from './images/bg.png'
 
export default class Radar {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 600,
      height: 600,
      dur: 750,
      tooltip: {
        show: true
      },
      itemStyle: {
        radius: 200,
        rangeMin: 0,
        rangeMax: 100,
        colors: [],
        lineColor: '#fff',
        level: 4,
        margin: {
          top: 20,
          right: 40,
          bottom: 40,
          left: 20
        }
      },
      textStyle: {
        fill: '#fff',
        radius: 6,
        circleFill: '#'
      }
    }
  }

  /**
   * 构造函数
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    this.config.selector = selector
    const { width, height } = this.config 
    this.renderBgStyle(selector)
    // 获取一系列id
    this.gId = genSVGDocID()
    // 创建svg
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', `url(${mainBg}) no-repeat center center`)
      .style('background-size', '70% 70%')
      .style('position', 'absolute')
      .style('z-index', 2)
    // 创建main g元素  
    const mainG = this.svg.append('g')
      .classed(`main-${this.gId}`, true)
      .attr('transform', `translate(${width / 2}, ${height / 2})`) 
    // 创建网格线g元素  
    this.websG = mainG.append('g')
      .classed('webs-group', true)
    // 创建轴线分组
    this.linesG = mainG.append('g')  
      .classed('lines-group', true)  
    // 创建雷达图区域分组
    this.areasG = mainG.append('g')
      .classed('areas-group', true)  
    // 创建文字区域分组
    this.textsG = mainG.append('g')
      .classed('texts-group', true) 

    // 实例化雷达区域
    this.radarArea = new RadarArea(this.areasG, this.config)   
    // 图例实例化
    this.renderLegend()
  }

  /**
   *  渲染旋转背景的样式
   *  @return   {void}
   */
  renderBgStyle() {
    const { width, height } = this.config 
    $(this.selector).css({width: width, height: height, position: 'relative'})
    const roateStyle = {
      width: width,
      height: height,
      'margin-left': -width / 2,
      'margin-top': -height / 2,
      'z-index': 1
    }
    const roateDiv = '<div class="rotate-bg"></div>'
    $(this.selector).append(roateDiv)
    $('.rotate-bg').css(roateStyle)
  }

  /**
   * 渲染
   * @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'value1|10-100': 1,
   *     'value2|10-100': 1
   *    }
   *  ]
   * @param {array} data 渲染组件需要的数据项
   * @return   {void}
   */
  render(data) {
    const self = this
    const { radius, level, rangeMin, rangeMax } = self.config.itemStyle

    // 获取value值
    let dataset = []
    let nums = Object.keys(data[0])
    // 处理数据
    nums.map((n) => {
      let values = []
      data.map(d => {
        let value = d[n]
        if(typeof value !== 'string'){
          values.push(value)
        } 
      })
      if(values.length !== 0 ){
        dataset.push(values)
      }
    })
    // 网轴的范围，类似坐标轴
    let arc = 2 * Math.PI 
    let dataLen = data.length
    // 每项指标所在的角度
    let angle = arc / dataLen
    // 计算网轴的正多边形的坐标
    let polygons = {
      webs: [],
      webPoints: []
    } 
    for(let k = level; k > 0; k--) {
      let webs = '' 
      let webPoints = []
      let r = radius / level * k
      for(let i = 0; i < dataLen; i++) {
        // 计算n边形各个点的位置
        let x = r * Math.sin(i * angle)
        let y = r * Math.cos(i * angle)
        webs += `${x},${y} ` // 注意后面的空格必须留着
        webPoints.push({
          x: x,
          y: y
        })
      }
      polygons.webs.push(webs)
      polygons.webPoints.push(webPoints)
    }
    // 渲染网格
    // self.renderWebs(polygons)
    // 渲染轴线
    self.renderLines(polygons)
    // 计算雷达图表的坐标
    let areasData = []
    for(let i = 0; i < dataset.length;i++) {
      let value = dataset[i]
      let area = '' 
      let points = []
      for(let k = 0;k < dataLen; k++) {
        let r = radius * (value[k] - rangeMin) / (rangeMax - rangeMin)
        let x = r * Math.sin(k * angle) 
        let y = r * Math.cos(k * angle)
        area += `${x},${y} ` // 注意后面的空格必须留着
        points.push({
          x: x,
          y: y
        })
      }
      areasData.push({
        polygon: area,
        points: points
      })
    }
    // 渲染雷达区域
    self.radarArea.render(data, areasData)

    // 计算文字标签坐标
    let textPoints = []
    let textRadius = radius + 20
    for(let i = 0; i < dataLen; i++) {
      let x = textRadius * Math.sin(i * angle) 
      let y = textRadius * Math.cos(i * angle)
      textPoints.push({
        x: x * 1.2,
        y: y * 1.2
      })
    }  
    // 渲染文字
    self.renderText(data, textPoints)
  }

  /**
   *  绘制雷达背景网格线
   *  @param    {[type]}  data [description]
   *  @return   {void}
   */
  renderWebs(data) {
    const self = this
    // 添加网格
    let webs = self.websG
    // 获取并处理update部分
    let update = webs.selectAll('polygon')
      .data(data.webs)
    // 获取并处理enter部分  
    update.enter()
      .append('polygon')
    // 处理update部分  
    update.attr('points', (d) => d) 
    // 获取并处理exit部分
    update.exit().remove() 
  }

  /**
   *  绘制雷达背景轴线
   *  @param    {[type]}  data [description]
   *  @return   {void}
   */
  renderLines(data) {
    const self = this
    // 获取并处理update部分
    let update = self.linesG.selectAll('line')
      .data(data.webPoints[0])
    // 获取并处理enter部分  
    update.enter().append('line')
    // 处理update部分
    update.call(::self.setLineAttribute)
    // 获取并处理eixt部分  
    update.exit().remove()
  }

  /**
   *  轴线属性设置
   *  @param    {object}  line line元素
   *  @return   {void}
   */
  setLineAttribute(line) {
    line.attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d) => d.x)
      .attr('y2', (d) => d.y)  
  }

  /**
   *  渲染雷达图周边文字
   *  @example: [example]
   *  @param    {[type]}  data     [description]
   *  @param    {[type]}  position [description]
   *  @return   {void}
   */
  renderText(data, position) {
    const self = this
    // 绘制文字标签
    let texts = self.textsG
    // 获取update部分
    let update = texts.selectAll('.text-group')
      .data(position)
    // 获取enter部分  
    let enter = update.enter().append('g') 
    enter.append('text').text((d, i) => data[i].name)  
    // 添加小圆点  
    enter.append('circle').classed('text-mark', true)
    
    /**
     *  处理update部分
     */
    // 处理组元素 update部分   
    update.call(::self.setTextGrouptAttr)
    // 选择小圆点  
    update.select('.text-mark')
      .call(::self.setTextCircltAttribute)
    // 选择文字  
    update.select('text')  
      .text((d, i) => data[i].name)  
    // 获取并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  文字g元素属性设置
   *  @param    {object}  g g元素
   *  @return   {void}
   */
  setTextGrouptAttr(g) {
    const { dur } = this.config
    g.attr('class', 'text-group')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .attr('y', (d) => d.y)
      .attr('opacity', 0)
      .transition()
      .duration(dur)
      .attr('opacity', 1)
  }

  /**
   *  文字里面的圆点属性设置
   *  @param    {object}  circle circle元素
   *  @return   {void}
   */
  setTextCircltAttribute(circle) {
    const { dur } = this.config
    circle.attr('class', 'text-mark')
      .attr('fill', '#6edef9')
      .attr('cy', 10)
      .attr('r', 0)
      .transition()
      .duration(dur)
      .attr('r', 6)
  }

  /**
   *  渲染图例
   *  @return   {void}
   */
  renderLegend(){
    const data = ['2017年', '2016年']
    $(this.selector).append(legendHbs(data))
    $(`${this.selector} .legend`).on('click', 'li', (evt) => {
      const $this = $(evt.target)
      const isClass = $this.hasClass('invalid')
      const index = $this.index()
      if(isClass) {
        $this.removeClass('invalid')
        $(this.selector).find(`.area${index + 1}`).fadeIn()
      }else {
        $this.addClass('invalid')
        $(this.selector).find(`.area${index + 1}`).fadeOut()
      }
    })
  }
}
