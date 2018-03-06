/*
 * @Author: liqi@hiynn.com 
 * @Date: 2018-01-19 21:50:39 
 * @Description: 基础柱形折线混合图
 * @Last Modified by: liqi@hiynn.com
 * @Last Modified time: 2018-01-25 15:34:26
 */

import d3 from 'd3'
import _ from 'lodash'
import { Legend, Tooltip, Axis } from '../../util/components/index'
import { deepClone, randomString } from '../../util/util'
import { filters } from '../../util/filters/index'

export default class BarWithLine {
  /**
   * 初始化默认配置
   * @param  {Object} option 用户定义配置项
   * @return {void}   void
   */
  initConfig(option) {
    // 配置主题栅格布局信息
    let svg = _.merge({
      width: 700,
      height: 400
    }, option.grid)

    let padding = {
      left: svg.width * 0.1,
      right: svg.width * 0.1,
      top: svg.height * 0.15,
      bottom: svg.height * 0.1
    }

    this.grid = _.merge({
      width: svg.width,
      height: svg.height,
      left: padding.left,
      right: padding.right,
      top: padding.top,
      bottom: padding.bottom
    }, option.grid)

    let { width, height, left, right, top, bottom } = this.grid
    this.AXIS = {
      width: width - (left + right),
      height: height - (top + bottom)
    }

    // 配置动画信息
    this.duration = option.duration || 300
    this.easing = option.easing || 'cubicIn'    

    let colors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', 
      '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1']
    
    // 配置柱形图相关信息
    this.bars = _.merge({
      width: null,
      gap: null,
      normal: {
        fills: deepClone(colors)   
      },
      emphasis: {
        fills: deepClone(colors).map(color => d3.rgb(color).brighter())
      }
    }, option.bars) 

