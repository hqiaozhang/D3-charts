/**
 * @Author:      zhanghq
 * @DateTime:    2017-10-06 15:47:15
 * @Description: 带箭头的柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-10-06 15:47:15
 */

import $ from 'jquery'
import d3 from 'd3'
import item from './hbs/gradientProcessBar.hbs'
import './css/gradientProcessBar.css'

export default class GradientProcessBar {

  /**
     * 柱状图默认配置项
     * @return {object} 默认配置项
     */
  defaultSetting() {
    return {
      width: 540,
      height: 1230,
      dur: 750, // 动画过度时间
      itemStyle: {
        margin: {
          top: 20,
          right: 60,
          bottom: 40,
          left: 60
        },
        width: 8,
        radius: 5,
        bgFill: '#bdbfc5',
        gradient: {
          color: ['#00d2ff', '#0048ff'],
          x1: '0%',
          y1: '0%',
          x2: '0%',
          y2: '100%',
          offset1: '20%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 1
        },
        colors: ['#ffd43d', '#efefef', '#eb8711', '#14c7fb', '#14c7fb', '#ffd43d', '#efefef', '#eb8711', '#14c7fb', '#14c7fb']
      },
      topMark: {
        fill: '#ebeef1'
      },
      yAxis: {
        axisLine: {
          show: true // 轴线
        },
        gridLine: {
          show: true // 网格线
        },
        pow: 0.5,
        ticks: 5 // 刻度  
      },
      xText: {
        fontSize: 16,
        fill: '#000',
        textAnchor: 'middle'
      },
      xItemStyle: {
        width: 50,
        height: 18,
        fill: '#ebeef1'
      },
      topText: {
        fontSize: 16,
        fill: '#8cffff'
      }
    }
  }

  /**
     * Creates an instance of arrowBar
     * @param {string} selector 容器元素选择器
     * @param {object} opt 图表组件配置项
     */
  constructor(selector, opt) {

    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = Object.assign({}, defaultSetting, opt)
    const { width, height, itemStyle } = this.config // 宽、高
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom

    // 创建svg元素
    $(selector)
      .css({
        height: `${height }px`,
        width: `${width }px`
      })
      .append(document.createElement('ul'))
  }

  render(data) {
    const max = d3.max(data, (d) => d.value)
    const { colors } = this.config.itemStyle
    for (let i = 0, length = data.length; i < length; i++) {
      data[i].barWidth = 290 * parseInt(data[i].value, 0) / max
      data[i].color = colors[i]
    }

    $('.gradientProcessBar ul').html(item(data))
  }

}
