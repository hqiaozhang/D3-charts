import d3 from 'd3'
import _ from 'lodash'
import $ from 'jquery'
import mapJsonFile from './data/chongqingtopo.json'
import { feature } from 'topojson'
import { genSVGDocID } from '../../util/util'
import { fetch } from '@/util/request'
import { originToDeformation } from '@/util/zoom/zoom'
import './css/index.css'

// 地图提示框
import mapTips from './hbs/tips.hbs'

const mapId = genSVGDocID()

export default class DrillDownMap {
  /**
   * Creates an instance of DrillDownMap.
   * @param {document} selector 地图组件容器元素
   * @param {object} opt 地图组件配置项
   * @memberof DrillDownMap
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    const{ width, height, subMap } = this.config
    // 一级地图数据
    this.geoJson = feature(mapJsonFile, mapJsonFile.objects.chongqing)
    this.selector = selector

    const svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('id', mapId)

    // 最底层的地图
    this.bottomMap = svg.append('g')
      .attr('class', 'bottomMap')

    // 各个区域上的撒点
    svg.append('g')
      .attr('class', 'main-circle-group')

    const{ show, backBtnClass } = subMap
    // 可下钻到二级地图
    if(show) {
      // 各个区县的地方
      this.countyMap = svg.append('g')
        .attr('class', 'countyMap')
        .style('disploy', 'none')

      svg.append('g')
        .attr('class', 'sub-circle-group')
        .style('disploy', 'none')

      // 添加返回按钮
      d3.select(selector)
        .append('div')
        .text('返回')
        .attr('class', backBtnClass)

      // 点击返回按钮，切换到主地图
      $(`.${backBtnClass}`).on('click', () => {
        $(`#${mapId} .bottomMap`).fadeIn(100)
        $(`#${mapId} .countyMap`).fadeOut(200)
        $(`#${mapId} .main-circle-group`).fadeIn(100)
        $(`#${mapId} .sub-circle-group`).fadeOut(100)
      })
    }
    
    // 路径函数
    this.path = null

    // 记录所有区域的中心点，以该区域ID为key，中心点为value
    this.areaCenters = {}

    // 地图上撒点的数据
    this.mapData = []
  }

  /**
   * 根据各个区域的地理信息数据生成对应的path函数
   * 
   * @param {any} features 地理信息数据
   * @returns path函数
   * @memberof DrillDownMap
   */
  genPath(features) {
    const self = this
    const{ width, height } = self.config
    // 获取地图缩放比例和中心点
    const scale = self.getZoomScale(features, width, height)
    const center = self.getCenters(features)

    // 投影函数
    const projection = d3.geo.mercator()
      .scale(scale * 50)
      .center(center)
      .translate([width / 2, height / 2])
    
    // 路径函数
    return d3.geo.path()
      .projection(projection)
  }

  /**
   * 渲染地图
   * 
   * @param {document} groups 地图path的容器
   * @param {object} data 绘制地图的数据源
   * @memberof DrillDownMap
   * @return {null} null
   */
  renderMap(groups, data) {
    const self = this
    // 获取update部分
    const update = groups.selectAll('.map-doc-group')
      .data(data)
    
    // 获取enter部分
    let enter = update.enter()

    // 获取exit部分
    let exit = update.exit()

    // 处理enter部分
    const pathGroup = enter.append('g')
      .attr('class', 'map-doc-group')
    
    const paths = pathGroup.append('path')

    paths.call(self.setMapStyle.bind(self))
    
    // 处理update部分
    update.selectAll('.map-doc-group').call(self.setMapStyle.bind(self))

    // 处理exit部分
    exit.remove()
  }

