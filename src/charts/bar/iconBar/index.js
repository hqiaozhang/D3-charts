/**
 * 带icon和背景图的柱状图类
 * @author baizn
 * @class IconBar
 */
import d3 from 'd3'
import _ from 'lodash'
import rectImgBg from './images/rect-img-bg.png'
import rectIcon from './images/rectIcon.png'
import { genSVGDocID, getMousePosition } from '../../util/util'
import { showTips, hideTips } from './tips.js'

/**
 * 带小图标和背景图片的柱状图
 * 
 * @export
 * @class IconBar
 */
export default class IconBar {

  /**
   * 图表组件默认配置项
   * 
   * @returns  {Object} 默认配置项
   * @memberof IconBar
   */
  defaultSetting() {
    return {
      width: 465,
      height: 400,
      left: 35,
      top: 35,
      fontFamily: '微软雅黑',
      minWidth: 1,
      tooltip: {
        show: true
      },
      // 条形图配置项
      itemStyle: {
        // 矩形的高度
        height: 4,
        // 柱状图数据背景色填充
        color: '#50f6ff',
        // 柱状图后面的小图标
        icon: {
          show: true,
          width: 16,
          height: 17,
          top: 4,
          left: 40
        },
        // 渐变配置项
        gradient: {
          show: true,
          color: ['#9936e8', '#49aefe'],
          id: 'linearColor',
          x1: '30%',
          y1: '0%',
          x2: '100%',
          y2: '0%',
          offset1: '0%',
          offset2: '100%',
          opacity1: 1,
          opacity2: 1
        }, 
        radius: 0, // 条形图两边的半径,
        margin: {
          top: 13,
          right: 30, 
          bottom: 0,
          left: 40
        },
        hover: {
          color: ''
        }
      },
      // 背景色，包括鼠标hover和里面的效果
      bgStyle: {
        width: 6,
        height: 16,
        hover: '#126df0',
        normal: '#062b5c'
      },
      // 左边文字配置项
      leftText: {
        show: true,
        fontSize: 12,
        color: '#fff',
        textAlign: 'start'
      },
      // 右边文字配置项
      rightText: {
        show: true,
        fontSize: 12,
        color: '#fff',
        textAlign: 'middle',
        unit: '人'
      }
    }
  }

