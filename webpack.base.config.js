const path = require("path")
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const purgecss = require("@fullhuman/postcss-purgecss")
const merge = require("webpack-merge")
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")

const { productName } = require("./package.json")

module.exports = ({
  name,
  entries = [],
  targets = [],
  overrides,
  isDevelopment,
}) => {
  return merge(
    {
      entry: {
        [name]: [
          ...entries,
          "./src/renderer/index.css",
          "./src/renderer/index.jsx",
          "cryptocoins-icons/webfont/cryptocoins.css",
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
        isDevelopment &&
          new ReactRefreshWebpackPlugin({ disableRefreshCheck: true }),
      ].filter(Boolean),
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            include: [path.resolve(__dirname, "src/renderer")],
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
                plugins: [isDevelopment && "react-refresh/babel"].filter(
                  Boolean,
                ),
                env: {
                  production: {
                    plugins: ["transform-react-remove-prop-types"],
                  },
                },
              },
            },
          },
          {
            test: /\.css$/,
            include: [path.resolve(__dirname, "src/renderer")],
            use: [
              ExtractCssChunks.loader,
              {
                loader: "css-loader",
                options: { modules: { mode: "global" } },
              },
              {
                loader: "postcss-loader",
                options: {
                  plugins: [
                    require("tailwindcss"),
                    purgecss({
                      whitelist: ["html", "body"],
                      content: [
                        path.join(
                          __dirname,
                          "./src/renderer/**/*.{js,jsx,css}",
                        ),
                      ],
                      extractors: [
                        {
                          extractor: (content) =>
                            content.match(/[A-Za-z0-9-_:/]+/g),
                          extensions: ["js", "jsx"],
                        },
                      ],
                    }),
                  ],
                },
              },
            ],
          },
          {
            test: /\.css$/,
            include: [path.resolve(__dirname, "node_modules")],
            use: [
              ExtractCssChunks.loader,
              {
                loader: "css-loader",
                options: { modules: { mode: "global" } },
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
}
