/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-21 08:56:13
 * @Description: filter样式设置
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-21 08:56:13
 */

import { genSVGDocID } from '../../util/util'

// 获取filter id
const filterId = genSVGDocID()

/**
 *  添加滤镜效果
 *  @param    {object}  defs defs元素
 *  @return   {string}  filterId
 */
export const addFilter = (defs) => {
  // 添加filter元素
  const filter = defs.append('filter')
    .attr('id', filterId)
    .attr('x', '0%')
    .attr('y', '0%')
    .attr('width', '200%')
    .attr('height', '200%')
  // 创建偏移 
  filter.append('feOffset')
    .attr('result', 'offOut')
    .attr('in', 'SourceAlpha')
    .attr('dx', 2)
    .attr('dy', 2)
  // 创建模糊效果
  filter.append('feGaussianBlur')
    .attr('result', 'blurOut')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', 2)
  // 合并滤镜 
  filter.append('feBlend')
    .attr('in', 'SourceGraphic')
    .attr('in2', 'blurOut')
    .attr('mode', 'normal')

  return filterId  
}

