/**
 * @Author:      zhanghq
 * @DateTime:    2017-10-13 14:24:06
 * @Description: 中国地图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-10-13 14:24:06
 */
import d3 from 'd3'
import _ from 'lodash'
import { isNoData } from '../../util/util'
import { getZoomScale, getCenters } from './util'
import { addLegend } from './legend'
import mapBg from './images/china-map.png'
import mapJson from './mapJson/china.json'

let centerP = []
let setTime = 5000

export default class ChinaMap {
  /**
   * 地图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 1200,
      height: 870,
      itemStyle: {
        fill: ['#01fbfe', '#ffc702'],
        minR: 1, // 最小半径
        maxR: 20, // 最大半径
        strokeWidth: 15, 
        strokeOpacity: 0.5,
        exponent: 0.6 // 比例尺指数
      },
      // 图例配置项
      legend: {
        fill: ['#01fbfe', '#ffc702'],
        width: 45,
        height: 18,
        bottom: 60,
        data: ['人口迁入', '人口迁出'],
        text: {
          fontSize: 14,
          margin: {
            top: 5,
            left: 20
          }
        }
      }
    }  
  }

  /**
   * Creates an instance of ChinaMap
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    const { width, height } = this.config  
    // 创建svg元素
    const svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', `url(${mapBg}) no-repeat`)
      .style('background-size', '100% 100%')
      .style('background-position', '25px 0')
      
    // 地图路径组元素  
    this.mapPathGroup = svg.append('g')
      .attr('class', 'map-path-group')  

    // 迁入数据线条组元素  
    this.enterLineGroup = svg.append('g')  
      .attr('class', 'enter-line-group')  
    // 迁出数据线条组元素  
    this.outLineGroup = svg.append('g')  
      .attr('class', 'out-line-group')

    // 迁入数据组元素  
    this.enterDataGroup = svg.append('g')  
      .attr('class', 'enter-data-group')  
    // 迁出数据组元素  
    this.outDataGroup = svg.append('g')  
      .attr('class', 'out-data-group') 
    this.svg = svg  
    
    // 定时器   
    this.mapTimer = null  
    this.setInterval(0)  
    addLegend(this)

    setTimeout(() => {
      this.renderAreaName()
    }, 1000)
  }

  /**
   *  渲染
   *  @example: [example]
   *  @param    {[type]}  data [description]
   *  @return   {[type]}  [description]
   */
  render(data) {
    const self = this
    const { width, height } = self.config
    // 判断数据是否为空
    if(!data) {
      isNoData(self.svg, { width, height })
      return false
    }
    let features = mapJson.features
    // 获取地图缩放值
    let scale = getZoomScale(features, width, height)
    // 获取地图显示的中心点
    let center = getCenters(features)
    // 定义一个投影函数
    let projection = d3.geo.mercator()  
      .scale(scale * 55)
      .center(center)
      .translate([width / 2, height / 2])

    // 定义一个路径函数  
    let pathMethod = d3.geo.path()  
      .projection(projection) 

    // 渲染地图path  
    self.renderMapPath(pathMethod)  
    // 渲染地图数据
    self.renderMapData(data)
  }

