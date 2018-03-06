import ol from 'openlayers'

/**
 * 散点类PointsLayer
 * 
 * @export
 * @class PointsLayer
 */
export default class PointsLayer {
  constructor() {
    this.pointsLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      layerName: 'points'
    })
  }

  /**
   * 获取PointsLayer的实例
   * 
   * @returns this.pointsLayer
   * @memberof PointsLayer
   */
  getLayer() {
    return this.pointsLayer
  }

  /**
     * 在PointsLayer上添加features
     * 
     * @param {any} features 根据数据生成的features
     * @memberof PointsLayer
     */
  addFeatures(features) {
    const source = this.pointsLayer.getSource()
    if(features) {
      source.clear()
      source.addFeatures(features)
    }
  }

  /**
     * 删除features
     * 
     * @param {any} feature 需要删除的feature
     * @memberof PointsLayer
     */
  removeFeatures(feature) {
    this.pointsLayer.getSource()
      .removeFeature(feature)
  }

  /**
     * 设置/更新pointsLayer的样式
     * 
     * @memberof PointsLayer
     */
  updateStyle() {
    this.pointsLayer.setStyle(feature => {
      // 根据feature里面的数据大小来计算
      let radius = 10
      let color = ''
      let strokeColor = ''
      if(feature.get('age') > 80) {
        radius = 15
        color = '#bbbf1e'
        strokeColor = '#ddd91c'
      } else if(feature.get('age') > 40) {
        radius = 10
        color = '#a23837'
        strokeColor = '#d9493d'
      } else {
        radius = 5
        color = '#02db72'
        strokeColor = '#08c36d'
      }
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius,
          fill: new ol.style.Fill({
            // 根据feature里面的数据大小显示不同颜色
            color: color
          }),
          stroke: new ol.style.Stroke({
            color: strokeColor,
            width: 3
          })
        })
      })
    })
  }
}
