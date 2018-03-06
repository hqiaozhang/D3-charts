/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-06 15:14:23
 * @Description: 图表提示框
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-06 15:14:23
 */
import './styles/index.css'
import $ from 'jquery'
import tipsHbs from './hbs/tips.hbs'

/**
 *  设置提示内容
 *  @param    {object}  selector 容器
 *  @param    {array}  data   提示数据
 *  @param    {object} x      提示框x坐标位置
 *  @param    {object} y      提示框y坐标位置
 *  @return   {void}
 */
export const showTips = (selector, data, {x, y}) => {
  const container = $(selector)
  data.name = data.name.slice(0, 2)
  const tipSelector = container.find('.charts-tooltip')
  if(tipSelector.length > 0) {
    tipSelector.fadeIn()
    tipSelector.html(tipsHbs(data))
  } else{
    container.append('<div class="charts-tooltip"></div>')
    container.find('.charts-tooltip').html(tipsHbs(data))
  }
  container.find('.charts-tooltip')
    .css({
      left: `${x}px`,
      top: `${y}px`
    })
}
 
/**
 *  鼠标移出地图外，隐藏提示框
 *  @param    {object}  selector 容器
 *  @return   {void}
 */
export const hideTips = (selector) => {
  const container = $(selector)
  const tipSelector = container.find('.charts-tooltip')
  tipSelector.hide()
}
