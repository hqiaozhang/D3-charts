/**
 * @Author:      zhanghq
 * @DateTime:    2017-10-16 09:32:49
 * @Description: 饼图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-10-16 09:32:49
 */

import d3 from 'd3'
import _ from 'lodash'
import { isNoData } from '../../util/util'

export default class Pie {
  /**
   * 饼图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 360,
      height: 190,
      dur: 1500, // 动画过度时间
      itemStyle: {
        margin: {
          top: 25,
          left: 0,
          bottom: 60,
          right: 0
        },
        colors: ['#1a9dff', '#0eebff', '#46faff', '#811ef8', '#504afd'],
        innerRadius: 70,
        outerRadius: 50,
        lines: {
          extend: 80 // 延长线
        }
      },
      // 背景样式设置
      bgItemStyle: {
        stroke: '#3d53a4',
        fill: '#0f1738',
        strokeWidth: 1
      }
    }  
  }

  /**
   * Creates an instance of Pie
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    const { width, height, itemStyle } = this.config  
    const { innerRadius, outerRadius, margin } = itemStyle
    const { top, bottom } = margin
    // 创建svg元素
    const svg = d3.select(selector)
      .append('svg')
      .attr('width', width + top)
      .attr('height', height + bottom)

    // 背景path组元素  
    this.bgArcGroup = svg.append('g')  
      .classed('bg-arc-group', true) 
      .call(::this.gTrans)

    // path组元素   
    this.arcGroup = svg.append('g') 
      .classed('arc-group', true) 
      .call(::this.gTrans)
    // 文字组元素
    this.textGroup = svg.append('g')
      .classed('text-group', true) 
      .call(::this.gTrans)
    // 线条组元素
    this.lineGroup = svg.append('g')
      .classed('line-group', true) 
      .call(::this.gTrans)

    // 转换原始数据为能用于绘图的数据
    this.pie = d3.layout.pie()
      .sort(null)
      .value((d) => d.value)
    this.pieData = []

    this.svg = svg

    // 创建弧生成器(计算弧形路径的函数)
    this.arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius) 
    // 背景弧  
    this.bgArc = d3.svg.arc()
      .innerRadius(innerRadius)   
      .outerRadius(outerRadius + 35)   
    // hover事件用的  
    this.arcHover = d3.svg.arc()
      .innerRadius(15 )   
      .outerRadius(30 )   
    // 线条的
    this.lineArc = d3.svg.arc()
      .innerRadius(1.1 * innerRadius)
      .outerRadius(1.1 * outerRadius)
    // 文字  
    this.lEndArc = d3.svg.arc()
      .innerRadius(1.6 * innerRadius)
      .outerRadius(1.6 * outerRadius)
  }

  /**
   *  渲染
   *  @example: [
   *    {
   *     'name': '@cname', // 名称
   *     'value|10-100': 1
   *    }
   *  ]
   *  @param {array} data 渲染组件需要的数据项
   *  @return   {void}
   */
  render(data) {
    const self = this
    const { width, height } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    self.pieData = self.pie(data)  
    // 渲染背景弧  
    self.renderArcGroup(self.bgArcGroup, 1) 
    // 数据弧
    self.renderArcGroup(self.arcGroup, 2) 
    // 文字
    self.renderTextGroup(self.textGroup)
    // 线条 
    self.renderlineGroup(self.lineGroup)
  }

  /**
   *  渲染数据 生成path元素
   *  @param    {object}  g    g元素
   *  @param    {[type]}  type 类型(1=背景；2=数据)
   *  @return   {void}
   */
  renderArcGroup(g, type) {
    const self = this
    // 获取update部分 
    let setArc = null
    let arc = null
    if(type === 1){
      setArc = self.setBgArcPathAttribute
      arc = this.bgArc
    } else{
      setArc = self.setArcPathAttribute  
      arc = self.arc 
    }
    // 获取并处理update部分  
    let update = g.selectAll('.path-arc-1')
      .data(self.pieData)
    // 处理enter部分  
    update.enter().append('path')
    // 处理update部分  
    update.call(self::setArc, arc)
    // 处理exit部分
    update.exit().remove() 
  }

  /**
   *  数据pie 的tween方法
   *  @param    {object} d  当前数据
   *  @return   {function}  过渡效果
   */
  tweenPie(d){  
    const self = this
    let start = {
      startAngle: d.startAngle,
      endAngle: d.startAngle
    }
    // 这里将每一个的弧的开始角度和结束角度都设置成了0  
    // 然后向他们原始的角度(d)开始过渡，完成动画。      
    let i = d3.interpolate(start, d)  
    // 下面的函数就是过渡函数，他是执行多次最终达到想要的状态。  
    return (t) => self.arc(i(t))
  }  

  /**
   *  背景pie 的tween方法
   *  @param    {object} d  当前数据
   *  @return   {function}  过渡效果
   */
  tweenBgPie(d){
    const self = this
    // 这里将每一个的弧的开始角度和结束角度都设置成了0  
    // 然后向他们原始的角度(d)开始过渡，完成动画。      
    let i = d3.interpolate({startAngle:0,endAngle:0}, d)  
    // 下面的函数就是过渡函数，他是执行多次最终达到想要的状态。  
    return (t) => self.bgArc(i(t))
  }

