/**
 * @Author:      zhanghq
 * @DateTime:    2018-01-17 14:11:34
 * @Description: 组件主文件
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2018-01-17 14:11:34
 */

import './styles/index.css'
import $ from 'jquery'
import {fetch} from '@/util/request'
import hbs from './hbs/index.hbs'
import popupHbs from './hbs/charts-popup.hbs'
import heatHbs from './hbs/heatMap-popup.hbs'
import earthHbs from './hbs/earth-popup.hbs'
import ChartsList from './chartsList.js'
import chartsNav from '@/../static/chartsNav.json'
import RenderDoc from '../RenderDoc'
// 热力图,地球
import {Earth, EarthLight} from '@/charts/index'

export default class Charts {
  
  /**
   * Creates an instance of Charts.
   * @param {object} selector 容器元素选择器
   * @memberof Charts
   */
  
  constructor(selector) {
    // 渲染左边导航
    this.chartsList = new ChartsList()
    $(selector).append(hbs(chartsNav))
    // 热力图
    $('.heatmap-content-popup').html(heatHbs())
    // 旋转地球
    $('.earth-content-popup').html(earthHbs())
    // 实例化热力图
    // this.areaHeatMap = new AreaHeatMap('.heatMap')
    this.renderDoc = new RenderDoc()
  }
  
  /**
   * 渲染图表组件
   *  @return   {void}
   */
  render() {
    const self = this
    self.chartsList.init()
    // 事件绑定
    self.bindEvent()
    // 鼠标滚动导航定位
    // self.scrollTop()
    $(window).on('scroll', ::self.scrollTop)
  }
  
  /**
   *  事件绑定
   *  @return   {void}
   */
  
  bindEvent() {
    const self = this
    let type = null
    let fetchUrl = 'fetchBar'
    let scrollTop = 0
    // 点击单个图表
    $('.chart-link').on('click', (evt) => {
      scrollTop = $(document).scrollTop()
      
      const $this = $(evt.target)
      let dataUrl = $this.attr('dataUrl') || 'fetchBar'
      // 数据的url赋值
      fetchUrl = dataUrl
      // 禁止滚动
      $('body').css('overflow-y', 'hidden')
      // 获取父级的父级元素
      let parent = $this.parents().parents()
      // 获取父级的id,用于判断属性哪种类型的图表
      let parentType = parent[1]['id']
      type = $this.attr('type')
      
      // 热力图渲染单独处理
      if (type === 'areaHeatMap') {
        fetch('fetchHeatMap', data => {
          self.areaHeatMap.render(data)
        })
        // 隐藏其他图表
        $('.charts-content-popup').hide()
        // 显示热力图
        $('.heatmap-content-popup').show()
        return
      }
      let name = $this.attr('name')
      
      // 旋转地图调用
      if (type === 'earthMap') {
        // 实例化旋转地球
        const earth = new Earth('.earth')
        // 渲染
        earth.render()
        // 弹窗显示隐藏
        self.hidePopup()
        return
      }
      
      if (type === 'earthMapLight') {
        // 实例化带光旋转地球
        const earthLight = new EarthLight('.earth')
        // 渲染
        earthLight.render()
        // 弹窗显示隐藏
        self.hidePopup()
        return
      }
      
      // 加载图表
      $('.charts-content-popup').show().html(popupHbs({
        type: type,
        name: name,
        parentType: parentType
      }))
      // 隐藏热力图
      $('.heatmap-content-popup').hide()
      // 隐藏旋转地球
      $('.earth-content-popup').hide()
      // 热力div图宽度设置
      $('.areaHeatMap').css('width', '1850')
      
      // 引入模块(公用图表)
      import('@/charts/index')
        .then(module => {
          // 首字母大写用于实例化
          let newType = type[0].toUpperCase() + type.slice(1)
          // 实例化该组件
          this[type] = new module[newType](`.${type}`)
        })
        .then(() => {
          // 渲染图表数据
          fetch(fetchUrl, (data) => {
            this[type].render(data)
          })
        })
    })
    
    // 点击更新数据
    $('.charts-content-popup').on('click', '.update-data-btn', () => {
      import('@/charts/index')
        .then(() => {
          fetch(fetchUrl, (data) => {
            this[type].render(data)
          })
        })
    })
    
    // 关闭弹窗
    const body = $('html,body')
    $(document).on('click', '.close', () => {
      $('.charts-content-popup').hide()
      $('.heatmap-content-popup').hide()
      $('.earth-content-popup').hide()
      // 还原滚动条位置
      body.animate({
        'scrollTop': scrollTop
      }, 0)
      // 还原滚动条显示
      $('body').css('overflow-y', 'auto')
    })
    // 调用点击配置项
    this.documentEvent()
  }
  
