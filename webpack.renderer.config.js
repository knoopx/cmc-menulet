const path = require('path')

const { version: electronVersion } = require(path.resolve(
  __dirname,
  'node_modules/electron/package.json',
))

const configure = require('./webpack.base.config')

module.exports = configure('renderer', [], `electron ${electronVersion}`, {
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist/electron'),
  },
})
