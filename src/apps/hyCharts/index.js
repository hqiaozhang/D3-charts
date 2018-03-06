/**
 * @Author:      baizn
 * @DateTime:    2017-01-17 09:24:27
 * @Description: 主文件
 * @Last Modified By:   baizn
 * @Last Modified Time:    2017-01-17 09:24:27
 */

import mockApis from './mock'
import loader from '@/loader/loader'
import Index from './scripts/'
const render = new Index()

import './index.css'

loader.load({
  apis: mockApis, 
  init() {
    render.render()
  }
})
