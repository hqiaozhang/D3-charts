/**
 * @Author:      孙雨珩
 * @DateTime:    2017-07-25 14:58:44
 * @Description: 开发及构建项目时的配置项
 * @Last Modified By:   孙雨珩
 * @Last Modified Time:    2017-07-25 14:58:44
 */

module.exports = {
  // 开发时使用的配置
  dev: {
    // 本地开发服务器端口号
    port: 8011
  },
  // 构建时使用的配置
  prod: {
    // dist文件夹对应的url地址
    assetsPublicPath: '/'
    // assetsPublicPath: '/cas-server/themes/hytheme'
  }
}