    // 配置折线图相关信息
    this.lines = _.merge({
      lineStyle: {
        strokeWidth: 2,
        interpolate: 'linear', // linear || cardinal
        normal: {
          strokes: deepClone(colors).reverse()
        },
        emphasis: {
          strokes: deepClone(colors).reverse().map(color => d3.rgb(color).brighter())
        }
      },
      itemStyle: {
        symbol: 'circle', // 类型参考d3符号生成器 || 'path://'
        symbolSize: 8,
        fills: deepClone(colors).reverse(),
        strokes: deepClone(colors).reverse(),
        strokeWidth: 2
      }
    }, option.lines)
  }

  /**
   * 初始化容器
   * @param  {String} selector 选择器
   * @param  {Object} option   配置项
   * @return {void}   void
   */
  initGroup(selector, option) {
    let { left, top, width, height } = this.grid

    // 设置外层容器样式
    d3.select(selector).style({
      position: 'relative',
      width: `${width}px`,
      height: `${height}px`
    })

    // 初始化 svg 容器
    this.svgid = `svg${randomString(10)}`
    let svgG = d3.select(selector)
      .append('svg')
      .attr('id', this.svgid)
      .attr('width', width)
      .attr('height', height)
    this.svgG = svgG     

    // 初始化柱形图容器
    this.barsG = svgG.append('g')
      .classed('bars', true)
      .attr('transform', `translate(
        ${left} ${top}
      )`)

    // 初始化折线图容器
    this.linesG = svgG.append('g')
      .classed('lines', true)
      .attr('transform', `translate(
        ${left} ${top}
      )`)

    // 初始化坐标轴容器
    this.axis = new Axis(svgG, option)   

    // 初始化图例容器
    this.legend = new Legend(svgG, option.legends, { 
      top: this.grid.top,
      left: this.grid.left
    })

    // 初始化提示框容器
    this.tooltip = new Tooltip(selector, option.tooltip)
  }  

  /**
   * 实例化
   * @param {String} selector 选择器
   * @param {Object} option   配置项
   */
  constructor(selector, option = {}) {
    this.selector = selector
    this.initConfig(option)
    this.initGroup(selector, option)    
  }

  /**
   * 绘制图表
   * @param  {Array} series 集合
   * @return {void}  void
   */
  drawChart(series) {
    // 绘制坐标轴    
    this.axis.render(series)

    // 获取比例尺    
    this.xScale = this.axis.getScale().xScale
    this.yScale = this.axis.getScale().yScale

    // 绘制柱形图
    let barsSeries = series.filter(item => item.type === 'bar')
    this.drawBars(barsSeries)

    // // 绘制折线图
    let linesSeries = series.filter(item => item.type === 'line')
    this.drawLines(linesSeries)
  }

  /**
   * 绘制柱形图
   * @param  {Array} series 集合
   * @return {void}
   */
  drawBars(series) {
    // colorid 将提供一个不变的序号，用于查找该柱形的填充颜色
    for (let [colorid, chunk] of series.entries()) {
      for (let d of chunk.data) {
        d.colorid = colorid
        d.legendName = chunk.name
      }
    }

    // 以下值将提供给 countBarsInfo 函数，用来计算柱形的宽度和偏移
    // 根据数据中的 isShow 来获取数组长度 len
    // 根据数据中的 isShow 来获取柱形的排序 sortid
    // isShow 属性将在图例点击事件中被改变
    let len = series.filter(d => d.isShow).length
    if (len === 0) {
      len = 1
    }
    for (let [sortid, chunk] of series.filter(d => d.isShow).entries()) {
      for (let d of chunk.data) {
        d.sortid = sortid
      }
    }

    let update = this.barsG.selectAll('g').data(series)
    let enter = update.enter()
    let exit = update.exit()

    // 1. ENTER 父集数据进入，添加对应的 g 集合
    enter.append('g')    

    // 2. UPDATE 父集数据更新，包括位置更改，删除子集数据，增加子集数据等
    // 子集的数据增加减少，实际上只是父集的数据更新
    // 因为父集的数据结构是没有改变的
    // 所有需要使用父集的 update 来制作子集的 enter update exit
    let _update = update.selectAll('rect').data(chunk => chunk.data)
    let _enter = _update.enter()
    let _exit = _update.exit()

    let min = this.axis.getRange().min

    _enter
      .append('rect')
      .attr('height', 0)
      .attr('y', () => {
        if (min > 0) {
          return this.AXIS.height
        }
        return this.yScale(0)
      })
      .call(::this.setBarsAttr, { len, min })
    _update
      .call(::this.setBarsAttr, { len, min })
    _exit
      .transition()
      .duration(this.duration)
      .ease(this.easing)
      .attr('width', 0)      
      .remove()

    // 3. EXIT 父集数据被删除
    // exit 会返回被删除的集合对象
    // 自然，该集合里面肯定包含子集创建的矩形对象
    // 选择所有的矩形对象，并进行动画、删除
    // 删除子集矩形对象后，再将 exit 返回的集合对象删除，完成闭环
    exit
      .selectAll('rect')
      .transition()
      .duration(this.duration)
      .ease(this.easing)
      .attr('width', 0)
      .remove()
    exit
      .transition()
      .delay(this.duration)
      .remove()
  }

  /**
   * 设置柱形属性
   * @param  {Object} selection 选择集对象
   * @param  {Object} opt       矩形的配置选项
   * @return {void}   void
   */
  setBarsAttr(selection, opt) {
    const that = this
    let { len, min } = opt

    selection      
      // 设置属性
      .attr('class', d => d.legendName)
      .attr('cursor', 'pointer')
      .attr('fill', d => filters(this.svgG, this.bars.normal.fills[d.colorid]))

      // 设置鼠标悬浮事件
      .on('mouseover', function(data) {
        d3.select(this)
          .attr('fill', d => filters(that.svgG, that.bars.emphasis.fills[d.colorid]))

        // 显示提示框
        let bbox = d3.select(this).node().getBBox()

        let x = bbox.x + that.grid.left
        let y = bbox.y
  
        let fill = d3.select(this).attr('fill')
  
        that.tooltip.show({
          titleName: data.name,
          legendName: data.legendName,
          value: data.value,
          x, y, fill
        })
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('fill', d => filters(that.svgG, that.bars.normal.fills[d.colorid]))
        
        // 隐藏提示框
        that.tooltip.hide()
      })

      // 设置动画
      .transition()
      .duration(this.duration)
      .ease(this.easing)
      .attr('width', d => {
        if (d.value !== 0) {
          return this.countBarsInfo(d.name, d.sortid, len).width
        } 
        return 1        
      })
      .attr('height', d => {
        if (min > 0) {
          return this.AXIS.height - this.yScale(d.value)
        }
        
        if (d.value > 0) {
          return this.yScale(0) - this.yScale(d.value)
        }
        return this.yScale(d.value) - this.yScale(0)
      })
      .attr('x', d => {
        return this.countBarsInfo(d.name, d.sortid, len).offset
      })
      .attr('y', d => {
        if (d.value > 0) {
          return this.yScale(d.value)
        }
        return this.yScale(0)
      })
  }

  /**
   * 计算柱形的宽度和偏移量
   * @param  {String} name   该组矩形的名称
   * @param  {Number} sortid 该组矩形的排列下标
   * @param  {Number} len    需要显示的柱形组数
   * @return {Array}  返回柱形的宽度和偏移量
   */
  countBarsInfo(name, sortid, len) {
    let rangeBand = this.xScale.rangeBand()

    // 柱形之间的间隙
    let gap
    if (this.bars.gap) {
      gap = this.bars.gap
    } else {
      gap = rangeBand / 20
    }

    // 矩形的宽度
    let barWidth
    if (this.bars.width) {
      barWidth = this.bars.width
    } else {
      barWidth = rangeBand / 2 / len
    } 
    // 正好位于刻度最左边时的偏移量
    let offset = this.xScale(name)

    // 通过下标，计算出的每一个柱形的偏移量
    let itemOffset = sortid * (barWidth + gap)

    // 最后将整组柱形挪动到中心点
    let groupOffset = rangeBand / 2 - (barWidth * len + (len - 1) * gap) / 2

    return { width: barWidth, offset: offset + itemOffset + groupOffset }
  }  

  /**
   * 绘制折线图
   * @param  {Array} series 集合数据
   * @return {void}  void
   */
  drawLines(series) {
    // colorid 将提供一个不变的序号，用于查找该折线的填充颜色
    for (let [colorid, chunk] of series.entries()) {
      chunk.colorid = colorid
      chunk.legendName = chunk.name
      for (let d of chunk.data) {        
        d.colorid = colorid
        d.legendName = chunk.name
      }
    }    

    let update = this.linesG.selectAll('g.line').data(series)
    let enter = update.enter().append('g')
    let exit = update.exit()
    
    // ENTER
    enter
      .classed('line', true)
      .attr('transform', `translate(${this.xScale.rangeBand() / 2} 0)`)      
    enter.append('path')
      .call(::this.setLinesAttr)

    // UPDATE
    update
      .attr('opacity', d => {
        if (d.isShow) {
          return 1
        }
        return 0
      })
    update.select('path')
      .call(::this.setLinesAttr)

    // 嵌套数据
    let _update = update.selectAll('path.item').data(chunk => chunk.data)
    let _enter = _update.enter()
    let _exit = _update.exit()

    // _ENTER
    _enter
      .append('path')
      .call(::this.setSymbolAttr)
    // _UPDATE
    _update      
      .call(::this.setSymbolAttr)
    // _EXIT
    _exit
      .remove()

    // EXIT
    exit.remove()
  }

  /**
   * 设置折线的样式
   * @param  {Object} selection 选择集对象
   * @return {void}   void
   */
  setLinesAttr(selection) {
    const that = this
    let { lineStyle } = this.lines

    let linePath = d3.svg.line()
      .x(d => this.xScale(d.name))
      .y(d => this.yScale(d.value))
      .interpolate(this.lines.lineStyle.interpolate)
    
    selection
      // 设置属性
      .attr('class', d => d.legendName)
      .attr('cursor', 'pointer')
      .attr('d', d => linePath(d.data))
      .attr('fill', 'none')
      .attr('stroke', d => filters(this.svgG, lineStyle.normal.strokes[d.colorid]))
      .attr('stroke-width', lineStyle.strokeWidth)
      .attr('stroke-dasharray', function() {
        return d3.select(this).node().getTotalLength()
      })
      .attr('stroke-dashoffset', function() {
        return d3.select(this).node().getTotalLength()
      })

      // 设置事件
      .on('mouseover', function(d) {
        d3.select(this)
          .attr('stroke', filters(that.svgG, lineStyle.emphasis.strokes[d.colorid]))       
      })
      .on('mouseout', function(d) {
        d3.select(this)
          .attr('stroke', filters(that.svgG, lineStyle.normal.strokes[d.colorid]))
      })

      // 设置动画
      .transition()
      .duration(this.duration)
      .ease(this.easing)
      .attr('stroke-dashoffset', 0)
  }

  /**
   * 设置符号属性
   * @param  {Object} selection 选择集对象
   * @return {void}   void
   */
  setSymbolAttr(selection) {
    const that = this
    let { fills, strokes, strokeWidth, symbol, symbolSize } = this.lines.itemStyle

    let type = symbol.indexOf('path://')
    let path = ''

    // 使用默认符号
    if (type === -1) {
      path = d3.svg.symbol()
        .type(symbol)
        .size(Math.pow(symbolSize, 2))()
    }
    
    // 使用自定义符号
    if (type === 0) {
      path = symbol.replace('path://', '')
    }

    selection
      // 设置属性
      .classed('item', true)
      .attr('cursor', 'pointer')
      .attr('d', path)
      .attr('transform', d => {
        return `translate(
          ${this.xScale(d.name)} ${this.yScale(d.value)}
        )`
      })
      .attr('fill', d => filters(this.svgG, fills[d.colorid]))
      .attr('stroke', d => filters(this.svgG, strokes[d.colorid]))
      .attr('stroke-width', strokeWidth)

      // 设置事件
      .on('mouseover', function(d) {
        let x = that.xScale(d.name)
        let y = that.yScale(d.value)

        // 改变样式
        d3.select(this)
          .transition()
          .duration(300)
          .ease('elastic-in')
          .attr('transform', `translate(${x} ${y}) scale(2)`)

        // 显示提示框
        let fill = d3.select(this).attr('fill')
  
        that.tooltip.show({
          titleName: d.name,
          legendName: d.legendName,
          value: d.value,
          x: x + that.grid.left + that.xScale.rangeBand() / 2, 
          y, fill
        })
      })
      .on('mouseout', function(d) {
        d3.select(this)
          .transition()
          .duration(300)
          .ease('cubic-out')
          .attr('transform', `translate(${that.xScale(d.name)} ${that.yScale(d.value)}) scale(1)`)
        
        // 隐藏提示框
        that.tooltip.hide()
      })
  }

  /**
   * 绑定图例事件
   * 原理注释：
   * 1. 传入的 series 事先会装载一个 isShow 属性，来表示该组数据是否渲染
   * 2. 深拷贝 series，制作一个全局的缓冲对象，
   *    所有对数据的修改都会在缓冲区进行，这样做的目的是不去污染原始数据
   * 3. 为每个图例绑定点击事件，根据图例的 id 名称，来找到 _series 缓冲区中对应的数据
   * 4. 将缓冲区对应的数据 isShow 属性设置为 false，并把 data 中所有 value 值设置为0
   * 5. 此时，数据已制作完成，使用 _series 调用 drawChart 方法渲染图表
   * 6. drawChart 会根据原始数据，给每一组柱形分配一个 fillid 属性，作为查找颜色值的 key
   * 7. drawChart 会根据数据中的 isShow 状态，创建 sortid 和 len 属性，
   *    这两个属性是 countBarsInfo 计算柱形偏移量和宽度的关键属性
   * 8. 图表绘制完成，使用 this.legend.toggle 方法，完成对图例元素状态的转变
   * @param  {Array} series 集合
   * @return {void}  void
   */
  bindLegendEvent(series) {
    const that = this

    // 深拷贝 series 数据集，制作缓冲数据
    this._series = deepClone(series)
    
    for (let dataset of series) {
      this.svgG.select(`.legends #${dataset.name}`)
        .on('click', function() {
          let name = d3.select(this).attr('id')
          let status = d3.select(this).attr('status')  
          let _sereis = _.find(that._series, d => d.name === name)
          
          if (status === 'normal') {
            // 改变缓冲区的数据状态，并将对应的数据值设置为0
            _sereis.isShow = false
            _sereis.data.forEach(data => { 
              data.value = 0 
            })
            
            // 使用缓冲区的数据绘制图表
            that.drawChart(that._series)

            // 改变图例的状态
            that.legend.toggle(name, 'blur')
          }

          if (status === 'blur') {  
            // 改变缓冲区的数据状态，并将对应的数据值设置为原始数据的值
            _sereis.isShow = true
            _sereis.data.forEach((data, i) => { 
              data.value = _.find(series, d => d.name === name).data[i].value
            })

            // 使用缓冲区的数据绘制图表
            that.drawChart(that._series)

            // 改变图例的状态
            that.legend.toggle(name, 'normal')
          }
        })
        // 鼠标悬浮图例高亮对应的图形
        .on('mouseover', function() {
          const { emphasis: lineEmphasis } = that.lines.lineStyle
          const { emphasis: barEmphasis } = that.bars

          let name = d3.select(this).attr('id')
          let type = series.filter(d => d.name === name)[0].type
                    
          switch(type) {
          case 'line':
            that.svgG.selectAll(`.${name}`)
              .attr('stroke', d => filters(that.svgG, lineEmphasis.strokes[d.colorid]))
            break
          case 'bar':
            that.svgG.selectAll(`.${name}`)
              .attr('fill', d => filters(that.svgG, barEmphasis.fills[d.colorid]))
            break
          default:
            throw new Error('Error:type is undefined!')
          }         
        })
        .on('mouseout', function() {
          const { normal: lineNormal } = that.lines.lineStyle
          const { normal: barNormal } = that.bars

          let name = d3.select(this).attr('id')
          let type = series.filter(d => d.name === name)[0].type
          
          switch(type) {
          case 'line':
            that.svgG.selectAll(`.${name}`)
              .attr('stroke', d => filters(that.svgG, lineNormal.strokes[d.colorid]))
            break
          case 'bar':
            that.svgG.selectAll(`.${name}`)
              .attr('fill', d => filters(that.svgG, barNormal.fills[d.colorid]))
            break
          default:
            throw new Error('Error:type is undefined!')
          }    
        })              
    }
  }

  /**
   * 渲染图表
   * @param  {Array} dataset 数据
   * @return {void}  void
   */
  render(dataset) {
    // 给每组数据加上状态
    // drawChrat 和 bindLegendEvent 都会根据这个属性渲染图表
    for (let d of dataset) {
      d.isShow = true
    }

    // 绘制图表
    this.drawChart(dataset)

    // 绘制图例并绑定点击事件
    this.legend.render(dataset)
    this.bindLegendEvent(dataset)
  }
}
