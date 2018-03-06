/**
 * @Author:      baizn
 * @DateTime:    2017-01-17 09:24:27
 * @Description: 通用工具方法
 * @Last Modified By:   baizn
 * @Last Modified Time:    2017-01-17 09:24:27
 */

import $ from 'jquery'

/**
 * @describe [错误提示]
 * @param    {[type]}   data [提示内容]
 * @return {boolean} false
 */
export const errorTooltip = (data) => {
  let errorTpl = require('./errorTips/errorDialog.hbs')
  let html = errorTpl({
    data
  }) 
  $('.error-dialog').html(html)
  $('#errorDialog').fadeIn(50)
  // 关闭错误提示
  $('#errorDialog').on('click', '.close-model', function(evt){
    evt.stopPropagation()
    evt.preventDefault()
    $('#errorDialog').fadeOut(50)
    $('.error-dialog').empty()
  })
  return false
}

/**
 *  生成一个延迟函数
 *  @param    {Function}  func        需要延迟执行的函数
 *  @param    {number}  delayMillis 延迟执行的毫秒数
 *  @return   {Function}  延迟函数
 */
export function delay(func, delayMillis) {
  /**
   * 延迟函数
   * @param    {boolean=}  immediate 是否立即执行（可选，默认为false）
   * @return {function} 延时函数
   */
  return function delayFunc(immediate) {
    if(immediate === true) {
      func()
    } else {
      setTimeout(func, delayMillis)
    }
  }
}