  /**
   * 弹窗事件
   * @param    {number} scrollTop
   * @return   {void}  void
   */

  documentEvent() {
    const self = this
    // 点击配置项
    $(document).off('click', '.document-btn').on('click', '.document-btn', (evt) => {
      // 还原滚动条显示
      $('body').css('overflow-y', 'auto')
      $('.nav li').eq(2).addClass('cur').siblings().removeClass('cur')
      const $this = $(evt.target)
      let type0 = $this.attr('type0')
      let type1 = $this.attr('type1')
      $('#write').html('')
      this.renderDoc.render(type0, type1)
      $(window).on('scroll', ::self.scrollTop)
    })
  }
  
  /**
   *  显示隐藏弹窗
   *  @return   {void}  [description]
   */
  hidePopup() {
    // 隐藏其他图表
    $('.charts-content-popup').hide()
    // 隐藏热力图
    $('.heatmap-content-popup').hide()
    // 显示旋转地球
    $('.earth-content-popup').show()
  }
  
  /**
   * 向上滚动
   * @return   {void}
   */
  scrollTop() {
    const self = this
    console.log('ddd')
    // $(window).scroll(() => {
    let winTop = $(window).scrollTop() + 200

    // let elements = {
    //   bar: $('#bar'),
    //   pie: $('#pie'),
    //   area: $('#area'),
    //   line: $('#line'),
    //   heat: $('#heat'),
    //   forc: $('#forc'),
    //   bar: $('#bar'),
    //   pie: $('#pie'),
    //   bar: $('#bar'),
    //   pie: $('#pie')
    
    // }
    let barH = $('#bar').offset().top
    let pieH = $('#pie').offset().top
    let areaH = $('#area').offset().top
    let lineH = $('#line').offset().top
    let forceH = $('#force').offset().top
    let mapH = $('#map').offset().top
    let heatH = $('#heatMap').offset().top
    let radarH = $('#radar').offset().top
    let treeH = $('#tree').offset().top
    let gaugeH = $('#gauge').offset().top
    let customizeH = $('#customize').offset().top
    if (winTop >= barH) {

      self.addActive(0)
    }
    if (winTop >= pieH) {
      self.addActive(1)
    }
    if (winTop >= areaH) {
      self.addActive(2)
    }
    if (winTop >= lineH) {
      self.addActive(3)
    }
    if (winTop >= forceH) {
      self.addActive(4)
    }
    if (winTop >= mapH) {
      self.addActive(5)
    }
    if (winTop >= heatH) {
      self.addActive(6)
    }
    if (winTop >= radarH) {
      self.addActive(7)
    }
    if (winTop >= treeH) {
      self.addActive(8)
    }
    if (winTop >= gaugeH) {
      self.addActive(9)
    }
    if (winTop >= customizeH) {
      self.addActive(10)
    }
    // })
  }
  
  /**
   *  添加active样式
   *  @param    {number}  index 索引
   *  @return   {void}
   */
  addActive(index) {
    var meuns = $('.charts-left li')
    meuns.eq(index).addClass('active').siblings().removeClass('active')
  }
}
