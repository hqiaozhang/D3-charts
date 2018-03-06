/**
 * @Author:      zhanghq
 * @DateTime:    2017-12-06 10:06:19
 * @Description: 图例
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-12-06 10:06:19
 */
import $ from 'jquery'
import legendHbs from './hbs/legend.hbs'

export const legend = (selector) => {
  let data = ['总数', '驾驶证', '身份证']
  $(selector).prepend(legendHbs(data))
  $(`${selector} .legend`).on('click', 'li', (evt) => {
    const $this = $(evt.target)
    const isClass = $this.hasClass('invalid')
    const index = $this.index()
    if(isClass) {
      $this.removeClass('invalid')
      $(selector).find(`.rect-data-${index}`).fadeIn()
    }else {
      $this.addClass('invalid')
      $(selector).find(`.rect-data-${index}`).fadeOut()
    }
  })
}

