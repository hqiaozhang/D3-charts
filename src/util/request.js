/**
 * @Author:      baizn
 * @DateTime:    2017-03-20 13:36:18
 * @Description: Description
 * @Last Modified By:   孙雨珩
 * @Last Modified Time:    2017-09-26 10:49:47
 */

import $ from 'jquery'
import { errorTooltip, delay } from './util'
import { isFunction, isNumber, isArray } from './typeCheck'
import apis from '@/apis'
import config from '@/config'
import ReconnectingWebSocket from 'reconnecting-websocket'

/**
 * 普通AJAX请求
 *  如果向后端传递的数据需要是json，那么接口.config.contentType应为'application/json; charset=UTF-8'
 *  如果向后端传递的数据需要传递文件，那么接口.config.contentType应为'multipart/form-data; charset=UTF-8'
 * 
 * @export 对外暴露方法
 * @param {string} apiName 接口名称
 * @param {object} [data={}] 接口参数 可选
 * @param {function} callback 回调函数
 * @returns {Boolean} false
 */
export function fetch(apiName, data = {}, callback) {
  if(arguments.length === 2 && isFunction(data)) {
    // 只传了apiName和callback
    callback = data
    data = {}
  }
  const ajaxConfig = apis.config(apiName)
  const extraAjaxConfig = {}
  let ajaxData = apis.filterData(apiName, data)
  if (ajaxConfig.contentType) {
    const contentType = ajaxConfig.contentType
    if (contentType.indexOf('application/json') != -1) {
      // application/json的要自己将传递的数据转换成字符串
      ajaxData = JSON.stringify(ajaxData)
    } else if (contentType.indexOf('multipart/form-data') != -1) {
      // 有文件要上传，使用formData
      // 把contentType置为false，由xhr自己生成，避免使用者忘记设置boundary
      extraAjaxConfig.contentType = false
      // xhr可直接发送formData，不用jquery重复处理数据
      extraAjaxConfig.processData = false
      const formData = new FormData()
      Object.keys(ajaxData)
        .forEach(key => {
          const val = ajaxData[key]
          if (isArray(val)) {
            val.forEach(val => {
              formData.append(key, val)
            })
          } else {
            formData.append(key, val)
          }
        })
      extraAjaxConfig.data = formData
    }
  }
  return $.ajax({
    url: apis.url(apiName, data),
    dataType: 'json',
    data: ajaxData,
    ...ajaxConfig,
    ...extraAjaxConfig
  }).done((response) => {
    if(!response.code){
      return errorTooltip( `调后台接口失败:${ response.msg }` )
    }
    callback && callback(response.result)
  }).fail(() => {
    return errorTooltip( '请求失败: 系统错误' )
  })
}

/**
 *  向指定api循环发送发送请求
 *  @param    {string}   apiName api名称
 *  @param    {object=}   data    请求参数（可选）
 *  @param    {Function}    cb    处理响应数据的回调
 *  @param    {number=}    interval    轮询间隔（毫秒）（可选，默认为配置值）
 *  @return   {Object}   用于对轮询状态进行操作的实例
 */
export function fetchInterval(apiName, data, cb, interval) {
  const argumentsLength = arguments.length
  const defaultInterval = config.get('fetchInterval')
  if (argumentsLength === 2) {
    // 只传了2个参数
    // 没传data，没传interval
    cb = data
    data = null
    interval = null
  } else if (argumentsLength === 3) {
    // 只传了3个参数
    if (isFunction(cb)) {
      // 没有传interval
      interval = null
    } else if (isNumber(cb)) {
      // 没有传data
      interval = cb
      cb = data
      data = null
    }
  }

  data = data || {}
  interval = interval || defaultInterval

  let hasClosed = false
  const delayFetchInterval = delay(
    function() {
      if (hasClosed) {
        return
      }
      fetch(apiName, data, cb)
        .always(delayFetchInterval)
    },
    interval
  )
  delayFetchInterval(true)
  return {
    // 停止轮询
    close() {
      hasClosed = true
    }
  }
}

/**
 *  建立websocket链接
 *  @param    {string}   apiName api名称
 *  @param    {Object=}   data    请求参数（可选）
 *  @param    {Function} cb      处理推送数据的回调
 *  @return   {Websocket}   websocket实例
 */
export function fetchSocket(apiName, data, cb) {
  if (arguments.length === 2 && isFunction(data)) {
    // 只传了2个参数，并且第2个参数是函数，说明第二个参数是cb
    cb = data
    data = {}
  }
  if (config.get('mock')) {
    // 需要mock，那么使用fetchInterval模拟
    const fakeWs = fetchInterval(apiName, data, cb)
    return fakeWs
  }
  // 不需要mock，创建真实的websocket
  const ws = new ReconnectingWebSocket(
    apis.url(apiName, data)
  )
  ws.onmessage = cb
  ws.onclose = function () {
    this.close()
  }
  // 当页面被卸载时，需要断开websocket
  window.addEventListener(
    'unload',
    function close() {
      window.removeEventListener('unload', close)
      ws.close()
    }
  )
  return ws
}
