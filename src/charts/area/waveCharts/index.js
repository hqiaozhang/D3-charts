/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-26 13:38:14
 * @Description: 水波图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-26 13:38:14
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID } from '../../util/util'
const clipId = genSVGDocID()

export default class WaveCharts {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return {
      width: 300,
      height: 300,
      min: 0, // The gauge minimum value.
      max: 100, // The gauge maximum value.
      circleThickness: 0.05, // 外圆半径
      circleFillGap: 0.05, //
      circleColor: '#178BCA', // The color of the outer circle.
      waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
      waveCount: 3, // 波浪的幅度
      waveRiseTime: 1000, // 动画过度时间
      waveAnimateTime: 1200, // 浪花速度
      waveRise: true, // 
      waveHeightScaling: true, // 
      waveAnimate: true, // 
      waveColor: '#178BCA', // The color of the fill wavePath.
      waveOffset: 0, // 
      textVertPosition: 0.5, // 文字的位置 0 = bottom, 1 = top.
      textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
      valueCountUp: true, // If true, 文字动画
      displayPercent: true, // If true, a % symbol is displayed after the value.
      textColor: '#fff', // The color of the value text when the wave does not overlap it.
      waveTextColor: '#A4DBf8' // The color of the value text when the wave overlaps it.
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
    const { width, height } = this.config  
    const radius = Math.min(width, height) / 2
    const locationX = width / 2 - radius
    const locationY = height / 2 - radius
    this.config.radius = radius

    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    this.group = this.svg.append('g')
      .attr('transform',`translate(${locationX}, ${locationY})`)

    this.circlePath = this.group.append('path') 

    const fillCircleGroup = this.group.append('g')
      .attr('clip-path', `url(#${clipId})`) 

    this.fillCircle = fillCircleGroup.append('circle')

    this.text = this.group.append('text')

    const defs = this.svg.append('defs')

    this.addClipPath(defs)
  }

  /**
   *  渲染
   *  @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'value|10-100': 1
   *    }
   *  ]
   *  @param    {number}  data 图表数据
   *  @return   {void}
   */
  render(data) {
    const self = this
    const value = data[0].value
    self.renderClipArea(value) 
    self.renderData(value)  
  }

  /**
   *  渲染数据
   *  @param    {number}  value  数据
   *  @return   {void}
   */
  renderData(value) {
    const self = this
    const config = self.config
    const radius = config.radius
    const textPixels = config.textSize * radius / 2
    const textFinalValue = parseFloat(value).toFixed(2)
    const textStartValue = config.valueCountUp ? config.min : textFinalValue
    const percentText = config.displayPercent ? '%' : ''
    const circleThickness = config.circleThickness * radius
    const circleFillGap = config.circleFillGap * radius
    const fillCircleMargin = circleThickness + circleFillGap
    const fillCircleRadius = radius - fillCircleMargin
    
    let textRounder = (d) => Math.round(d)
    if(parseFloat(textFinalValue) !== parseFloat(textRounder(textFinalValue))){
      textRounder = (d) => parseFloat(d).toFixed(1)
    }
    if(parseFloat(textFinalValue) !== parseFloat(textRounder(textFinalValue))){
      textRounder = (d) => parseFloat(d).toFixed(2)
    }

    // Scales for drawing the outer circle.
    let gaugeCircleX = d3.scale.linear()
      .range([0,2 * Math.PI])
      .domain([0,1])

    let gaugeCircleY = d3.scale.linear()
      .range([0,radius])
      .domain([0,radius])

    // Scale for controlling the position of the text within the gauge.
    let textRiseScaleY = d3.scale.linear()
      .range([fillCircleMargin + fillCircleRadius * 2, fillCircleMargin + textPixels * 0.7])
      .domain([0,1])

    // Draw the outer circle.
    let gaugeCircleArc = d3.svg.arc()
      .startAngle(gaugeCircleX(0))
      .endAngle(gaugeCircleX(1))
      .outerRadius(gaugeCircleY(radius))
      .innerRadius(gaugeCircleY(radius - circleThickness))

    self.circlePath
      .attr('d', gaugeCircleArc)
      .style('fill', config.circleColor)
      .attr('transform',`translate(${radius}, ${radius})`)
 
    self.fillCircle
      .attr('cx', radius)
      .attr('cy', radius)
      .attr('r', fillCircleRadius)
      .style('fill', config.waveColor)

    // Text where the wave does overlap.
    let text2 = self.text
      .text(textRounder(textStartValue) + percentText)
      .attr('class', 'liquidFillGaugeText')
      .attr('text-anchor', 'middle')
      .attr('font-size', textPixels)
      .style('fill', config.waveTextColor)
      .attr('transform', `translate(${radius}, ${textRiseScaleY(config.textVertPosition)})`)

    // Make the value count up.
    if(config.valueCountUp){
      let textTween = () => {
        let text = d3.select('.liquidFillGaugeText')[0][0]
        let i = d3.interpolate(text.textContent, textFinalValue)
        return (t) => { 
          text.textContent = textRounder(i(t)) + percentText 
        }
      }
      // 开启文字动画
      text2.transition()
        .duration(config.waveRiseTime)
        .tween('text', textTween)
    }
  }

