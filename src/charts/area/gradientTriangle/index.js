/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-20 11:45:39
 * @Description: 三角形图表
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-20 11:45:39
 */

import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData } from '../../util/util'
import AddAxis from './addAxis'
import filterHbs from './hbs/filter.hbs'

// 获取一系列Id
const gId = genSVGDocID()
// 渐变色ID
const gradientId = genSVGDocID()
// markId
const markId = genSVGDocID()

export default class Triangle {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      dur: 750,
      itemStyle: {
        margin: {
          top: 20,
          right: 40,
          bottom: 40,
          left: 60
        },
        colors: [
          {
            color: ['#9936e8', '#49aefe']
          }, {
            color: ['#9936e8', '#49aefe']
          }, {
            color: ['#9936e8', '#49aefe']
          }
        ],
        gradient: {
          x1: '0%',
          y1: '0%',
          x2: '0%',
          y2: '100%',
          offset1: '20%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 0.2
        }
      },
      topText: {
        show: true,
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'middle'
      },
      yAxis: {
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
   * Creates an instance of triangle
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)

    const { width, height, itemStyle, topText } = this.config 
 
    // 获取margin的值
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 

    // 创建svg元素
    const svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
 
    const colors = this.getColor()
    colors.map((d, i) => {
      let color = this.getColor(i) 
      d.stopColor = color.color[0]
      d.endColor = color.color[1]
      d.gradient = this.config.itemStyle.gradient
      d.id = `${gradientId}-gradient${i}`
    })

    const defs = svg.append('defs')
    defs.html(filterHbs({
      config: colors
    }))

    this.addElement(defs)