  /**
   *  渲染地图路径
   *  @example: [example]
   *  @param    {[type]}  pathMethod [description]
   *  @param    {[type]}  features   [description]
   *  @return   {[type]}  [description]
   */
  renderMapPath(pathMethod) {
    const self = this
    // 获取update部分并处理  
    let update = self.mapPathGroup.selectAll('path')
      .data(mapJson.features)
      .call(this.setPathAttribute, pathMethod)
    // 获取并处理enter部分  
    update.enter()
      .append('path')  
      .call(this.setPathAttribute, pathMethod)
    // 获取并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  设置地图路径属性
   *  @param    {object}  path       path元素
   *  @param    {function}  pathMethod path方法
   */
  setPathAttribute(path, pathMethod) {
    path.attr('stroke-width', 0)
      .attr('fill', '#050840')
      .attr('opacity', 0)
      .attr('d', pathMethod)
      .attr('class', (d, i) => {
        let center = pathMethod.centroid(d)
        // 这两个点有点跑偏(地图与图片不能完全吻合)，移动下位置
        if(d.properties.name === '海南省') {
          center[0] = center[0] + 40
        }
        if(d.properties.name === '台湾省') {
          center[0] = center[0] + 50
        }
        d.center = center
        // 保留中间点天津市
        if(d.properties.name === '重庆市') {
          centerP = pathMethod.centroid(d)
        }
        return `path-${i}`
      })
  }

  renderMapData(data) {
    const self = this
    // 迁入数据
    let enterGroup = self.enterDataGroup
    let enterLine = self.enterLineGroup
    let enterData = data.qianru
    self.renderMarker(enterGroup, enterData, 2) 
    self.renderLine(enterLine, enterData, 2) 
    // 迁出数据
    let outGroup = self.outDataGroup
    let outLine = self.outLineGroup
    let outData = data.qianchu
    self.renderMarker(outGroup, outData, 1)
    self.renderLine(outLine, outData, 1) 
  }

  renderLine(group, data, type) {
    const self = this

    // 添加圆点组元素
    let update = group.selectAll('path')
      .data(data)
      .call(self.setLinePathAttribute.bind(self), type)
    // 处理enter部分  
    update.enter().append('path')
      .call(self.setLinePathAttribute.bind(self), type) 
    // 获取并处理exit部分  
    update.exit().remove()
  }

  /**
   * 画线
   * @param  {array} roots 根元素
   * @param  {array} posi  坐标点
   * @param  {object} cfg  配置项
   */
  setLinePathAttribute(path, type) {
    const self = this
    const { fill } = self.config.itemStyle
    path.attr('class', `${type === 1 ? 'out-line' : 'enter-line'}`)
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .attr('stroke', `${type === 1 ? fill[0] : fill[1]}`)
      .attr('d', (d)=> {
        let posi = self.getPathCenter(d)
        let QPosi = [centerP[0] + (posi[0] - centerP[0]) / 4, centerP[1]]
        return `M ${centerP[0]}  ${centerP[1]} Q${QPosi[0]} ${QPosi[1]} ${posi[0]} ${posi[1]}`
      })
  }

  renderMarker(group, data, config) {
    const self = this
    const { minR, maxR, exponent } = self.config.itemStyle
    let dataset = []
    data.forEach(function(d) {
      dataset.push(d.value)
    })
    // 指数比例尺
    let scale = d3.scale.pow()
      .domain([0, d3.max(dataset)])
      .range([minR, maxR])
      .exponent(exponent) // 设置指数  

    // 添加圆点组元素
    let update = group.selectAll('.circle')
      .data(data)
      .call(self.setCircleAttribute.bind(self), scale, config)
    // 获取并处理enter部分    
    update.enter().append('circle')
      .call(self.setCircleAttribute.bind(self), scale, config) 
    // 获取并处理exit部分  
    update.exit().remove()

    // // 添加value
    // let updateT = group.selectAll('.text')
    //   .data(data)
    //   .call(self.setDataTextAttribute.bind(self), scale, config)
    // // 获取并处理enter部分    
    // updateT.enter().append('text')
    //   .call(self.setDataTextAttribute.bind(self), scale, config) 
    // // 获取并处理exit部分  
    // updateT.exit().remove()
  }

  /**
   *  设置数据的value属性
   *  @example: [example]
   *  @param    {[type]}  text [description]
   */
  setDataTextAttribute(text) {
    const self = this
    text.attr('fill', '#fff')
      .attr('x', (d) => {
        let cx = self.getPathCenter(d)
        return cx[0]
      })
      .attr('y', (d) => {
        let cy = self.getPathCenter(d)
        return cy[1]
      })
      .attr('text-anchor', 'middle')
      .text((d) => d.value)
  }

  /**
   *  设置撒点圆的属性
   *  @param    {object}  circle circle元素
   *  @param    {function}  scale  scale函数
   *  @param    {number}   type  [description]
   */
  setCircleAttribute(circle, scale, type) {
    const self = this
    const { fill, strokeWidth, strokeOpacity } = self.config.itemStyle
    circle.attr('fill', `${type === 1 ? fill[0] : fill[1]}`)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-opacity', strokeOpacity)
      .attr('stroke', `${type === 1 ? fill[0] : fill[1]}`)
      .attr('class', () => `outerCircle${type}`)
      .attr('cx', (d) => {
        let cx = self.getPathCenter(d)
        return cx[0]
      })
      .attr('cy', (d) => {
        let cy = self.getPathCenter(d)
        return cy[1]
      })
      .attr('r', (d) => scale(d.value))
  }

  /**
   * 获取path中心位置
   * @param  {string} d        区域名字
   * @return {array}           中心点
   */
  getPathCenter(d) {
    let features = mapJson.features
    for(let j = 0, len = features.length; j < len; j++) {
      if(d.name === features[j].properties.name){
        return features[j].center
      }
    } 
  }

  /**
   *  渲染区域名字
   *  @return   {[type]}  [description]
   */
  renderAreaName() {
    const self = this
    let features = mapJson.features

    let g = self.svg.append('g')
      .attr('class', 'area-name')

    g.selectAll('text')
      .data(features)
      .enter()
      .append('text')
      .attr('fill', '#fff')
      .text((d) => {
        return d.properties.name
      })  
      .attr('x', (d) => {
        return d.center[0]
      })
      .attr('y', (d) => {
        return d.center[1]
      })
  }

  /*
    定时切换迁入迁出数据
   */
  setInterval(n) {
    let t = n
    const self = this
    clearInterval(self.mapTimer)
    self.mapTimer = setInterval(function() {
      t++ 
      self.switchData( t % 2 )
    }, setTime)
  }

  switchData(i) {
    if(i === 0) {
      d3.select('.enter-line-group').style('opacity', 1)
      d3.select('.out-line-group').style('opacity', 0)
      d3.selectAll('.out-data-group').style('opacity', 0)
      d3.selectAll('.enter-data-group').style('opacity', 1)
    } else{
      d3.select('.enter-line-group').style('opacity', 0)
      d3.select('.out-line-group').style('opacity', 1)
      d3.selectAll('.out-data-group').style('opacity', 1)
      d3.selectAll('.enter-data-group').style('opacity', 0)
    }
  }

}