  /**
   *  渲染路径剪切
   *  @param    {number}  value 数据
   *  @return   {void}
   */
  renderClipArea(value) {
    const self = this
    const config = self.config
    const radius = config.radius
    // Scales for controlling the size of the clipping path.
    const fillPercent = Math.max(config.min, Math.min(config.max, value)) / config.max

    // 比例尺
    let waveHeightScale
    if(config.waveHeightScaling){
      waveHeightScale = d3.scale.linear()
        .range([0, config.waveHeight, 0])
        .domain([0,50,100])
    } else{
      waveHeightScale = d3.scale.linear()
        .range([config.waveHeight, config.waveHeight])
        .domain([0,100])
    }
    
    let circleThickness = config.circleThickness * radius
    let circleFillGap = config.circleFillGap * radius
    let fillCircleMargin = circleThickness + circleFillGap
    let fillCircleRadius = radius - fillCircleMargin

    let waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100)
    let waveLength = fillCircleRadius * 2 / config.waveCount
    let waveClipCount = 1 + config.waveCount
    let waveClipWidth = waveLength * waveClipCount

    let waveScaleX = d3.scale.linear()
      .range([0, waveClipWidth])
      .domain([0, 1])

    let waveScaleY = d3.scale.linear()
      .range([0,waveHeight])
      .domain([0, 1])

    let waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth

    // Scales for controlling the position of the clipping path.
    let waveRiseScale = d3.scale.linear()
      .range([fillCircleMargin + fillCircleRadius * 2 + waveHeight, fillCircleMargin - waveHeight])
      .domain([0, 1])

    let waveAnimateScale = d3.scale.linear()
      .range([0, waveClipWidth - fillCircleRadius * 2]) 
      .domain([0, 1])

    let waveOffset = Math.PI * 2 * config.waveOffset
    let waveCount = Math.PI * 2 * (1 - config.waveCount) 

    let clipArea = d3.svg.area()
      .x((d) => waveScaleX(d.x))
      .y0((d) => waveScaleY(Math.sin(waveOffset * -1 + waveCount + d.y * 2 * Math.PI)))
      .y1(() => fillCircleRadius * 2 + waveHeight)

    // wareData for building the clip wave area.
    let wareData = []
    for(let i = 0; i <= 40 * waveClipCount; i++){
      wareData.push({x: i / (40 * waveClipCount), y: i / 40})
    }  
   
    const waveGroup = self.waveGroup
    let wavePath = self.wavePath
      .datum(wareData)
      .call(::self.setClipPathAttribute, clipArea)

    // 开启浪花升起动画  
    if(config.waveRise){
      waveGroup.attr('transform', `translate(${waveGroupXPosition}, ${waveRiseScale(0)})`)
        .transition()
        .duration(config.waveRiseTime)
        .attr('transform', `translate(${waveGroupXPosition}, ${waveRiseScale(fillPercent)})`)
        .each('start', () => wavePath.attr('transform','translate(1,0)'))
    }else {
      waveGroup.attr('transform', `translate(${waveGroupXPosition}, ${waveRiseScale(fillPercent)})`)
    }

    // 开启浪花流动动画
    if(config.waveAnimate) {
      self.animateWave(wavePath, waveAnimateScale, config.waveAnimateTime)
    }      
  }

  /**
   *  浪花
   *  @param    {[type]}  wavePath             [description]
   *  @param    {[type]}  waveAnimateScale [description]
   *  @param    {[type]}  time             [description]
   *  @return   {void}
   */
  animateWave(wavePath, waveAnimateScale, time) {
    const self = this
    const config = self.config
    wavePath.attr('transform', `translate(${waveAnimateScale(wavePath.attr('T'))}, 0)`)
    wavePath.transition()
      .duration(config.waveAnimateTime * (1 - wavePath.attr('T')))
      .ease('linear')
      .attr('transform', `translate(${waveAnimateScale(1)}, 0)`)
      .attr('T', 1)
      .each('end', function(){
        wavePath.attr('T', 0)
        self.animateWave(wavePath, waveAnimateScale, time)
      })
  }

  /**
   *  裁剪路径属性设置
   *  @param    {object}  path     path元素
   *  @param    {function}  clipArea clipArea方法
   *  @return   {void}
   */
  setClipPathAttribute(path, clipArea) {
    path.attr('d', clipArea)
      .attr('T', 0)  
  }

  /**
   *  创建裁剪路径
   *  @param    {object}  defs defs元素
   *  @return   {void}
   */
  addClipPath(defs) {
    this.waveGroup = defs.append('clipPath')
      .attr('id', clipId)
    this.wavePath = this.waveGroup.append('path') 
  }
}

