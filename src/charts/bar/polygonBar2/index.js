/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-08 10:58:52
 * @Description: 三组数据三角形柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-08 10:58:52
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, getMousePosition } from '../../util/util'
import AddAxis from './addAxis'
import filterHbs from './hbs/filter.hbs'
import { showTips, hideTips } from './tips.js'

export default class PolygonBar2 {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      dur: 750,
      tooltip: {
        show: true
      },
      itemStyle: {
        margin: {
          top: 20,
          right: 40,
          bottom: 40,
          left: 40
        },
        colors: [
          ['#17bec7', '#11244e'],
          ['#6f44d1', '#0a0d38'],
          ['#0578d1', '#11286b'] 
        ],
        gradient: {
          x1: '0%',
          y1: '0%',
          x2: '0%',
          y2: '100%',
          offset1: '0%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 1
        },
        hover: {
          colors: [
            ['#008efc', '#1f75ff'],
            ['#3f4599', '#3f4599'],
            ['#5810ed', '#5810ed'] 
          ]
        }
      },
      topText: {
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'middle'
      },
      yAxis: {
        show: false,
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
        fill: '#fff',
        textAnchor: 'middle'
      }
    }
  }

  /**
   * Creates an instance of PointBar
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列Id
    this.gId = genSVGDocID()
    this.polygonId = genSVGDocID()
    this.rectId = genSVGDocID()
    this.gradientId = [genSVGDocID(), genSVGDocID()]

    const { width, height, itemStyle } = this.config 
    // 获取margin的值
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom - 47 // - 47是图形的高度占了47
    this.TYPENAMES = ['装订证据材料', '听阅卷', '移送案']
    // 创建svg元素
    const svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    // 创建defs元素  
    const defs = svg.append('defs') 
    // 渐变色
    const colors = itemStyle.colors
    const hoverColors = itemStyle.hover.colors
    let gradientCfg = []  
    colors.map((d, i) => {
      let color = colors[i]
      let hoverCfg = []
      d.stopColor = color[0]
      d.endColor = color[1]
      d.gradient = this.config.itemStyle.gradient
      d.id = `${this.gradientId[0]}-0${i}`
      // hover配置项
      let hoverColor = hoverColors[i]
      hoverCfg.stopColor = hoverColor[0]
      hoverCfg.endColor = hoverColor[1]
      hoverCfg.gradient = this.config.itemStyle.gradient
      hoverCfg.id = `${this.gradientId[1]}-0${i}`
      gradientCfg.push(hoverCfg)
    })
    // 合并滤镜配置项  
    colors.push(...gradientCfg)
    defs.html(filterHbs({
      config: colors
    }))

    this.svg = svg  
    // x轴比例尺
    this.xScale = null 
    // y轴比例尺
    this.yScale = null 
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)
    // 定义初始值
    this.isInit = true
  }

  /**
   * 渲染
   * @example: [
   *    {
   *     'name': 'Random.date()', // 名称
   *     'value|3': [3, 2, 1]
   *    }
   *  ]
   * @param {array} data 渲染组件需要的数据项
   * @return   {void}
   */
  render(data) {
    const self = this
    const { width, height, yHeight } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    self.rangeArr = []
    // 获取所有value
    let dataset = []

    data.map((d) => dataset.push(...d.value)) 
    // 渲染x轴
    self.xScale = self.addAxis.renderXAxis(data) 
    // 定义y轴比例尺
    self.yScale = d3.scale.pow()  
      .domain([0, d3.max(dataset)])  
      .range([0, yHeight])  
      .exponent(0.5)
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
    let update = svg.selectAll(`.group-${self.gId}`)
      .data(data)
    // 获取enter部分  
    let enter = update.enter().append('g') 
    // 处理update部分   
    update.call(::self.setGroupAttribute)
    // 获取数组类型的长度  
    let len = data[0].value
    len.map((d, i) => {
      // 处理enter部分
      enter.append('path').classed(`path-${i}`, true) 
      enter.append('text').classed(`value-text-${i}`, true) 
      // 处理update部分
      update.select(`.path-${i}`) 
        .call(::self.setPathAttribute, i) 
      update.select(`.value-text-${i}`)
        .call(::self.setTextAttribute, i)    
    })   
      
    // 获取并处exit部分  
    update.exit().remove()  
  }

  /**
   *  设置数据g元素属性
   *  @param    {array}  g  g元素
   *  @return   {void}
   */
  setGroupAttribute(g) {
    const self = this
    const selector = self.selector
    const { itemStyle, height, tooltip, dur } = self.config
    const { bottom, left } = itemStyle.margin
    let transX = left - 20
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    let y = height - bottom - 47
    // 初始化判断
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(${transX + self.xScale(i)}, ${y})`)
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(${transX + self.xScale(i)}, ${y})`)
    }
    // 是否显示提示框
    if(tooltip.show) {
      g.attr('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用当前组下面的元素样式设置
          self.mouseEventStyle(i, self.gradientId[1])
          // 显示提示框
          d.value1 = d.value[0]
          d.value2 = d.value[1]
          d.value3 = d.value[2]
          d.name1 = self.TYPENAMES[0] 
          d.name2 = self.TYPENAMES[1] 
          d.name3 = self.TYPENAMES[2] 
          showTips(selector, d, getMousePosition())
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用当前组下面的元素样式设置
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
    const self = this
    const colors = self.config.itemStyle.colors
    const group = d3.select(`.group-${self.gId}-${i}`)
    colors.map((d, j) => {
      group.select(`.path-${j}`)
        .attr('fill', `url(#${fill}-0${j})`)
    })
  }

  /**
   *  设置Path属性
   *  @param    {object}  path path元素
   *  @param    {number}  i    下标
   *  @return   {void}
   */
  setPathAttribute(path, i) {
    const self = this
    const { dur } = self.config
    path.attr('class', `path-${i}`)
      .attr('fill', `url(#${self.gradientId[0]}-0${i})`)
    // 初始化属性设置
    this.initSetAttribute(() => {
      path.attr('d', 'M20, 0, -15, 0, -15, 44, 20, 25, 54, 44, 54, 0')
    })
    // 动画过渡设置
    path.transition()
      .duration(dur)
      .attr('d', (d) => {
        let p1 = self.yScale(d.value[i])
        let h = 12
        let fixed = '-15, 44, 20, 25, 54, 44, 54'
        let points = `M20, ${-(p1 - h)}, -15, ${-(p1 - h * 3)}, ${fixed}, ${-(p1 - h * 3)}`
        return points
      })
  }

  /**
   *  设置文字的属性
   *  @example: [example]
   *  @param    {object}  text text元素
   *  @param    {number}  i    下标
   *  @return   {void}
   */
  setTextAttribute(text, i) {
    const self = this
    const { dur } = self.config
    text.attr('class', `value-text-${i}`)
      .attr('x', 20)
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
    // 初始化属性设置
    this.initSetAttribute(() => text.attr('y', 0))
    // 动画过渡设置
    text.transition()
      .duration(dur)
      .attr('y', (d) => -self.yScale(d.value[i]) + 5)
      .text((d) => d.value[i])
  }

  /**
   * 初始化的属性设置 
   * @param {function} fn 初始化的属性设置 
   * @return   {void}
   */
  initSetAttribute(fn) {
    this.isInit ? fn() : ''
  }
}
