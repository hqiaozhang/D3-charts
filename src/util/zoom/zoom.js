/**
 * @Author:      孙雨珩
 * @DateTime:    2017-07-18 09:20:07
 * @Description: 对document.body进行缩放，使得body尺寸始终保持config中声明的尺寸
 * @Last Modified By:   孙雨珩
 * @Last Modified Time:    2017-08-08 13:25:11
 */
import './zoom.css'
import config from '@/config'
import $ from 'jquery'

const body = $('body')

let lastScale = [1, 1]

/**
 *  根据当前窗口大小缩放页面
 */
export default function zoom() {
  const x = window.innerWidth / config.get('pageWidth')
  const y = window.innerHeight / config.get('pageHeight')
  lastScale = [x, y]
  body
    .css('transform',`scale(${x}, ${y})`)
}

/**
 *  开启zoom
 */
export function adaptZoom() {
  body
     .addClass('zoomify')
    .css('width', config.get('pageWidth'))
    .css('height', config.get('pageHeight'))
}

/**
 *  将原始位置转换为zoom后的位置
 *  @param    {Array.number}  origin 原始位置
 *  @return   {Array.number}  zoom后的位置
 */
export function originToDeformation(origin) {
  return [origin[0] * lastScale[0], origin[1] * lastScale[1]]
}

/**
 *  将zoom后的位置转换为原始位置
 *  @param    {Array.number}  deformation zoom后的位置
 *  @return   {Array.number}  原始位置
 */
export function deformationToOrigin(deformation) {
  return [deformation[0] / lastScale[0], deformation[1] / lastScale[1]]
}
