/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-29 10:06:44
 * @Description: 添加拆线提示框
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-29 10:06:44
 */
import d3 from 'd3'

/**
 *  折线提示框
 *  @param    {object}    svg    svg元素
 *  @param    {object}    config 配置项
 *  @param    {function}  xScale x轴比例尺
 *  @return   {void}
 */
export const addOverlay = (svg, config, xScale) => {

  const { itemStyle, xWidth, yHeight } = config
  const { top, left } = itemStyle.margin

  // 焦点元素  
  let focusCircle = svg.append('g')
    .attr('class', 'focusCircle')
    .style('display', 'none')

  focusCircle.append('circle')
    .attr('r', 4.5)  
    .attr('fill', '#fff')

  focusCircle.append('text')
    .attr('dx', 10)
    .attr('dy', '1em')

  // 对齐线的元素
  let focusLine = svg.append('g')  
    .attr('class', 'focusLine')
    .style('display', 'none')

  focusLine.append('line')  
  focusLine.append('line')
    .attr('x1', 0)
    .attr('x2', 1)
    .attr('y1', -top)
    .attr('y2', yHeight - top)  
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)

  svg.append('rect')
    .attr('class', 'overlay')
    .attr('width', xWidth)
    .attr('height', yHeight)
    .attr('x', left)
    .attr('y', top)
    .style('pointer-events', 'all')
    .attr('fill', 'none')
    .on('mouseover', () => {
      focusCircle.style('display', null)
      focusLine.style('display', null)
    })
    .on('mouseout', () => {
      focusCircle.style('display', 'none')
      focusLine.style('display', 'none')
    })
    .on('mousemove', () => {
      let current = d3.select('.overlay')[0][0]
      /*
        返回当前d3.event相对于指定的容器的x和y坐标，
        该容器可以是一个HTML或SVG容器元素，如svg:g或svg:svg
        该坐标返回为一个包含两个元素的数组[x, y]。
       */
      let mouseX = d3.mouse(current)[0] - left 
      // let mouseY = d3.mouse(current)[1] - 100
      let x0 = Math.round(xScale.invert(mouseX)) 
      let xPart = xScale(x0)  
      
      focusCircle.attr('transform', `translate(${xPart}, 50)`)
      focusLine.attr('transform', `translate(${xPart}, 50)`)
    })
}