  /**
   * Creates an instance of IconBar.
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) {
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.selector = selector
    // 获取一系列的id
    this.gId = genSVGDocID()
    this.defsId = genSVGDocID()
    this.xScale = null

    // 创建svg元素
    this.svg = d3.select(selector)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)

    const { bgStyle } = this.config
    const { width, height } = bgStyle
    // 添加pattern元素，实现柱状图背景效果
    let defs = this.svg.append('defs')
      .append('pattern')
      .attr('id', this.defsId)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternContentUnits', 'userSpaceOnUse')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)

    defs.append('image')
      .attr('width', width)
      .attr('height', height)
      .attr('x', 0)
      .attr('y', 0)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', rectImgBg)
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
    const config = self.config
    const { width, itemStyle } = config
    const { margin } = itemStyle

    let dataset = []
    for(let current of data) {
      dataset.push(current.value)
    }

    const maxWidth = width - margin.left - margin.right

    self.xScale = d3.scale.linear()
      .domain([0, d3.max(dataset)])
      .range([maxWidth, 0])

    self.renderData(data, maxWidth)  

  }

  renderData(data, maxWidth) {
    const self = this
    // 计算行高
    const { height } = self.config
    const lineHeight = height / data.length
    // 获取update部分
    let update = self.svg.selectAll(`.group-${self.gId}`)
      .data(data)

    // 获取enter部分
    let enter = update.enter().append('g')
    // 添加左边文字
    enter.append('text').classed('left-text', true)
    // 添加矩形背景
    enter.append('rect').classed('rect-bg', true)
    // 添加矩形图像点缀背景
    enter.append('rect').classed('rect-img-bg', true)
    // 添加数据部分
    enter.append('rect').classed('rect-data', true)
    // 添加矩形后面的小图标
    enter.append('image')
    // 添加右边的文本
    enter.append('text').classed('right-text', true)

    // 处理update部分
    // 组元素属性设置
    update.call(::self.setGroupAttribute, lineHeight)
    // 选择左边文字
    update.select('.left-text')
      .call(::self.setLeftTextAttribute, data)
    // 选择矩形背景
    update.select('.rect-bg')
      .call(::self.setRectBgAttribute, maxWidth)
    // 选择数据部分  
    update.select('.rect-data')
      .call(::self.setRectAttribute, data, maxWidth)
    // 选择右边的文本
    update.select('.right-text')
      .call(::self.setRightTextAttribute, data)
    // 选择矩形图像点缀背景  
    update.select('.rect-img-bg')
      .call(::self.setRectImgAttribute, maxWidth)
    // 选择矩形后面的小图标
    update.select('image')
      .call(::self.setImageAttribute, maxWidth)
    /*
      处理exit
     */  
    update.exit().remove()
  }

  /**
   *  组元素样式设置
   *  @param    {array}   g           g元素
   *  @param    {number}  lineHeight  行高
   */
  setGroupAttribute(g, lineHeight) {
    const self = this
    const selector = self.selector
    let { bgStyle, tooltip } = self.config
    g.attr('transform', (d, i) => `translate(0, ${lineHeight * i})`)
      .attr('class', (d, i) => `group-${self.gId} group-${self.gId}-${i}`)
    // 是否显示提示框
    if(tooltip.show) {
      g.attr('cursor', 'pointer')
        .on('mouseover', (d, i) => {
          // 调用样式设置
          self.mouseEventStyle(i, bgStyle.hover)
          // 显示提示框
          showTips(selector, d, getMousePosition())
        })
        .on('mousemove', (d) => showTips(selector, d, getMousePosition()))
        .on('mouseout', (d, i) => {
          self.mouseEventStyle(i, bgStyle.normal)
          // 隐藏提示框  
          hideTips(selector)  
        })
    }   
  }

  /**
   *  设置鼠标事件的样式
   *  @param    {number}  i 当前下标
   *  @param    {object}  fill 样式配置
   *  @return   {void}
   */
  mouseEventStyle(i, fill) {
    d3.select(`.group-${this.gId}-${i}`)
      .select('.rect-bg')
      .attr('fill', fill)
      .style('cursor', 'pointer')
  }

  /**
   * 设置数据矩形的样式
   * 
   * @param {any} rect 表示数据量大小的矩形元素
   * @param {any} dataset 数据项
   * @param {any} maxWidth 最大宽度
   * @return   {void}
   */
  setRectAttribute(rect, dataset, maxWidth) {
    const { itemStyle, minWidth } = this.config
    const { margin, radius, color, height} = itemStyle
    
    const self = this
    rect.attr('class', 'rect-data')
      .attr('fill', color)
      .attr('x', margin.left)
      .attr('y', margin.top / 2)
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('height', height)
      .attr('width', (d) => {
        let currentWidth = maxWidth - self.xScale(d.value) - margin.left
        if(currentWidth <= 0) {
          currentWidth = minWidth
        }
        return currentWidth
      })
  }

  /**
   * 设置数据矩形的背景样式
   * 
   * @param {any} rect 背景矩形元素
   * @param {any} maxWidth 最大宽度
   * @return   {void}
   */
  setRectBgAttribute(rect, maxWidth) {
    const { itemStyle, bgStyle } = this.config
    const { margin, radius } = itemStyle
    const { height } = bgStyle
    rect.attr('class', 'rect-bg')
      .attr('fill', bgStyle.normal)
      .attr('x', margin.left)
      .attr('y', 0)
      .attr('height', height)
      .attr('width', maxWidth - margin.left)
      .attr('rx', radius)
      .attr('ry', radius)
  }

  /**
   * 设置矩形背景图像的样式
   * 
   * @param {any} rect 
   * @param {any} maxWidth 
   * @return   {void}
   */
  setRectImgAttribute(rect, maxWidth) {
    const self = this
    const { itemStyle, minWidth, bgStyle } = self.config
    const { margin, radius } = itemStyle
    const { height } = bgStyle

    rect.attr('class', 'rect-img-bg')
      .attr('fill', `url(#${self.defsId})`)
      .attr('x', margin.left)
      .attr('y', 0)
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('height', height)
      .attr('width', (d) => {
        let currentWidth = maxWidth - self.xScale(d.value) - margin.left
        if(currentWidth <= 0) {
          currentWidth = minWidth
        }
        return currentWidth
      })
  }

  /**
   * 设置左边文本样式
   * 
   * @param {any} text 左边文本元素
   * @param {any} data 数据项
   * @return   {void}
   */
  setLeftTextAttribute(text, data) {
    const self = this
    const { leftText, itemStyle } = self.config
    const { color, fontSize, textAlign } = leftText
    text.attr('fill', color)
      .attr('font-size', fontSize)
      .attr('text-anchor', textAlign)
      .attr('class', 'left-text')
      .attr('x', 0)
      .attr('y', itemStyle.margin.top)
      .text((d, i) => data[i].name)
  }

  /**
   * 设置矩形后面小图标的样式
   * 
   * @param {any} image 图标元素
   * @return   {void}
   */
  setImageAttribute(image, maxWidth) {
    const self = this
    const { itemStyle, minWidth } = self.config
    const { margin, icon } = itemStyle
    const { width, height, top, left } = icon

    image.attr('width', width)
      .attr('height', height)
      .attr('class', 'rect-icon')
      .attr('xlink:href', rectIcon)
      .attr('x', (d) => {
        let currentWidth = maxWidth - self.xScale(d.value) 
        if(currentWidth <= 0) {
          currentWidth = minWidth
        }
        return currentWidth + margin.left - left
      })
      .attr('y', top)
  }

  /**
   * 设置右边文本的样式
   * 
   * @param {any} text 右边文本元素
   * @param {any} data 数据项
   * @return   {void}
   */
  setRightTextAttribute(text, data) {
    const self = this
    const { rightText, width, itemStyle } = self.config
    const { color, fontSize, textAlign, unit } = rightText
    const { right, top } = itemStyle.margin
    text.attr('fill', color)
      .attr('font-size', fontSize)
      .attr('text-anchor', textAlign)
      .attr('x', width - right)
      .attr('y', top)
      .attr('class', 'right-text')
      .text((d, i) => `${data[i].value} ${unit}`)
  }
}
