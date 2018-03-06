/**
 * @Author:      zhanghq
 * @DateTime:    2017-11-06 17:18:50
 * @Description: 六边形饼图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-11-06 17:18:50
 */
import d3 from 'd3'
import _ from 'lodash'
import { genSVGDocID, isNoData, getMousePosition } from '../../util/util'
import AddAxis from './addAxis'
import { showTips, hideTips } from './tips.js'

export default class PolygonPie {
  /**
   * 柱状图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting () {
    return{
      width: 700,
      height: 200,
      tooltip: {
        show: true
      },
      itemStyle: {
        radius: 12,
        margin: {
          top: 20,
          right: 40,
          bottom: 40,
          left: 20
        },
        circle: {
          fill: '#0c0e17',
          stroke: '#252a43',
          strokeWidth: 3,
          radius: 25
        },
        polygon: {
          fill: '#40265e',
          stroke: '#d6a6ff',
          strokeWidth: 2,
          sideLength: 20,
          left: 0,
          bottom: 0
        },
        path: {
          fill: '#ab28ff'
        },
        hover: {
          polygon: {
            fill: '#fc96e3',
            stroke: '#d7b3f5'
          },
          path: {
            fill: '#e31fb3'
          }
        }
      },
      xText: {
        fontSize: 16,
        fill: '#fff',
        textAnchor: 'middle'
      }
    }
  }

  /**
   * Creates an instance of PolygonPie
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
    const { width, height, itemStyle } = this.config 
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

    this.svg = svg  
    // x轴比例尺
    this.xScale = null  
    this.linear = null
    // 实例化轴线
    this.addAxis = new AddAxis(this.svg, this.config)
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
    const { width, height } = self.config
    // 判断数据是否为空
    if(!data || !data.length) {
      isNoData(self.svg, { width, height })
      return false
    }
    // 获取所有value
    let dataset = []
    data.map((d) => dataset.push(d.value))
    // 设置比例尺
    self.linear = d3.scale.linear()
      .domain([0, d3.max(dataset)])
      .range([0, 1])
    // 渲染x轴
    self.xScale = this.addAxis.renderXAxis(data)  
    // 调用渲染数据
    self.renderData(data)
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
      .call(::self.setGroupAttribute)

    /**
     *  获取并处理enter部分
     */
    let enter = update.enter().append('g')  
    // 添加背景圆  
    enter.append('circle')
    // 添加背景六边形  
    enter.append('polygon')
    // 添加path路径  
    enter.append('path')  
    // 添加顶部文字  
    enter.append('text')

