/*
 * @Author: liqi@hiynn.com 
 * @Date: 2018-01-23 13:58:15 
 * @Description: 滤镜方法
 * @Last Modified by: liqi@hiynn.com
 * @Last Modified time: 2018-01-23 16:31:11
 */
import $ from 'jquery'
import _ from 'lodash'
import gridHbs from './templates/grid.hbs'
import columnHbs from './templates/column.hbs'

/**
 * 创建滤镜的公共方法
 * 1. 线性渐变：
 * target: {
 *    type: 'linear',
 *    direction: [x1, y1, x2, y2],
 *    addColorStops: [
 *      { offset: 0, color: '' }
 *    ]
 * }
 * ----------
 * 2. 径向渐变
 * target: {
 *    type: 'radial',
 *    direction: [cx, cy, r, fx, fy],
 *    addColorStops: [
 *      { offset: 0, color: '' }
 *    ]
 * }
 * ----------
 * 3. 图案填充 [不稳定]
 * target: {
 *    type: 'pattern',
 *    pattern: 'grid || column',
 *    background: string || gradientObject
 *    lineStyle: {
 *      strokeWidth: 1,
 *      stroke: '#FFF',
 *      density: 0.05
 *    }
 * }
 * @param  {Object} svg    svg 容器
 * @param  {Mix}    target 颜色字符串，或 colorStops 对象
 * @return {String} 返回颜色字符串，或 填充 的 id 名
 */
export function filters(svg, target) {  
  const type = target.type

  // 如果是颜色字符串，或者 d3 的颜色对象，则直接返回
  if (_.isString(target) || !type) {
    return target
  }  

  if (!_.isObject(target)) {
    return
  }

  // 制作唯一 id 标识符
  let id
  let reg = /\s|,|\.|#|\(|\)|"|'|:|\[|\]|\{|\}|/gi

  // 创建线性或径向渐变
  if (type === 'linear' || type === 'radial') {
    const { direction = [], addColorStops = {} } = target
    
    id = type + 
      JSON.stringify(direction).replace(reg, '') + 
      JSON.stringify(addColorStops).replace(reg, '')

    // 如果该渐变已经被创建，则直接返回 id
    let defs = $(`#${svg.attr('id')} defs`)
    if (defs.find(`#${id}`).length > 0) {
      return `url(#${id})`
    }

    // 线性渐变
    if (type === 'linear') {
      svg
        .append('defs')
        .append('linearGradient')
        .attr('id', id)
        .attr('x1', direction[0])    
        .attr('y1', direction[1])    
        .attr('x2', direction[2])    
        .attr('y2', direction[3])
        .selectAll('stop')
        .data(addColorStops)
        .enter()
        .append('stop')
        .attr('offset', d => d.offset)
        .style('stop-color', d => d.color)
    }

    // 径向渐变
    if (type === 'radial') {
      svg
        .append('defs')
        .append('radialGradient')
        .attr('id', id)
        .attr('cx', direction[0])    
        .attr('cy', direction[1])    
        .attr('r', direction[2])    
        .attr('fx',direction[3])
        .attr('fy', direction[4])
        .selectAll('stop')
        .data(addColorStops)
        .enter()
        .append('stop')
        .attr('offset', d => d.offset)
        .style('stop-color', d => d.color)      
    }    

    return `url(#${id})`
  }

  // 创建图案
  if (type === 'pattern') {
    const { pattern, background = {}, lineStyle} = target
    const bbox = svg.node().getBBox()
    const width = bbox.width
    const height = bbox.height
    const rate = width / height
    
    id = pattern + JSON.stringify(background).replace(reg, '')

    // 如果该渐变已经被创建，则直接返回 id
    let defs = $(`#${svg.attr('id')} defs`)
    if (defs.find(`#${id}`).length > 0) {
      return `url(#${id})`
    }    

    switch(pattern) {
    // 网格图案
    case 'grid':
      svg
        .append('defs')
        .html(gridHbs({
          id,
          lineStyle,
          background: filters(svg, background),
          _width: lineStyle.density,
          _height: lineStyle.density * rate
        }))
      break
    // 堆叠网格图案
    case 'column':
      svg
        .append('defs')
        .html(columnHbs({
          id,
          lineStyle,
          background: filters(svg, background),
          _height: lineStyle.density
        }))
      break
    default:
      throw new Error('Error:must set pattern!')
    }    

    return `url(#${id})`
  }
}
