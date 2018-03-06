import ol from 'openlayers'

const createBlurCircle = (r, color, shadowBlur) => {
  const canvas = document.createElement('canvas')
  const realR = Math.ceil(r + shadowBlur * 1.3)
  const realDiameter = realR * 2

  canvas.width = realDiameter
  canvas.height = realDiameter

  const ctx = canvas.getContext('2d')

  ctx.shadowColor = color
  ctx.shadowBlur = shadowBlur
  ctx.fillStyle = color

  ctx.beginPath()
  ctx.arc(realR, realR, r, 0, 2 * Math.PI)
  ctx.closePath()

  ctx.fill()

  return canvas
}

export default class BlurPointsLayer {
  /**
   * Creates an instance of BlurPointsLayer.
   * @memberof BlurPointsLayer
   */
  constructor() {
    this.layer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style(feature) {
        // 根据feature里面的数据大小来计算
        let radius = 10
        if(feature.get('age') > 80) {
          radius = 15
        } else if(feature.get('age') > 40) {
          radius = 10
        } else {
          radius = 5
        }
        const img = createBlurCircle(radius, '#fff', 10)
        return new ol.style.Style({
          image: new ol.style.Icon({
            img, 
            imgSize: [img.width, img.height]
          })
        })
      }
    })
  }

  /**
   * 获取BlurPointsLayer的layer实例
   * 
   * @returns this.layer
   * @memberof BlurPointsLayer
   */
  getLayer() {
    return this.layer
  }

  /**
   * 将feature添加到layer中
   * 
   * @param {any} feature 需要添加的feature
   * @memberof BlurPointsLayer
   */
  addFeature(feature) {
    this.getLayer()
      .getSource().addFeature(feature)
  }

  /**
   * 删除对应的feature
   * 
   * @param {any} feature 要删除的feature
   * @memberof BlurPointsLayer
   */
  removeFeature(feature) {
    this.getLayer()
      .getSource().removeFeature(feature)
  }
}