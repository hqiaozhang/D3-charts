/**
 * @Author:      zhanghq
 * @DateTime:    2017-10-26 17:17:16
 * @Description: 转盘图表
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-10-26 17:17:16
 */
import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData } from '../../util/util'
import filterHbs from './hbs/filter.hbs'

export default class Turntable {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      itemStyle: {
        color: ['#ffb034', '#ff7646'],
        innerRadius: 58,
        outerRadius: 65,
        gradient: {
          x1: '0%',
          y1: '0%',
          x2: '0%',
          y2: '100%',
          offset1: '20%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 0.8
        }
      }
    }
  }

  /**
   * Creates an instance of Turntable
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    // 获取一系列id
    this.gId = genSVGDocID()
    this.gradientId = genSVGDocID()
    const { width, height, itemStyle } = this.config 

    // 创建svg元素
    const svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    const defs = svg.append('defs')  
    // 渐变配置项
    let gradientCfg = {}
    gradientCfg.stopColor = itemStyle.color[0]
    gradientCfg.endColor = itemStyle.color[1]
    gradientCfg.gradient = itemStyle.gradient
    gradientCfg.id = this.gradientId
    defs.html(filterHbs({
      config: [gradientCfg]
    }))  
    this.arcPath = d3.svg.arc()
      .innerRadius(58)
      .outerRadius(65)  

    this.angle = {
      startAngle: -Math.PI * 0.5, endAngle: Math.PI * 0.5
    }  
    // 比例尺
    self.linear = null

    this.svg = svg  
  }

  /**
   *  渲染
   *  @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'value|10-100': 1
   *    }
   *  ]
   *  @param {array} data 渲染组件需要的数据项
   *  @return   {void}
   */
  render(data) {
    const self = this
    const { width, height } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    } 
    // 调用数据渲染
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
      .call(::self.setGroupAttribute)

    let dataset = []
    data.map((d) => dataset.push(d.value))  

    let max = d3.max(dataset)
    // 定义比例尺
    self.linear = d3.scale.linear()
      .domain([0, max])
      .range([-Math.PI * 0.55, Math.PI * 0.5]) // 从-Math.PI * 0.55开始是为了防止值特别小的时候看不见了  

    let g = update.enter()
      .append('g')  
      .call(::self.setGroupAttribute, data)

    g.append('path')  
      .call(::self.setArcPathAttribute, dataset)  
      
    g.append('path')  
      .call(::self.setBgPathAttribute)
  }

  setArcPathAttribute(path, data) {
    const self = this
    const angle = self.angle
    path.attr('class', 'data-path')
      .attr('d', (d, i) => {
        angle.endAngle = self.linear(data[i])
        return self.arcPath(angle)
      })
      .attr('fill', `url(#${self.gradientId})`)
  }

  setBgPathAttribute(path) {
    const self = this
    const polygon = 'M56.000,86.000 C32.252,86.000 13.000,66.748 13.000,43.000'
      + 'C13.000,41.370 13.099,39.764 13.276,38.181 L0.002,29.067 L16.452,26.102'
      + 'C23.018,10.755 38.251,0.000 56.000,0.000 C79.748,0.000 99.000,19.252 99.000,43.000'
      + 'C99.000,66.748 79.748,86.000 56.000,86.000 Z'
    path.attr('class', 'bg-path')
      .attr('fill', `url(#${self.gradientId})`)
      .attr('transform', (d) => {
        var rotate = 360 / self.linear(d.value) 
        // var translate = 0
         
        // if(rotate > 90) {
        //   rotate = 90
        //   translate = 360 / rotate
        // }
        // if(rotate < -90) {
        //   rotate = -90
        //   translate = 360 / rotate
        // }
        rotate = 19
       return `translate(0, 0) scale(1) rotate(${rotate}, 55, 45)`
      })
      .attr('d', polygon)
  }

  /**
   *  背景圆
   *  @example: [example]
   *  @param    {[type]}  circle [description]
   */
  setCircleAttribute(circle) {
    circle.attr('class', 'bg-circle')
      .attr('r', 20)
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke', '#eee')
  }

  /**
   *  设置数据g元素属性
   *  @param    {array}  g  g元素
   *  @return   {void}
   */
  setGroupAttribute(g, data) {
    const self = this
    const { width, height } = self.config
    g.attr('transform', (d, i) => `translate(${width / data.length * i + 100}, ${height / 2})`)
      .attr('class', `group-${self.gId}`)
  }
}

