/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-27 12:23:37
 * @Description: 渲染组件的content
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-27 12:23:37
 */

import $ from 'jquery'
import chartData from '@/../static/charts.json'
 
import listHbs from './hbs/chartsList.hbs'

export default class ChartsList {

  /**
   *  构造函数
   */
  constructor() {
    $('.charts-content .charts-right').html(listHbs())
  }

  /**
   *  初始化
   *  @return   {void}
   */
  init() {
    $('.charts-content .charts-right').html(listHbs(chartData))
  }
}
