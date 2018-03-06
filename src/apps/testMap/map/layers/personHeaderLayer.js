import ol from 'openlayers'
import headerPng from '../../images/header.png'

export default class PersonHeaderLayer {
  /**
   * Creates an instance of PersonHeaderLayer.
   * @memberof PersonHeaderLayer
   */
  constructor() {
    this.personHeaderLayer = new ol.layer.Vector({
      source: new ol.source.Vector()
    })
    this.source = this.personHeaderLayer.getSource()
  }

  /**
   * 获取PersonHeaderLayer的实例
   * 
   * @returns this.personHeaderLayer
   * @memberof PersonHeaderLayer
   */
  getLayer() {
    return this.personHeaderLayer
  }

  /**
   * 将feature添加到PersonHeaderLayer中
   * 
   * @param {any} features 需要添加的feature
   * @memberof PersonHeaderLayer
   */
  addFeatures(features) {
    // this.source.clear()
    this.source.addFeatures(features)
  }

  /**
   * 删除feature
   * 
   * @param {any} feature 需要删除的feature
   * @memberof PersonHeaderLayer
   */
  removeFeature(feature) {
    this.source.removeFeature(feature)
  }

  /**
   * 设置/更新PersonHeaderLayer的样式
   * 
   * @memberof PersonHeaderLayer
   */
  updateStyle() {
    this.personHeaderLayer.setStyle(feature => {
      return new ol.style.Style({
        image: new ol.style.Icon({
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
          src: feature.get('img') || headerPng
        })
      })
    })
  }

  /**
   * 显示人员散点layer
   * 
   * @memberof PersonHeaderLayer
   */
  show() {
    this.personHeaderLayer.setVisible(true)
  }

  /**
   * 隐藏人员散点layer
   * 
   * @memberof PersonHeaderLayer
   */
  hide() {
    this.personHeaderLayer.setVisible(false)
  }
}