const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const { productName, description, dependencies } = require('./package.json')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')

class Extractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g)
  }
}

module.exports = {
  mode: process.env.NODE_ENV,
  entry: [
    'tachyons/css/tachyons.css',
    'tachyons-open-color',
    './src/index.css',
    './src/index.jsx',
  ],
  plugins: [
    new webpack.ExternalsPlugin('commonjs', Object.keys(dependencies)),
    new ExtractTextPlugin('bundle.css'),
    new PurgecssPlugin({
      paths: glob.sync(path.join(path.resolve(__dirname, './src'), '**/*.{js,jsx,ejs}')),
      extractors: [
        {
          extractor: Extractor,
          extensions: ['js', 'jsx', 'ejs'],
        },
      ],
    }),
    new FaviconsWebpackPlugin(path.resolve(__dirname, 'Icon.png')),
    new HtmlWebpackPlugin({
      title: productName,
      template: 'src/index.ejs',
    }),
    new WebpackPwaManifest({
      name: productName,
      short_name: productName,
      description,
      background_color: '#343a40',
      icons: [
        {
          src: path.resolve(path.resolve(__dirname, 'Icon.png')),
          sizes: [96, 128, 192, 256, 384, 512],
        },
      ],
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    modules: [path.resolve(__dirname, './src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.json', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
          disable: process.env.NODE_ENV !== 'production',
        }),
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: [
          path.resolve('./src'),
          path.resolve('./node_modules/react-icons'),
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
    ],
  },
}
