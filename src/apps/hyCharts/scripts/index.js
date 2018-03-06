/**
 * @Author:      zhanghq
 * @DateTime:    2018-01-17 14:41:06
 * @Description: 入口文件
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2018-01-17 14:41:06
 */

import $ from 'jquery'
import hbs from '../templates/index.hbs'
import { Main, Charts, Document } from '../components/'

export default class Index {
  constructor() {
    $('body').append(hbs)
    // 实例化首页
    this.main = new Main('body')
    // 实例化图表
    this.charts = new Charts('body')
    // 实例化文档
    this.document = new Document('body')
  }
  
  /**
   *  渲染页面
   *  @return   {void}  [description]
   */
  render() {
    // 渲染首页
    this.main.render()
    // 渲染图表
    this.charts.render()
    // 渲染文档
    this.document.render()
  }
}
