/**
 * @Author:      zhanghq
 * @DateTime:    2017-12-12 11:26:24
 * @Description: 画地图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-12-12 11:26:24
 */

import d3 from 'd3'
import _ from 'lodash'
import { getZoomScale, getCenters, genSVGDocID } from './util'
import filterHbs from './hbs/filter.hbs'

export default class AddElement {
  /**
   * 地图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 1200,
      height: 1400,
      mapClass: 'area',
      itemStyle: {
        fill: ['#0e2c60', '#050112'],
        stroke: ['#0e2c60', '#2e8ecc'],
        strokeW: [2, 2],
        gradient: {
          x1: '30%',
          y1: '20%',
          x2: '80%',
          y2: '60%',
          colors: ['#0b9acc', '#103ed9', '#103ed9', '#0744dc'],
          offsets: ['10%', '45%', '75%', '100%'] 
        }
      }
    }  
  }

  /**
   * Creates an instance of AddSvg
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt, features) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    const { width, height, itemStyle, mapClass } = this.config  
    const { fill, stroke, strokeW } = itemStyle
    const filterId = genSVGDocID()
    const gradientId = genSVGDocID()
    const patternId = genSVGDocID()

    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height) 
      .attr('class', `${mapClass}-svg`)

    const defs = this.svg.append('defs') 
    // 处理配置项颜色
    const { colors, offsets } = itemStyle.gradient
    let stops = []
    colors.map((d, i) => {
      stops.push({
        color: d,
        offset: offsets[i]
      })
    })
    itemStyle.gradient.stops = stops
    // 渐变配置项
    let gradientCfg = {
      gradient: itemStyle.gradient,
      id: gradientId,
      patternId: patternId
    } 
    // 添加滤镜效果
    defs.html(filterHbs({
      config: [gradientCfg],
      filterId: filterId
    }))   

    const mapShadowGroup = this.svg.append('g')
      .attr('class', `${mapClass}-map-shadow-group`) 
      .attr('transform', 'translate(0, 30)') 
      .attr('fill', fill[0])
      .attr('stroke-width', strokeW[0])
      .attr('stroke', stroke[0])  
      .attr('filter', `url(#${filterId})`)
      
    // 地图路径组元素  
    const mapPathGroup = this.svg.append('g')
      .attr('class', `${mapClass}-map-path-group`) 
      .attr('fill', `url(#${patternId})`)
      .attr('filter', `url(#${filterId})`)
      .attr('stroke-width', strokeW[1])
      .attr('stroke', stroke[1])   
      
    // 获取地图缩放值
    let scale = getZoomScale(features, width, height - 200)
    // 获取地图显示的中心点
    let center = getCenters(features)

    // 定义一个投影函数
    let projection = d3.geo.mercator()  
      .scale(scale * 51)
      .center(center)
      .translate([width / 2, height / 2])

    // 定义一个路径函数  
    const geoPath = d3.geo.path()  
      .projection(projection)    

    return {
      shadowGroup: mapShadowGroup,
      pathGroup: mapPathGroup,
      geoPath: geoPath
    }  
  }
}