    /**
     *  处理update部分
     */
    // 组元素update部分
    update.call(::self.setGroupAttribute)
    // 选择背景圆  
    update.select('circle')
      .call(::self.setBgCircleAttribute)
    // 选择背景六边形  
    update.select('polygon')
      .call(::self.setPolygonAttribute)  
    // 选择path路径  
    update.select('path')  
      .call(::self.setPathAttribute)
    // 选择顶部文字  
    update.select('text')
      .call(::self.setTopTextAttribute)   
    // 处理exit部分  
    update.exit().remove()   
  }

  /**
   *  组元素属性设置
   *  @param    {object}  g g元素
   *  @return   {void}
   */
  setGroupAttribute(g) {
    const self = this
    const selector = self.selector
    const { itemStyle, height, tooltip } = self.config
    const { bottom, left } = itemStyle.margin
    const { polygon, path } = itemStyle.hover
    let transX = left 
    g.attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
      .attr('transform', (d, i) => {
        return `translate(${transX + self.xScale(i)}, ${height - bottom * 2}) scale(0.2)`
      })
      .transition()
      .duration(750)
      .attr('transform', (d, i) => {
        return `translate(${transX + self.xScale(i)}, ${height - bottom * 2}) scale(1)`
      })
    // 是否显示提示框
    if(tooltip.show) {
      g.style('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, polygon, path)
          // 显示提示框  
          showTips(selector, d, getMousePosition())  
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, itemStyle.polygon, itemStyle.path)
          // 隐藏提示框  
          hideTips(selector)  
        })
    }  
  }

  /**
   *  鼠标事件图表样式设置
   *  @param    {number}  i 当前下标
   *  @param    {object}  polygon polygon样式配置项
   *  @param    {object}  path    path样式配置项
   *  @return   {void}  
   */
  mouseEventStyle(i, polygon, path) {
    // 选择当前组元素
    const group = d3.select(`.group-${this.gId}-${i}`)
    // 选择背景六边形
    group.select('.bg-polygon')
      .attr('fill', polygon.fill)
      .attr('stroke', polygon.stroke)
    // 选择数据多边形  
    group.select('.path-data')
      .attr('fill', path.fill)
  }

  /**
   *  设置顶部文字
   *  @param    {object}  text text元素
   *  @return   {void}
   */
  setTopTextAttribute(text) {
    const self = this
    const { radius } = self.config.itemStyle.circle
    text.attr('font-size', 12)
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('y', -radius * 2)
      .text((d) => d.value)
  }

  /**
   *  背景圆属性设置
   *  @param    {object}  circle circle元素
   *  @return   {void}
   */
  setBgCircleAttribute(circle) {
    const self = this
    const { radius, fill, stroke, strokeWidth } = self.config.itemStyle.circle
    circle.attr('class', 'bg-circle')
      .attr('r', radius)
      .attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
  }

  /**
   *  六边形属性设置
   *  @param    {object}  polygon polygon元素
   *  @return   {void}
   */
  setPolygonAttribute(polygon) {
    const self = this
    const { fill, strokeWidth, stroke } = self.config.itemStyle.polygon
    let points2 = self.setPolygonPoints()
    polygon.attr('class', 'bg-polygon')
      .attr('fill', fill)
      .attr('stroke-width', strokeWidth)
      .attr('stroke', stroke)
      .attr('points', points2.toString())
  }

  /**
   *  path属性设置
   *  @param    {object}  path path元素
   *  @return   {void}
   */
  setPathAttribute(path) {
    const self = this
    const paths = self.config.itemStyle.path
    const linePath = d3.svg.line()
    path.attr('class', 'path-data')
      .attr('fill', paths.fill)
      .attr('d', (d) => {
        let polylineArr = self.setPolylineArrs(self.linear(d.value))
        return linePath(polylineArr)
      })
  }

  /**
   *  构造绘制六边形的数据
   *  @return   {array}  六边形的点
   */
  setPolygonPoints() {
    const self = this
    let points = []
    const { left, bottom, sideLength } = self.config.itemStyle.polygon
    // 构造绘制六边形的数据
    points.push([left, bottom - sideLength])
    points.push([left + Math.sqrt(3) * sideLength / 2, bottom - sideLength / 2])
    points.push([left + Math.sqrt(3) * sideLength / 2, bottom + sideLength / 2])
    points.push([left, bottom + sideLength])
    points.push([left - Math.sqrt(3) * sideLength / 2, bottom + sideLength / 2])
    points.push([left - Math.sqrt(3) * sideLength / 2, bottom - sideLength / 2])
    return points
  }

  /**
   *  设置六边的六个点
   *  @param    {number}  per 角度
   *  @return   {void}
   */
  setPolylineArrs(per) {
    const self = this
    let points = self.setPolygonPoints()
    const { left, bottom, sideLength } = self.config.itemStyle.polygon
    let polylineArr = [] // 存放绘制动态多边形的数据
    let angle = per * 2 * Math.PI // 百分比对应的弧度

    // 条件判断，不同的弧度范围对应不同的计算方式
    let tempArr = []
    if(angle >= 0 && angle <= Math.PI / 3) {
      tempArr = []
      polylineArr = points.slice(0, 1)
      tempArr.push(polylineArr[polylineArr.length - 1][0] + Math.sin(angle) * sideLength * Math.sin(Math.PI / 3) / Math.sin(Math.PI - Math.PI / 3 - angle))
      tempArr.push(polylineArr[polylineArr.length - 1][1] + Math.sin(angle) * sideLength * Math.cos(Math.PI / 3) / Math.sin(Math.PI - Math.PI / 3 - angle))
      polylineArr.push(tempArr)
    }else if(angle > Math.PI / 3 && angle <= 2 * Math.PI / 3) {
      tempArr = []
      polylineArr = points.slice(0, 2) 
      tempArr.push(polylineArr[polylineArr.length - 1][0])
      tempArr.push(polylineArr[polylineArr.length - 1][1] + Math.sin(angle - Math.PI / 3) * sideLength / Math.sin(Math.PI - Math.PI / 3 - (angle - Math.PI / 3)))
      polylineArr.push(tempArr)
    }else if(angle > 2 * Math.PI / 3 && angle <= Math.PI) {
      tempArr = []
      polylineArr = points.slice(0, 3)
      tempArr.push(polylineArr[polylineArr.length - 1][0] - Math.sin(angle - 2 * Math.PI / 3) * sideLength * Math.sin(Math.PI / 3) / Math.sin(Math.PI - Math.PI / 3 - (angle - 2 * Math.PI / 3)))
      tempArr.push(polylineArr[polylineArr.length - 1][1] + Math.sin(angle - 2 * Math.PI / 3) * sideLength * Math.cos(Math.PI / 3) / Math.sin(Math.PI - Math.PI / 3 - (angle - 2 * Math.PI / 3)))
      polylineArr.push(tempArr)
    }else if(angle > Math.PI && angle <= 4 * Math.PI / 3) {
      tempArr = []
      polylineArr = points.slice(0, 4)
      tempArr.push(polylineArr[polylineArr.length - 1][0] - Math.sin(angle - Math.PI) * sideLength * Math.sin(Math.PI / 3) / Math.sin(Math.PI - Math.PI / 3 - (angle - Math.PI)))
      tempArr.push(polylineArr[polylineArr.length - 1][1] - Math.sin(angle - Math.PI) * sideLength * Math.cos(Math.PI / 3) / Math.sin(Math.PI - Math.PI / 3 - (angle - Math.PI)))
      polylineArr.push(tempArr)
    }else if(angle > 4 * Math.PI / 3 && angle <= 5 * Math.PI / 3) {
      tempArr = []
      polylineArr = points.slice(0, 5)
      tempArr.push(polylineArr[polylineArr.length - 1][0])
      tempArr.push(polylineArr[polylineArr.length - 1][1] - Math.sin(angle - 4 * Math.PI / 3) * sideLength / Math.sin(Math.PI - Math.PI / 3 - (angle - 4 * Math.PI / 3)))
      polylineArr.push(tempArr)
    }else{
      tempArr = []
      polylineArr = points.slice(0, 6)
      tempArr.push(polylineArr[polylineArr.length - 1][0] + Math.sin(angle - 5 * Math.PI / 3) * sideLength * Math.sin(Math.PI / 3) / Math.sin(Math.PI - Math.PI / 3 - (angle - 5 * Math.PI / 3)))
      tempArr.push(polylineArr[polylineArr.length - 1][1] - Math.sin(angle - 5 * Math.PI / 3) * sideLength * Math.cos(Math.PI / 3) / Math.sin(Math.PI - Math.PI / 3 - (angle - 5 * Math.PI / 3)))
      polylineArr.push(tempArr)
    }
    // 把正六边形的中心点加进去
    polylineArr.push([left, bottom])
    return polylineArr 
  }
}
