import ol from 'openlayers'
import 'openlayers/dist/ol.css'
import config from '../config'

/**
 * 地图类
 * 
 * @export
 * @class Map
 */
export default class Map {
  /**
   * Creates an instance of Map.
   * @param {any} container 地图容器ID
   * @memberof Map
   */
  constructor(container) {
    this.map = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: config.MAP_TILE_URL
          })
        })
      ],
      target: container,
      controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false
        }
      }),
      view: new ol.View({
        center: config.CENTER_VIEW,
        zoom: config.MAP_ZOOM
      })
    })
  }

  /**
   * 返回地图实例
   * 
   * @returns 
   * @memberof Map
   */
  getMapInstance() {
    return this.map
  }
}