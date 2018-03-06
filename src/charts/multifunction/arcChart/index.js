/**
 * @Author:      xieyang
 * @DateTime:    2017-12-20 21:27:10
 * @Description: 圆环图
 * @Last Modified By:   xieyang
 * @Last Modified Time:    2017-12-20 21:27:10
 */

import d3 from 'd3'
import _ from 'lodash'

export default class ArcChart {
  /**
   * 默认配置列表
   * @return {Object}
   */
  defaultSetting() {
    return {
      /**
       * 图表主体配置
       */
      chartBody: {
        /**
         * 图表的宽（包含padding值）
         */
        width: 680,
        /**
         * 图表的高（包含padding值）
         */
        height: 400,
        /**
         * 图表的内边距
         */
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }
      },
      /**
       * 坐标轴（这是一个预留属性）
       */
      axes: {
        /**
         * 是否显示坐标轴
         */
        isShow: false,
        /**
         * X轴配置
         */
        axisX: {
          isShow: false
        },
        /**
         * Y轴配置
         */
        axisY: {
          isShow: false
        }
      },
      /**
       * 弧段配置
       */
      item: {
        /**
         * 层叠属性
         */
        layer: {
          /**
           * 是否使用层叠模式
           */
          isMultiLayer: true,
          /**
           * 最小外半径（最内层的外半径）
           */
          minOuterRadius: 20,
          /**
           * 最大外半径（最外层的外半径）
           */
          maxOuterRadius: 140,
          /**
           * 层的宽度
           */
          arcSize: 18,
          /**
           * 弧段相对于整个圆的开始位置
           * 12点方向为0，顺时针一圈后的12点方向为1
           */
          startAngleRatio: 0.375,
          /**
           * 弧段相对于整个圆的结束位置
           */
          endAngleRatio: 1.125
        },
        /**
         * 数据排序 可选‘asc’, 'desc' 或 ''(不排序)
         */
        sort: '',
        /**
         * 圆弧/环 的颜色
         */
        fill: ['#fff838', '#fbc543', '#38ffc4', '#0bdcfc', '#08b1ff'],
        /**
         * 动画相关配置
         */
        animate: {
          /**
           * 是否开启动画
           */
          isAutoAnimate: true,
          /**
           * 动画持续时间
           * 不是所有元素都在相同的时间点开始动画和结束动画，这个值只能保证每个动画元素的持续时间
           */
          duration: 1000,
          /**
           * 动画初始角度
           */
          start: {
            /**
             * 动画开始时圆环/弧的开始角度
             */
            startAngle: 0,
            /**
             * 动画开始时圆环/弧的结束角度
             */
            endAngle: 0
          }
        },
        /**
         * 非层叠属性
         * 以下配置只在 !layer.isMultiLayer（圆环图或扇形图）时生效
         * outerRadius 外半径
         * innerRadius 内半径
         */
        outerRadius: 100,
        innerRadius: 80
      },
      /**
       * 背景图形配置
       */
      itemBg: {
        /**
         * 透明度
         */
        opacity: 0.12,
        /**
         * 填充色
         */
        stroke: '#58efcc',
        /**
         * 宽度
         */
        bgSize: 26
      },
      /**
       * 连接线配置
       */
      line: {
        /**
         * 是否使用对应的圆弧/环的颜色值
         */
        isItemColor: true,
        /**
         * 线条粗细
         */
        size: 2,
        /**
         * 线条颜色
         * 当 !isItemColor 时生效
         */
        stroke: '#ffffff',
        /**
         * 第一个值表示折线的折点距离圆心的水平距离
         * 第二个值表示折线的水平线段部分的长度
         * 注意：
         *    如果图表是折叠图时，horInterval[0] 小于 item.layer.maxOuterRadius
         *    horInterval[0] 将强制使用 item.layer.maxOuterRadius 作为默认值
         */
        horInterval: [50, 50]
      },
      /**
       * 连接线末尾的圆点
       */
      circle: {
        /**
         * 填充色是否使用对应的圆弧/环的颜色值
         */
        fillIsItemColor: false,
        /**
         * 填充色
         * 当 !fillIsItemColor 时生效
         */
        fill: '#ffffff',
        /**
         * 笔触色是否使用对应的圆弧/环的颜色值
         */
        strokeIsItemColor: true,
        /**
         * 笔触色
         * 当 !strokeIsItemColor 时生效
         */
        stroke: '#ffffff',
        /**
         * 笔触宽度
         */
        strokeWidth: 3,
        /**
         * 半径
         */
        radius: 4
      },
      /**
       * 文字样式配置
       */
      text: {
        /**
         * 名称样式配置
         */
        name: {
          /**
           * 是否使用对应的圆弧/环的颜色值
           */
          isItemColor: false,
          /**
           * 填充色
           * 当 !isItemColor 时生效
           */
          fill: '#ffffff',
          /**
           * 字体大小
           */
          fontSize: 16,
          /**
           * 当文字位于图表主体左侧时，文字的对齐方式
           */
          leftTextAnchor: 'end',
          /**
           * 当文字位于图表主体右侧时，文字的对齐方式
           */
          rightTextAnchor: 'start',
          /**
           * 文字相对X轴的偏移量
           * 主要用于文字对齐的微调
           */
          translateX: 20,
          /**
           * 文字相对Y轴的偏移量
           * 主要用于文字对齐的微调
           */
          translateY: 4
        },
        /**
         * 值样式配置
         */
        value: {
          /**
           * 是否使用对应的圆弧/环的颜色值
           */
          isItemColor: true,
          /**
           * 填充色
           * 当 !isItemColor 时生效
           */
          fill: '#ffffff',
          /**
           * 字体大小
           */
          fontSize: 16,
          /**
           * 当文字位于图表主体左侧时，文字的对齐方式
           */
          leftTextAnchor: 'end',
          /**
           * 当文字位于图表主体右侧时，文字的对齐方式
           */
          rightTextAnchor: 'start',
          /**
           * 文字相对X轴的偏移量
           * 主要用于文字对齐的微调
           */
          translateX: 80,
          /**
           * 文字相对Y轴的偏移量
           * 主要用于文字对齐的微调
           */
          translateY: 4
        }
      }
    }
  }
  
  /**
   * 构造器
   * @param {string} selector 选择器
   * @param {Object} opt 自定义配置列表，用来覆盖默认配置列表
   */
  constructor(selector, opt) {
    this.config = _.merge(this.defaultSetting(), opt)
    
    const {line, item, axes} = this.config
    const {isMultiLayer, maxOuterRadius} = item.layer
    const {horInterval} = line
    
    if (isMultiLayer) {
      horInterval[0] = horInterval[0] < maxOuterRadius ? maxOuterRadius : horInterval[0]
    }
    const coordinate = this.getCircleCenter()
    
    // 图表必需的结构 SVG
    this.svg = d3.select(selector)
      .append('svg')
      .call(this::this.setSVG, selector)
    
    // 图表主体内容的容器
    this.chartBody = this.svg
      .append('g')
      .call(this::this.setBox, 'chart-body')
    
    if (axes.isShow) {
      // 坐标轴（用于支持以后的雷达图、象限图、多边形图等图形）
      this.svg
        .append('g')
        .call(this::this.setBox, 'axes')
    }
    
    if (isMultiLayer) {
      // 背景图形部分
      this.arcBgBox = this.chartBody
        .append('g')
        .call(this::this.setBox, 'arc-base-bg-box', coordinate)
      
      // 半径比例尺
      this.radiusScale = d3.scale.linear()
      // 多层圆弧比例尺
      this.arcScale = d3.scale.linear()
    }
    
    // 弧段
    this.arcBox = this.chartBody
      .append('g')
      .call(this::this.setBox, 'arc-box', coordinate)
    
    // 连接线
    this.lineBox = this.chartBody
      .append('g')
      .call(this::this.setBox, 'line-box')
    
    // 连接线末尾的圆点
    this.lineCircleBox = this.chartBody
      .append('g')
      .call(this::this.setBox, 'line-circle-box')
    
    // 文字
    this.textBox = this.chartBody
      .append('g')
      .call(this::this.setBox, 'text-box')
    
    // 线段生成器
    this.line = d3.svg.line()
  }
  
  /**
   * 重新渲染图表时，重置上一次缓存的数据
   * 缓存的作用是：避免某一项计算在多个地方重复执行多次
   */
  clearCache() {
    this.linePoints = undefined
  }
  
  /**
   * 渲染图表
   * @param {Array} data 数据集
   */
  render(data) {
    this.clearCache()
    const dataset = this.setData(data)
    
    if (this.config.item.layer.isMultiLayer) {
      this.renderArcBg(dataset)
    }
    this.renderArc(dataset)
    this.renderLine(dataset)
    this.renderLineCircle(dataset)
    this.renderText(dataset)
  }
  
  /**
   * 渲染圆弧段
   * @param {Array} data 数据集
   */
  renderArc(data) {
    const dataSet = this.getAngleData(data)
    const arc = this.arcBox
      .selectAll('path.arc')
      .data(dataSet)
    
    arc.enter()
      .append('path')
    
    arc
      .exit()
      .remove()
    
    arc
      .call(this::this.setArc, data.length)
  }
  
  /**
   * 渲染圆环背景
   * @param {Array} data 数据集
   */
  renderArcBg(data) {
    const dataSet = this.getAngleData(data, true)
    const arcBg = this.arcBgBox
      .selectAll('path.arc-base-bg')
      .data(dataSet)
    
    arcBg.enter()
      .append('path')
    
    arcBg
      .exit()
      .remove()
    
    arcBg
      .call(this::this.setArcBg)
  }
  
  /**
   * 渲染连接线
   * @param {Array} data 数据集
   */
  renderLine(data) {
    const dataSet = this.getLinePoints(data)
    
    const line = this.lineBox
      .selectAll('path.line')
      .data(dataSet)
    
    line.enter()
      .append('path')
    
    line
      .exit()
      .remove()
    
    line
      .call(this::this.setLine)
  }
  
  /**
   * 渲染连接线末端的圆点
   * @param {Array} data 数据集
   */
  renderLineCircle(data) {
    const lineCircle = this.lineCircleBox
      .selectAll('circle.line-circle')
      .data(data)
    
    lineCircle.enter()
      .append('circle')
    
    lineCircle
      .exit()
      .remove()
    
    lineCircle
      .call(this::this.setLineCircle, data)
  }
  
  /**
   * 渲染文本
   * @param {Array} data 数据集
   */
  renderText(data) {
    const name = this.textBox
      .selectAll('text.name')
      .data(data)
    
    const value = this.textBox
      .selectAll('text.value')
      .data(data)
    
    name.enter().append('text')
    value.enter().append('text')
    
    name.exit().remove()
    value.exit().remove()
    
    name
      .call(this::this.setText, 'name', data)
    value
      .call(this::this.setText, 'value', data)
  }
  
  /**
   * 设置SVG的属性
   * @param {Object} svg 结点
   */
  setSVG(svg) {
    const {width, height} = this.config.chartBody
    const {top, right, bottom, left} = this.config.chartBody.padding
    this.chartBodyWidth = width - left - right
    this.chartBodyHeight = height - top - bottom
    
    svg.attr({
      width: this.chartBodyWidth,
      height: this.chartBodyHeight,
      style: `padding: ${top}px ${right}px ${bottom}px ${left}px`
    })
  }
  
  /**
   * 设置容器属性
   * @param {Object} node 结点
   * @param {string} className 容器的class名称
   * @param {Array=} coordinate 容器坐标（相对于SVG左上角的偏移量）[x, y]
   */
  setBox(node, className, coordinate = [0, 0]) {
    node
      .attr({
        class: className,
        transform: () => `translate(${coordinate[0]}, ${coordinate[1]})`
      })
  }
  
  /**
   * 设置圆弧
   * @param {Object} path 结点
   * @param length 圆弧数量
   */
  setArc(path, length) {
    const {item} = this.config
    const {fill, layer, animate} = item
    const {duration, start} = animate
    
    if (layer.isMultiLayer) {
      path
        .attr({
          fill: (d, i) => fill[i],
          class: (d, i) => `arc arc-${i}`
        })
        .transition()
        .duration((d, i) => duration + 50 * (length - i - 1))
        .attrTween('d', (d, i) => {
          const arc = this.getArc(i)
          
          let interpolate = d3.interpolate(start, d)
          return t => arc(interpolate(t))
        })
    } else {
      const arc = this.getArc()
      
      path
        .attr({
          fill: (d, i) => fill[i],
          class: (d, i) => `arc arc-${i}`
        })
        .transition()
        .duration(duration)
        .attrTween('d', (d) => {
          let interpolate = d3.interpolate(start, d)
          return t => arc(interpolate(t))
        })
    }
  }
  
  /**
   * 设置圆环背景
   * @param {Object} arcBg 结点
   */
  setArcBg(arcBg) {
    const {stroke, opacity} = this.config.itemBg
    
    arcBg
      .attr({
        class: (d, i) => `arc-base-bg arc-base-bg-${i}`,
        fill: stroke,
        opacity: opacity,
        d: (d, i) => {
          const arc = this.getArc(i)
          return arc(d)
        }
      })
  }
  
  /**
   * 设置连接线
   * @param {Object} linePath 结点
   */
  setLine(linePath) {
    const {item, line} = this.config
    const {fill, animate} = item
    const {duration} = animate
    const {isItemColor, size} = line
    
    linePath
      .attr({
        class: (d, i) => `line line-${i}`,
        fill: 'none',
        stroke: (d, i) => {
          if (isItemColor) {
            return fill[i]
          }
          return line.fill
        },
        'stroke-width': size,
        'opacity': 0
      })
      .style('stroke-dasharray', '350, 350')
      .attr('d', (d) => this.line(d))
      .transition()
      .duration(() => duration * 1.5)
      .delay((d, i) => duration + 50 * (length - i - 1))
      .attr('opacity', 1)
      .styleTween('stroke-dashoffset', () => {
        return d3.interpolateNumber(350, 0)
      })
  }
  
  /**
   * 设置连接线末尾圆点
   * @param {Object} lineCircle 结点
   * @param {Array} data 数据集
   */
  setLineCircle(lineCircle, data) {
    const {item, circle} = this.config
    const {fill, animate} = item
    const {duration} = animate
    const {fillIsItemColor, strokeIsItemColor, stroke, strokeWidth, radius} = circle
    const linePoints = this.getLinePoints(data)
    
    lineCircle
      .attr({
        class: (d, i) => `line-circle line-circle-${i}`,
        cx: (d, i) => linePoints[i][2][0],
        cy: (d, i) => linePoints[i][2][1],
        fill: (d, i) => {
          if (fillIsItemColor) {
            return fill[i]
          }
          return circle.fill
        },
        stroke: (d, i) => {
          if (strokeIsItemColor) {
            return fill[i]
          }
          return stroke
        },
        'stroke-width': strokeWidth
      })
      .attr('r', 0)
      .transition()
      .duration(() => duration)
      .delay((d, i) => 1.5 * (duration + 50 * (length - i - 1)))
      .attr('r', radius)
  }
  
  /**
   * 设置文本
   * @param {Object} text 结点
   * @param {string} className class名称（用于区别显示 name 或 value 的 text 标签）
   * @param {Array} data 数据集
   */
  setText(text, className, data) {
    const config = this.config
    const {item} = config
    const {fill, animate} = item
    const {duration} = animate
    const {leftTextAnchor, rightTextAnchor, fontSize, isItemColor, translateX, translateY} = config.text[className]
    const linePoints = this.getLinePoints(data)
    
    text
      .attr({
        class: (d, i) => `${className} ${className}-${i}`,
        x: (d, i) => linePoints[i][2][0],
        y: (d, i) => linePoints[i][2][1] + translateY / 2,
        'text-anchor': (d, i) => this.getDirection(this.arcAngleData[i]) > 0 ? rightTextAnchor : leftTextAnchor,
        'font-size': 0,
        opacity: 0,
        fill: (d, i) => {
          if (isItemColor) {
            return fill[i]
          }
          
          return config.text[className].fill
        }
      })
      .text((d) => d[className])
      .transition()
      .duration(() => duration)
      .delay((d, i) => 2 * (duration + 50 * (length - i - 1)))
      .attr({
        opacity: 1,
        'font-size': fontSize,
        x: (d, i) => linePoints[i][2][0] + translateX * this.getDirection(this.arcAngleData[i]),
        y: (d, i) => linePoints[i][2][1] + translateY
      })
  }
  
  /**
   * 生成弧段数据
   * @param {Array} data 数据
   * @param {=boolean} isArcBg 是否是弧段背景
   * @returns {Array} 圆环段数据集
   */
  getAngleData(data, isArcBg) {
    let dataSet = []
    let angle = {}
    const fullAngle = Math.PI * 2
    const {layer} = this.config.item
    // 缓存圆弧的角度数据集
    this.arcAngleData = []
    
    if (!layer.isMultiLayer) { // 圆环/扇形
      let total = this.getTotalValue(data)
      
      d3.range(data.length).map((d) => {
        angle = {}
        angle.startAngle = d === 0
          ? 0
          : dataSet[dataSet.length - 1].endAngle
        
        angle.endAngle = d === 0
          ? data[d].value / total * fullAngle
          : d === data.length - 1
            ? fullAngle
            : dataSet[dataSet.length - 1].endAngle
            + data[d].value / total * fullAngle
        
        this.arcAngleData.push(angle.startAngle + (angle.endAngle - angle.startAngle) / 2)
        
        dataSet.push(angle)
      })
    } else { // 层叠圆环
      this.setScale(data)
      
      if (!isArcBg) {
        d3.range(data.length).map((d) => {
          angle = {}
          angle.startAngle = this.arcScale(0)
          angle.endAngle = this.arcScale(data[d].value)
          angle.name = data[d].name
          dataSet.push(angle)
        })
      } else {
        d3.range(data.length).map((d) => {
          angle = {}
          angle.startAngle = 0
          angle.endAngle = fullAngle
          angle.name = data[d].name
          
          dataSet.push(angle)
        })
      }
    }
    
    return dataSet
  }
  
  /**
   * 获取连接线路径所需的坐标集
   * @param {Array} data 数据集
   * @returns {Array} 连接线坐标集
   */
  getLinePoints(data) {
    if (this.linePoints && this.linePoints.length > 0) {
      return this.linePoints
    }
    
    const {line, item} = this.config
    const {outerRadius, layer} = item
    const {isMultiLayer} = layer
    const {horInterval} = line // 所求点在x轴上的长度
    const cc = this.getCircleCenter() // 求圆心坐标
    const circleX = this.circleCenter[0] + horInterval[0]
    let dataSet = []
    let r = 0 // 半径
    let y = null
    let cp = [] // 求圆上某点的坐标
    let points = [] // 连接线的三个点坐标
    
    d3.range(data.length).map((d) => {
      if (isMultiLayer) {
        r = this.radiusScale(d)
        cp = this.getCirclePoint(r)
        
        // 求连接线折点的坐标
        y = (Math.pow(r, 2) - (cp[0] - cc[0]) * horInterval[0]) / (cp[1] - cc[1]) + cc[1]
        
        points = [
          cp,
          [circleX, y],
          [circleX + horInterval[1], y]
        ]
      } else {
        r = outerRadius
        cp = this.getCirclePoint(r + horInterval[0], this.arcAngleData[d])
        
        points = [
          this.getCirclePoint(r, this.arcAngleData[d]),
          cp,
          [cp[0] + horInterval[1] * this.getDirection(this.arcAngleData[d]), cp[1]]
        ]
      }
      
      dataSet.push(points)
    })
    
    this.linePoints = dataSet
    return dataSet
  }
  
  /**
   * 获取当前弧形的圆弧生成器
   * @param {number=} index 当前的索引
   * @return {Object} 圆弧生成器
   */
  getArc(index) {
    const {layer, innerRadius, outerRadius} = this.config.item
    const {isMultiLayer} = layer
    const arc = d3.svg.arc()
    
    if (isMultiLayer) {
      const {arcSize} = layer
      const currentOuterRadius = this.radiusScale(index)
      
      arc
        .outerRadius(currentOuterRadius)
        .innerRadius(currentOuterRadius - arcSize)
    } else {
      arc
        .outerRadius(outerRadius)
        .innerRadius(innerRadius)
    }
    
    return arc
  }
  
  /**
   * 获取圆心坐标
   * @return {Array} 圆心坐标
   */
  getCircleCenter() {
    if (typeof this.circleCenter !== 'undefined' && this.circleCenter.length > 0) {
      return this.circleCenter
    }
    
    const {chartBody, item, line, text} = this.config
    const {isMultiLayer, maxOuterRadius} = item.layer
    const {horInterval} = line
    const {name, value} = text
    
    let x = isMultiLayer
      ? (chartBody.width
      - Math.abs(maxOuterRadius - horInterval[0])
      - horInterval[1]
      - name.translateX
      - value.translateX) / 2
      : chartBody.width / 2
    
    let y = chartBody.height / 2
    
    this.circleCenter = [x, y]
    return this.circleCenter
  }
  
  /**
   * 获取当前弧形开始位置的坐标
   * @param {number} r 所求点所在圆的半径
   * @param {number=} angle 所求点连接圆心的连线与圆上0度连接圆心的连线所形成的夹角的度数
   * @returns {Array} 开始坐标
   */
  getCirclePoint(r, angle) {
    const {line, item} = this.config
    const {layer} = item
    const {startAngleRatio} = layer
    const {size} = line
    const fullAngle = Math.PI * 2
    let lineAngle = angle
    
    if (angle === undefined) {
      lineAngle = fullAngle * startAngleRatio
    }
    
    this.circleCenter = this.getCircleCenter()
    
    return [
      Math.ceil(this.circleCenter[0] + Math.sin(lineAngle) * r - size / 2),
      Math.ceil(this.circleCenter[1] - Math.cos(lineAngle) * r - size / 2)
    ]
  }
  
  /**
   * 设置比例尺
   * @param {Array} data 数据集
   */
  setScale(data) {
    const {layer} = this.config.item
    const {minOuterRadius, maxOuterRadius, startAngleRatio, endAngleRatio} = layer
    const fullAngle = Math.PI * 2
    
    // 半径比例尺
    this.radiusScale
      .domain([0, data.length - 1])
      .range([minOuterRadius, maxOuterRadius])
    
    // 圆弧比例尺
    this.arcScale
      .domain([0, this.getMaxValue(data)])
      .range([startAngleRatio * fullAngle, endAngleRatio * fullAngle])
  }
  
  /**
   * 获取所有数据的总值
   * @param {Array} data 数据集
   * @returns {number} 总值
   */
  getTotalValue(data) {
    let total = 0
    
    d3.range(data.length).map((i) => {
      total += data[i].value
    })
    
    return total
  }
  
  /**
   * 获取数据最大值
   * @param {Array} data 数据集
   * @returns {number} 最大值
   */
  getMaxValue(data) {
    this.maxValue = _.max(_.map(data, d => d.value))
    return this.maxValue
  }
  
  /**
   * 数据排序
   * @param {Array} data 数据集
   * @returns {Array} 排序后的数据集
   */
  setData(data) {
    const sort = this.config.item.sort
    const isAsc = sort === 'asc' ? true : sort === 'desc' ? false : '--'
    
    if (isAsc === '--') {
      return data
    }
    
    return _.sortBy(data, d => {
      return parseFloat(`${isAsc ? '' : '-'}${d.value}`)
    })
  }
  
  /**
   * 获取水平方向连接线的方向及长度
   * @param {number} angle 当前点的角度
   * @returns {number}
   */
  getDirection(angle) {
    if (angle > Math.PI) {
      return -1
    }
    return 1
  }
}
