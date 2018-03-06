import ol from 'openlayers'

/**
 * 弹出框Popup类
 * 
 * @export
 * @class Popup
 */
export default class Popup {
  /**
   * Creates an instance of Popup.
   * @param {any} container 弹出框元素或容器ID
   * @memberof Popup
   */
  constructor(container) {
    const ele = typeof container === 'string' ?
      document.getElementById(container) : container

    this.overlay = new ol.Overlay({
      element: ele,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    })
  }

  /**
   * 返回弹出框Popup的实例
   * 
   * @returns this.overlay
   * @memberof Popup
   */
  getOverlay() {
    return this.overlay
  }

  /**
   * 点击关闭按钮，关闭弹出框
   * 
   * @param {string|element} ele 关闭按钮元素或ID
   * @param {function} callback 点击关闭按钮后的回调函数
   * @memberof Popup
   */
  closePopup(ele, callback) {
    const target = typeof ele === 'string' ?
      document.getElementById(ele) : ele
    const self = this
    target.onclick = () => {
      self.overlay.setPosition(undefined)
      target.blur()
      callback && callback()
      return false
    }
  }
}
