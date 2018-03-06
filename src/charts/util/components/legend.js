/*
 * @Author: liqi@hiynn.com 
 * @Date: 2018-01-21 13:37:12 
 * @Description: 图例绘制方法
 * @Last Modified by: liqi@hiynn.com
 * @Last Modified time: 2018-01-25 15:34:53
 */
import d3 from 'd3'
import _ from 'lodash'

export default class Legend {
  /**
   * 实例化
   * @param {Object} svg     svg 容器
   * @param {Object} option  配置项
   * @param {Object} padding 外部环境的边距，只需要 top 和 left
   */
  constructor(svg, option, padding) {
    this.svg = svg

    // 基本配置
    this.config = _.merge({
      show: true,
      direction: 'row', // row || column
      gap: 30,
      offsetX: 0,
      offsetY: 0,
      labelStyle: {
        margin: 6,
        fontSize: 14,         
        normal: '#FCFAF2',
        blur: '#828282'
      },
      itemStyle: {
        symbol: 'circle', // 类型参考d3符号生成器 || 'path://'
        symbolSize: 8,
        blur: '#828282'
      }
    }, option)

    // 初始化容器
    this.legendG = svg.append('g')
      .classed('legends', true)
      .attr('transform', `translate(
        ${padding.left + this.config.offsetX} ${padding.top / 2 + this.config.offsetY}
      )`)
  }

  /**
   * 设置图标的属性
   * @param  {Object} selection 选择集对象
   * @param  {Object} itemStyle 样式对象
   * @return {void}   void
   */
  setItemAttr(selection, itemStyle) {
    selection
      .attr('fill', d => {
        let item = this.svg.select(`.${d}`)

        if (item.attr('fill') && item.attr('fill') !== 'none') {
          return item.attr('fill')
        } 

        if (item.attr('stroke') && item.attr('stroke') !== 'none') {
          return item.attr('stroke')
        }

        return 'none'
      })
      .attr('d', () => {
        let { symbol, symbolSize } = itemStyle
        let type = symbol.indexOf('path://')
      
        // 使用默认图标
        if (type === -1) {
          let path = d3.svg.symbol()
            .type(symbol)
            .size(Math.pow(symbolSize, 2))()  
          return path
        }

        // 使用定制化图标
        if (type === 0) {
          let d = symbol.replace('path://', '')
          return d
        }
      })

    selection
      .attr('transform', function() {
        let height = d3.select(this).node().getBBox().height
        return `translate(0 ${-height / 2})`
      })

  }

  /**
   * 设置文字标签的属性
   * @param  {Object} selection  选择集对象
   * @param  {Object} labelStyle 样式对象
   * @param  {Object} itemStyle  样式对象
   * @return {void}   void
   */
  setLabelAttr(selection, labelStyle, itemStyle) {
    selection
      .text(d => d)
      .attr('dx', labelStyle.margin + itemStyle.symbolSize)
      .attr('fill', labelStyle.normal)
      .style('font-size', `${labelStyle.fontSize}px`)
  }
  
  /**
   * 切换图例的状态
   * @param  {String} name   图例名字
   * @param  {String} status 要改变为什么状态
   * @return {void}   void
   */
  toggle(name, status) {
    const { labelStyle } = this.config
    const legend = this.svg.select(`.legends #${name}`)
    
    switch(status) {
    case 'blur':
      legend.select('text')
        .attr('fill', labelStyle.blur)
      legend.select('path')
        .attr('fill', labelStyle.blur)  
      legend.attr('status', 'blur')
      break
    case 'normal':
      legend.select('text')
        .attr('fill', labelStyle.normal)
      legend.select('path')
        .attr('fill', d => {
          let item = this.svg.select(`.${d}`)

          if (item.attr('fill') && item.attr('fill') !== 'none') {
            return item.attr('fill')
          } 

          if (item.attr('stroke') && item.attr('stroke') !== 'none') {
            return item.attr('stroke')
          }

          return 'none'
        })     
      legend.attr('status', 'normal') 
      break
    default:
      throw new Error('Error:must set status!')
    }
  }

  /**
   * 渲染
   * @param  {Array} series 集合
   * @return {void}  void
   */
  render(series) {
    const that = this
    const { show, itemStyle, labelStyle, direction, gap } = this.config

    if (!show) {
      return 
    }
    
    let dataset = series.map(d => d.name)

    let update = this.legendG.selectAll('g').data(dataset)
    let enter = update.enter().append('g')
    let exit = update.exit()

    // ENTER legend 容器
    enter
      .attr('id', d => d)
      .attr('status', 'normal')
      .attr('cursor', 'pointer')
    // ENTER 容器中的图标
    enter.append('path')
      .call(::this.setItemAttr, itemStyle)
    // ENTER 容器中的标签
    enter.append('text')
      .call(::this.setLabelAttr, labelStyle, itemStyle)

    // UPDATE legend 容器
    update
      .attr('status', 'normal')
      .attr('id', d => d)
    // UPDATE 容器中的图标
    update.select('path')
      .call(::this.setItemAttr, itemStyle)
    // UPDATE 容器中的标签
    update.select('text')
      .call(::this.setLabelAttr, labelStyle, itemStyle)

    // EXIT legend 容器
    exit.remove()

    // 当页面 DOM 加载完毕，设置容器的偏移量
    // 首先制作数组，用来装载所有容器的宽度和高度
    this.legendWidth = []
    this.svg.selectAll('.legends g').each(function() {
      let width = d3.select(this).node().getBBox().width
      that.legendWidth.push(width)      
    })
    
    this.svg.selectAll('.legends g').each(function(d, index) {
      // 水平排列      
      if (direction === 'row') {
        let lastWidth = 0
        for (let j = 1; j <= index; j ++) {
          lastWidth += that.legendWidth[j - 1]
        }
        d3.select(this)
          .attr('transform', `translate(${lastWidth + index * gap} 0)`)
      }

      // 垂直排列
      let height = d3.select(this).node().getBBox().height

      if (direction === 'column') {
        d3.select(this)
          .attr('transform', `translate(0 ${(height + gap) * index})`)
      }
    })
  }
}
