const path = require('path')

module.exports = {
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'dist/electron'),
  },
  entry: {
    main: ['./src/main/index.js'],
  },
  node: false,
}
