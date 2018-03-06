/**
 * @Author:      zhanghq
 * @DateTime:    2017-10-23 17:10:25
 * @Description: 圆点柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-10-23 17:10:25
 */
import d3 from 'd3'
import _ from 'lodash'
import { isNoData, genSVGDocID, getMousePosition } from '../../util/util'
import filterHbs from './hbs/filter.hbs'
import { showTips, hideTips } from './tips.js'

export default class DotBar {
  /**
   * 图表组件默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting() {
    return{
      width: 465,
      height: 400,
      dur: 750,
      tooltip: {
        show: true
      },
      itemStyle: {
        bgFill: '#162850',
        height: 15,
        min: 10, // 柱子小宽度
        radius: 5, // 条形图两边的半径,
        margin: {
          top: 6,
          right: 70, 
          bottom: 0,
          left: 40
        },
        color: ['#b500ff', '#4c11c4'],
        gradient: {
          x1: '0%',
          y1: '0%',
          x2: '0%',
          y2: '100%',
          offset1: '20%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 0.8
        },
        hover: {
          color: ['#03a9ff', '#4c11c4']
        }
      },
      dotStyle: {
        radius: 2,
        fill: '#290d47'
      },
      // 左边文字配置项
      leftText: {
        show: true,
        fontSize: 12,
        fill: '#fff',
        textAlign: 'start'
      },
      // 右边文字配置项
      rightText: {
        show: true,
        fontSize: 12,
        fill: '#fff',
        textAlign: 'middle',
        unit: ''
      }
    }
  }

  /**
   * Creates an instance of DotBar
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector

    // 获取一系列的Id
    this.gradientId = [genSVGDocID(), genSVGDocID()]
    this.filterId = genSVGDocID()
    this.gId = genSVGDocID()
    this.markId = genSVGDocID()

    const { width, height, itemStyle } = this.config 
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 
    // 初始化判断
    this.isInit = true
    // 比例尺
    this.xScale = null
    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    // 创建defs元素  
    const defs = this.svg.append('defs') 
    // 渐变配置项
    let gradientCfg = {
      stopColor: itemStyle.color[0],
      endColor: itemStyle.color[1],
      gradient: itemStyle.gradient,
      id: this.gradientId[0]
    }
    // hover事件配置项
    const { hover } = itemStyle
    let hoverCfg = {
      stopColor: hover.color[0],
      endColor: hover.color[1],
      gradient: itemStyle.gradient,
      id: this.gradientId[1]
    }
    defs.html(filterHbs({
      config: [gradientCfg, hoverCfg],
      filterId: this.filterId
    })) 
  }

  /**
   * 渲染
   *  @example: [
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
    const { width, height, xWidth } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }

    // 取value值用比例尺计算最大值
    let dataset = []
    data.map((d) => dataset.push(d.value))
    // 比例尺
    self.xScale = d3.scale.pow()
      .domain([0, d3.max(dataset)] )
      .range([0, xWidth])
      .exponent(0.25)

    // 渲染图表数据
    self.renderData(data)
    // 初始化判断
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
      
    // 获取并处理enter部分
    let enter = update.enter().append('g')
    // 添加左边文字
    enter.append('text').classed('left-text', true)
    // 添加数据背景部分
    enter.append('rect').classed('rect-bg', true) 
    // 添加数据部分
    enter.append('rect').classed('rect-data', true)  
    // 添加小圆点组元素  
    enter.append('g').classed('group-dot', true)
    // 添加右边文字部分  
    enter.append('text').classed('right-text', true)

    /*
      处理update部分
     */
    // group update处理
    update.call(::self.setGroupAttribute, lineHeight)
    // 选择左边文字部分
    update.select('.left-text')  
      .call(::self.setLeftTextAttribute, data)
    // 选择背景
    update.select('.rect-bg') 
      .call(::self.setRectBgAttribute) 
    // 选择数据部分
    update.select('.rect-data')  
      .call(::self.setRectAttribute)
    // 选择小圆点组元素
    update.select('.group-dot')  
      .call(::self.setGroupDotAttribute)  
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
    const { tooltip, dur } = self.config
    g.classed(`group-${self.gId}`, true)
    // 非初始化的执行动画
    if(!this.isInit){
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(0, ${lineHeight * i})`)
    }else{
      g.attr('transform', (d, i) => `translate(0, ${lineHeight * i})`)
    }
    
    // 是否显示提示框
    if(tooltip.show) {
      g.style('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, self.gradientId[1])
          // 显示提示框  
          showTips(selector, d, getMousePosition())  
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, self.gradientId[0])
          // 隐藏提示框  
          hideTips(selector)  
        })
    }  
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {string}  fill    填充色
   *  @return   {void}
   */
  mouseEventStyle(i, fill) {
    const group = d3.select(`.group-${this.gId}-${i}`)
    // 选择数据矩形条    
    group.select('.rect-data')
      .attr('fill', `url(#${fill})`)
  }

  /**
   *  设置矩形背景属性
   *  @param    {[type]}  rect [description]
   *  @return   {void}
   */
  setRectBgAttribute(rect) {
    const self = this
    const { itemStyle, dur, xWidth } = self.config
    const { bgFill, height, margin, radius } = itemStyle
    rect.attr('class', 'rect-bg')
      .attr('fill', bgFill)
      .attr('filter', `url(#${self.filterId})`)
      .attr('stroke-width', 1)
      .attr('stroke', '#2235c0')
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('height', height)
      .attr('x', margin.left)
      // 初始化属性设置
    if(this.isInit) {
      rect.attr('width', 0) 
    }
    rect.transition()
      .duration(dur)
      .attr('width', xWidth) 
  }
 
  /**
   *  设置数据的属性样式
   *  @param {object} rect 表示数据量大小的矩形元素
   *  @return   {void}
   */
  setRectAttribute(rect) {
    const self = this
    const { itemStyle, dur } = self.config
    const { height, margin, radius } = itemStyle
    rect.attr('class', 'rect-data')
      .attr('fill', `url(#${self.gradientId[0]})`)
      .attr('height', height - 3)
      .attr('y', 2)
      .attr('x', margin.left)
      .attr('rx', radius)
      .attr('ry', radius)
    // 初始化属性设置
    if(this.isInit) {
      rect.attr('width', 0) 
    }
    // 动画过渡设置
    rect.transition()
      .duration(dur)
      .attr('width', (d) => self.xScale(d.value)) 
  } 

  /**
   *  小圆点组元素属性设置
   *  @param    {object}  g g元素
   *  @return   {void}
   */
  setGroupDotAttribute(g) {
    const self = this
    const { itemStyle } = self.config
    const { left } = itemStyle.margin
    let group = g.attr('class', 'group-dot')
      .attr('transform', `translate(${left + 10}, 0)`)
    // 选择并处理update部分  
    let update = group.selectAll('circle')
      .data((d) => {
        let range = (self.xScale(d.value) - left + 20) / 10
        return d3.range(0, range)
      })
      .call(::self.setDotAttribute)
    // 选择并处理enter部分  
    update.enter()
      .append('circle')
      .call(::self.setDotAttribute)
    // 选择并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  小圆点属性设置
   *  @param    {object}  circle circle元素
   *  @return   {void}
   */
  setDotAttribute(circle) {
    const self = this
    const { dur, itemStyle, dotStyle } = self.config
    const { radius, fill } = dotStyle
    circle.attr('class', 'dot')
      .attr('r', radius)
      .attr('fill', fill)
      .attr('cy', itemStyle.height / 2)
      .attr('filter', `url(#${self.filterId})`)
    if(this.isInit) {
      circle.attr('cx', 0)
    }
    circle.transition()
      .duration(dur)
      .attr('cx', (d, i) => 10 * i)
  }

  /**
   *  设置顶部线条图片属性
   *  @param    {array}  use use元素
   *  @return   {void}
   */
  setRightCircleAttribute(use) {
    const self = this
    const { dur, itemStyle } = self.config
    const { left } = itemStyle.margin
    use.attr('class', 'right-circle')
      .attr('xlink:href', `#${self.markId}`)
      .attr('y', itemStyle.height / 2)
      .attr('opacity', 0)
    // 初始化属性设置    
    if(this.isInit) {
      use.attr('x', left)
    }
    // 动画过渡
    use.transition()
      .duration(dur)
      .attr('x', (d) => self.xScale(d.value) + left)
      .attr('opacity', 1)
  }

  /**
   *  设置左边文本的样式
   *  @param {array} text 右边文本元素
   *  @param {array} data 数据项
   *  @return   {void}
   */
  setLeftTextAttribute(text, data) {
    const { leftText, dur, itemStyle } = this.config
    const top = itemStyle.height
    text.attr('class', 'left-text')
      .attr('x', 0)
      .attr('y', top)
      .attr('font-size', leftText.fontSize)
      .attr('fill', leftText.fill)
      .attr('text-anchor', leftText.textAlign)
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
    const top = itemStyle.height
    text.attr('class', 'right-text')
      .attr('y', top)
      .attr('font-size', rightText.fontSize)
      .attr('fill', rightText.fill)
      .attr('text-anchor', rightText.textAlign)
    // 初始化属性设置  
    if(this.isInit) {
      text.attr('x', 0)
    }
    // 动画过渡
    text.transition()
      .duration(dur)
      .attr('x', width - right / 2)
      .text((d, i) => `${data[i].value} ${rightText.unit}`)
  }
}
