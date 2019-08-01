import { format as formatUrl } from 'url'

import path from 'path'
import electron from 'electron'
import { menubar } from 'menubar'

const isDevelopment = process.env.NODE_ENV !== 'production'

const { app, nativeImage } = electron

app.on('ready', () => {
  const { screen, ipcMain } = electron
  const { height } = screen.getPrimaryDisplay().workAreaSize

  let index = formatUrl({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file',
    slashes: true,
  })

  let icon = path.join(__dirname, 'build/IconTemplate.png')

  if (isDevelopment) {
    index = __ELECTRON_WEBPACK_DEV_SERVER_URL__
    icon = path.join(__dirname, '../../build/IconTemplate.png')
  }
  const mb = menubar({
    index,
    icon,
    browserWindow: {
      width: 720,
      height: height * 0.8,
    },
    preloadWindow: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  })

  mb.on('ready', () => {
    if (process.env.DEBUG || isDevelopment) {
      mb.window.webContents.openDevTools()
    }
  })

  ipcMain
    .on('set-title', (event, title) => {
      mb.tray.setTitle(title)
    })
    .on('set-icon', (event, dataURL) => {
      const image = nativeImage.createFromDataURL(dataURL)
      mb.tray.setImage(image)
    })
})
