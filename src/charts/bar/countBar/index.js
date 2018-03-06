/**
 * @Author:      zhanghq
 * @DateTime:    2017-12-05 17:08:15
 * @Description: 多数据柱状图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-12-05 17:08:15
 */

// import * as d3 from 'd3'
import './styles/index.css'
import _ from 'lodash'
import AddAxis from './addAxis'
import filterHbs from './hbs/filter.hbs'
import { appendSVG, isNoData, genSVGDocID,
  getMousePosition } from '../../util/util'
import { legend } from './legend.js'
import { showTips, hideTips } from './tips.js'

export default class CountBar {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 300,
      dur: 750, // 动画过渡时间
      tooltip: { // 是否显示提示框
        show: true
      }, // 图形配置项
      itemStyle: {
        width: 8,
        radius: 5,
        spacing: 5, // 柱子之间的间距
        margin: { // 图形离上下左右的距离
          top: 20,
          right: 40,
          bottom: 30,
          left: 50
        },
        colors: [ // 每根柱子的填充色（渐变填充）
          {
            color: ['#9936e8', '#49aefe']
          }, {
            color: ['#ff8a00', '#49aefe']
          }, {
            color: ['#191ed4', '#9936e8']
          }
        ],
        // 渐变配置项
        gradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
          offset1: '0%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 1
        }
      },
      yAxis: {
        show: true,
        axisLine: {
          show: true // 轴线
        },
        gridLine: { 
          show: true // 网格线
        },
        pow: 0.3,
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
   * Creates an instance of CountBar
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列的id
    this.gId = genSVGDocID()
    this.gradientId = [genSVGDocID(), genSVGDocID(), genSVGDocID()]
    const { width, height, itemStyle } = this.config 
    // 获取margin的值
    const { left, right, top, bottom } = itemStyle.margin
    // x轴的实际宽度(该值会多次使用,初始化计算出来，后面就不用计算了)
    this.config.xWidth = width - left - right
    this.config.yHeight = height - top - bottom 
    // 创建svg元素
    this.svg = appendSVG(selector, {width, height})
    const defs = this.svg.append('defs')
    // 渐变配置项
    const colors = this.getColor()
    colors.map((d, i) => {
      let color = this.getColor(i) 
      d.stopColor = color.color[0]
      d.endColor = color.color[1]
      d.gradient = this.config.itemStyle.gradient
      d.id = `gradient-${this.gradientId[i]}`
    })
    defs.html(filterHbs({
      config: colors
    }))
    // 加载图例
    legend(selector)
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)  
    // 初始化定义
    this.isInit = true
  }

  render(data) {
    const self = this
    const { width, height } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    self.DATA = data
    let xData = [] // 保存x轴数据
    let dataset = [] // 保存各组value
    let yData = [] // 保存y轴数据
    for(let a of data){
      let values = Object.values(a)
      let value = []
      values.map((d) => {
        if(typeof d === 'string'){
          xData.push(d)
        }else {
          yData.push(d)
          value.push(d)
        }
      })
      dataset.push(value)
    }
    // 渲染x轴
    self.xScale = this.addAxis.renderXAxis(data)  
    // 渲染y轴  
    self.yScale = self.addAxis.renderYAxis(yData) 
    self.renderData(dataset)
    // 重置初始化的值
    this.isInit = false  
     
  }

  renderData(data) {
    const self = this
    // 获取update部分
    let update = self.svg.selectAll(`.group-${self.gId}`)
      .data(data)
    
    // 获取enter部分
    update.enter().append('g')
    update.call(::self.setGroupAttribute)

    data.map((d, i) => {
      let updateRect = self.svg.select(`.group-${self.gId}-${i}`).selectAll('rect')
        .data(d)

      updateRect.enter().append('rect')

      updateRect.call(::self.setRectAttriute)
    })
    // 处理exit部分
    update.exit().remove()
  }
  /**
   *  组元素样式设置
   *  @param    {array}   g           g元素
   *  @param    {number}  lineHeight  行高
   *  @return   {void}
   */
  setGroupAttribute(g) {
    const self = this
    const data = self.DATA
    const selector = self.selector
    const { dur, itemStyle } = self.config
    const { top } = itemStyle.margin
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    // 初始化判断
    if(this.isInit){
      g.attr('transform', (d, i) => `translate(${this.xScale(i) + 34}, ${top})`)
    }else{
      g.transition()
        .duration(dur)
        .attr('transform', (d, i) => `translate(${this.xScale(i) + 34}, ${top})`)
    }
    // 鼠标事件
    g.on('mouseover', (d, i) => showTips(selector, data[i], getMousePosition()))
      .on('mouseout', () => {
        hideTips(selector)
      })
  }

  /**
   *  矩形属性设置
   *  @param    {object}  rect rect元素
   *  @return   {void}
   */
  setRectAttriute(rect) {
    const self = this
    const { dur, itemStyle, yHeight } = self.config
    const { width: itemWidth, radius, spacing } = itemStyle
    rect.attr('class', (d, i) => `rect-data-${i}`)
      .attr('width', itemWidth)
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('fill', (d, i) => `url(#gradient-${self.gradientId[i]})`)
      .attr('x', (d, i) => (spacing + itemWidth) * i)
    // 初始化属性设置
    self.initSetAttribute(() => {
      rect.attr('height', 0)
        .attr('y', yHeight)
    })  
    // 动画过渡设置
    rect.transition()
      .duration(dur)
      .attr('height', (d) => yHeight - self.yScale(d))
      .attr('y', (d) => self.yScale(d))
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
   *  获取渐变填充色
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
    let palette = _.merge([], defauleColor, this.config.itemStyle.colors)
    return idx === undefined ? palette : palette[idx % palette.length]  
  }  
}
