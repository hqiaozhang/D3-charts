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
import { feature } from 'topojson'
import AddSvg from './addSvg.js'
import AddHeat from './addHeat.js'
import { makeHeatMapData } from './util.js' 
import AddAreaName from './addAreaName.js'
// 地图json路径
const mapUrl = loader.mapHost

export default class MainHeatMap {
  /**
   * 地图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 1200,
      height: 1400,
      mapClass: 'main',
      itemStyle: {
        hover: {
          fill: '#0195ad'
        },
        gradient: {
          colors: ['#277eeb', '#353ee7', '#6562f5', '#5687f9']
        },
        rect: {
          width: 110,
          height: 45,
          slice: 3
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
    // 主城数据
    this.mainData = []
    // 地图数据  
    d3.json(`${mapUrl}/cqMain.json`, (data) => {
      let root = feature(data, data.objects.cqMain) 
      this.features = root.features
      const get = new AddSvg(selector, this.config, this.features) 
      this.geoPath = get.geoPath
      this.mergeArea = d3.set(['北部新区'])
      // 地图阴影 g元素
      const mapShadowGroup = get.shadowGroup
      mapShadowGroup.attr('fill', '#2f527a')
      // 地图path g元素
      this.pathGroup = get.pathGroup
      this.pathGroup.attr('stroke', '#1eabef')
      // 渲染阴影
      this.renderMapPath(mapShadowGroup, 0)
      // 渲染地图path  
      this.renderMapPath(this.pathGroup, 1)  
      // 实例化热力图
      this.addHeat = new AddHeat(selector)   
      // 添加地区名字，实例化
      this.names = new AddAreaName(selector, this.config)
      this.names.render(this.mainData)
    })
  }

  /**
   *  渲染地图路径
   *  @param    {object}  g       g元素
   *  @param    {number}  type 类型  0 是阴影， 1是地图
   *  @return   {void}   
   */
  renderMapPath(g, type) {
    const self = this
    // 获取update部分并处理  
    let update = g.selectAll('path')
      .data(self.features) 
    // 获取并处理enter部分  
    update.enter()
      .append('path')  
    // 处理update部分  
    update.call(::self.setMapPathAttribute, type)
    // 获取并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  设置地图路径属性
   *  @param    {object}  path       path元素
   *  @param    {number}  type 类型  0 是阴影， 1是地图
   *  @return   {void}  
   */
  setMapPathAttribute(path, type) {
    const self = this
    path.attr('class', (d) => `mpath2-${type}-${d.properties.id} mpath2-${type}`)
      .attr('d', self.geoPath)
      .attr('name', d => d.properties.name)
      .attr('stroke', d => {
        if(d.properties.name === '渝北区' || d.properties.name === '北部新区') {
          return 'none'
        }
      })
    
    // 该方法要调用两次(阴影和真实地图，但循环[地图path]一遍即可)  
    if(type){
      path.each((d) => {
        let center = self.geoPath.centroid(d)
        self.areaCenters[d.properties.id] = center
        self.mainData.push({
          name: d.properties.name,
          id: d.properties.id,
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
      // 赋值数据  
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
