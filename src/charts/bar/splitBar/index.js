/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-27 13:50:58
 * @Description: 刻度柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-27 13:50:58
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, getMousePosition } from '../../util/util'
import { showTips, hideTips } from './tips.js'

export default class SplitBar {
  /**
   * 图表组件默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting() {
    return{
      width: 425,
      height: 400,
      dur: 750,
      tooltip: {
        show: true
      },
      itemStyle: {
        width: 4,
        height: 6,
        min: 10, // 柱子小宽度
        spacing: 4, // 间距
        skewX: -45,
        color: ['#5810ed', '#282f36'],
        // 渐变配置项
        margin: {
          top: 10,
          right: 50, 
          bottom: 0,
          left: 50
        },
        hover: {
          color: ['#a40890', '#44505b']
        }
      },
      // 左边文字配置项
      leftText: {
        fontSize: 12,
        fill: '#fff',
        textAlign: 'start'
      },
      // 右边文字配置项
      rightText: {
        fontSize: 12,
        fill: '#fff',
        textAlign: 'middle',
        unit: '件'
      }
    }
  }

  /**
   * Creates an instance of SplitBar.
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列id
    this.gId = genSVGDocID()
    this.useId = genSVGDocID()

    const { width, height, itemStyle } = this.config 
    const { left, right } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right

    // 比例尺
    this.xScale = null
    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    // 创建defs元素  
    const defs = this.svg.append('defs')
    // 调用添加数据背景矩形
    this.addElement(defs)  
    // 定义初始值
    this.isInit = true
  }
  
  /**
   * 渲染
   * @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'value|10-100': 1
   *    }
   *  ]
   * @param {array} data 渲染组件需要的数据项
   * @return   {void}
   */
  render(data) {
    const self = this
    const { width, height, itemStyle } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    const { margin } = itemStyle 
    const dataMaxWidth = width - margin.left - margin.right

    // 取value值用比例尺计算最大值
    let dataset = []
    data.map((d) => dataset.push(d.value))
    // 比例尺
    self.xScale = d3.scale.pow()
      .domain([0, d3.max(dataset)] )
      .range([0, dataMaxWidth])
      .exponent(0.25)
    // 渲染图表数据
    self.renderData(data)
    // 重置初始化值
    this.isInit = false
  }

  /**
   *  渲染数据
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderData(data) {
    const self = this
    const svg = self.svg
    const { height } = self.config

    // 计算行高
    let lineHeight = height / data.length
    // 获取update部分
    let update = svg.selectAll(`.group-${self.gId}`)
      .data(data)

    /*
      获取并处理append部分
     */
    let enter = update.enter().append('g')
    // 添加左边文字
    enter.append('text').classed('left-text', true)
    // 添加数据组部分    
    enter.append('g').classed('data-group', true)
    // 添加右边文字部分  
    enter.append('text').classed('right-text', true)

    /*
      处理update部分
     */
    // 组元素处理 
    update.call(::self.setGroupAttribute, lineHeight)
    // 选择左边文字部分
    update.select('.left-text')  
      .call(::self.setLeftTextAttribute, data)
    // 选择数据组部分  
    update.select('.data-group')  
      .call(::self.setDataGroupAttribute, data)    
    // 选择右边文字部分  
    update.select('.right-text')
      .call(::self.setRightTextAttribute, data) 