  /**
   *  path属性设置
   *  @param    {object}  path path元素
   *  @param    {function}  arc  arc方法
   *  @return   {void}
   */
  setArcPathAttribute(path, arc) {
    const self = this
    const { dur } = self.config
    path.attr('fill', (d, i) => self.getColor(i))
      .attr('stroke', '#040d1a')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1)
      .attr('class', 'path-arc-1')
      .attr('d', d => arc(d))
      .transition() // 设置动画  
      .duration(dur) // 持续时间  
      .attrTween('d', ::self.tweenPie) // 两个属性之间平滑的过渡 
  }

  /**
   *  背景path属性设置
   *  @param    {object}  path path元素
   *  @param    {function}  arc  arc方法
   *  @return   {void}
   */
  setBgArcPathAttribute(path, arc) {
    const self = this
    const { dur } = self.config
    const { fill, stroke, strokeWidth } = self.config.bgItemStyle
    path.attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
      .attr('d', (d) => arc(d))
      .transition() // 设置动画  
      .duration(dur) // 持续时间  
      .attrTween('d', ::self.tweenBgPie) // 两个属性之间平滑的过渡 
  }

  /**
   *  渲染文字(path)
   *  @param    {object}  g    g元素
   *  @return   {void}
   */
  renderTextGroup(g) {
    const self = this
    // 获取name update部分 
    let updateN = g.selectAll('.name-text')
      .data(self.pieData)
    // 处理enter部分  
    updateN.enter().append('text')
    // 处理update部分  
    updateN.call(::self.setTextAttribute, 1)
    // 处理exit部分
    updateN.exit().remove()      

    // 获取value update部分 
    let updateV = g.selectAll('.value-text')
      .data(self.pieData)
    // 处理enter部分  
    updateV.enter().append('text')
    // 处理update部分
    updateV.call(::self.setTextAttribute, 2)
    // 处理exit部分
    updateV.exit().remove()
  }

  /**
   *  设置文字属性
   *  @param    {object}  text text元素
   *  @param    {number}  type 类型(name,value)
   *  @return   {void}
   */
  setTextAttribute(text, type) {
    const self = this
    const { dur, itemStyle } = self.config
    const { outerRadius } = itemStyle
    text.attr('fill', (d, i) => `${type === 1 ? '#fff' : self.getColor(i)}`)
      .attr('text-anchor', (d) => self.midAngel(d) < Math.PI ? 'start' : 'end')
      .attr('font-size', 14)
      .attr('class', `${type === 1 ? 'name-text' : 'value-text'}`)
      .attr('dy', `${type === 1 ? '1.2em' : '-0.5em'}`)
      .text((d) => `${type === 1 ? d.data.name : d.data.value}`)
      .attr('transform', (d) => {
        let pos = self.lineArc.centroid(d)
        return `translate(${pos})`
      })
      .attr('opacity', 0)
      .transition() // 设置动画  
      .delay(dur)
      .duration(dur) // 持续时间  
      .attr('opacity', 1)
      .attr('transform', (d) => {
        let pos = self.lEndArc.centroid(d)
        let radius = outerRadius + 60
        pos[0] = radius * (self.midAngel(d) < Math.PI ? 1.1 : -1.1)  
        return `translate(${pos})`
      })
  }
 
  /**
   *  线条组数据渲染
   *  @param    {object}  g g元素
   *  @return   {void}
   */
  renderlineGroup(g) {
    const self = this
    // 获取update部分 
    let update = g.selectAll('polyline')
      .data(self.pieData)
      .call(::self.setPolylineAttribute)
    // 处理enter部分  
    update.enter()
      .append('polyline')
      .call(::self.setPolylineAttribute)
    // 处理exit部分
    update.exit().remove()    
  }

  /**
   *  线条属性设置
   *  @param    {object}  polyline polyline元素
   *  @return   {void}
   */
  setPolylineAttribute(polyline) {
    const self = this
    const { dur, itemStyle } = self.config
    const { outerRadius, lines } = itemStyle
    polyline.attr('fill', 'none')
      .attr('stroke', (d, i) => self.getColor(i))
      .attr('stroke-width', 1)
      .attr('points', (d) => {
        let pos = self.lineArc.centroid(d)
        return [pos, pos, pos] 
      })
      .transition() // 设置动画  
      .delay(dur)
      .duration(dur) // 持续时间  
      .attr('points', (d) => {
        let pos = self.lEndArc.centroid(d)
        let radius = outerRadius + lines.extend
        pos[0] = radius * (self.midAngel(d) < Math.PI ? 1.1 : -1.1)  
        return [self.lineArc.centroid(d), self.lEndArc.centroid(d), pos] 
      })
  }
 
  /**
   *  g元素tansfrom的位置 
   *  @param    {g}  g    g元素
   *  @return   {void}
   */
  gTrans(g) {
    const self = this
    const { width, height, itemStyle } = self.config
    const { top } = itemStyle.margin
    g.attr('transform', `translate(${width / 2}, ${height / 2 + top })`)
  }

  /**
   *  计算弧长的中心位置  
   *  @param    {object}  d 弧度数据
   *  @return   {void}
   */
  midAngel(d) {
    // 计算弧长的中心位置 =（起始弧度 + 终止弧度）/2 = 弧度的中心位置
    return d.startAngle + (d.endAngle - d.startAngle) / 2
  }

  /**
   *  获取饼图填充色
   *  @param    {numbter}  idx [下标]
   *  @return   {void}
   */
  getColor(idx) {
    const self = this
    const { colors } = self.config.itemStyle
    // 默认颜色
    let defauleColor = [
      '#38f3ff', '#da2c59', '#5ab1ef', '#ffb980', '#d87a80',
      '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
      '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
      '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
    ]
    let palette = _.merge([], defauleColor, colors)
    return palette[idx % palette.length]  
  }  
}
