/**
 * @Author:      孙雨珩
 * @DateTime:    2017-07-20 15:45:28
 * @Description: 工具类
 * @Last Modified By:   孙雨珩
 * @Last Modified Time:    2017-07-20 15:45:28
 */

const path = require('path')
const fs = require('fs')

const HtmlWebpackPlugin = require('html-webpack-plugin')

/**
 *  获取项目下某个文件的绝对路径
 *  @param    {string}  dir 相对于项目根目录的路径
 *  @return   {string}  文件的绝对路径
 */
exports.resolve = function (dir) {
  return path.join(__dirname, '..', dir)
}

/**
 *  根据src/apps下的文件夹数量来确定有哪些应用入口
 *  @return   {Object}  webpack的entry
 */
exports.getEntry = function () {
  const me = this
  const pages = fs.readdirSync(me.resolve('src/apps'));
  const entry = {}
  pages
    .forEach(fileName => {
      entry[fileName] = me.resolve(`src/apps/${fileName}/index.js`)
    })

  return entry
}

/**
 *  根据入口名确定要生成哪些html页面
 *  @param    {Array.string}  entryNames 由应用入口名组成的数组
 *  @param    {boolean=}  minify     是否压缩，默认为false
 *  @return   {Array}  用于生成页面的plugins
 */
exports.getHtmlPlugins = function (entryNames, minify=false) {
  const me = this
  return entryNames
    .map(entryName => {
      let templatePath = me.resolve('index.html')
      let appTemplatePath = me.resolve(`src/apps/${entryName}/${entryName}.html`)
      if (fs.existsSync(appTemplatePath)) {
        // app下存在和app同名的html，使用该html作为页面模板
        templatePath = appTemplatePath
      }
      const htmlWebpackPluginConfig = {
        // 产出时页面的文件名
        filename: `${entryName}.html`,
        // 模板路径
        template: templatePath,
        // 引入的资源不应包含其他的entry
        excludeChunks: entryNames.filter(curEntryName => curEntryName !== entryName)
      }
      if (minify) {
        // 为true说明页面需要压缩
        htmlWebpackPluginConfig.minify = {
          // 去注释
          removeComments: true,
          // 去空白
          collapseWhitespace: true,
          // 去除引用时的引号
          removeAttributeQuotes: true
        }
      }
      return new HtmlWebpackPlugin(htmlWebpackPluginConfig)
    })
}