/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-19 17:13:31
 * @Description: 3D饼图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-19 17:13:31
 */
import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData } from '../../util/util'

// 获取path id
const pathId = genSVGDocID()

export default class Donut3d {

  /**
   * 图表组件默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting() {
    return{
      width: 300,
      height: 300,
      ir:0.4, // inner radius 取值:0-1
      ph: 40, // path height 
      colors: ['#9b25ef', '#e0be17', '#f45d23', '#0366de', '#00ffda']
    }
  }

  /**
   * Creates an instance of donut3d
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    this.selector = selector
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    const { width, height} = this.config // 宽、高
    this.outerRadius = width / 2 // 外半径
    this.innerRadius = width / 3 - 20 // 内半径

    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    // 创建g元素  
    this.pathGroup = this.svg.append('g')
      .attr('transform', `translate(${width / 2 }, ${height / 2})`)
      .attr('class', `slices-group-${pathId}`) 
    // 创建内部path g元素  
    this.innerGroup = this.pathGroup.append('g')
      .attr('class', 'inner-path-group')   
    // 创建顶部path g元素  
    this.topGroup = this.pathGroup.append('g')
      .attr('class', 'top-path-group')  
    // 创建外部path g元素
    this.outerGroup = this.pathGroup.append('g')
      .attr('class', 'outer-path-group') 
    // 创建文字 g元素
    this.textGroup = this.pathGroup.append('g')
      .attr('class', 'text-group')          
 
    // 创建饼图布局  
    this.pie = null
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
    const { width, height, ir, ph} = self.config  
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    const rx = self.outerRadius
    const ry = self.innerRadius

    let dataset = d3.layout.pie()
      .sort(null)
      .value( (d) => d.value )(data)
 
    // 渲染内部path
    self.renderInnerPath(dataset, {rx, ry, ph, ir})
    // 渲染顶部path
    self.renderTopPath(dataset, {rx, ry, ir})
    // 渲染外部path
    self.renderOuterPath(dataset, {rx, ry, ph})
    // 文字
    self.renderText(dataset, {rx, ry})
  } 
 
  /**
   *  渲染内部path
   *  @param    {array}   data       图表数据
   *  @param    {number}  rx radius x
   *  @param    {number}  ry radius y
   *  @param    {number}  ph path正面height
   *  @param    {number}  ir inner radius
   *  @return   {void}
   */
  renderInnerPath(data, {rx, ry, ph, ir}) {
    const self = this
    let innerGroup = this.innerGroup
    // 获取upate部分
    let update = innerGroup.selectAll('.inner-path')
      .data(data)  
    // 获取并处理enter部分  
    update.enter().append('path')
    // 处理update部分  
    update.call(::self.setInnerPathAttribute, {rx, ry, ph, ir})  
    // 获取并处理exit()    
    update.exit().remove()      
  }

  /**
   *  渲染顶部path
   *  @param    {array}   data   图表数据
   *  @param    {number}  rx     radius x
   *  @param    {number}  ry     radius y
   *  @param    {number}  ir     inner radius
   *  @return   {void}
   */
  renderTopPath(data, {rx, ry, ir}) {
    const self = this
    // 获取g元素
    const topGroup = self.topGroup
    // 获取并处理update部分
    let update = topGroup.selectAll('.top-path')
      .data(data)
    // 获取并处理enter部分  
    update.enter().append('path')
    // 处理update部分  
    update.call(::self.setTopPathAttribute, {rx, ry, ir})   
    // 获取并处理exit()  
    update.exit().remove()   
  }

  /**
   *  渲染外部path
   *  @param    {array}   data      图表数据
   *  @param    {number}  rx        radius x
   *  @param    {number}  ry        radius y
   *  @param    {number}  ph        path正面height
   *  @return   {void}
   *  
   */
  renderOuterPath(data, {rx, ry, ph}) {
    const self = this
    // 获取g元素
    const outerGroup = this.outerGroup
    // 获取并处理update部分
    let update = outerGroup.selectAll('.outer-path')
      .data(data)
    // 获取并处理enter部分  
    update.enter().append('path')
    // 处理update部分
    update.call(::self.setOuterPathAttribute, {rx, ry, ph}) 
    // 获取并处理exit部分  
    update.exit().remove()  
  }

