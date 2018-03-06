/**
 * @Author:      孙雨珩
 * @DateTime:    2017-07-20 16:02:08
 * @Description: 在生产环境下使用的webpack编译配置
 * @Last Modified By:   孙雨珩
 * @Last Modified Time:    2017-07-20 16:02:08
 */

const webpack = require('webpack')
const merge = require('webpack-merge')

const ExtractTextPlugin = require('extract-text-webpack-plugin')

const utils = require('../utils')

const config = require('../config')

const baseWebpackConfig = require('./base')

const entry = baseWebpackConfig.entry
const entryNames = Object.keys(entry)

/**
 *  将位于node_modules下的module判断为需要放入common chunk
 *  @param    {Object}  module webpack的module
 *  @return   {boolean}  为true就会被认为需要被放入common chunk
 */
function extractVendorModule(module) {
  return (
    module.resource &&
    module.resource.indexOf(
      utils.resolve('node_modules')
    ) === 0
  )
}

module.exports = merge(
  baseWebpackConfig,
  {
    devtool: '#source-map',
    output: {
      // dist文件夹对应的url地址
      // 最终所有静态资源文件都会以绝对路径的方式引入
      publicPath: config.prod.assetsPublicPath,
      // chunkhash可以避免浏览器无效缓存
      // entry chunk产出时的文件名称
      filename: 'static/js/[name].[chunkhash].js',
      // async chunk产出时的文件名称
      chunkFilename: 'static/js/[id].[chunkhash].js'
    },
    module: {
      rules: [
        // 使得可以require样式文件
        {
          test: /\.css$/,
          // css module需要被单独提取到css文件中
          use: ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  // 在css中import的css，还是需要先用postcss-loader处理后再用css-loader
                  importLoaders: 1,
                  sourceMap: true,
                  // 在避免修改css原义的情况下进行压缩
                  minimize: {
                    safe: true
                  }
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true
                }
              }
            ],
            // 如果css module被异步chunk依赖，无法被提取到css文件
            // 那么还是存放在异步chunk中，用style-loader进行加载
            fallback: {
              loader: 'style-loader',
              options: {
                sourceMap: true
              }
            }
          })
        }
      ]
    },
    plugins: [
      // 提取css文件
      new ExtractTextPlugin({
        filename: ('static/css/[name].[contenthash].css')
      }),
      // 将异步chunk中用到的第三方module拉回到entry chunk中
      new webpack.optimize.CommonsChunkPlugin({
        names: entryNames,
        children: true,
        minChunks: extractVendorModule
      }),
      // 新建一个名为vendor的chunk
      // 将所有entry chunk中的第三方module拉到vendor中
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        chunks: entryNames,
        minChunks: extractVendorModule
      }),
      // 新建一个名为manifest的chunk
      // 将webpack在浏览器中的bootstrap，module表拉到manifest中
      // 如果不提取，那么module表会留在vendor中
      // 一旦module表发生变化，那么vendor.js也会发生变化，降低了浏览器缓存的使用效果
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor']
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: true
      })
    ].concat(
      // 拼接需要产出的html文件
      utils.getHtmlPlugins(entryNames, true)
    )
  }
)