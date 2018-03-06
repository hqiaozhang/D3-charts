/**
 * @Author:      zhanghq
 * @DateTime:    2017-10-14 16:06:43
 * @Description: 地图图例
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-10-14 16:06:43
 */

export const addLegend = (self) => {
  const config = self.config
  const { width, height, legend } = config
  const { margin, fontSize } = legend.text

  let legendG = self.svg.append('g')
    .attr('calss', 'map-legend')
    .attr('transform', `translate(${width - legend.width * 3}, ${height - 100})`)
    .style('cursor', 'pointer')

  let data = legend.data

  let update = legendG.selectAll('legend-group')
    .data(data)
    .enter()

  let g = update.append('g')
    .attr('calss', 'legend-group') 
    .attr('transform', (d, i) => `translate(0, ${i * legend.bottom})`)
    .attr('fill', (d, i) => i === 1 ? legend.fill[0] : legend.fill[1])
    .on('click', (d, i) => {
      // 清除定时器
      clearInterval(self.mapTimer)
      // 切换数据
      self.switchData(i)
      // 调用定时器
      setTimeout(() => {
        self.setInterval(i)  
      }, 5000)
    })

  g.append('rect')
    .attr('width', legend.width)
    .attr('height', legend.height)
    .attr('y', -legend.height)

  g.append('text')
    .attr('x', legend.width + margin.left)
    .attr('y', -margin.top)
    .attr('font-size', fontSize)
    .text((d) => d)
}
