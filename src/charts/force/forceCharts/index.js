/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-25 09:11:44
 * @Description: 力导向图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-25 09:11:44
 */

import d3 from 'd3'
import _ from 'lodash'
import circle from './images/circle.png'
import circle2 from './images/circle2.png'
import current from './images/current.png'
import { genSVGDocID } from '../../util/util'
// 获取一系列id
const imgId = [genSVGDocID(), genSVGDocID(), genSVGDocID()]

export default class ForceCharts {
  /**
   * 图表组件默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting() {
    return {
      width: 500,
      height: 500
    }
  }

  /**
   * Creates an instance of forceCharts.
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)

    // 创建svg元素
    const svg = d3.select(selector)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
    // 创建line g元素
    this.lineGroup = svg.append('g')
      .attr('class', 'line-group')  
    // 创建圆的g元素
    this.circles = svg.append('g')
      .attr('class', 'circles')  
    // 创建text g元素
    this.texts = svg.append('g')
      .attr('class', 'texts')  

    this.updatePath = null
    this.updateUse = null
    this.updateText = null  
    // 力导向布局
    this.force = null  

    // 创建defs元素
    const defs = svg.append('defs')
    this.addElement(defs)
  }  

  /**
   *  渲染
   *  example:
   *  {
   *  "sourceNode": "13800138000",
   *    "edges": [
   *      {
   *        "source": "12345610",
   *         "target": "1234561"
   *       }
   *     ]
   *   } 
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  render(data) {
    const self = this
    const { width, height } = self.config
    // 定义节点数据
    let nodes = {}
    // 定义连数组
    let edges = data.edges
    // compute the distinct nodes from the links
    edges.forEach((d) => {
      d.source = nodes[d.source] || (nodes[d.source] = {name: d.source})
      d.target = nodes[d.target] || (nodes[d.target] = {name: d.target})
    })

    // d3.values(object)
    // 返回一个包含指定对象(关联数组) 属性值的数组。返回数组的顺序未定义
    nodes = d3.values(nodes)
    let sourceNode = data.sourceNode

    // 转换数据
    /* 创建一个力导向图的布局,将nodes和edges作为布局被转换的数据
    并设定连线的距离为90，节点的电荷数为-400，其他参数使用默认值*/
    self.force = d3.layout.force()
      .nodes(nodes) // 设定节点数组
      .links(edges) // 设定连线数组
      .size([width, height])
      .linkDistance(150) // 设定连线的距离
      .charge(-400)
      .start() // 开启布局计算  

