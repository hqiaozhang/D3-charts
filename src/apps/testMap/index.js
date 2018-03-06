
import loader from '@/loader/loader'
import apis from './mock'
import './index.css'
import config from './config'
import MapIndex from './map/'

loader.load({
  apis: apis,
  config: config,
  init() {
    const map = new MapIndex()
    map.renderPoints()
    map.renderPersonHeader()
    map.bindClickEvent()
  }
})