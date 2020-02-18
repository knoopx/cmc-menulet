const path = require("path")
const WebpackPwaManifest = require("webpack-pwa-manifest")

const { productName, description } = require("./package.json")
const configure = require("./webpack.base.config")

module.exports = (env, argv) => {
  console.log(env, argv)
  return configure({
    name: "web",
    entries: ["core-js/stable", "regenerator-runtime/runtime"],
    targets: "last 1 version",
    overrides: {
      resolve: {
        alias: {
          electron: "electron-shim",
        },
      },
      output: {
        path: path.resolve(__dirname, "dist/web"),
      },
      plugins: [
        new WebpackPwaManifest({
          name: productName,
          short_name: productName,
          description,
          background_color: "#343a40",
          icons: [
            {
              src: path.resolve(__dirname, "build/Icon.png"),
              sizes: [96, 128, 192, 256, 384, 512],
            },
          ],
        }),
      ],
    },
    isDevelopment: process.env.WEBPACK_DEV_SERVER === "true",
  })
}