    // 调用线条渲染
    self.renderLinePath(edges)  
    // 渲染节点关系
    self.renderNodes(nodes, sourceNode)
    // 渲染文字
    self.renderTexts(nodes, sourceNode)
    // 动画的计算进入到下一步
    self.force.on('tick', ::self.setTick) 
    // 用于拖拽操作的函数
    self.forceDrag(sourceNode)
  }

  /**
   *  渲染线条
   *  @param    {[type]}  edges 连线数据
   *  @return   {void}
   */
  renderLinePath(edges) {
    const self = this
    // 获取g元素
    const lineGroup = this.lineGroup
    // 获取update部分
    let update = lineGroup.selectAll('path')
      .data(edges)
    
    // 获取并处理enter部分
    update.enter()
      .append('path')
    // 处理update部分  
    update.call(::self.setpathAttribute)
    this.updatePath = update  

    // 处理exit部分  
    update.exit().remove()  
  }

  /**
   *  渲染节点数据
   *  @param    {array}  nodes      节点数组
   *  @param    {number}  sourceNode 源头号码
   *  @return   {void}
   */
  renderNodes(nodes, sourceNode) {
    const self = this
    // 获取g元素 
    const circles = self.circles
    // 获取并处理update部分
    let updata = circles.selectAll('use')
      .data(nodes)
      .call(::self.setUseCircleAttribute, sourceNode)
    self.updateUse = updata  
    // 获取并处理enter部分
    let enterG = updata.enter()
      .append('use')
    // 处理enter部分
    self.setUseCircleAttribute(enterG, sourceNode)
    // 绑定拖动
    enterG.call(self.force.drag)
    // 处理eixt部分
    updata.exit().remove() 
  }

  /**
   *  设置线条path的属性
   *  @param    {object}  path path元素
   *  @return   {void}
   */
  setpathAttribute(path) {
    const self = this
    path.attr('class', 'force-line')
      .attr('d', self.linkArc)
      .attr('stroke', '#18a7ff')
      .attr('fill', 'none')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', 3)
  }

  /**
   *  渲染文字
   *  @param    {array}   nodes      生成好的节点数据
   *  @param    {number}  sourceNode 源头号码
   *  @return   {void}
   */
  renderTexts(nodes, sourceNode) {
    const self = this
    let texts = self.texts
    // 获取update部分 
    let update = texts.selectAll('text')
      .data(nodes)  
    // 获取并处理enter部分 
    update.enter()
      .append('text')
    // 处理update部分  
    update.call(::self.setTextAttribute, sourceNode)  
    self.updateText = update  
    // 处理exit部分
    update.exit().remove()  
  }

  /**
   * 文字属性设置
   * @param  {object} text      text元素
   * @param  {number} sourceNode 源头号码
   * @return {object}  null
   */
  setTextAttribute(text, sourceNode) {
    const self = this
    text.attr('pointer-events', 'none')
      .attr('class', (d, i) => `text text-${i}`)
      .attr('fill', (d, i) => {
        if( d.name === sourceNode) {
          // 源头号码字体变大
          d3.select(`.text${i}`)
            .attr('font-size', 20) 
          return 'yellow'
        }
        return '#66abfb'
      })
      .attr('transform', self.transform)
      .text((d) => d.name)
  }

  /**
   * 圆(use引用image)属性设置
   * @param  {object} use      use元素
   * @param  {number} sourceNode 源头号码
   * @return   {void}
   */
  setUseCircleAttribute(use, sourceNode) {
    const self = this
    use.attr('class', (d, i) => `img-${i}`)
      .attr('xlink:href', (d) => {
        if(d.name === sourceNode) {
          return `#${imgId[2]}`
        }
        return `#${imgId[0]}`
      })
      .attr('transform', self.transform)
  }

  /**
   * 用于拖拽操作的函数
   * @param  {number} sourceNode 源头号码
   * @return   {void}
   */
  forceDrag(sourceNode) {
    this.force.drag()
      .on('dragend', (d, i) => {
        // 拖拽结束后变为原来的颜色
        d3.select(`.img-${i}`)
          .attr('xlink:href', () => {
            if(d.name === sourceNode) {
              return `#${imgId[2]}`
            }
            return `#${imgId[0]}`
          })
      })
      // 拖拽的时候改变颜色
      .on('drag', (d, i) => {
        d3.select(`.img-${i}`)
          .attr('xlink:href', () => {
            if(d.name === sourceNode) {
              return `#${imgId[2]}`
            }
            return `#${imgId[1]}`
          })
      })
  }

  /**
  * 动画的计算进入到下一步
  *  @return   {void}
  */
  setTick() {
    this.updatePath.attr('d', this.linkArc)
    this.updateUse.attr('transform', this.transform)
    this.updateText.attr('transform', this.transform)
  } 

  /**
   *  transform生成点
   *  @param    {object}  d 数据源
   *  @return   {object}  translate的位置
   */
  transform(d) {
    return `translate(${d.x - 20}, ${d.y - 20})`
  }

  /**
   *  添加一系列元素
   *  @param    {object}  defs defs元素
   *  @return   {void}
   */
  addElement(defs) {
    // 创建箭头
    defs.selectAll('marker')
      .data(['suit', 'licensing', 'resolved'])
      .enter().append('marker')
      .attr('id', (d) => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', -1.5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto') 
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#18a7ff')
    // 添加小图片   
    defs.append('image')
      .attr('width', 33)
      .attr('height', 33)
      .attr('xlink:href', circle)
      .attr('id', imgId[0])   
    // 添加小图片(拖动改变时的图片) 
    defs.append('image')
      .attr('width', 33)
      .attr('height', 33)
      .attr('xlink:href', circle2)
      .attr('id', imgId[1])  
    // 来源号码大图片   
    defs.append('image')
      .attr('width', 80)
      .attr('height', 80)
      .attr('xlink:href', current)
      .attr('id', imgId[2])      
  }

  /**
   *  path生成点
   *  @param    {object}  d 数据源
   *  @return   {object}  line的 path d属性
   */
  linkArc(d) {
    let dx = d.target.x - d.source.x
    let dy = d.target.y - d.source.y
    let dr = Math.sqrt(dx * dx + dy * dy)
    return `M${d.source.x}, ${d.source.y}, A${dr}, ${dr} 0 0, 1 ${d.target.x}, ${d.target.y}`
  }
}
