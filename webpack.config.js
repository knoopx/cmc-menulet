const path = require('path')
const webpack = require('webpack')
const { productName, dependencies } = require('./package.json')
const HappyPack = require('happypack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  target: 'electron-renderer',
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval',
  entry: [
    'source-map-support/register',
    'react-activity/dist/react-activity.css',
    'tachyons/css/tachyons.css',
    'tachyons-open-color',
    'cryptocoins-icons/webfont/cryptocoins.css',
    './src/index.jsx',
  ],
  plugins: [
    new HappyPack({
      loaders: ['babel-loader'],
      threads: 4,
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ExternalsPlugin('commonjs', Object.keys(dependencies)),
    new webpack.NamedModulesPlugin(),
    new webpack.EnvironmentPlugin({ NODE_ENV: 'development', CHANNEL: 'web' }),
    new webpack.LoaderOptionsPlugin({ minimize: process.env.NODE_ENV === 'production' }),
    new ExtractTextPlugin('renderer.css'),
    new HtmlWebpackPlugin({
      title: productName,
      filename: 'renderer.html',
      template: 'src/index.ejs',
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js',
  },
  resolve: {
    modules: [path.resolve(__dirname, './src'), 'node_modules'],
    aliasFields: ['browser'],
    extensions: ['.js', '.jsx', '.json', '.css'],
  },
  module: {
    loaders: [
      {
        test: /\.css/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      {
        test: /\.jsx?$/,
        use: 'happypack/loader',
        include: [
          path.resolve('./src'),
          path.resolve('./node_modules/react-icons'),
        ],
      },
      {
        test: /\.json$/,
        use: 'json-loader',
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
    ],
  },
}
