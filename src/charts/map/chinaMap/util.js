/**
 * @Author:      zhanghq
 * @DateTime:    2017-10-13 14:41:24
 * @Description: 处理地图的一些方法
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-10-13 14:41:24
 */

import d3 from 'd3'

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