  /**
   *  渲染文字
   *  @param    {array}   data       图表数据
   *  @param    {number}  rx radius x
   *  @param    {number}  ry radius y
   *  @return   {void}
   */
  renderText(data, {rx, ry}) {
    const self = this
    // 获取g元素
    let textGroup = self.textGroup
    // 获取并处理update部分
    let update = textGroup.selectAll('.text')
      .data(data)
    // 获取并处理enter部分  
    update.enter().append('text')
    // 处理update部分
    update.call(::self.setTextAttribute, {rx, ry}) 
    // 获取并处理exit部分    
    update.exit().remove()     
  }

  /**
   *  设置内部path属性及方法
   *  @param    {array}  path       path元素
   *  @param    {number}  rx radius x
   *  @param    {number}  ry radius y
   *  @param    {number}  ph path正面height
   *  @param    {number}  ir inner radius
   *  @return   {void}
   */
  setInnerPathAttribute(path, {rx, ry, ph, ir}) {
    const self = this
    let tween = (d) => {
      let start = {
        endAngle: d.endAngle,
        startAngle: 0
      }
      let i = d3.interpolate(start, d)
      return (t) => self.pieInner(i(t), rx + 0.5, ry + 0.5, ph, ir)  
    }

    path.attr('class', (d, i) => `inner-path inner-path-${i}`)
      .style('fill', (d, i) => d3.hsl(self.getColor(i)).darker(0.7) )
      .attr('d', (d) => self.pieInner(d, rx + 0.5, ry + 0.5, ph, ir) )
      .transition()
      .duration(750)
      .attrTween('d', tween) 

  }

  /**
   *  设置顶部path属性及样式
   *  @param    {array}  path       path元素
   *  @param    {number}  rx radius x
   *  @param    {number}  ry radius y
   *  @param    {number}  ir inner radius
   *  @return   {void}
   */
  setTopPathAttribute(path, {rx, ry, ir}) {
    const self = this
    let tween = (d) => {
      let start = {
        endAngle: d.endAngle,
        startAngle: 0
      }
      let i = d3.interpolate(start, d)
      return (t) => self.pieTop(i(t), rx, ry, ir)  
    }

    path.attr('class', 'top-path')
      .style('fill', (d, i) => self.getColor(i) )
      .attr('d', (d) => self.pieTop(d, rx, ry, ir))
      .transition()
      .duration(750)
      .attrTween('d', tween) 
  }

  /**
   *  设置外部path属性及样式
   *  @param    {array}  path       path元素
   *  @param    {number}  rx radius x
   *  @param    {number}  ry radius y
   *  @param    {number}  ph path正面height
   *  @return   {void}
   */
  setOuterPathAttribute(path, {rx, ry, ph}) {
    const self = this
    let tween = (d) => {
      let start = {
        endAngle: d.endAngle,
        startAngle: 0
      }
      let i = d3.interpolate(start, d)
      return (t) => self.pieOuter(i(t), rx - 0.5, ry - 0.5, ph)  
    }
    path.attr('class', 'outer-path')
      .style('fill', (d, i) => d3.hsl(self.getColor(i)).darker(0.7))
      .attr('d', (d) => self.pieOuter(d, rx - 0.5, ry - 0.5, ph))
      .transition()
      .duration(750)
      .attrTween('d', tween) 
  }

  /**
   *  设置文字属性及样式
   *  @param    {array}  text       text元素
   *  @param    {number}  rx radius x
   *  @param    {number}  ry radius y
   *  @return   {void}
   */
  setTextAttribute(text, {rx, ry}) {
    const self = this
    text.attr('class', 'text')
      .attr('fill', '#fff')
      .attr('x',(d) => 0.6 * rx * Math.cos(0.5 * (d.startAngle + d.endAngle)) )
      .attr('y',(d) => 0.6 * ry * Math.sin(0.5 * (d.startAngle + d.endAngle)) )
      .text(self.getPercent)
      .attr('opacity', 0)
      .transition()
      .ease('out')
      .duration(750)
      .attr('opacity', 1)
  }

