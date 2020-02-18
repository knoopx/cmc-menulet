const path = require("path")

const { version: electronVersion } = require(path.resolve(
  __dirname,
  "node_modules/electron/package.json",
))

const configure = require("./webpack.base.config")

module.exports = configure({
  name: "renderer",
  targets: `electron ${electronVersion}`,
  overrides: {
    target: "electron-renderer",
    output: {
      path: path.resolve(__dirname, "dist/electron"),
    },
  },
  isDevelopment: process.env.WEBPACK_DEV_SERVER === "true",
})
