/**
 * @Author:      孙雨珩
 * @DateTime:    2017-07-20 16:15:05
 * @Description: 在开发环境下使用的webpack编译配置
 * @Last Modified By:   孙雨珩
 * @Last Modified Time:    2017-07-20 16:15:05
 */

const webpack = require('webpack')
const merge = require('webpack-merge')
const utils = require('../utils')

const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const baseWebpackConfig = require('./base')

const entry = baseWebpackConfig.entry
const entryNames = Object.keys(entry)
const devEntry = {}

// 每个entry对应的chunk要额外加载一个模块，用于实现热更新
entryNames.forEach(
  name => {
    return devEntry[name] = ['webpack-hot-middleware/client?noInfo=true&reload=true'].concat(entry[name])
  }
)

module.exports = merge(
  baseWebpackConfig,
  {
    entry: devEntry,
    devtool: '#cheap-module-eval-source-map',
    output: {
      // dist文件夹对应的url地址
      // 最终所有静态资源文件都会以绝对路径的方式引入
      publicPath: '/',
      // entry chunk产出时的文件名称
      filename: 'static/js/[name].js',
      // async chunk产出时的文件名称
      chunkFilename: 'static/js/[id].js'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            // 使得可以require样式文件
            {
              loader: 'style-loader',
              options: {
                sourceMap: true
              }
            },
            {
              loader: 'css-loader',
              options: {
                // 在css中import的css，还是需要先用postcss-loader处理后再用css-loader
                importLoaders: 1,
                sourceMap: true
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true
              }
            }
          ]
        }
      ]
    },
    plugins: [
      // 更友好的编译错误提示
      new FriendlyErrorsPlugin(),
      // 热更新插件
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ].concat(
      // 拼接需要产出的html文件
      utils.getHtmlPlugins(entryNames)
    )
  }
)