    // 获取并处理exit部分
    update.exit().remove()    
  }

  /**
   *  数据组元素设置
   *  @param    {object}  g    g元素
   *  @param    {array}   data 图表数据
   *  @return   {void}
   */
  setDataGroupAttribute(g, data) {
    const self = this
    const { xWidth, itemStyle } = self.config
    const { width, margin, spacing } = itemStyle
    let dataset = []
    data.map((d) => dataset.push(d.value) )
    let max = Math.floor(xWidth / (width + spacing))
    let unit = Math.floor(d3.max(dataset) / max)
    itemStyle.max = max
    itemStyle.unit = unit
    // 获取并处理update部分
    let update = g.attr('class', 'data-group')
      .attr('transform', `translate(${margin.left}, 0)`)
      .selectAll('use')
      .data(d3.range(0, max))
      .call(::self.setUseAttribute, data)
    // 获取并处理enter部分  
    update.enter()
      .append('use')  
      .call(::self.setUseAttribute, data)
    // 获取并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  组元素样式设置
   *  @param    {array}   g           g元素
   *  @param    {number}  lineHeight  行高
   *  @return   {void}
   */
  setGroupAttribute(g, lineHeight) {
    const self = this
    const selector = self.selector
    const { itemStyle, tooltip, dur } = self.config
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(0, ${lineHeight * i})`)
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(0, ${lineHeight * i})`)
    }
    // 是否显示提示框
    if(tooltip.show) {
      g.attr('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, itemStyle.hover)
          // 显示提示框
          showTips(selector, d, getMousePosition())
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          self.mouseEventStyle(i, itemStyle)
          // 隐藏提示框  
          hideTips(selector)  
        })
    }    
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {object}  fill 样式填充
   *  @return   {void}
   */
  mouseEventStyle(i, fill) {
    const group = d3.select(`.group-${this.gId}-${i}`).select('.data-group')
    // 选择数据
    group.selectAll('.use-data')
      .attr('fill', fill.color[0])
    // 选择背景
    group.selectAll('.use-bg')
      .attr('fill', fill.color[1])  
  }

  /**
   *  use元素属性设置
   *  @param    {object}  use  use元素
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  setUseAttribute(use, data) {
    const self = this
    let index = 0
    let index2 = 0
    const { dur, itemStyle } = self.config
    const { skewX, spacing, width, color, max } = itemStyle
    use.attr('xlink:href', `#${self.useId}`)
      .attr('transform', `skewX(${skewX})`)
      .attr('fill', (d, i) => {
        let range = self.countRanges(data[index].value, i)
        if(i === max - 1) {
          index ++
        }
        return i < range ? color[0] : color[1]
      })
      .attr('class', (d, i) => {
        let range = self.countRanges(data[index2].value, i)
        if(i === max - 1) {
          index2 ++
        }
        return i < range ? 'use-data' : 'use-bg'
      })
      .attr('x', 0)
      .transition()
      .duration(dur)
      .attr('x', (d, i) => (spacing + width) * i ) 
  } 

  /**
   *  计算范围
   *  @param    {number}  d 当前value
   *  @return   {void}
   */
  countRanges(d) {
    const self = this
    const { min, unit } = self.config.itemStyle
    let range = Math.floor(d / unit)
    if(range <= 0) {
      range = min
    }
    return range
  }

  /**
   *  设置左边文本的样式
   *  @param {array} text 右边文本元素
   *  @param {array} data 数据项
   *  @return   {void}
   */
  setLeftTextAttribute(text, data) {
    const { leftText,dur } = this.config
    const { top } = this.config.itemStyle.margin
    text.attr('class', 'left-text')
      .attr('x', 0)
      .attr('y', top)
      .attr('font-size', leftText.fontSize)
      .attr('fill', leftText.fill)
      .attr('text-anchor', leftText.textAlign)
      .attr('opacity', 0)
      .transition()
      .duration(dur)
      .attr('opacity', 1)
      .text((d, i) => data[i].name)
  }   
  /**
   *  设置右边文本的样式
   *  @param {array} text 右边文本元素
   *  @param {array} data 数据项
   *  @return   {void}
   */
  setRightTextAttribute(text, data) {
    const { rightText, width, dur, itemStyle } = this.config
    const { right } = itemStyle.margin
    const { top } = itemStyle.margin
    text.attr('class', 'right-text')
      .attr('y', top)
      .attr('font-size', rightText.fontSize)
      .attr('fill', rightText.fill)
      .attr('text-anchor', rightText.textAlign)
    // 初始化属性设置
    this.initSetAttribute(() => text.attr('x', 0))  
    // 动画过渡设置  
    text.transition()
      .duration(dur)
      .attr('x', width - right / 2)
      .text((d, i) => `${data[i].value} ${rightText.unit}`)
  }

  /**
   * 初始化的属性设置 
   * @param {function} fn 初始化的属性设置 
   * @return   {void}
   */
  initSetAttribute(fn) {
    this.isInit ? fn() : ''
  }

  /**
   *  添加背景图
   *  @param    {object}  defs defs元素
   *  @return   {void}
   */
  addElement(defs) {
    const { itemStyle } = this.config
    defs.append('rect')
      .attr('width', itemStyle.width)
      .attr('height', itemStyle.height)
      .attr('id', this.useId)
  }
}
