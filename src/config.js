/**
 * @Author:      孙雨珩
 * @DateTime:    2017-07-17 15:29:37
 * @Description: 全局配置
 * @Last Modified By:   孙雨珩
 * @Last Modified Time:    2017-07-20 11:09:36
 */
let config = {}

export default {
  /**
   *  将源配置覆盖到全局配置
   *  @param    {Object}  srcConfig 源配置，将会覆盖到全局配置
   */
  merge(srcConfig) {
    config = {
      ...config,
      ...srcConfig
    }
  },
  /**
   *  获取某个配置项的值
   *  @param    {string}  key 配置项的key
   *  @return   {*}  配置项的值
   */
  get(key) {
    return config[key]
  }
}