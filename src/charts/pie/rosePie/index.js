/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-10 09:38:43
 * @Description: 玫瑰图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-10 09:38:43
 */

import d3 from 'd3'
import _ from 'lodash'
import { isNoData, getMousePosition} from '../../util/util'
import Legend from './legend.js'
import { showTips, hideTips } from './tips.js'

export default class RosePie {

  /**
   * 饼图图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 500,
      height: 500,
      dur: 1000,
      tooltip: {
        show: true
      },
      itemStyle: {
        colors: ['#C32F4B', '#6CC4A4', '#4D9DB4', '#E1514B', '#F47245', '#FB9F59', '#FEC574', 
          '#FAE38C', '#EAF195', '#C7E89E', '#9CD6A4', '#9E0041', '#C32F4B', '#4776B4'],
        margin: {
          top: 6,
          right: 110, 
          bottom: 20,
          left: 40
        },
        hover: {
          fill: '#9CD6A4',
          radius: 20
        }
      },
      legend: {
        radius: 6,
        fontSize: 12,
        fill: '#fff'
      }
    }
  }

  /**
   * Creates an instance of RosePie
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector

    const { width, height } = this.config 
 
    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // path组元素
    this.arcPathGroup = this.svg.append('g')
      .attr('class', 'arc-path-groups')
      .call(this::this.gTrans)

    // 实例化图例
    this.legend = new Legend(this.svg, this.config)  
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
    const { width, height } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    // 渲染数据组  
    self.renderData(data)
    // 调用图例
    self.legend.render(data)
  }

  /**
   *  渲染数据
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  renderData(data) {
    const self = this
    const { width, height, itemStyle } = self.config
    const { right } = itemStyle.margin
    let radius = Math.min(width - right, height) / 2 - 20
    let innerRadius = 0.2 * radius
    itemStyle.radius = radius
    let dataset = []
    data.map((d) => dataset.push(d.value))
    // 可以返回自然数，获取值大值，计算比例尺 返回 10 的 max.length 次幂。  
    let pow = Math.pow(10, String(d3.max(dataset)).length )
    self.pie = d3.layout.pie()
      .sort(null)
      .value((d) => d.value)
    // 创建一个饼图布局  
    self.arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius((d) => { 
        return (radius - innerRadius) * (d.data.value / pow) + innerRadius
      })
    // hover饼图布局
    self.hoverArc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius((d) => { 
        return (radius - innerRadius) * (d.data.value / pow) + innerRadius + itemStyle.hover.radius
      })  
    // 转换数据  
    self.pieData = self.pie(data)    
    // 渲染路径
    self.renderPathGroup(self.arcPathGroup)  
 
  }

  /**
   *  渲染路径
   *  @example: [example]
   *  @param    {[type]}  g [description]
   *  @return   {void}
   */
  renderPathGroup(g) {
    const self = this
    // 选择update部分
    let update = g.selectAll('path')
      .data(self.pieData)
    // 处理enter部分  
    update.enter().append('path') 
    // 处理update部分   
    update.call(::self.setPathAttribute)  
    // 处理exit部分
    update.exit().remove()  
  }

  /**
   *  pie 的tween方法
   *  @param    {object} d  当前数据
   *  @return   {function}  过渡效果
   */
  tweenPie(d){  
    const self = this
    let start = {
      startAngle: d.startAngle,
      endAngle: d.startAngle
    }
    // 这里将每一个的弧的开始角度和结束角度都设置成了开始位置  
    // 然后向他们原始的角度(d)开始过渡，完成动画。      
    let i = d3.interpolate(start, d)  
    // 下面的函数就是过渡函数，他是执行多次最终达到想要的状态。  
    return (t) => self.arc(i(t))
  }  
  
  /**
   *  设置path元素属性
   *  @param    {object}  path path元素
   *  @return   {void}
   */
  setPathAttribute(path) {
    const self = this
    const selector = self.selector
    const { itemStyle, tooltip, dur } = self.config
    const { colors, hover } = itemStyle
    path.attr('class', (d, i) => `arc-path arc-apth-${i}`)
      .attr('fill', (d, i) => colors[i])
      .attr('stroke', 'none')
      .attr('d', self.arc)
      .transition() // 设置动画  
      .duration(dur) // 持续时间  
      .attrTween('d', ::self.tweenPie) // 两个属性之间平滑的过渡 

    // 是否显示提示框
    if(tooltip.show){
      path.on('mouseover', (d, i) => {
        path.style('cursor', 'pointer')
        // 调用样式设置
        self.mouseEventStyle(i, 1, hover.fill)
        // 显示提示框  
        showTips(selector, d.data, getMousePosition())  
      })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, 2, colors)
          // 隐藏提示框  
          hideTips(selector)  
        })
    }
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {number}  type    鼠标事件类型(1:over, 2:out)
   *  @param    {string}  fill    填充色
   *  @return   {void}
   */
  mouseEventStyle(i, type, fill) {
    const self = this
    const me = d3.select(`.arc-apth-${i}`)
    me.attr('d', type === 1 ? self.arc : self.hoverArc)
      .transition()
      .duration(500)
      .attr('d', type === 1 ? self.hoverArc : self.arc)
      .attr('fill', type === 1 ? fill : fill[i])
  }

  /**
   *  g元素tansfrom的位置 
   *  @param    {g}  g    g元素
   *  @return   {void}
   */
  gTrans(g) {
    const { width, height, itemStyle } = this.config
    const { top, left } = itemStyle.margin
    g.attr('transform', `translate(${width / 2 - left}, ${height / 2 + top })`)
  }
}
