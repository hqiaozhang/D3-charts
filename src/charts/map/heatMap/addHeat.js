/**
 * @Author:      zhanghq
 * @DateTime:    2017-12-06 15:49:59
 * @Description: Description
 * @Last Modified By:   热力图
 * @Last Modified Time:    2017-12-06 15:49:59
 */

import _ from 'lodash'
import heatmap from 'heatmap.js'

export default class AddHeat {
  /**
   * 地图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      radius: 45
      // maxOpacity: 0.8,
      // minOpacity: 0.2,
      // blur: 0.3
      // gradient: {
      //   // enter n keys between 0 and 1 here
      //   // for gradient color customization
      //   '0.95': '#ce2972',
      //   '0.8': '#ce2b75',
      //   '0.5': '#21a33a',
      //   '0.2': 'blue'
      // }
    }  
  }
 
  /**
   * Creates an instance of Heatmap
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    const config = _.merge({}, defaultSetting, opt)
    config.container = document.querySelector(selector)
    // 实例化
    this.heatmapInstance = heatmap.create(config)
  }

  /**
   *  渲染
   *  @param    {[type]}  data [description]
   *  @return   {[type]}  [description]
   */
  render(data){
    const self = this
    let heatmapInstance = self.heatmapInstance
    heatmapInstance.repaint()
    heatmapInstance.setData(data)
  }
}
