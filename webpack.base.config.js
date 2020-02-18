const path = require("path")
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const whitelister = require("purgecss-whitelister")
const merge = require("webpack-merge")
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")

const { productName } = require("./package.json")

module.exports = (name, entries = [], targets = [], overrides) =>
  merge(
    {
      entry: {
        [name]: [
          ...entries,
          "cryptocoins-icons/webfont/cryptocoins.css",
          "./src/renderer/index.css",
          "./src/renderer/index.jsx",
        ],
      },
      resolve: {
        modules: [
          path.resolve(__dirname, "node_modules"),
          path.resolve(__dirname, "src/renderer"),
          path.resolve(__dirname, "src/web"),
        ],
        extensions: [".mjs", ".js", ".jsx"],
      },
      plugins: [
        new HtmlWebpackPlugin({
          inject: false,
          title: productName,
          template: require("html-webpack-template"),
          appMountId: "root",
          mobile: true,
          meta: {
            "theme-color": "#343a40",
          },
        }),
        new ExtractCssChunks(),
        new ReactRefreshWebpackPlugin({ disableRefreshCheck: true }),
      ],
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            use: {
              loader: "babel-loader",
              options: {
                presets: [
                  [
                    "@babel/preset-env",
                    {
                      modules: false,
                      targets,
                    },
                  ],
                  "@babel/preset-react",
                ],
                env: {
                  development: {
                    plugins: ["react-refresh/babel"],
                  },
                  production: {
                    plugins: ["transform-react-remove-prop-types"],
                  },
                },
              },
            },
            include: [path.resolve(__dirname, "src/renderer")],
          },
          {
            test: /\.css$/,
            use: [
              ExtractCssChunks.loader,
              {
                loader: "css-loader",
                options: { modules: { mode: "global" } },
              },
              {
                loader: "postcss-loader",
                options: {
                  plugins: [require("tailwindcss")],
                },
              },
              {
                loader: "@fullhuman/purgecss-loader",
                options: {
                  whitelist: [
                    "html",
                    "body",
                    ...whitelister(
                      path.resolve(
                        "node_modules/cryptocoins-icons/webfont/cryptocoins.css",
                      ),
                    ),
                  ],
                  content: [
                    path.join(__dirname, "./src/renderer/**/*.{js,jsx,css}"),
                  ],
                  extractors: [
                    {
                      extractor: class {
                        static extract(content) {
                          return content.match(/[A-Za-z0-9-_:/]+/g)
                        }
                      },
                      extensions: ["js", "jsx"],
                    },
                  ],
                },
              },
            ],
          },
          {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            use: "file-loader",
          },
        ],
      },
    },
    overrides,
  )
