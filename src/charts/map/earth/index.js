/**
 *
 * @Author:      Oceanxy
 * @DateTime:    2018/1/8 22:01
 * @Description: echarts-gl地球组件
 * @Last Modified By: Oceanxy
 * @Last Modified Time: 2018/1/8 22:01
 */

import echarts from 'echarts'
import echartsGl from 'echarts-gl'
import _ from 'lodash'
import $ from 'jquery'
import heightTexture from './images/heightTexture.jpg'
import baseTexture from './images/baseTexture.jpg'
import texture1 from './images/texture1.jpg'
import texture2 from './images/texture2.png'
import environment from './images/environment.jpg'

window.echartsGl = echartsGl

export default class globe {
  defaultSetting() {
    return {
      width: 1920, // 可见区域的宽
      height: 1080, // 可见区域的高
      show: true,
      globeRadius: 100,
      globeOuterRadius: 150,
      globe: { // 地球组件
        width: 1920, // 地球组件的宽
        height: 1080, // 地球组件的高
        baseTexture: baseTexture, // 基础贴图
        heightTexture: heightTexture, // 高度贴图
        displacementScale: 0.15, // 地球顶点位移的大小
        displacementQuality: 'ultra', // 地球顶点位移的质量
        shading: 'realistic', // 地球中三维图形的着色效果
        globeRadius: 60, // 地球半径
        environment: environment, // 地球的背景贴图
        light: { // 光照
          ambient: { // 全局的环境光设置
            intensity: 0.1 // 环境光的强度
          },
          main: { // 场景主光源的设置，在 globe 组件中就是太阳光
            intensity: 1.5
          }
        }
      },
      environment: environment, // 地球的背景贴图
      baseTexture: baseTexture,
      heightTexture: heightTexture,
      displacementTexture: '',
      displacementScale: 0,
      displacementQuality: 'medium',
      shading: 'realistic',
      realisticMaterial: {
        detailTexture: '',
        textureTiling: 1,
        textureOffset: 0,
        roughness: 0.5,
        metalness: 0,
        roughnessAdjust: 0.5,
        metalnessAdjust: 0.5,
        normalTexture: ''
      },
      lambertMaterial: {
        detailTexture: '',
        textureTiling: 1,
        textureOffset: 0
      },
      colorMaterial: {
        detailTexture: '',
        textureTiling: 1,
        textureOffset: 0
      },
      light: {
        main: {
          color: '#fff',
          intensity: 1,
          shadow: false,
          shadowQuality: 'medium',
          alpha: 0,
          beta: 0,
          time: new Date()
        },
        ambient: {
          color: '#fff',
          intensity: 0.2
        },
        ambientCubemap: {
          texture: '',
          diffuseIntensity: 0.5,
          specularIntensity: 0.5
        }
      },
      postEffect: {
        enable: false,
        bloom: {
          enable: false,
          bloomIntensity: 0.1
        },
        depthOfField: {
          enable: false,
          focalDistance: 50,
          focalRange: 20,
          fstop: 2.8,
          blurRadius: 10
        },
        screenSpaceAmbientOcclusion: {},
        SSAO: {
          enable: false,
          quality: 'medium',
          radius: 2,
          intensity: 1
        },
        colorCorrection: {
          enable: true,
          lookupTexture: '',
          exposure: 0,
          brightness: 0,
          contrast: 1,
          saturation: 1
        },
        FXAA: {
          enable: false
        }
      },
      temporalSuperSampling: {
        enable: 'auto'
      },
      viewControl: {
        projection: 'perspective',
        autoRotate: false,
        autoRotateDirection: 'cw',
        autoRotateSpeed: 10,
        autoRotateAfterStill: 3,
        damping: 0.8,
        rotateSensitivity: 1,
        zoomSensitivity: 1,
        panSensitivity: 0,
        panMouseButton: 'left',
        rotateMouseButton: 'middle',
        distance: 150,
        minDistance: 40,
        maxDistance: 400,
        orthographicSize: 150,
        maxOrthographicSize: 20,
        minOrthographicSize: 400,
        alpha: 0,
        beta: 0,
        center: [0, 0, 0],
        minAlpha: -90,
        maxAlpha: 90,
        minBeta: null,
        maxBeta: null,
        animation: true,
        animationDurationUpdate: 1000,
        animationEasingUpdate: 'cubicInOut',
        targetCoord: [116.46, 39.92]
      },
      layers: [
        {
          show: true,
          type: 'overlay',
          name: '',
          blendTo: 'albedo',
          intensity: 1,
          shading: 'lambert', 
          distance: null, 
          texture: texture1 // 贴图路径
        },
        {
          type: 'overlay',
          texture: texture2,
          shading: 'lambert',
          distance: 5
        }
      ],
      zlevel: -10,
      left: 'auto',
      top: 'auto',
      right: 'auto',
      bottom: 'auto'
    }
  }
  
  /**
   * 构造器
   * @param {string} selector 选择器
   * @param {Object} opt 配置项
   */
  constructor(selector, opt) {
    this.selector = selector
    this.config = _.merge(this.defaultSetting(), opt)
    this.canvas = document.createElement('canvas')
    this.earth = echarts.init(this.canvas, null, this.config)
    this.earth.setOption(this.config)
  }
  
  /**
   * 渲染地球组件
   */
  render() {
    $(this.selector).append(this.canvas)
  }
}