  /**
   * 渲染地图上的撒点
   * 
   * @param {document} container 散点容器元素
   * @param {array} data 数据项
   * @memberof DrillDownMap
   */
  renderPoints(container, data) {
    const self = this
    self.mapData = data
    let points = d3.select(container)
      .selectAll('.single-circle')
      .data(data)
    
    let enter = points.enter()
    let enterCircle = enter
      .append('circle')
      .attr('class', 'single-circle')
      .attr('r', 10)
      .attr('fill', '#debc00')
    
    let coordinate = []

    for(let currentId of data) {
      /**
       * center 格式：
       * {
       *    id: value
       * }
       */
      if(self.areaCenters[currentId.areaId]) {
        coordinate.push(self.areaCenters[currentId.areaId])
      }
    }

    // 处理enter部分
    enterCircle.call(self.setPointStyle.bind(self), coordinate)

    // 处理update部分
    points.call(self.setPointStyle.bind(self), coordinate)

    // 获取和处理exit部分
    let exit = points.exit()
    exit.remove()
  }

  /**
   * 设置地图上撒点的样式
   * 
   * @param {any} points 地图上撒点的元素
   * @param {any} coordinate 撒点的坐标
   * @memberof DrillDownMap
   */
  setPointStyle(points, coordinate) {
    const self = this
    points.attr('cx', (d, i) => coordinate[i][0])
      .attr('cy', (d, i) => coordinate[i][1])
      .style('cursor', 'pointer')
      .on('mousemove', (d) => {
        self.showTips(d, self.getMousePosition(d3.event))
      })
  }

  /**
   * 获取鼠标真实位置，缩放后鼠标位置可能会存在偏差，需要进行适当的转换
   * 
   * @param {event} evt 鼠标事件句柄
   * @returns 
   * @memberof DrillDownMap
   */
  getMousePosition(evt) {
    let pos = originToDeformation([evt.clientX + 20, evt.clientY - 20])
    return {
      x: pos[0],
      y: pos[1]
    }
  }

  /**
   * 鼠标移动到地图上时显示提示框
   * 
   * @param {object} data 提示框上显示的信息
   * @param {object} {x, y} 提示框坐标位置
   * @memberof DrillDownMap
   */
  showTips(data, {x, y}) {
    const self = this
    const container = $(self.selector)
    const tipSelector = container.find('.map-info-tips')
    if(tipSelector.length > 0) {
      tipSelector.show()
      tipSelector.find('.title').text(data.name)
      tipSelector.find('.content').text(data.value || 0)
    } else {
      container.append(mapTips({
        data: data
      }))
    }

    container.find('.map-info-tips')
      .css({
        left: x,
        top: y
      })
  }

  /**
   * 鼠标移出地图外，隐藏提示框
   * 
   * @memberof DrillDownMap
   */
  hideTips() {
    const self = this
    const container = $(self.selector)
    const tipSelector = container.find('.map-info-tips')
    tipSelector.hide()
  }
  /**
   * 绘制全市底层地图
   * 
   * @memberof DrillDownMap
   */
  renderBottomMap() {
    const self = this
    self.path = self.genPath(self.geoJson.features)
    self.renderMap(self.bottomMap, self.geoJson.features)
  }

  /**
   * 渲染具体的区县地图
   * 
   * @param {any} countyID 区县在geojson中的ID
   * @memberof DrillDownMap
   */
  renderCountyMap(countyID) {
    const self = this
    import(`./data/counties/${countyID}.json`)
      .then(countyJSON => {
        self.path = self.genPath(countyJSON.features)
        self.renderMap(self.countyMap, countyJSON.features)
        // 发起ajax请求，请求二级地图数据，渲染撒点
        fetch('fetchSubMap',
          data => self.renderPoints('.sub-circle-group', data))
      })
  }

