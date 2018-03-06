/*
 * @Author: zhanghongqiao@hiynn.com 
 * @Date: 2018-01-24 18:02:11 
 * @Description: 渲染文档
 * @Last Modified by: zhanghongqiao@hiynn.com
<<<<<<< HEAD
 * @Last Modified time: 2018-01-27 12:23:04
=======
 * @Last Modified time: 2018-01-27 21:58:41
>>>>>>> 388e2b78a6a7e555a484b4cfe8dace7de5ee8a13
 */

import { Base64 } from '@/loader/common/scripts/base64.js' 
import hljs from 'highlight.js' // 给markdown文档添加高亮
import MarkdownIt from 'markdown-it' // markdown文档样式解析
import chartData from '@/../static/charts.json'
import listHbs from './index.hbs'
import $ from 'jquery'

export default class RenderDoc {
  constructor() {
    this.base = new Base64() // base64解码
    // markdown样式解析参数配置
    let defaults = {
      html:         true, // Enable HTML tags in source
      xhtmlOut:     true, // Use '/' to close single tags (<br />).
      // This is only for full CommonMark compatibility.
      breaks:       true, // Convert '\n' in paragraphs into <br>
      
      // useful for external highlighters.
      linkify:      true, // Autoconvert URL-like text to links
 
      // Enable some language-neutral replacement + quotes beautification
      typographer:  true,
 
      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: '“”‘’',
      highlight: function (code) {
        return `<pre class="hljs"><code>${hljs.highlightAuto(code).value}</code></pre>` 
      }
    }
    this.md = new MarkdownIt(defaults)
  }

  render(type0, type1) {
    import(`@/../static/document/${type0}/${type1}.md`)
      .then(data => {
        let result = this.base.decode(data) 
        $('#write').html(this.md.render(result))
        $('#write p').eq(0).attr('class', 'charts-title')
          .text(`${type1}组件-配置项字段说明`)
        $('#write').append('<div class="back-charts-list"></div>')
        this.clickCommon()
        $('#write').on('click', '.back-charts-list', () => this.renderChartsList())
        // 隐藏其他tab显示文档页
        $('.cont-wrap').hide()
        $('.charts-content-popup').hide()
        $('.documents-content').show()
      })
      .catch(err => {
        // 解除滚动事件
        $(window).off('scroll')
        alert(err)
        return false
      })
   
  }

  /**
   * 渲染组件列表
   */
  
  renderChartsList() {
    const self = this
    $('#write').html(listHbs(chartData))
    $('.cahrts-classify-nav').show()
    $(window).on('scroll', ::self.scrollTop)
  }

  /**
   * 点击事件公用操作
   */
  
  clickCommon() {
    // 隐藏右下角导航
    $('.cahrts-classify-nav').hide()
    // 禁止加载滚动效果
    $(window).off('scroll') 
    // 移出右下角导航样式
    // $('.chats-type-list a').removeClass('active')
  }

  /**
   * 向上滚动
   * @return   {void}
   */
  scrollTop() {
    const self = this
    const cont = $('#write')  
    let winTop = $(window).scrollTop() + 200
    let barH = $(cont).find('#barD').offset().top
    let pieH = $(cont).find('#pieD').offset().top
    let areaH = $(cont).find('#areaD').offset().top
    let lineH = $(cont).find('#lineD').offset().top
    let forceH = $(cont).find('#forceD').offset().top
    let mapH = $(cont).find('#mapD').offset().top
    let heatH = $(cont).find('#heatMapD').offset().top
    let radarH = $(cont).find('#radarD').offset().top
    let treeH = $(cont).find('#treeD').offset().top
    let gaugeH = $(cont).find('#gaugeD').offset().top
    let customizeH = $(cont).find('#customizeD').offset().top
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

    if(winTop - 200 > 0) {
      $('.gotop').fadeIn()
    }else{
      $('.gotop').fadeOut()
    }
    // 点击返回顶部
    $('.gotop').click(function(){
      $('body,html').animate({scrollTop:0}, 300)
    })
  }

  /**
   *  添加active样式
   *  @param    {number}  index 索引
   *  @return   {void}
   */
  addActive(index) {
    var meuns = $('.chats-type-list a')
    meuns.eq(index).addClass('active').siblings().removeClass('active')
  }

}
