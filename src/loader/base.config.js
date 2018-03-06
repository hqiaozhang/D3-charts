/**
 * @Author:      孙雨珩
 * @DateTime:    2017-07-24 13:51:21
 * @Description: 全局配置
 * @Last Modified By:   孙雨珩
 * @Last Modified Time:    2017-08-09 10:13:43
 */

const search = global.location.search

export default {
  // 是否使用mock模式，在mock模式下向服务器的请求使用mockjs模拟
  // hycharts默认调用mock数据，不需要再加mock标识
  mock: search.indexOf('mock') === -1,
  // 模拟websocket时，消息的推送间隔(毫秒)
  mockInterval: 3500,
  // 轮询请求时的时间间隔(毫秒)
  fetchInterval: 3000,
  // 是否使用proxy模式，在proxy模式下会使用proxy的url来替换原来的url
  proxy: search.indexOf('proxy') !== -1,
  // 线上服务器域名，当proxy为false时，所有ajax请求都会发送到这个域名
  host: '/api',
  // websocket线上服务器域名，当proxy为false时，所有websocket都会连接到这个域名
  websocketHost: 'ws://online.com',
  // 代理服务器域名，当proxy为true时，所有ajax请求都会发送到这个域名,主要用于前后台联调
  proxyHost: 'http://192.168.1.199:3000/api',
  // websocket代理服务器域名，当proxy为true时，所有websocket都会连接到这个域名,主要用于前后台联调
  websocketProxyHost: 'ws://offline.com',
  // 是否使用zoom模式，在zoom模式下页面会根据窗口的宽高使用transform调整
  mapHost: 'http://192.168.1.16:10088/mapdata/cq',
  // 地图路径
  zoom: false,
  // 固定的页面宽
  pageWidth: 1920,
  // 固定的页面高
  pageHeight: 1080
}
