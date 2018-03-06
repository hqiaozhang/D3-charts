/**
 * @Author:      zhanghq
 * @DateTime:    2017-10-13 14:41:24
 * @Description: 处理地图的一些方法
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-10-13 14:41:24
 */

import d3 from 'd3'
import { randoms } from './random.js'

let ADDDATA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 
/**
 *  地图缩放
 *  @param     {object}    features [地图数据]
 *  @param     {number}    width    [容器width]
 *  @param     {number}    height   [容器height]
 *  @return    {number}  缩放范围
 */
export const getZoomScale = (features, width, height) => {
  let longitudeMin = 100000 // 最小经度
  let latitudeMin = 100000 // 最小维度
  let longitudeMax = 0 // 最大经度
  let latitudeMax = 0 // 最大纬度
  features.forEach(function(e) {
    let a = d3.geo.bounds(e) // [[最小经度，最小维度][最大经度，最大纬度]]
    if (a[0][0] < longitudeMin) {
      longitudeMin = a[0][0]
    }
    if (a[0][1] < latitudeMin) {
      latitudeMin = a[0][1]
    }
    if (a[1][0] > longitudeMax) {
      longitudeMax = a[1][0]
    }
    if (a[1][1] > latitudeMax) {
      latitudeMax = a[1][1]
    }
  })

  let a = longitudeMax - longitudeMin
  let b = latitudeMax - latitudeMin
  return Math.min(width / a, height / b)
}
 
/**
 *  获取中心点
 *  @param     {object}    features [地图数据]
 *  @return    {array}   中心点
 */
export const getCenters = (features) => {
  let longitudeMin = 100000
  let latitudeMin = 100000
  let longitudeMax = 0
  let latitudeMax = 0
  features.forEach(function(e) {
    let a = d3.geo.bounds(e)
    if (a[0][0] < longitudeMin) {
      longitudeMin = a[0][0]
    }
    if (a[0][1] < latitudeMin) {
      latitudeMin = a[0][1]
    }
    if (a[1][0] > longitudeMax) {
      longitudeMax = a[1][0]
    }
    if (a[1][1] > latitudeMax) {
      latitudeMax = a[1][1]
    }
  })
  let a = (longitudeMax + longitudeMin) / 2
  let b = (latitudeMax + latitudeMin) / 2
  return [a, b]
}

/**
 * 随机生成svg defs中元素的ID
 * 
 * @return 随机生成的ID
 */
export const genSVGDocID = ( () => {
  let id = 1
  return () => {
    let prefix = new Date().valueOf()
    return `hyfe-${prefix}-${id++}`
  }
})()

/**
 *  生成热力图数据（在原始数据上再添加几组）
 *  @param    {array}  data        原始数据
 *  @param    {object}  areaCenters path中心点
 *  @return   {object}  热力数据
 */
export const makeHeatMapData = (data, areaCenters) => {
  let centers = areaCenters
  // // 给数据添加坐标
  let points = []
  let max = 0
  let num = 0
  ADDDATA.map(() => {
    data.map((d) => {
      num++
      if(centers[d.id]) {
        let coordinate = centers[d.id]
        let r1 = randoms[num][0]
        let r2 = randoms[num][1]
        let r3 = randoms[num][2]
        let value = d.value + Math.floor(r1 * d.value)
        max = Math.max(max, value)
        let x = Math.floor(coordinate[0]) 
        let y = Math.floor(coordinate[1])
        let point = {
          x: x + Math.floor(r2 * 120),
          y: y + Math.floor(r3 * 120),
          value: value
        }
        points.push(point)
      }
    })
  })
  let datas = {
    max: max, 
    data: points
  }
  return datas
}

/**
 * 获取鼠标真实位置，缩放后鼠标位置可能会存在偏差，需要进行适当的转换
 *  @return   {array}  x,y坐标位置
 */
export const getMousePosition = () => {
  let pos = [d3.event.offsetX - 30 , d3.event.offsetY - 420]
  return{
    x: pos[0],
    y: pos[1]
  }
}