    // 创建多边形g元素
    this.polygonGroup = svg.append('g')
      .attr('class', `polygon-group-${gId}`) 
    // 是否显示顶部文字  
    this.isShowTopText = topText.show  
    if(this.isShowTopText) {
      // 创建图片g元素(顶部文字背景)
      this.imageGroup = svg.append('g')
        .attr('class', `top-mark-group-${gId}`)  
      // 创建顶部文字g元素
      this.TopTextGroup = svg.append('g')
        .attr('class', `top-text-group-${gId}`)
    }
    this.svg = svg
    // x轴比例尺
    this.xScale = null  
    // y轴比例尺
    this.yScale = null
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)
    // 定义初始化的值
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
    const { width, height, xWidth } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    self.config.datalen = data.length
    self.config.unit = xWidth / data.length

    // 获取所有value
    let dataset = []
    data.map((d) => dataset.push(d.value))

    // 渲染x轴
    self.xScale = this.addAxis.renderXAxis(data)  
    // 渲染y轴  
    self.yScale = this.addAxis.renderYAxis(dataset) 
    // 渲染多边形
    self.renderPolygon(data)

    // 是否显示顶部文字
    if(this.isShowTopText){
      // 渲染顶部文字背景图片
      self.renderTopMark(data)
      // 渲染顶部文字
      self.renderTopText(data)
    }
    // 初始化值
    this.isInit = false
  }

  /**
   *  渲染多边形
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderPolygon(data) {
    const self = this
    const polygonGroup = this.polygonGroup
      .call(::self.setGroupAttribute)  
    // 选择并处理update部分
    let update = polygonGroup.selectAll('polygon')
      .data(data)
    // 选择enter部分
    update.enter().append('polygon')
    // 处理update部分  
    update.call(::self.setPolygonAttribute, data) 
    // 选择并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  渲染顶部文字背景图片
   *  @param    {array}  data 图表数据
   *  @return   {void}  
   */
  renderTopMark(data) {
    const self = this
    const imageGroup = this.imageGroup
      .call(::self.setGroupAttribute)  

    // 选择并处理update部分
    let update = imageGroup.selectAll('use')
      .data(data)
    // 选择并处理enter部分
    update.enter().append('use')
    // 处理update部分
    update.call(::self.setMarkAttribute) 
    // 选择并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  渲染顶部文字
   *  @param    {array}  data 图表数据
   *  @return   {void}   
   */
  renderTopText(data) {
    const self = this
    const TopTextGroup = this.TopTextGroup
      .call(::self.setGroupAttribute)  
 
    // 选择并处理update部分
    let update = TopTextGroup.selectAll('text')
      .data(data)
    // 选择enter部分
    update.enter().append('text')
    // 处理update部分  
    update.call(::self.setTopTextAttribute) 
    // 选择并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  设置多边形(polygon)属性
   *  @param    {object}  polygon polygon元素
   *  @param    {array}  data    数据数据
   *  @return   {void}  
   */
  setPolygonAttribute(polygon, data) {
    const self = this
    const { yHeight, dur, itemStyle } = self.config
    const { left, right } = itemStyle.margin
    polygon.attr('class', 'polygon-data')
      .attr('fill', (d, i) => `url(#${gradientId}-gradient${i})`)
      .attr('opacity', 0.6)
    // 初始化属性设置  
    self.initSetAttribute(() => {
      polygon.attr('points', (d, i) => {
        let curX = self.xScale(i)
        let p5 = curX 
        let p1 = curX
        return `${p1} 0, ${curX} 0, ${p5} 0`
      })
    })
    // 动画过渡设置  
    polygon.transition()
      .duration(dur)
      .attr('points', (d, i) => {
        let curX = self.xScale(i)
        let p5 = self.xScale(0)  
        let p1 = self.xScale(data.length) - left - right
        return `${p1} 0, ${curX} ${self.yScale(d.value) - yHeight}, ${p5} 0`
      })
  }

  /**
   *  设置顶部线条图片属性
   *  @param    {array}  use Mark元素
   *  @return   {void}   void
   */
  setMarkAttribute(use) {
    const self = this
    const { yHeight, dur } = self.config
    use.attr('class', 'top-mark')
      .attr('xlink:href', `#${markId}`)
      .attr('x', (d, i) => self.xScale(i) - 4 )
      .attr('opacity', 0)
    // 初始化属性设置  
    self.initSetAttribute(() => use.attr('y', 0))
    // 动画过渡设置
    use.transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d.value) - yHeight - 4 )
      .attr('opacity', 1)
  }

  /**
   *  设置X轴text属性
   *  @param    {array}  text text属性
   *  @return   {void}
   */
  setTopTextAttribute(text) {
    const self = this
    const { yHeight, topText, dur } = self.config
    text.attr('class', 'top-text')
      .attr('font-size', topText.fontSize)
      .attr('fill', topText.fill)
      .attr('text-anchor', topText.textAnchor)
      .attr('x', (d, i) => self.xScale(i) )
      .text((d) => d.value )
    // 初始化属性设置  
    self.initSetAttribute(() => text.attr('y', 0))
    // 动画过渡设置
    text.transition()
      .duration(dur)
      .attr('y', (d) => self.yScale(d.value) - yHeight - 16 )
  }

  /**
   *  设置数据g元素属性
   *  @param    {array}  g  g元素
   *  @return   {void}
   */
  setGroupAttribute(g) {
    const self = this
    const { itemStyle, height } = self.config
    const { bottom, left } = itemStyle.margin
    g.attr('transform', () => `translate(${left}, ${height - bottom})`)
  }

  /**
   *  添加元素
   *  @param    {object}  defs defs元素
   *  @return   {void}
   */
  addElement(defs) {
    // 线断上添加多边形标记点  
    const points = '5, 0, 0, 5, 5, 10, 10, 5'
    let zoom = 1.2
    let oPoints = points.split(',')
    let nPoints = []
    for(let i = 0, len = oPoints.length; i < len; i++) {
      let num = oPoints[i] / zoom
      if(isNaN(num)) {
        num = 0
      }
      nPoints.push(num)
    }
    defs.append('polygon')
      .attr('id', markId)
      .attr('fill', '#5acaff')
      .attr('points', nPoints)
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
   *  获取饼图填充色
   *  @param    {numbter}  idx [下标]
   *  @return   {void}
   */
  getColor(idx) {
    // 默认颜色
    const defauleColor = [
      {
        color: ['#aa58fd', '#008efe']
      }, {
        color: ['#191ed4', '#9936e8']
      }, {
        color: ['#50adfc', '#008efe']
      }, {
        color: ['#50adfc', '#008efe']
      }, {
        color: ['#84f088', '#008efe']
      }, {
        color: ['#f97dcb', '#008efe']
      }, {
        color: ['#f0f88b', '#008efe']
      }, {
        color: ['#7bfcfb', '#008efe']
      }, {
        color: ['#7bfcfb', '#008efe']
      }, {
        color: ['#aa58fd', '#008efe']
      }, {
        color: ['#aa58fd', '#008efe']
      }, {
        color: ['#aa58fd', '#008efe']
      }, {
        color: ['#aa58fd', '#008efe']
      }
    ]
    let palette = _.merge([], defauleColor, this.config.colors)
    return idx === undefined ? palette : palette[idx % palette.length]  
  }  
}
