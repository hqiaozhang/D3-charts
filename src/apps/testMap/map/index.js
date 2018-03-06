
import Map from'./map'
import PointsLayer from'./layers/pointsLayer'
import PersonHeaderLayer from'./layers/personHeaderLayer'
import Popup from'./layers/popup'
import BlurPointsLayer from'./layers/blurPointsLayer'
import{ fetch, fetchInterval } from'@/util/request'
import ol from'openlayers'

const geoJSONFormatter = new ol.format.GeoJSON({
  featureProjection: 'EPSG: 3857'
})

export default class MapIndex {
  constructor() {
    const map = new Map('map')
    this.mapInstance = map.getMapInstance()

    this.pointsLayer = new PointsLayer()
    this.personHeaderLayer = new PersonHeaderLayer()
    this.popup = new Popup('popup')
    this.blurPointsLayer = new BlurPointsLayer()

    const blurPointsInstance = this.blurPointsLayer.getLayer()
    this.mapInstance.addLayer(blurPointsInstance)

    const pointsLayerInstance = this.pointsLayer.getLayer()
    this.mapInstance.addLayer(pointsLayerInstance)

    const personHeaderLayerInstance = this.personHeaderLayer.getLayer()
    this.mapInstance.addLayer(personHeaderLayerInstance)

    const popupInstance = this.popup.getOverlay()
    this.mapInstance.addOverlay(popupInstance)
  }

  /**
   * 渲染散点layer
   * 
   * @memberof MapIndex
   */
  renderPoints() {
    const self = this
    fetch('MapPointsFetch', (data) => {
      const features = geoJSONFormatter.readFeatures(data)
      self.pointsLayer.addFeatures(features)
      
      self.pointsLayer.updateStyle()
    })
  }

  /**
   * 渲染人员头像layer
   * 
   * @memberof MapIndex
   */
  renderPersonHeader() {
    const self = this
    fetchInterval('RealHeaderFetch', (data) => {
      const features = geoJSONFormatter.readFeatures(data)
      self.personHeaderLayer.addFeatures(features)
      self.personHeaderLayer.updateStyle()
      setTimeout(
        () => {
          features.forEach(feature => {
            if(!feature.get('isVisibiled')) {
              self.personHeaderLayer.removeFeature(feature)
            }
          })
        }, 4000
      )
    }, 5000)
  }

  /**
   * 绑定地图上点击事件
   * 
   * @memberof MapIndex
   */
  bindClickEvent() {
    const self = this
    const map = self.mapInstance
    
    map.on('pointermove', (evt) => {
      const hit = map.hasFeatureAtPixel(evt.pixel)
      map.getViewport().style.cursor = hit ? 'pointer' : ''
    })

    map.on('singleclick', (evt) => {
      const{ feature, layer } = map.forEachFeatureAtPixel(
        evt.pixel,
        (subFeature, subLayer) => {
          /**
           * 比较当前操作的是哪个layer，有两种实现方式:
           * 1、使用实例比较，layer === self.pointsLayer.getLayer()
           * 2、在new layer时候添加自定义属性，如layerName，标识当前layer，
           *  使用layer.get('layerName')获取layer标识值
           */
           
          return{ feature: subFeature, layer: subLayer }
        }
      )
      if(!feature) {
        return false
      }
      
      const isPointLayer = layer === self.pointsLayer.getLayer()
      if(isPointLayer) {
        self.blurPointsLayer.addFeature(feature)
      }

      // if(choosedFeatures && choosedFeatures != feature) {
      //   choosedFeatures.set('isVisibiled', false)
      //   self.personHeaderLayer.removeFeature(choosedFeatures)
      // }
      // choosedFeatures = feature
      feature.set('isVisibiled', true)
      self.popup.closePopup('popup-closer', () => {
        feature.set('isVisibiled', false)
        if(isPointLayer) {
          self.blurPointsLayer.removeFeature(feature)
        } else{
          self.personHeaderLayer.removeFeature(feature)
        }
        
        map.removeOverlay(self.popup)
      })

      // 加载模板
      const content = document.getElementById('popup-content')
      content.innerHTML = `<p>You name:</p><code>${feature.get('name')}</code>`
      self.popup.getOverlay().setPosition(evt.coordinate)
    })
  }
}
