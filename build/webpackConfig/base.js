/**
 * @Author:      孙雨珩
 * @DateTime:    2017-07-20 15:54:18
 * @Description: 在任何环境下都应使用的webpack编译配置
 * @Last Modified By:   baizn
 * @Last Modified Time:    2017-07-20 15:54:18
 */
const CopyWebpackPlugin = require('copy-webpack-plugin')
const utils = require('../utils')

module.exports = {
  // 决定有哪些app入口
  entry: utils.getEntry(),
  output: {
    // 用于存放编译后文件的文件夹
    path: utils.resolve('dist')
  },
  resolve: {
    alias: {
      // 实现用import '@/'来从src文件夹开始定位
      '@': utils.resolve('src')
    }
    // extensions: ['', '.webpack.js', '.web.js', '.js']
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /node_modules|request.js/,
        use: [
          {
            loader: 'eslint-loader',
            options: {
              failOnError: false,
              failOnWarning: false
            }
          }
        ]
      },
      // js文件使用babel-loader编译
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      // 使得可以require模板文件
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        options: {
          // 静态资源用loader获取
          inlineRequires: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
          // 注册全局helper
          helperDirs: [utils.resolve('src/helpers')]
        }
      },
      // 使得可以require图片资源，css文件中的url也需要此loader进行解析
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          // 不超过3000字节的资源直接用base64
          limit: 3000,
          name: 'static/img/[name].[hash:7].[ext]'
        }
      },
      // 使得可以require字体资源，css文件中的url也需要此loader进行解析
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          // 不超过3000字节的资源直接用base64
          limit: 3000,
          name: 'static/fonts/[name].[hash:7].[ext]'
        }
      },
      // 可以使用txt文件
      {
        test: /\.(txt?|md)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          // 不超过3000字节的资源直接用base64
          limit: 3000,
          name: 'static'
        }
      }
    ]
  },
  plugins: [
    // 复制外部的静态资源
    new CopyWebpackPlugin([
      {
        // 源文件来自根目录下的static
        from: utils.resolve('static'),
        // 复制到构建后目录下的static文件夹
        to: 'static',
        // '.'开头的文件不复制
        ignore: ['.*']
      }
    ])
  ]
}
