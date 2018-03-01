const path = require('path')
const electron = require('electron')
const menubar = require('menubar')
const defaultMenu = require('electron-default-menu')

const {
  app, shell, nativeImage, Menu,
} = electron

if (process.env.NODE_ENV === 'development') {
  const webpack = require('webpack')
  const WebpackDevServer = require('webpack-dev-server')
  const config = require(path.resolve('./webpack.config.js'))

  config.output.publicPath = 'http://localhost:8080/'
  config.entry.unshift(
    'webpack-dev-server/client?http://localhost:8080/',
    'webpack/hot/dev-server',
  )
  config.plugins.unshift(new webpack.HotModuleReplacementPlugin())

  const compiler = webpack(config)
  const server = new WebpackDevServer(compiler, { hot: true, inline: true })
  server.listen(8080)
}

app.on('ready', () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu(app, shell)))

  const { screen, ipcMain } = electron
  const { height } = screen.getPrimaryDisplay().workAreaSize

  let index = `file://${__dirname}/dist/renderer.html`
  if (process.env.NODE_ENV === 'development') {
    index = 'http://localhost:8080/renderer.html'
  }
  const mb = menubar({
    index,
    width: 720,
    height: height * 0.8,
    preloadWindow: true,
    webPreferences: { webSecurity: false },
  })
  mb.on('ready', () => {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      mb.window.webContents.openDevTools()
    }
  })

  ipcMain
    .on('set-title', (event, title) => {
      mb.tray.setTitle(title)
    })
    .on('set-icon', (event, dataURL) => {
      const image = nativeImage.createFromDataURL(dataURL)
      // const trayIcon = nativeImage.createFromDataURL(image.toDataURL({ scaleFactor: 0.5 }))
      // image.addRepresentation({ scaleFactor: 2, dataURL })
      mb.tray.setImage(image)
    })
})
