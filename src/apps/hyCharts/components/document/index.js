/*
 * @Author: zhanghongqiao@hiynn.com 
 * @Date: 2018-01-22 14:02:14 
 * @Description: 组件文档
 * @Last Modified by: zhanghongqiao@hiynn.com
 * @Last Modified time: 2018-01-26 09:41:02
 */
import './styles/index.css'
import $ from 'jquery'
import hbs from './hbs/index.hbs'
import { Base64 } from '@/loader/common/scripts/base64.js' 
import hljs from 'highlight.js' // 给markdown文档添加高亮
import MarkdownIt from 'markdown-it' // markdown文档样式解析
import RenderDoc from '../RenderDoc'
// 默认加载组件使用文字
// import useDoc from '@/../static/document/use.md' 
import chartsNav from '@/../static/chartsNav.json' 

export default class Document {
  /**
   * Creates an instance of Document.
   * @param {object} selector 容器元素选择器 
   * @memberof Document
   */
 
  constructor(selector) {
    // 左边导航定义
    let docNav = [
      {
        name: '组件使用', 
        type: 'use'
      }, {
        name: '组件添加',
        type: 'add'
      }, {
        name: '组件配置',
        type: 'config'
      }
    ]
 
    $(selector).append(hbs({
      docNav: docNav,
      chartsNav: chartsNav
    }))
    this.base = new Base64() // base64解码
    // markdown样式解析参数配置
    let defaults = {
      highlight: function (code) {
        return `<pre class="hljs"><code>${hljs.highlightAuto(code).value}</code></pre>` 
      }
    }
    this.md = new MarkdownIt(defaults)

    // 实例化文档渲染
    this.renderDoc = new RenderDoc()
     
    $('.document-nav li').eq(0).addClass('active')    
    // let result = this.base.decode(useDoc)   
    // $('.document-right').html(`<div id="write">${this.md.render(result)}</div>`)
    // $('#write p').eq(0).attr('class', 'charts-title').text('组件使用说明')
    // this.renderDoc.renderChartsList()
    
  }
  /**
  * @事件绑定 
  */

  bindEvent() {
    const self = this
    // 点击左边导航
    $('.document-nav li').on('click', (evt) => {
      let $this = $(evt.target) 
      $this.addClass('active').siblings().removeClass('active')
      let type = $this.attr('type')
      console.log(type)
      if(type === 'config'){
        debugger
       // this.renderDoc.renderChartsList()
      }else{
        this.renderDoc.clickCommon()
        import(`@/../static/document/${type}.md`)
          .then(data => {
            let result = self.base.decode(data) 
            $('#write').html(self.md.render(result))
            $('#write p').eq(0).attr('class', 'charts-title')
              .text(`${$this.text()}说明`)
          }) 
      }
    })

    // 点击配置项单个组件
    $(document).on('click', '.charts-type li', (evt) => {
      const $this = $(evt.target)
      let parent = $this.parents()
      // 获取父级的id,用于判断属性哪种类型的图表
      let type0 = parent.attr('key')
      let type1 = $this.attr('key')
      // 调用文档渲染
      self.renderDoc.render(type0, type1)
    })
    // 点击右下角导航
    $('.chats-type-list a').on('click', (evt) => {
      const $this = $(evt.target)
      $this.addClass('active').siblings().removeClass('active')
    })
    
  }
  
  render() {
    this.bindEvent()
  }
}
