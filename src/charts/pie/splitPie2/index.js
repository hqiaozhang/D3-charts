/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-16 11:44:05
 * @Description: 饼图分隔
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-16 11:44:05
 */

import d3 from 'd3'
import _ from 'lodash'
import { isNoData, genSVGDocID } from '../../util/util'
 
export default class SplitPie2 {
  /**
   * 饼图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 500,
      height: 500,
      dur: 750, // 动画过渡时间
      max: 50, // 限制平分最多个数
      itemStyle: {
        stroke: '#051046',
        strokeWidth: 3,
        color: ['#9b25ef', '#e0be17', '#f45d23', '#0366de', '#00ffda']
      },
      textStyle: {
        fontSize: 18
      }
    }
  }

  /**
   * Creates an instance of SplitPie2
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    // 获取配置项
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    const { width, height} = this.config // 宽、高
    const outerRadius = width / 4 // 外半径
    const innerRadius = width / 5 // 内半径
    this.gId = genSVGDocID()

    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // 创建饼图布局  
    this.pie = d3.layout.pie().sort(null) 
    // 创建弧生成器
    this.arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)  
    // 创建defs元素  
    this.defs = this.svg.append('defs')  
    // 创建path的组元素(g)
    this.pathGroup = this.svg.append('g')
      .attr('class', 'path-group')  
      
    // 生成弧度  
    this.arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)  
      
    // 线条弧度
    this.lineArc = d3.svg.arc()
      .innerRadius(1.1 * innerRadius)
      .outerRadius(1.1 * outerRadius)
    // 文字弧度
    this.lEndArc = d3.svg.arc()
      .innerRadius(1.4 * innerRadius)
      .outerRadius(1.4 * outerRadius)    
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
  render (data) {
    const self = this
    const { width, height } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    const { max } = self.config
    
    // 处理数据的一系列变量
    let pieData = []
    let sum = 0
    let nums = []
    let dataset = []
    let total = 0 // 获取总数
    data.map( (d) => {
      total += d.value
      dataset.push(d.value)
    })

    for(let i = 0, len = dataset.length; i < len; i++) {
      /* n * (n1 / n1 + n2 + n3) 
       * n = 最多平分个数
       * n1 = 当前值
       * (n1 + n2 + n3) = 总数 
      */
      let num = Math.ceil(max * (dataset[i] / total))
      for(let j = 1; j < num + 1; j++) {
        pieData.push(1)
      }
      // 保存平分多少份的值用于后面填充颜色
      nums.push(num)
      // 计算总值
      sum += num
    }
    
    self.renderPath(pieData, nums)
    // 添加文字组元素
    self.renderTextGroup(data, nums, sum)
  }

  renderPath(data, nums) {
    const self = this
    const { width, height, dur } = self.config
    // 获取path的g元素容器
    let pathGroup = self.pathGroup
    pathGroup.attr('transform', `translate(${width / 2}, ${height / 2}) scale(0)`)   
      .transition()
      .duration(dur)  
      .attr('transform', `translate(${width / 2}, ${height / 2}) scale(1)`)   
    // 获取并处理update部分
    let update = pathGroup.selectAll('path')
      .data(self.pie(data))
      .call(::self.setPathAttribute, nums)

    // 获取并处理enter部分
    update.enter()
      .append('path')
      .call(::self.setPathAttribute, nums)
    // 获取并处理exit部分
    update.exit().remove()  

  }

  /**
   *  设置path样式
   *  @param    {array}  path        path元素
   *  @param    {array}   nums       每一类型的总数组
   *  @return   {void}
  */
  setPathAttribute (path, nums) {
    // 填充颜色
    const { stroke, strokeWidth } = this.config.itemStyle 
    let n = 0
    let num = nums[0]
    path.attr('d', this.arc)
      .attr('fill', (d, i) => {
        if(i === num){
          n++
          num += nums[n]
        }
        return this.getColor(n)
      }) 
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
  }

  /**
   *  渲染文字组元素
   *  @param    {array}  data 图表数据
   *  @param    {array}   nums       每一类型的总数组
   *  @param    {number}  sum         path总数
   *  @return   {void}
   */
  renderTextGroup(data, nums, sum) {
    let self = this
    // 选择update部分    
    let update = this.svg.selectAll(`.text-group-${this.gId}`)
      .data(data)

    // 选择enter部分  
    let enter = update.enter()
      .append('g')
      .attr('class', (d, i) => `text-group-${this.gId} text-group-${this.gId}-${i}` )
    // 添加文字
    enter.append('text')
      .call(::self.setTextAttribute, data, nums, sum)
    // 选择文字
    update.select('text')
      .call(::self.setTextAttribute, data, nums, sum)  
    // 处理exit部分  
    update.exit().remove()  
  }

  /**
   *  设置text属性及样式----添加polyline元素
   *  @param    {array}   text        text元素
   *  @param    {array}   data        数据
   *  @param    {array}   nums        每一类型的总数组 
   *  @param    {number}  sum         path总数
   *  @return   {void}
   */
  setTextAttribute (text, data, nums, sum) {
    const self = this
    // 线条弧度
    const lineArc = self.lineArc
    // 文字弧度
    const lEndArc = self.lEndArc
    const { textStyle, width, height} = self.config      
    let attr = {}
    let angle = Math.PI * 2 / sum
    let midAngel // 弧度的中心位置

    text.each( (d, i) => {
      let count = 0
      let last = 0
      for (let k = 0; k <= i; k++) {
        count += nums[k]
        last = nums[k]
      }
      attr.startAngle = angle * (count - last)
      attr.endAngle = angle * count
      // 计算弧长的中心位置 =（起始弧度 + 终止弧度）/2 = 弧度的中心位置
      midAngel = attr.startAngle + (attr.endAngle - attr.startAngle) / 2
      let pos = lEndArc.centroid(attr)
      // 改变文字标识的x坐标
      let radius = 240
      let points = [lineArc.centroid(attr), lEndArc.centroid(attr), pos]
      pos[0] = radius * (midAngel < Math.PI ? 1.05 : -1.05)

      // 保存i的下标用于polyline设置颜色
      self.config.lineIndex = i
      // 选择g元素下面的polyline元素
      let polyline = self.svg.select(`.text-group-${this.gId}-${i}`)
      if(polyline.select('polyline').node()){
        polyline
          .select('polyline')
          .call(::self.setPolylineAttribute, points)
      } else{
        polyline 
          .append('polyline')
          .call(::self.setPolylineAttribute, points)
      }
      
      // 设置文字属性
      let texts = d3.select(`.text-group-${this.gId}-${i}`)
        .select('text')
        .attr('x', pos[0])
        .attr('y', pos[1])
        .style('fill', this.getColor(i))
        .attr('font-size', textStyle.fontSize)
        .style('text-anchor', midAngel < Math.PI ? 'end' : 'start')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
      // 选择tspan update部分  
      let update = texts.selectAll('tspan')
        .data([data[i].value, data[i].name])
      // 处理enter部分  
      update.enter().append('tspan')
      // 处理update部分  
      update.call(::self.setTspanAttribute, pos)
      // 处理exit部分
      update.exit().remove()  
    })
  }

  /**
   *  tspan属性设置
   *  @param    {array}  tspan tspan元素
   *  @param    {array}  pos   位置坐标点
   *  @return   {void}
   */
  setTspanAttribute(tspan, pos) {
    const { dur } = this.config
    tspan
      .attr('x', 0)
      .attr('y', 0)
      .transition()
      .duration(dur)
      .attr('x', pos[0] )
      .attr('y', (d, i) => {
        if(i === 0) {
          return pos[1] + 30
        }
        return pos[1] - 10
      })
      .text( (d) => d )
  }

  /**
   *  设备polyline样式
   *  @param    {array}  polyline polyline元素
   *  @param    {array}  points   points属性(成生好之后传过来)
   *  @return   {void}
   */
  setPolylineAttribute(polyline, points) {
    const { lineIndex, width, height, dur } = this.config
    polyline
      .attr('fill', 'none')
      .attr('stroke', () => this.getColor(lineIndex))
      .attr('transform', `translate(${width / 2}, ${height / 2})`)
      .attr('stroke-width', 2)
      .attr('points', [0, 0, 0, 0, 0, 0])
      .transition()
      .duration(dur)
      .attr('points', points)
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
    let palette = _.merge([], defauleColor, this.config.itemStyle.color)
    return palette[idx % palette.length]  
  } 
}
