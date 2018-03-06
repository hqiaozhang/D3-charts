/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-18 10:50:02
 * @Description: 滑块柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-18 10:50:02
 */
import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, getMousePosition } from '../../util/util'
import AddAxis from './addAxis'
import filterHbs from './hbs/filter.hbs'
import { showTips, hideTips } from './tips.js'
 
export default class SliderBar {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      dur: 750, // 动画过渡时间
      itemStyle: {
        width: 8,
        radius: 5,   
        bgColor: '#4d788a',
        color: ['#00d2ff', '#0048ff'],
        gradient: {
          x1: '0%',
          y1: '0%',
          x2: '0%',
          y2: '100%',
          offset1: '20%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 0.2
        },
        topMark: {
          width: 15,
          height: 8,
          fill: '#fff',
          stroke: 'none'
        },
        margin: {
          top: 20,
          right: 40,
          bottom: 30,
          left: 70
        },
        hover: {
          bgColor: '#4d6670',
          color: ['#00fff6', '#59ffd6']
        }
      },
      tooltip: {
        show: true
      },
      isxAxis: true,
      yAxis: {
        show: true,
        axisLine: {
          show: true // 轴线
        },
        gridLine: { 
          show: true // 网格线
        },
        ticks: 5 // 刻度  
      },
      xText: {
        fontSize: 16,
        fill: '#fff'
      },
      topText: {
        fontSize: 16,
        fill: '#8cffff'
      }
    }
  }

  /**
   * Creates an instance of sliderBar
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    this.selector = selector
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列Id
    this.gId = genSVGDocID()
    this.useId = genSVGDocID()
    this.filterId = genSVGDocID()
    this.gradientId = [genSVGDocID(), genSVGDocID()]
    const { width, height, itemStyle } = this.config // 宽、高
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 

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
    // x轴比例尺
    this.xScale = null
    // y轴比例尺
    this.yScale = null
    // 调用添加矩形背景柱子
    this.addElement()  
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config, this.filterId)
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
   * @param    {array}   data 渲染组件需要的数据项
   * @return   {void}
   */
  render(data) {
    const self = this
    const { width, height } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    // 渲染x轴
    self.xScale = this.addAxis.renderXAxis(data)
    // 获取所有value 用于渲染y轴
    let dataset = []
    data.map((d) => dataset.push(d.value))  
    // 渲染y轴
    self.yScale = this.addAxis.renderYAxis(dataset)
    // 渲染数据组  
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
    // 获取update部分  
    let update = this.svg.selectAll(`.group-${self.gId}`)
      .data(data)

    // 获取enter部分  
    let enter = update.enter().append('g')
    // 添加use元素-引用矩形背景  
    enter.append('use')
    // 添加数据矩形  
    enter.append('rect').classed('rect-data', true)
    // 添加顶部小滑块矩形  
    enter.append('rect').classed('top-mark', true) 
    // 添加顶部文字
    enter.append('text')   

    /**
     *  处理update部分
     */
    // 组元素属性设置
    update.call(::self.setGroupAttribute) 
    // 选择use元素-引用矩形背景  
    update.select('use')
      .call(::self.useRectBgAttribute)  
    // 选择数据矩形    
    update.select('.rect-data')
      .call(::self.setRectAttribute)  
    // 选择顶部小滑块矩形  
    update.select('.top-mark')
      .call(::self.setTopMarkAttribute) 
    // 选择顶部文字
    update.select('text')
      .call(::self.setTopTextAttribute)   
    // 处理exit部分
    update.exit().remove()      

  }

  /**
   *  设置g元素属性
   *  @param    {array}  g g元素
   *  @return   {void}
   */
  setGroupAttribute(g) {
    const self = this
    const selector = this.selector
    const { tooltip, itemStyle, dur } = this.config
    const { top, left } = itemStyle.margin
    // translate Y  = top - 5 是为了让柱子离x轴有点点距离，其他运算涉及到-5的都是同理
    g.attr('class', `group-${self.gId}`)
    // 初始化判断
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(${this.xScale(i) + left / 2 }, ${top - 5})`) 
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(${this.xScale(i) + left / 2 }, ${top - 5})`) 
    }
    // 是否显示提示框
    if(tooltip.show) {
      g.attr('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, 1, itemStyle.hover)
          // 显示提示框
          showTips(selector, d, getMousePosition())
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, 2, itemStyle)
          // 隐藏提示框  
          hideTips(selector)
        })
    }
  }

  /**
   *  鼠标事件图表样式设置
   *  @param    {number}  i 当前下标
   *  @param    {object}  type 鼠标事件类型
   *  @param    {object}  opt   样式配置项
   *  @return   {void}  
   */
  mouseEventStyle(i, type, opt) {
    const { width } = this.config.itemStyle
    // 选择渐变柱子
    d3.select(`.rect-data-${i}`)
      .attr('fill', `url(#${type === 1 ? this.gradientId[1] : this.gradientId[0]})`)
      .attr('width', `${type === 1 ? width : width + 2}`)
      .transition()
      .duration(200)
      .attr('x', `${type === 1 ? -1 : 0}`)
      .attr('width', `${type === 1 ? width + 2 : width }`)
    // 选择背景柱子  
    d3.select(`.rect-bg-${i}`)
      .attr('fill', opt.bgColor)
  }

  /**
   *  设置use元素属性
   *  @param    {array}  use use元素
   *  @return   {void}
   */
  useRectBgAttribute(use) {
    const { bgColor } = this.config.itemStyle
    use.attr('xlink:href', `#${this.useId}`)
      .attr('class', (d, i) => `rect-bg rect-bg-${i}` )
      .attr('fill', bgColor)
  }

  /**
   *  设置数据的柱子属性
   *  @param    {array}  rect rect元素
   *  @return   {void}
   *  @return   {void}
   */
  setRectAttribute(rect) {
    const { yHeight, itemStyle, dur } = this.config
    rect.attr('class', (d, i) => `rect-data rect-data-${i}`)
      .attr('width', itemStyle.width)
      .attr('rx', itemStyle.radius)
      .attr('ry', itemStyle.radius)
      .attr('fill', `url(#${this.gradientId[0]})`)
      // 初始化属性设置  
    this.initSetAttribute(() => {
      rect.attr('y', yHeight)
        .attr('height', 0)
    })
    // 动画过渡设置    
    rect.transition()
      .duration(dur)
      .attr('height', (d) => yHeight - this.yScale(d.value) )
      .attr('y', (d) => this.yScale(d.value))
  }

  /**
   *  设置顶部矩形属性
   *  @param    {rect}  rect rect元素
   *  @return   {void}
   */
  setTopMarkAttribute(rect) {
    const { yHeight, itemStyle, dur } = this.config
    const { topMark, width } = itemStyle
    rect.attr('width', topMark.width)
      .attr('height', topMark.height)
      .attr('fill', '#fff')
      .attr('x', -(topMark.width - width) / 2)
    // 初始化属性设置  
    this.initSetAttribute(() => rect.attr('y', yHeight))  
    // 动画过渡设置  
    rect.transition()
      .duration(dur)
      .attr('y', (d) => this.yScale(d.value) - topMark.height + topMark.height / 2 )
      .attr('class', 'top-mark')
  }

  /**
   *  设置顶部文字属性
   *  @param    {array}  text text元素
   *  @return   {void}
   */
  setTopTextAttribute(text) {
    const { yHeight, topText, dur } = this.config
    text.attr('class', 'top-text')
      .attr('font-size', topText.fontSize)
      .attr('text-anchor', 'middle')
      .attr('fill', topText.fill)
      .attr('x', 2)
    // 初始化属性设置  
    this.initSetAttribute(() => text.attr('y', yHeight))  
    // 动画过渡设置  
    text.transition()
      .duration(dur)
      .attr('y', (d) => this.yScale(d.value) - 5 )
      .text((d) => d.value )
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
   *  添加矩形背景柱子
   *  @return   {void}
   */
  addElement() {
    const defs = d3.selectAll('svg defs')
    const { yHeight, itemStyle } = this.config
    defs.append('rect')
      .attr('width', itemStyle.width)
      .attr('height', yHeight)
      .attr('rx', itemStyle.radius)
      .attr('ry', itemStyle.radius)
      .attr('id', this.useId)
  }
}
