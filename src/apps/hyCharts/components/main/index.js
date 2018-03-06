/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-24 15:28:54
 * @Description: 首页
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-24 15:28:54
 */

import './index.css'
import $ from 'jquery'
import hbs from './index.hbs'

export default class Main {
   
  /**
   * Creates an instance of Main.
   * @param {object} selector 容器元素选择器 
   * @memberof Main
   */

  constructor(selector) {
    $(selector).append(hbs())
  }

  /**
   *  初始化
   *  @return   {void}
   */
  render() {
    this.bindEvent()
  }

  /**
   *  事件绑定
   *  @return   {void}
   */
  bindEvent() {
    $('.nav li').on('click', (evt) => {
      const $this = $(evt.target)
      let type = $this.attr('type')
      $this.addClass('cur').siblings().removeClass('cur')
      $('.cont-wrap').hide()
      $(`.${type}-content`).show()
    })
  }
}
