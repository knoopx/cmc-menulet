const EventEmitter = require('events')

const ipcRenderer = new EventEmitter()

ipcRenderer.send = ipcRenderer.emit

function changeFavicon(src) {
  let link = document.querySelector("link[rel='shortcut icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'shortcut icon'
    document.head.appendChild(link)
  }
  link.href = src
}

ipcRenderer
  .on('set-title', (title) => {
    document.title = title
  })
  .on('set-icon', (dataURL) => {
    changeFavicon(dataURL)
  })


const remote = {
  app: class {
    static getLocaleCountryCode() {
      return navigator.languages
    }
  },
}

export { ipcRenderer, remote }
