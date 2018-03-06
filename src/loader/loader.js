/**
 * @Author:      孙雨珩
 * @DateTime:    2017-07-18 09:11:51
 * @Description: 初始化应用
 * @Last Modified By:   孙雨珩
 * @Last Modified Time:    2017-07-20 10:56:29
 */

// 样式重置
import 'reset-css'
// 加载公用的css
import './common/common.css'

import { adaptZoom, default as zoom } from '@/util/zoom/zoom'

import config from '@/config'
import apis from '@/apis'

import globalConfig from './base.config'

export default {
  /**
   *  执行初始化操作，然后执行app的初始化逻辑
   *  @param    {Object}  app 页面实例
   */
  load(app) {
    const me = this

    // 将全局配置合并到全局api
    config.merge(globalConfig)
    // 将应用配置合并到全局api
    config.merge(app.config)

    // 将应用的接口配置合并到全局api
    apis.merge(app.apis)

    me.initZoom()

    // 初始化app
    app.init()
  },
  /**
   *  根据config，判断是否需要执行zoom逻辑
   */
  initZoom() {
    if(config.get('zoom')) {
      // 为true，启用自动缩放
      adaptZoom()
      window.addEventListener('resize', zoom)
      zoom()
    }
  }
}
