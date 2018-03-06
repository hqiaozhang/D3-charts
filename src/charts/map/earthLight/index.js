/**
 * @Author:      zhanghq
 * @DateTime:    2018-01-11 16:15:29
 * @Description: 旋转地图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2018-01-11 16:15:29
 */

import echarts from 'echarts'
import 'echarts-gl' 
import * as contour from '@/loader/common/scripts/d3-contour.js' 
import * as geo from '@/loader/common/scripts/d3-geo.js'
import * as timer from '@/loader/common/scripts/d3-timer.js' 
import _ from 'lodash'

import environment from './images/canvas-bg.jpg'
import baseTexture from './images/baseTexture.jpg'
import heightTexture from './images/heightTexture.jpg'
import texture1 from './images/1.png'
 
export default class EarthLight {
  /**
   * 地图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting() {
    return {
      // 动画光颜色
      color: '#0b233e',
      lineWidth: 0.5,
      levels: 300,
      // 表层混合强度，就当是光晕
      threshold: 0.01,
      intensity: 8,
      width: 4096, // 可见区域的宽
      height: 2048, // 可见区域的高
      globe: {
        
        globeRadius: 60, // 地球半径
        // canvas背景
        environment: environment,
        baseTexture: baseTexture,
        heightTexture: heightTexture,

        displacementScale: 0.08,
        displacementQuality: 'high',
      // baseColor: '#010613',
        shading: 'realistic',
        realisticMaterial: {
          roughness: 0.2,
          metalness: 0
        },

        postEffect: {
          enable: true,
          depthOfField: {
              // enable: true
          }
        },
        light: {
          ambient: {
            intensity: 0
          },
          main: {
            intensity: 0.5,
            shadow: false
          },
          ambientCubemap: {
            texture: texture1,
            exposure: 1,
            diffuseIntensity: 0.5,
            specularIntensity: 2
          }
        },
        viewControl: {
          autoRotate: true
        },

        layers: [{
          type: 'blend',
          blendTo: 'emission',
          texture: '',
          intensity: 7
        }]
      }
    }
  }

  /**
   * Creates an instance of Earth
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) { 
    this.selector = selector
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.earth = echarts.init(document.querySelector(selector))
    let canvas = document.createElement('canvas')
    canvas.width = this.config.width
    canvas.height = this.config.height
    let context = canvas.getContext('2d')
    context.lineWidth = this.config.lineWidth
    context.strokeStyle = this.config.color
    context.fillStyle = this.config.color
    context.shadowColor = this.config.color
    this.canvas = canvas
    this.context = context
    
  }

  /**
   *  加载图图片渲染
   *  @param    {string}  url 图片路径 
   *  @return   {void}   
   */
  image(url) {
    return new Promise(function (resolve) {
      let image = new Image()
      image.src = url
      image.onload = () => {
        let canvas = document.createElement('canvas')
        canvas.width = image.width / 8
        canvas.height = image.height / 8
        let context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(context.getImageData(0, 0, canvas.width, canvas.height))
      }
    })
  }

  /**
   *  初始化Charts
   *  @param    {object}  opt 配置项
   *  @return   {void}   
   */
  initCharts(opt) {
    const self = this
    let canvas = document.createElement('canvas')
    let contourChart = echarts.init(canvas, null, {
      width: 4096,
      height: 2048
    })
    let img = new echarts.graphic.Image({
      style: {
        image: opt.image,
        x: -1,
        y: -1,
        width: opt.image.width + 2,
        height: opt.image.height + 2
      }
    })

    contourChart.getZr().add(img) 
    opt.onupdate = () => {
      img.dirty()
    }
    self.config.globe.layers[0].texture = contourChart
    self.earth.setOption(self.config)
  }

  /**
   *  渲染地球
   *  @return   {void}  
   */
  render() {
    const self = this
    let canvas = self.canvas
    let context = self.context
    let config = self.config
    self.image(heightTexture).then((image) => {
      let m = image.height
      let n = image.width
      let values = new Array(n * m)
      let contours = contour.d3.contours().size([n, m]).smooth(true)
      let projection = geo.d3.geoIdentity().scale(canvas.width / n)
      let path = geo.d3.geoPath(projection, context)
      //   
      for (let j = 0, k = 0; j < m; ++j) {
        for (let i = 0; i < n; ++i, ++k) {
          values[k] = image.data[k << 2] / 255 // << 左移运算符
        }
      }

      let opt = {
        image: canvas
      }
      let results = []

      /**
       *  画灯光
       *  @return   {void}  
       */
      function redraw() {
        results.forEach(function (d, idx) {
          context.beginPath()
          path(d)
          context.globalAlpha = 1
          context.stroke()
          if (idx > config.levels / 5 * 3) {
            context.globalAlpha = 0.01
            context.fill()
          }
        })
        opt.onupdate()
      }

      /**
       *  更新线灯光
       *  @param    {number}  threshold [description]
       *  @param    {number}  levels    [description]
       *  @return   {void}  
       */
      function update(threshold, levels) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        let thresholds = []
        for (let j = 0; j < levels; j++) {
          thresholds.push((threshold + 1 / levels * j) % 1)
        }
        results = contours.thresholds(thresholds)(values)
        // 调用灯光渲染
        redraw()
      }
      // 使用定时器加载灯光
      timer.d3.timer(function (t) {
        let threshold = t % 10000 / 7000 
        update(threshold, 1)
      })
      // 初始化canvas
      self.initCharts(opt)
      // 初始化调用灯光
      update(config.threshold, config.levels)
    })
  }
}
