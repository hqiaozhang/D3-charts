/*
 * @Author: liqi@hiynn.com 
 * @Date: 2018-01-22 13:48:20 
 * @Description: 提示框绘制方法
 * @Last Modified by: liqi@hiynn.com
 * @Last Modified time: 2018-01-25 15:38:36
 */
import $ from 'jquery'
import _ from 'lodash'
import { randomString } from '../util'

export default class Tooltip {
  /**
   * 实例化
   * @param {String} selector 父级选择器
   * @param {Object} option   配置项
   */
  constructor(selector, option) {
    this.selector = selector
    this.config = _.merge({
      show: true,
      style: {
        background: 'rgba(11, 16, 19, .66)',
        radius: 4,
        color: '#FCFAF2',
        fontSize: 12,
        formatter: '{value}'
      }
    }, option)

    this.tooltipid = `tooltip${randomString(10)}`
    $(selector).append(`
      <div id="${this.tooltipid}" style="display: none;position: absolute;"></div>`)
  }

  /**
   * 显示 tooltip
   * @param  {Object} option 配置对象
   *                         <-
   * titleName  {String}          提示框标题名称
   * legendName {String || Array} 与图例对应的名称
   * value      {Number || Array} 值
   * x          {Number}          鼠标 offsetX 的值
   * y          {Number}          鼠标 offsetY 的值
   * fill       {String}          图标的颜色
   *                         ->
   * @return {void}   void
   */
  show(option) {
    if (!this.config.show) {
      return
    }

    const { legendName, titleName, value, x, y, fill } = option
    const { background, radius, color, fontSize, formatter } = this.config.style

    let isStart = formatter.startsWith('{value}')
    let unit = formatter.replace('{value}', '') 

    // true 为多值类型，false 为单值类型
    let type = _.isArray(legendName) && _.isArray(value)

    let template
    // 单值类型模板字符串
    if (!type) {
      template = `
       <article style="color: ${color};">
        <div style="margin-bottom: 6px;font-size: ${fontSize}px">${titleName}</div>
        <div style="display: flex;align-items: center;">
          <svg width="${fontSize - 4}" height="${fontSize - 4}">
            <circle 
              r="${(fontSize - 4) / 2}" 
              cx="${(fontSize - 4) / 2}"
              cy="${(fontSize - 4) / 2}"
              fill="${fill}"></circle>
          </svg>
          <div style="font-size: ${fontSize - 4}px;margin-left: 8px;">
            ${legendName}：${isStart ? value + unit : unit + value}
          </div>
        </div>
      </article>`
    }

    // 将定义好的模板字符串 append 进容器
    // let svg = $(`${this.selector} svg`)

    // let xAxis = svg.find('.x-axis')[0]
    // let axisWidth = xAxis.getBBox().width
    // let tooltipWidth = $(`#${this.tooltipid}`).width()

    $(`#${this.tooltipid}`)
      .show()
      .html(template)
      .css({
        left: x,
        top: y,
        borderRadius: `${radius}px`,
        backgroundColor: background,
        padding: '8px',
        transition: 'all 0.3s ease'
      })
  }

  /**
   * 隐藏提示框
   * @return {void} void
   */
  hide() {
    $(`#${this.tooltipid}`).hide()
  }
}
