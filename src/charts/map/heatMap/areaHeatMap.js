/**
 * @Author:      zhanghq
 * @DateTime:    2017-12-06 13:38:14
 * @Description: 各区域地图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-12-06 13:38:14
 */

import $ from 'jquery'
import d3 from 'd3'
import _ from 'lodash'
import loader from '@/loader/base.config.js'
import AddSvg from './addSvg.js'
import {feature, merge} from 'topojson'
import AddHeat from './addHeat.js'
import { makeHeatMapData } from './util.js' 
import AddAreaName from './addAreaName.js'
// 地图json路径
const mapUrl = loader.mapHost

export default class AreaHeatMap {
  /**
   * 地图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 1850,
      height: 1030,
      mapClass: 'area',
      itemStyle: {
        hover: {
          fill: '#0195ad'
        }
      },
      // 主城区样式
      mainStyle: {
        rect: {
          width: 120,
          height: 40 
        },
        fontStyle: {
          size: 22,
          color: '#fff'
        }
      }
    }  
  }

  /**
   * Creates an instance of Map
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 记录所有区域的中心点，以该区域ID为key，中心点为value
    this.areaCenters = {}
    // 地图数据  
    d3.json(`${mapUrl}/chongqing.json`, (data) => {
      let root = feature(data, data.objects.chongqing) 
      this.features = root.features
      // 不包含主城区的数据
      this.areaData = []
      // 重庆主城名称的集合
      this.mergeArea = d3.set(['渝北区', '巴南区', '北碚区', '九龙坡区', '南岸区', 
        '江北区', '沙坪坝区', '大渡口区', '渝中区', '两江新区'
      ])
      // 合并主城区
      this.mainData = merge(data, 
        data.objects.chongqing.geometries.filter((d) => {
          return this.mergeArea.has(d.properties.name)
        }))

      const get = new AddSvg(selector, this.config, this.features) 
      this.geoPath = get.geoPath
      // 地图阴影 g元素
      const mapShadowGroup = get.shadowGroup
      // 地图path g元素
      this.pathGroup = get.pathGroup
      // 渲染阴影
      this.renderMapPath(mapShadowGroup, 0)
      // 渲染地图path  
      this.renderMapPath(this.pathGroup, 1)  
      // 实例化热力图
      this.addHeat = new AddHeat(selector)   
      // 添加地区名字，实例化
      this.names = new AddAreaName(selector, this.config)
      this.names.render(this.areaData) 
      // 渲染主城区名称
      this.renderMainName()
    })
  }

  /**
   *  渲染主城区名称
   *  @return {void}   
   */
  renderMainName() {
    const { mapClass, mainStyle } = this.config
    let mainCenter = this.geoPath.centroid(this.mainData)
    let nameSvg = d3.selectAll(`.${mapClass}-names-svg`)
    const { rect, fontStyle } = mainStyle
    let g = nameSvg.append('g')
      .attr('class', 'main-name')
      .attr('transform', `translate(${mainCenter[0] - rect.width / 2}, ${mainCenter[1] - 50})`)
    g.append('rect')
      .attr('fill', 'rgba(17, 27, 142, 0.9)')
      .attr('width', rect.width)
      .attr('height', rect.height)
      .attr('stroke', '#1866cc')
      .attr('stroke-width', 2)
    g.append('text')
      .attr('fill', fontStyle.color)
      .attr('font-size', fontStyle.size)
      .attr('text-anchor', 'middle')
      .attr('x', rect.width / 2)
      .attr('y', 25)
      .text('重庆主城')   
  }

  /**
   *  渲染地图路径
   *  @param    {object}  g       g元素
   *  @param    {number}  type 类型  0 是阴影， 1是地图
   *  @return {void}   
   */
  renderMapPath(g, type) {
    const self = this
    // 获取update部分并处理  
    let update = g.selectAll('path')
      .data(self.features.filter((d) => { 
        // 过滤主城区
        return !self.mergeArea.has(d.properties.name)
      })) 
 
    // 获取并处理enter部分  
    update.enter()
      .append('path')  
    // 处理update部分  
    update.call(::self.setMapPathAttribute, type)
    // 获取并处理exit部分  
    update.exit().remove()  

    const { fill } = self.config.itemStyle.hover
    // 绘制主城区
    const mainPath = g.append('path')  
      .datum(this.mainData)
      .attr('d', self.geoPath)
      .style('pointer-events', 'all') 
      .attr('class', 'main-path') 
    // 主城事件  
    mainPath
      .on('mouseover', () => mainPath.attr('fill', fill))
      .on('mouseout', () => mainPath.attr('fill', ''))  
  }

  /**
   *  设置地图路径属性
   *  @param    {object}  path       path元素
   *  @param    {number}  type 类型  0 是阴影， 1是地图
   *  @return {void}   
   */
  setMapPathAttribute(path, type) {
    const self = this
    path.attr('class', (d) => `mpath-${type}-${d.id} mpath-${type}`)
      .attr('d', self.geoPath)
    // 该方法要调用两次(阴影和真实地图，但执行[真实path]一遍即可)  
    if(type) {
      path.each((d) => {
        let center = self.geoPath.centroid(d)
        self.areaCenters[d.id] = center
        self.areaData.push({
          name: d.properties.name,
          id: d.id,
          x: center[0],
          y: center[1]
        })
        d.center = center
      })
    }  
    // end if
  }

  /**
   *  地图文字块添加数据
   *  @param    {array}  data 地图数据
   * @return {void}   
   */
  pathSetData(data) {
    const self = this
    let curArea = data.curArea
    const { mapClass } = self.config
    let nameSvg = d3.selectAll(`.${mapClass}-names-svg`)
      .attr('curArea', curArea)
    // 清空所有value值
    nameSvg.selectAll('.name-group')
      .attr('value', 0)  
    data.map((d) => {
      nameSvg.selectAll(`.name-${d.id}`)
        .attr('value', d.value)
    })
  }

  /**
   * 渲染热力图
   * @param  {array} data 地图数据
   * @return {void}      
   */
  render(data) {
    const self = this
    self.pathSetData(data)
    let centers = self.areaCenters
    let datas = makeHeatMapData(data, centers)
    self.addHeat.render(datas)
    // 样式被heatMap修改了，还原回来
    $(self.selector).css('position', 'absolute')
  }
}
