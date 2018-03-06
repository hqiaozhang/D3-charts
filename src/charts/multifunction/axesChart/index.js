/**
 * @Author:      xieyang
 * @DateTime:    2017-12-20 21:27:10
 * @Description: 坐标系图
 * @Last Modified By:   xieyang
 * @Last Modified Time:    2017-12-20 21:27:10
 */

import d3 from 'd3'
import _ from 'lodash'
import tpl from './hbs/filter.hbs'

export default class axesChart {
  defaultSetting() {
    return {
      /**
       * 图表主体配置
       */
      chartBody: {
        width: 300,
        height: 300,
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }
      },
      /**
       * 坐标轴
       */
      axes: {
        enable: true,
        /**
         * 数据按照x轴排序或者y轴排序
         * 默认'' 不排序，可选值'', 'x', 'y'
         * （排序规则将强制使用轴配置中的key字段排序）
         */
        sort: '',
        axisX: {
          isShow: true,
          enable: true,
          /**
           * 坐标轴离chartBody顶部的距离比例
           */
          verticalAlign: 1,
          /**
           * 数据中用于轴数据值的键key（{key: value}）
           */
          key: 'name',
          type: 'linear',
          unit: '',
          stroke: '#183a67',
          strokeSize: 2,
          tickColor: '#ffffff',
          textOpacity: 1,
          textColor: '#46aaff',
          fontSize: 24,
          textAnchor: 'middle',
          tickPadding: 15,
          dasharray: '1, 0',
          innerTickSize: 0,
          outerTickSize: 0,
          /**
           * 坐标轴向内侧缩放的倍率
           */
          scale: 0,
          gridLine: {
            enable: true,
            stroke: '#2f3a67',
            strokeSize: 1,
            dasharray: '4, 2'
          }
        },
        axisY: {
          isShow: false,
          enable: true,
          verticalAlign: 0.5,
          key: 'value',
          type: 'linear',
          /**
           * 单位
           * 如果单位为‘%’字符， 则坐标轴按照百分比渲染，只接受0-100的数字
           * 如果单位带有‘%’字符，且‘%’之前带有数字（如50%），则坐标轴的区间为[0, 50%]
           * （当数据中出现负值时，区间为[-50%, 50%]）
           * 否则就按照正常的值进行渲染
           */
          unit: '',
          stroke: '#38e7c0',
          strokeSize: 2,
          ticks: 10,
          tickColor: '#ffffff',
          textColor: '#46aaff',
          textOpacity: 1,
          fontSize: 22,
          textAnchor: 'middle',
          tickPadding: 15,
          dasharray: '1, 0',
          innerTickSize: 0,
          outerTickSize: 0,
          gridLine: {
            enable: false,
            stroke: '#2f3a67',
            strokeSize: 1,
            dasharray: '1, 0'
          }
        }
      },
      /**
       * 文字配置
       */
      texts: {
        enable: false,
        key: 'value',
        /**
         * 是否只显示极值（最大值和最小值）
         */
        isExtremum: false,
        fill: '#ffffff',
        stroke: '#none',
        fontSize: 20,
        strokeWidth: 0,
        textAnchor: 'middle',
        /**
         * 文字的位置以定位点为中心点进行距离微调
         */
        position: {
          x: 20,
          y: -20
        },
        /**
         * 此处的配置需和hbs/filter.hbs里面的的对应图片属性保持一致
         */
        image: [
          {
            id: '',
            width: 0,
            height: 0
          }
        ]
      },
      /**
       * 点阵配置
       */
      points: {
        enable: false,
        key: 'value',
        fill: '#ffffff',
        stroke: '#56eea1',
        strokeWidth: 0,
        point: {
          sharp: 'circle',
          r: 5
        }
      },
      /**
       * 折线配置
       */
      lines: {
        enable: false,
        key: 'value',
        stroke: '#56eea1',
        dasharray: '1, 0',
        size: 5,
        interpolate: 'cardinal',
        tension: 0.5
      },
      /**
       * 区域配置
       */
      areas: {
        enable: false,
        key: 'value',
        fill: '#31c6ad',
        interpolate: 'cardinal',
        tension: 0.5
      },
      /**
       * 柱状配置
       */
      bars: {
        enable: false,
        key: 'value',
        /**
         * 是否只显示极值（最大值和最小值）
         */
        isExtremum: false,
        stroke: 'none',
        strokeDasharray: '1, 0',
        strokeSize: 0,
        size: 38,
        fill: 'url(#pattern)',
        /**
         * 此处的配置需和hbs/filter.hbs里面的的对应图片属性保持一致
         */
        image: [
          {
            id: '',
            width: 0,
            height: 0
          }
        ]
      }
    }
  }
  
  /**
   * 构造器
   * @param {string} selector 选择器
   * @param {Object} opt 配置项
   */
  constructor(selector, opt) {
    this.sele = selector
    this.config = _.merge(this.defaultSetting(), opt)
    const {axes, texts, points, lines, bars, areas} = this.config
    
    this.svg = d3.select(selector)
      .append('svg')
      .call(this::this.setSVG)
    
    this.svg.append('defs')
      .html(tpl)
    
    if (axes.enable) {
      this.svg
        .append('g')
        .call(this::this.setAxes)
    }
    // 图表主体
    this.chartBody = this.svg
      .append('g')
      .call(this::this.setBox, 'chart-body')
    
    if (areas.enable) {
      this.areaBox = this.chartBody
        .append('g')
        .call(this::this.setBox, 'areas-box')
    }
    
    if (bars.enable) {
      this.barBox = this.chartBody
        .append('g')
        .call(this::this.setBox, 'bars-box')
    }
    
    if (lines.enable) {
      this.lineBox = this.chartBody
        .append('g')
        .call(this::this.setBox, 'lines-box')
    }
    
    if (points.enable) {
      this.pointBox = this.chartBody
        .append('g')
        .call(this::this.setBox, 'points-box')
    }
    
    if (texts.enable) {
      this.textBox = this.chartBody
        .append('g')
        .call(this::this.setBox, 'texts-box')
    }
  }
  
  /**
   * 设置SVG属性
   * @param {Object} svg 结点
   */
  setSVG(svg) {
    const {width, height} = this.config.chartBody
    const {top, right, bottom, left} = this.config.chartBody.padding
    this.chartBodyWidth = width - left - right
    this.chartBodyHeight = height - top - bottom
    
    svg.attr({
      class: 'axes-chart',
      width: this.chartBodyWidth,
      height: this.chartBodyHeight,
      style: `padding: ${top}px ${right}px ${bottom}px ${left}px`
    })
  }
  
  /**
   * 设置坐标轴容器
   * @param {Object} axes 结点
   */
  setAxes(axes) {
    axes.attr({
      class: 'axes'
    })
    
    this.xGAxes = axes
      .append('g')
      .call(this::this.setBox, 'x-axis')
    
    this.yGAxes = axes
      .append('g')
      .call(this::this.setBox, 'y-axis')
  }
  
  /**
   * 设置容器属性
   * @param {Object} node 结点
   * @param {string} className 容器的class名称
   */
  setBox(node, className) {
    node
      .attr({
        class: className
      })
  }
  
  /**
   * 渲染
   * @param {Array} data 数据集
   */
  render(data) {
    const {axes, points, texts, lines, bars, areas} = this.config
    const dataset = this.setData(data)
    
    if (axes.enable) {
      this.renderAxes(dataset)
    }
    
    if (texts.enable) {
      this.renderText(dataset)
    }
    
    if (points.enable) {
      this.renderPoint(dataset)
    }
    
    if (lines.enable) {
      this.renderLine(dataset)
    }
    
    if (bars.enable) {
      this.renderBar(dataset)
    }
    
    if (areas.enable) {
      this.renderArea(dataset)
    }
  }
  
  /**
   * 渲染坐标轴
   */
  renderAxes() {
    const {axisX, axisY} = this.config.axes
    
    if (axisX.enable) {
      const {
        gridLine, tickPadding, innerTickSize, outerTickSize, stroke, strokeSize, isShow,
        textColor, textAnchor, fontSize, verticalAlign, type, scale, unit, dasharray, textOpacity
      } = axisX
      
      // 定义比例尺
      this.xScale = this.getScale(type)
      
      if (type === 'ordinal') {
        this.xScale
          .domain(this.xData)
          .rangePoints([0, this.chartBodyWidth], scale)
      } else {
        this.xScale
          .range([0, this.chartBodyWidth])
        
        if (type === 'time') {
          this.xScale
            .domain([
              new Date(this.xData[0]),
              new Date(this.xData[this.xData.length - 1])
            ])
        } else {
          this.xScale
            .domain(this.xData[0], this.xData[this.xData.length - 1])
        }
      }
      
      // 定义坐标轴
      const axis = d3.svg.axis()
        .scale(this.xScale)
        .orient('bottom')
        .tickFormat((d, i) => {
          if (type === 'time') {
            if (!i && d.getMonth() < 8 || d.getMonth() === 0) {
              return d.getFullYear() + unit
            }
          } else {
            return d + unit
          }
        })
        .ticks(this.xData.length)
        .tickPadding(tickPadding)
        .innerTickSize(innerTickSize)
        .outerTickSize(outerTickSize)
      
      this.xGAxes
        .attr({
          'transform': `translate(0, ${this.chartBodyHeight * verticalAlign})`
        })
        .call(axis)
      
      // 轴样式
      this.xGAxes
        .select('.domain')
        .attr({
          fill: 'none',
          stroke: stroke,
          'stroke-width': strokeSize,
          'stroke-dasharray': dasharray,
          opacity: isShow ? 1 : 0
        })
      
      // 轴文本样式
      const grid = this.xGAxes
        .selectAll('.tick')
      
      grid.select('text')
        .attr({
          fill: textColor,
          'text-anchor': textAnchor,
          'font-size': fontSize
        })
        .style('opacity', textOpacity)
      
      if (gridLine.enable) {
        // 网格线生成器
        const gl = d3.svg.line()
        
        grid
          .append('path')
          .attr({
            fill: 'none',
            stroke: gridLine.stroke,
            'stroke-width': gridLine.strokeSize,
            'stroke-dasharray': gridLine.dasharray,
            d: (d, i) => {
              if (type === 'time') {
                if (!i && d.getMonth() < 8 || d.getMonth() === 0) {
                  return gl([
                    [0, 0],
                    [0, -this.chartBodyHeight]
                  ])
                }
              } else {
                return gl([
                  [0, 0],
                  [0, -this.chartBodyHeight]
                ])
              }
            }
          })
      }
    }
    
    if (axisY.enable) {
      const {
        gridLine, tickPadding, innerTickSize, outerTickSize, stroke, strokeSize, ticks, isShow,
        textColor, textAnchor, fontSize, type, unit, dasharray, textOpacity
      } = axisY
      
      this.yScale = this.getScale(type)
        .range([0, this.chartBodyHeight])
      
      const unitY = unit.substr(unit.length - 1, 1)
      if (unitY === '%') {
        let pValue = unit.substr(0, unit.length - 1)
        
        if (unit.length !== 1) {
          this.yScale
            .domain([
              pValue,
              this.minValue < 0 ? -pValue : 0
            ])
        } else {
          this.yScale
            .domain([
              this.maxValue,
              this.minValue < 0 ? this.minValue : 0
            ])
        }
      } else {
        this.yScale
          .domain([
            this.maxValue,
            this.minValue < 0 ? this.minValue : 0
          ])
      }
      
      // 定义坐标轴
      const axis = d3.svg.axis()
        .scale(this.yScale)
        .orient('left')
        .ticks(ticks)
        .tickFormat(d => {
          if (unitY === '%') {
            return d + unitY
          }
        })
        .tickPadding(tickPadding)
        .innerTickSize(innerTickSize)
        .outerTickSize(outerTickSize)
      
      this.yGAxes
        .attr({
          'transform': 'translate(0, 0)'
        })
        .call(axis)
      
      // 轴样式
      this.yGAxes
        .select('.domain')
        .attr({
          fill: 'none',
          stroke: stroke,
          'stroke-width': strokeSize,
          'stroke-dasharray': dasharray,
          opacity: isShow ? 1 : 0
        })
      
      // 轴刻度容器
      const grid = this.yGAxes
        .selectAll('.tick')
      
      // 文本样式
      grid.select('text')
        .attr({
          fill: textColor,
          'text-anchor': textAnchor,
          'font-size': fontSize
        })
        .style('opacity', textOpacity)
      
      if (gridLine.enable) {
        // 网格线生成器
        const gl = d3.svg.line()
        
        grid
          .append('path')
          .attr({
            fill: 'none',
            stroke: gridLine.stroke,
            'stroke-width': gridLine.strokeSize,
            'stroke-dasharray': gridLine.dasharray,
            d: () => {
              return gl([
                [0, 0],
                [this.chartBodyWidth, 0]
              ])
            }
          })
      }
    }
  }
  
  /**
   * 渲染点阵图
   * @param {Array} data 数据集
   */
  renderPoint(data) {
    const {sharp} = this.config.points.point
    const points = this.pointBox
      .selectAll(sharp)
      .data(data)
    
    points
      .enter()
      .append(sharp)
    
    points
      .exit()
      .remove()
    
    points
      .call(this::this.setPoints)
  }
  
  /**
   * 渲染折线图
   * @param {Array} data 数据集
   */
  renderLine(data) {
    const {axes, lines} = this.config
    const {axisX, axisY} = axes
    let arrayZero = []
    let x, y
    const dataSet = [
      _.map(data, d => {
        // 设置动画的起始数据，缓存到变量arrayZero
        if (axisX.type === 'time') {
          x = this.xScale(new Date(d[axisX.key]))
        } else {
          x = this.xScale(d[axisX.key])
        }
        arrayZero.push([x, this.chartBodyHeight])
        
        // 返回动画的终止数据，缓存到常量dataSet
        if (!axisY) {
          y = this.yScale(d[axisY.key])
        } else {
          y = this.yScale(d[lines.key])
        }
        return [x, y]
      })
    ]
    
    const pLines = this.lineBox
      .selectAll('path')
      .data(dataSet)
    
    pLines
      .enter()
      .append('path')
    
    pLines
      .exit()
      .remove()
    
    pLines
      .call(this::this.setLines, arrayZero)
  }
  
  /**
   * 渲染区域图
   * @param {Array} data 数据集
   */
  renderArea(data) {
    const {axes, areas} = this.config
    const {axisX, axisY} = axes
    let arrayZero = []
    let x, y1
    const dataSet = [
      _.map(data, d => {
        // 设置动画的起始数据，缓存到变量arrayZero
        if (axisX.type === 'time') {
          x = this.xScale(new Date(d[axisX.key]))
        } else {
          x = this.xScale(d[axisX.key])
        }
        arrayZero.push({
          x: x,
          y0: this.chartBodyHeight,
          y1: this.chartBodyHeight
        })
        
        // 返回动画的终止数据，缓存到常量dataSet
        if (!axisY) {
          y1 = this.yScale(d[axisY.key])
        } else {
          y1 = this.yScale(d[areas.key])
        }
        
        return {
          x: x,
          y0: this.chartBodyHeight,
          y1: y1
        }
      })
    ]
    
    const pAreas = this.areaBox
      .selectAll('path')
      .data(dataSet)
    
    pAreas
      .enter()
      .append('path')
    
    pAreas
      .exit()
      .remove()
    
    pAreas
      .call(this::this.setAreas, arrayZero)
  }
  
  /**
   * 渲染柱状图
   * @param {Array} data 数据集
   */
  renderBar(data) {
    const bars = this.barBox
      .selectAll('rect')
      .data(data)
    
    bars
      .enter()
      .append('rect')
    
    bars
      .exit()
      .remove()
    
    bars
      .call(this::this.setBars)
    
    const barsImg = this.barBox
      .selectAll('use')
      .data(data)
    
    barsImg
      .enter()
      .append('use')
    
    barsImg
      .exit()
      .remove()
    
    barsImg
      .call(this::this.setBarImages)
  }
  
  /**
   * 渲染文字
   * @param {Array} data 数据集
   */
  renderText(data) {
    const texts = this.textBox
      .selectAll('text')
      .data(data)
    
    texts
      .enter()
      .append('text')
    
    texts
      .exit()
      .remove()
    
    texts
      .call(this::this.setTexts)
    
    const barsImg = this.textBox
      .selectAll('use')
      .data(data)
    
    barsImg
      .enter()
      .append('use')
    
    barsImg
      .exit()
      .remove()
    
    barsImg
      .call(this::this.setTextImages)
  }
  
  /**
   * 获取比例尺
   * @param {string} scaleType 比例尺类型
   * @returns {Object} d3比例尺对象
   */
  getScale(scaleType) {
    switch (scaleType) {
      case 'ordinal':
        return d3.scale.ordinal()
      case 'time':
        return d3.time.scale()
      default:
        return d3.scale.linear()
    }
  }
  
  /**
   * 处理数据
   * @param {Array} data 数据集
   * @returns {Array} data 处理之后的数据集
   */
  setData(data) {
    const {axes} = this.config
    const {sort, axisX, axisY} = axes
    let dataset = data
    
    if (sort) {
      dataset = this.sort(data, axes[`axis${sort.toUpperCase()}`]['key'])
    }
    
    // x轴数据
    this.xData = _.map(dataset, (d) => d[axisX.key])
    
    // y轴数据
    if (!axisY.key) {
      let array = []
      _.map(dataset, d => {
        array.push.apply(array, _.values(d))
      })
      
      d3.range(array.length).map((d) => {
        if (isNaN(array[d])) {
          array.splice(d, 1)
        }
      })
      
      this.yData = array
      
    } else {
      this.yData = _.map(dataset, (d) => d[axisY.key])
    }
    
    this.minValue = Math.min(...this.yData)
    this.maxValue = Math.max(...this.yData)
    return dataset
  }
  
  /**
   * 设置曲线属性及样式
   * @param {Object} lines 结点
   * @param {Array} arrayZero 设置动画的起始数据集
   */
  setLines(lines, arrayZero) {
    const {stroke, size, interpolate, tension, dasharray} = this.config.lines
    const line = d3.svg.line()
      .tension(tension)
      .interpolate(interpolate)
      .x((d) => d[0])
      .y((d) => d[1])
    
    lines
      .attr({
        class: (d, i) => `lines lines-${i}`,
        fill: 'none',
        stroke: () => this.minValue === this.maxValue ? '#53eea1' : stroke,
        'stroke-dasharray': dasharray,
        'stroke-width': size,
        d: () => line(arrayZero)
      })
      .transition()
      .duration(1200)
      .attr('d', d => line(d))
  }
  
  /**
   * 设置区域属性及样式
   * @param {Object} pAreas 结点
   * @param {Array} arrayZero 设置动画的起始数据集
   */
  setAreas(pAreas, arrayZero) {
    const {areas} = this.config
    const {fill, interpolate, tension} = areas
    const area = d3.svg.area()
      .tension(tension)
      .interpolate(interpolate)
      .x(d => d.x)
      .y0(d => d.y0)
      .y1(d => d.y1)
    
    pAreas
      .attr({
        class: (d, i) => `lines lines-${i}`,
        fill: fill,
        d: () => area(arrayZero)
      })
      .transition()
      .duration(1200)
      .attr('d', d => area(d))
  }
  
  /**
   * 设置柱状图属性及样式
   * @param {Object} bars 结点
   */
  setBars(gBars) {
    const {bars, axes} = this.config
    const {verticalAlign} = axes.axisX
    const {axisY} = axes
    const {stroke, strokeSize, size, fill, isExtremum, dasharray} = bars
    const extremum = this.getExtremum(isExtremum)
    
    gBars
      .attr({
        class: (d, i) => `bars bars-${i}`,
        fill: fill,
        stroke: stroke,
        'stroke-width': strokeSize,
        'stroke-dasharray': dasharray,
        width: size,
        height: 0,
        x: d => {
          if (axes.axisX.type === 'time') {
            return this.xScale(new Date(d[axes.axisX.key])) - size / 2
          }
          return this.xScale(d[axes.axisX.key]) - size / 2
        },
        y: this.chartBodyHeight * verticalAlign
      })
      .transition()
      .duration(1000)
      .attr({
        height: (d, i) => {
          if (!extremum.isExtremum
            || d[axisY.key] === this.maxValue
            || d[axisY.key] === this.minValue
          ) {
            if (!extremum.isDataStandard || !i) {
              if (verticalAlign !== 1) {
                if (d[axisY.key] >= 0) {
                  return (this.chartBodyHeight - this.yScale(d[axisY.key])) * verticalAlign
                }
                return Math.abs(this.yScale(d[axisY.key]) - this.chartBodyHeight * verticalAlign)
              }
              return this.chartBodyHeight - this.yScale(d[axisY.key])
            }
          }
        },
        y: d => {
          if (verticalAlign !== 1) {
            if (d[axisY.key] >= 0) {
              return this.yScale(d[axisY.key]) * verticalAlign
            }
            return this.chartBodyHeight * verticalAlign
          }
          return this.yScale(d[axisY.key])
        }
      })
  }
  
  /**
   * 设置文字属性及样式
   * @param {Object} gTexts 结点
   */
  setTexts(gTexts) {
    const {texts, axes} = this.config
    const {verticalAlign} = axes.axisX
    const {axisY} = axes
    const {stroke, strokeSize, fontSize, fill, isExtremum, textAnchor, key, position} = texts
    const extremum = this.getExtremum(isExtremum)
    
    const k = axisY.key ? axisY.key : key
    
    gTexts
      .attr({
        class: (d, i) => `texts texts-${i}`,
        fill: fill,
        stroke: stroke,
        'font-size': fontSize,
        'stroke-width': strokeSize,
        'text-anchor': 0,
        opacity: 0,
        x: d => {
          if (axes.axisX.type === 'time') {
            return this.xScale(new Date(d[axes.axisX.key]))
          }
          return this.xScale(d[axes.axisX.key])
        },
        y: d => {
          if (verticalAlign !== 1) {
            if (d[axisY.key] >= 0) {
              return this.yScale(d[axisY.key]) * verticalAlign
            }
            return this.chartBodyHeight * verticalAlign
          }
          return this.yScale(d[axisY.key])
        }
      })
      .text((d, i) => {
        if (!extremum.isExtremum
          || d[axisY.key] === this.maxValue
          || d[axisY.key] === this.minValue
        ) {
          if (!extremum.isDataStandard || !i) {
            return d[k]
          }
        }
      })
      .transition()
      .duration(1000)
      .delay(500)
      .attr({
        x: d => {
          if (axes.axisX.type === 'time') {
            return this.xScale(new Date(d[axes.axisX.key])) + position.x
          }
          return this.xScale(d[axes.axisX.key]) + position.x
        },
        y: d => {
          let y = 0
          if (verticalAlign !== 1) {
            if (d[axisY.key] >= 0) {
              y = this.yScale(d[axisY.key]) * verticalAlign + position.y
            } else {
              y = this.chartBodyHeight * verticalAlign + position.y
            }
          } else {
            y = this.yScale(d[axisY.key]) + position.y
          }
          
          if (d[axisY.key] === this.minValue) {
            y += 60
          }
          
          return y
        },
        opacity: 1,
        'text-anchor': textAnchor
      })
  }
  
  /**
   * 设置图表附带的图片的属性及样式
   * @param use svg:use标签
   */
  setBarImages(use) {
    const {bars, axes} = this.config
    const {verticalAlign} = axes.axisX
    const {axisY} = axes
    const {isExtremum} = bars
    const extremum = this.getExtremum(isExtremum)
    
    use
      .attr({
        'xlink:href': (d, i) => {
          if (!extremum.isExtremum
            || d[axisY.key] === this.maxValue
            || d[axisY.key] === this.minValue
          ) {
            if (!extremum.isDataStandard || !i) {
              if (verticalAlign !== 1) {
                if (d[axisY.key] >= 0) {
                  return `#${bars.image[0].id}`
                }
                return `#${bars.image[1].id}`
              }
              return `#${bars.image[0].id}`
            }
          }
        },
        x: d => {
          if (axes.axisX.type === 'time') {
            return this.xScale(new Date(d[axes.axisX.key])) - bars.image[0].width / 2
          }
          return this.xScale(d[axes.axisX.key]) - bars.image[0].width / 2
        },
        y: this.chartBodyHeight * verticalAlign
      })
      .transition()
      .duration(1000)
      .attr({
        y: d => {
          if (verticalAlign !== 1) {
            if (d[axisY.key] >= 0) {
              return this.yScale(d[axisY.key]) * verticalAlign
            }
            return this.yScale(d[axisY.key])
          }
          return this.yScale(d[axisY.key])
        }
      })
  }
  
  /**
   * 设置图表文字附带的图片的属性及样式
   * @param use svg:use标签
   */
  setTextImages(use) {
    const {texts, axes} = this.config
    const {verticalAlign} = axes.axisX
    const {axisY} = axes
    const {isExtremum} = texts
    const extremum = this.getExtremum(isExtremum)
    
    use
      .attr({
        'xlink:href': (d, i) => {
          if (!extremum.isExtremum
            || d[axisY.key] === this.maxValue
            || d[axisY.key] === this.minValue
          ) {
            if (!extremum.isDataStandard || !i) {
              if (verticalAlign !== 1) {
                if (d[axisY.key] >= 0) {
                  return `#${texts.image[0].id}`
                }
                return `#${texts.image[1].id}`
              }
              return `#${texts.image[0].id}`
            }
          }
        },
        x: d => {
          if (axes.axisX.type === 'time') {
            return this.xScale(new Date(d[axes.axisX.key]))
          }
          return this.xScale(d[axes.axisX.key])
        },
        y: d => {
          if (verticalAlign !== 1) {
            if (d[axisY.key] >= 0) {
              return this.yScale(d[axisY.key]) * verticalAlign
            }
            return this.yScale(d[axisY.key])
          }
          return this.yScale(d[axisY.key])
        },
        opacity: 0
      })
      .transition()
      .delay(500)
      .duration(1000)
      .attr({
        x: d => {
          if (axes.axisX.type === 'time') {
            return this.xScale(new Date(d[axes.axisX.key])) + 50
          }
          return this.xScale(d[axes.axisX.key]) + 60
        },
        y: d => {
          let y = 0
          if (verticalAlign !== 1) {
            if (d[axisY.key] >= 0) {
              y = this.yScale(d[axisY.key]) * verticalAlign
            } else {
              y = this.yScale(d[axisY.key])
            }
          } else {
            y = this.yScale(d[axisY.key])
          }
          
          if (d[axisY.key] === this.minValue) {
            y += 15
          } else {
            y -= 45
          }
          return y
        },
        opacity: 1
      })
  }
  
  /**
   * 设置点阵图属性及样式
   * @param {Object} gPoints 结点
   */
  setPoints(gPoints) {
    const {points, axes} = this.config
    const {verticalAlign} = axes.axisX
    const {stroke, strokeSize, fill, key} = points
    const {r} = points.point
    
    const k = axes.axisY.key ? axes.axisY.key : key
    
    gPoints
      .attr({
        class: (d, i) => `points points-${i}`,
        fill: fill,
        stroke: stroke,
        'stroke-width': strokeSize,
        r: 0,
        cx: d => {
          if (axes.axisX.type === 'time') {
            return this.xScale(new Date(d[axes.axisX.key]))
          }
          return this.xScale(d[axes.axisX.key])
        },
        cy: d => {
          if (verticalAlign !== 1) {
            if (d[k] >= 0) {
              return this.yScale(d[k]) * verticalAlign
            }
            return this.yScale(d[k])
          }
          return this.yScale(d[k])
        }
      })
      .transition()
      .duration(1000)
      .attr({
        r: r
      })
  }
  
  /**
   * （JSON）数据排序
   * @param {Array} data 数据集
   * @param {string} filed 排序字段
   * @param {boolean=} isAsc 正序/倒序
   * @returns {Array} 排序后的数据集
   */
  sort(data, filed, isAsc = true) {
    const rule = {
      'date': () => {
        return _.sortBy(data, d => {
          return `${isAsc ? '' : '-'}${new Date(d[filed]).getTime()}`
        })
      },
      'value': () => {
        return _.sortBy(data, d => {
          return `${isAsc ? '' : '-'}${d[filed]}`
        })
      }
    }
    
    return rule[filed]()
  }
  
  /**
   * 获取最大值和最小值
   * @param {boolean} isExtremum 是否是极值模式
   * @returns {Object} 返回根据数据处理后的极值逻辑
   */
  getExtremum(isExtremum) {
    if (isExtremum) {
      // 如果开启了极值，但数据不规范则强制禁用极值。例如value为一个恒定值（每一项的值都相等），这时开启极值无意义
      if (this.minValue === this.maxValue) {
        return {
          isExtremum: !isExtremum,
          isDataStandard: isExtremum // 是否是数据不规范引起的强制禁用极值
        }
      }
  
      return {
        isExtremum: isExtremum,
        isDataStandard: !isExtremum
      }
    }
    return {
      isExtremum: isExtremum,
      isDataStandard: isExtremum
    }
  }
}