  /**
   *  设置path组元素属性
   *  @param    {array}  g  g元素
   *  @return   {void}
   */
  setPathGroupAttribute(g) {
    g.attr('class', 'path-group')
  }
 
  /**
   *  计算内部path的d属性
   *  @param    {object}  d  当前类型数据
   *  @param    {number}  rx radius x
   *  @param    {number}  ry radius y
   *  @param    {number}  h path正面height
   *  @param    {number}  ir inner radius
   *  @return   {string}  path 'd'属性的值
   *  @return   {void}
   */
  pieInner(d, rx, ry, h, ir ){
    let startAngle = d.startAngle < Math.PI ? Math.PI : d.startAngle
    let endAngle = d.endAngle < Math.PI ? Math.PI : d.endAngle 
    let sx = ir * rx * Math.cos(startAngle)
    let sy = ir * ry * Math.sin(startAngle)
    let ex = ir * rx * Math.cos(endAngle)
    let ey = ir * ry * Math.sin(endAngle)
    let ret = []
    ret.push('M', sx, sy, 'A', ir * rx, ir * ry, '0 0 1', ex, ey, 
      'L', ex, h + ey, 'A', ir * rx, ir * ry, '0 0 0', sx, h + sy, 'z')
    return ret.join(' ')
  }

  /**
   *  计算顶部path的d属性
   *  @param    {object}  d  当前类型数据
   *  @param    {number}  rx radius x
   *  @param    {number}  ry radius y
   *  @param    {number}  ir inner radius
   *  @return   {string}  path 'd'属性的值
   *  @return   {void}
   */
  pieTop(d, rx, ry, ir ){
    if(d.endAngle - d.startAngle === 0 ) {
      return 'M 0 0' 
    }
    let sx = rx * Math.cos(d.startAngle)
    let sy = ry * Math.sin(d.startAngle)
    let ex = rx * Math.cos(d.endAngle)
    let ey = ry * Math.sin(d.endAngle)
    let ret = []
    ret.push('M', sx, sy, 'A', rx, ry, '0', 
      d.endAngle - d.startAngle > Math.PI ? 1 : 0, 
      '1', ex, ey, 'L', ir * ex, ir * ey)

    ret.push('A', ir * rx , ir * ry, '0', 
      d.endAngle - d.startAngle > Math.PI ? 1 : 0, 
      '0', ir * sx, ir * sy,'z')
    return ret.join(' ')
  }

  /**
   *  计算外部path的d属性
   *  @param    {object}  d  当前类型数据
   *  @param    {number}  rx radius x
   *  @param    {number}  ry radius y
   *  @param    {number}  h path正面height
   *  @return   {string}  path 'd'属性的值
   *  @return   {void}
   */
  pieOuter(d, rx, ry, h ){
    let startAngle = d.startAngle > Math.PI ? Math.PI : d.startAngle
    let endAngle = d.endAngle > Math.PI ? Math.PI : d.endAngle
    let sx = rx * Math.cos(startAngle)
    let sy = ry * Math.sin(startAngle)
    let ex = rx * Math.cos(endAngle)
    let ey = ry * Math.sin(endAngle)
    let ret = []
    ret.push('M', sx, h + sy, 'A', rx, ry, '0 0 1', 
      ex, h + ey, 'L', ex, ey, 'A', rx, ry, '0 0 0', sx, sy, 'z')
    return ret.join(' ')
  }

  /**
   *  计算百分比
   *  @param    {d}  d 数据
   *  @return   {void}
   */
  getPercent (d){
    let angle = d.endAngle - d.startAngle
    return angle > 0.2 ? 
      `${Math.round(1000 * angle / (Math.PI * 2)) / 10} %` : ''
  } 

  /**
   *  获取饼图填充色
   *  @param    {numbter}  idx [下标]
   *  @return   {void}
   */
  getColor(idx) {
    // 默认颜色
    const defauleColor = [
      '#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80',
      '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
      '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
      '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
    ]
    let palette = _.merge([], defauleColor, this.config.colors)
    return palette[idx % palette.length]  
  }  
} 
