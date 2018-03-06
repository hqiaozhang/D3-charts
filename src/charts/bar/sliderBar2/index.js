/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-07 09:54:19
 * @Description: 横向滑块柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-07 09:54:19
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, interpolate,
  getMousePosition } from '../../util/util'
import { showTips, hideTips } from './tips.js'
 
export default class SliderBar2 {
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
        fillBg: '#43484d',
        strokeBg: '#0e7b98',
        height: 14,
        width: 2,
        spacing: 1,
        min: 10, // 柱子小宽度
        // 滑动块
        slider: {
          fill: '#fff',
          width: 6,
          height: 28
        },
        color: ['#167fff', '#8605ff'],
        radius: 0, // 条形图两边的半径,
        margin: {
          top: 10,
          right: 70, 
          bottom: 0,
          left: 40
        },
        hover: {
          fillBg: '#5a5f6b',
          color: ['#9f78fe', '#00baab']
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
        unit: '份'
      }
    }
  }

  /**
   * Creates an instance of gradienBar.
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列的id
    this.gId = genSVGDocID()
    this.useBgId = genSVGDocID()
    this.useDataId = genSVGDocID()
    this.useSliderId = genSVGDocID()
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
    // 定义初始化值
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
    const { width, height} = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
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
    const { height, width, itemStyle } = self.config

    let dataset = []
    // 取value值用比例尺计算最大值
    data.map((d) => dataset.push(d.value))
    // 比例尺
    const { margin } = itemStyle 
    const dataMaxWidth = width - margin.left - margin.right
    // 指数比例尺
    self.xScale = d3.scale.pow()
      .domain([0, d3.max(dataset)] )
      .range([0, dataMaxWidth])
      .exponent(0.25)

    // 计算行高
    let lineHeight = height / data.length
    // 获取update部分
    let update = svg.selectAll(`.group-${self.gId}`)
      .data(data)

    /*
      获取并处理enter部分
     */
    let enter = update.enter().append('g')
    // 添加左边文字
    enter.append('text').classed('left-text', true)
    // 添加矩形背景, use引用
    enter.append('use').classed('data-bg', true)
    // 添加数据部分
    enter.append('g').classed('data-group', true)
    // 添加右边滑块  
    enter.append('use').classed('right-slider', true)
    // 添加右边文字部分  
    enter.append('text').classed('right-text', true)

    /*
      处理update部分
     */
    // 组元素属性设置
    update.call(::self.setGroupAttribute, lineHeight)
    // 选择左边文字部分
    update.select('.left-text')  
      .call(::self.setLeftTextAttribute, data)
    // 选择矩形背景, use引用
    update.select('.data-bg')
      .call(::self.setDataBgAttribute)
    // 选择数据部分
    update.select('.data-group')  
      .call(::self.setDataGroupAttribute, dataset)
    // 选择右边滑块
    update.select('.right-slider')  
      .call(::self.setSliderAttribute)  
    // 选择右边文字部分  
    update.select('.right-text')
      .call(::self.setRightTextAttribute, data) 
      
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
    const { slider, hover } = itemStyle
    let hoverFill = interpolate(hover.color)
    let fill = interpolate(itemStyle.color)
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(0, ${lineHeight * i + slider.height / 2})`)
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(0, ${lineHeight * i + slider.height / 2})`)
    }
    // 是否显示提示框
    if(tooltip.show) {
      g.attr('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, hover.fillBg, hoverFill)
          // 显示提示框
          showTips(selector, d, getMousePosition())
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, itemStyle.fillBg, fill)
          // 隐藏提示框  
          hideTips(selector)  
        })
    }  
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {string}  fill    填充色
   *  @param    {function}  compute 颜色插值
   *  @return   {void}
   */
  mouseEventStyle(i, fill, compute) {
    const group = d3.select(`.group-${this.gId}-${i}`)
    group.select('.data-group')
      .selectAll('.use-data')
      .attr('fill', (dd) => compute(this.fillLinear(dd)))
    // 选择背景  
    group.select('.data-bg')  
      .attr('fill', fill)
  }

  /**
   *  数据背景矩形样式设置
   *  @param    {array}   use    use元素
   *  @return   {void}
   */
  setDataBgAttribute(use) {
    const { fillBg } = this.config.itemStyle
    use.attr('class', 'data-bg')
      .attr('xlink:href', `#${this.useBgId}`)
      .attr('fill', fillBg)
  }

  /**
   *  数据组元素设置
   *  @param    {object}  g    g元素
   *  @param    {array}  data  数据(所有value)
   *  @return   {void}
   */
  setDataGroupAttribute(g, data) {
    const self = this
    const { xWidth, itemStyle } = self.config
    const { width, margin, spacing } = itemStyle
    let max = Math.floor(xWidth / (width + spacing) ) 
    let unit = Math.floor(d3.max(data) / max)
    itemStyle.max = max
    itemStyle.unit = unit
    // 保存每一组的小矩形个数
    self.rangeArray = []
    // 颜色插值比例尺
    self.fillLinear = d3.scale.linear()  
      .domain([0, max])  
      .range([0, 2])  
    // 选择并处理update部分  
    let update = g.attr('class', 'data-group')
      .attr('transform', `translate(${margin.left}, 0)`)
      .selectAll('use')
      .data((d, i) => {
        let range = Math.floor(data[i] / unit)
        if(range <= itemStyle.min) {
          range = itemStyle.min
        }
        if(range > max) {
          range = max
        }
        self.rangeArray.push(range)
        return d3.range(0, range)
      })
      .call(::self.setUseAttribute, data)
    // 选择并处理enter部分  
    update.enter()
      .append('use')  
      .call(::self.setUseAttribute, data)
    // 选择并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  设置use属性
   *  @param    {object}  use use元素
   *  @return   {void}
   */
  setUseAttribute(use) {
    const self = this
    const { dur, itemStyle } = self.config
    const { color, width, spacing } = itemStyle
    let compute = interpolate(color)
    use.attr('class', 'use-data')
      .attr('xlink:href', `#${self.useDataId}`)
      .attr('fill', (d) => compute(self.fillLinear(d)))
      .attr('y', 2)
      .attr('x', 0)
      .transition()
      .duration(dur)
      .attr('x', (d, i) => (width + spacing) * i)
  }

  /**
   *  设置右边滑动块的属性
   *  @param    {object}  use use元素
   *  @return   {void}
   */
  setSliderAttribute(use) {
    const self = this
    const { dur, itemStyle } = self.config
    const { width, spacing, height, margin, slider } = itemStyle
    use.attr('class', 'right-slider')
      .attr('xlink:href', `#${self.useSliderId}`)
    // 初始化属性设置  
    this.initSetAttribute(() => {
      use.attr('x', margin.left)
    })
    // 动画过渡设置
    use.transition()
      .duration(dur)
      .attr('x', (d, i) => self.rangeArray[i] * (width + spacing) + margin.left - slider.width )
      // (滑动的高度 - 矩形背景的高度 - 矩形边框) / 2
      .attr('y', -(slider.height - height - 2) / 2)
  }

  /**
   *  设置左边文本的样式
   *  @param {array} text 右边文本元素
   *  @param {array} data 数据项
   *  @return   {void}
   */
  setLeftTextAttribute(text, data) {
    const { leftText,dur } = this.config
    const top = this.config.itemStyle.height
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
      .text((d, i) => `${data[i].name}`)
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
    const top = this.config.itemStyle.height
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
   *  添加use使用的元素
   *  @param    {object}  defs defs元素
   *  @return   {void}
   */
  addElement(defs) {
    const { width, itemStyle } = this.config
    const { margin, slider } = itemStyle 
    let dataMaxWidth = width - margin.left - margin.right

    // 添加矩形背景条 
    defs.append('rect')
      .attr('width', dataMaxWidth)
      .attr('height', itemStyle.height + 4)
      .attr('stroke', itemStyle.strokeBg)
      .attr('stroke-width', 1)
      .attr('x', margin.left)
      .attr('id', this.useBgId)

    // 添加矩形数据条  
    defs.append('rect')
      .attr('width', itemStyle.width)
      .attr('height', itemStyle.height)
      .attr('id', this.useDataId)  

    // 添加矩形滑块
    defs.append('rect')
      .attr('width', slider.width)
      .attr('height', slider.height )
      .attr('fill', slider.fill)
      .attr('id', this.useSliderId)    
      .attr('rx', 1)
      .attr('ry', 1)
  }
}