  /**
   * 设置地图path样式
   * 
   * @param {document} path 地图path组元素
   */
  setMapStyle(path) {
    const self = this
    const{ itemStyle, subMap } = self.config
    const{ fill, stroke, strokeWidth } = itemStyle
    const{ show } = subMap
    const mapPath = path.attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
      .style('cursor', 'pointer')
      .attr('fill', (d, i) => {
        // let centerObj = {}
        self.areaCenters[d.properties.id] = self.path.centroid(d)
        // self.areaCenters.push(centerObj)
        let color
        if(i % 2 == 0) {
          color = fill[0]
        } else if(i % 2 == 1) {
          color = fill[1]
        } else {
          color = fill[2]
        }
        return color
      })
      .attr('d', self.path)
      .on('mousemove', (d) => {
        let currentData
        for(let data of self.mapData) {
          if(d.properties.id === data.areaId) {
            currentData = data
          }
        }
        self.showTips(currentData || d.properties, 
          self.getMousePosition(d3.event))
      })
      .on('mouseout', () => self.hideTips())

    if(show) {
      mapPath.on('click', (d) => {
        const ZZJGDM = d.properties.ZZJGDM
        // 如果ZZJGDM存在，则可以点击下钻到具体区县
        if(ZZJGDM) {
          $(`#${mapId} .bottomMap`).fadeOut(100)
          $(`#${mapId} .countyMap`).fadeIn(200)
          $(`#${mapId} .main-circle-group`).fadeOut(100)
          $(`#${mapId} .sub-circle-group`).fadeIn(100)
          self.renderCountyMap(ZZJGDM)
        }
      })
    } 
  }

  /**
   * 地图默认配置项
   * 
   * @returns 
   * @memberof DrillDownMap
   */
  defaultSetting() {
    return {
      width: 900,
      height: 800,
      showTips: true,
      subMap: {
        show: true,
        backBtnClass: 'return-main-map'
      },
      itemStyle: {
        fill: ['#001e5a', '#301e5b', '#066e5a'],
        stroke: '#ccc',
        strokeWidth: 1
      }
    }
  }

  /**
   * 获取地图缩放比例
   * 
   * @param {object} features 地图数据
   * @param {number} width 容器宽度
   * @param {number} height 容器高度
   * @returns {number} 地图缩放比例值
   * @memberof DrillDownMap
   */
  getZoomScale(features, width, height) {
    // 最小经度
    let longitudeMin = 100000
    // 最小维度
    let latitudeMin = 100000
    // 最大经度
    let longitudeMax = 0
    // 最大纬度
    let latitudeMax = 0

    features.forEach(fts => {
      // [[最小经度，最小维度][最大经度，最大纬度]]
      const a = d3.geo.bounds(fts)

      if(a[0][0] < longitudeMin) {
        longitudeMin = a[0][0]
      }
      if(a[0][1] < latitudeMin) {
        latitudeMin = a[0][1]
      }
      if(a[1][0] > longitudeMax) {
        longitudeMax = a[1][0]
      }
      if(a[1][1] > latitudeMax) {
        latitudeMax = a[1][1]
      }
    })

    const longitude = longitudeMax - longitudeMin
    const latitude = latitudeMax - latitudeMin
    return Math.min(width / longitude, height / latitude)
  }

  /**
   * 获取地图中心点
   * 
   * @param {object} features 地图数据
   * @returns {array} 地图中心点经纬度
   * @memberof DrillDownMap
   */
  getCenters(features) {
    // 最小经度
    let longitudeMin = 100000
    // 最小维度
    let latitudeMin = 100000
    // 最大经度
    let longitudeMax = 0
    // 最大纬度
    let latitudeMax = 0

    features.forEach(fts => {
      // [[最小经度，最小维度][最大经度，最大纬度]]
      const a = d3.geo.bounds(fts)

      if(a[0][0] < longitudeMin) {
        longitudeMin = a[0][0]
      }
      if(a[0][1] < latitudeMin) {
        latitudeMin = a[0][1]
      }
      if(a[1][0] > longitudeMax) {
        longitudeMax = a[1][0]
      }
      if(a[1][1] > latitudeMax) {
        latitudeMax = a[1][1]
      }
    })

    const longitude = (longitudeMax + longitudeMin) / 2
    const latitude = (latitudeMax + latitudeMin) / 2
    return [longitude, latitude]
  }
}
