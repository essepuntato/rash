const electron = require('electron')
const app = electron.app

const {
  BrowserWindow,
  ipcMain,
  dialog
} = electron

const url = require('url')
const path = require('path')

const TEMPLATE = 'template.html'
const SPLASH = 'splash.html'

const raje_fs = require('./modules/raje_fs.js')

let browserWindow

const splash = {

  /**
   * 
   */
  createWindow: function () {

    browserWindow = new BrowserWindow({
      height: 400,
      width: 500
    })

    browserWindow.loadURL(url.format({
      pathname: path.join(__dirname, SPLASH),
      protocol: 'file:',
      slashes: true
    }))


  },

  /**
   * 
   */
  openEditor: function () {

    browserWindow.loadURL(url.format({
      pathname: path.join(__dirname, TEMPLATE),
      protocol: 'file:',
      slashes: true
    }))

    // Maximize page 
    browserWindow.maximize()
  },

  /**
   * 
   */
  isApp: function () {
    return true
  }
}

// Event called when the app is ready
app.on('ready', splash.createWindow)

/**
 * Open new article
 */
ipcMain.on('newArticle', (event, arg) => {
  splash.openEditor()
})

/**
 * 
 */
ipcMain.on('isAppSync', (event, arg) => {
  event.returnValue = splash.isApp()
})

/**
 * 
 */
ipcMain.on('saveDocumentSync', (event, arg) => {

  let savePath = dialog.showSaveDialog(browserWindow)

  if (savePath) {
    raje_fs.saveArticleFirstTime(savePath, 'hello_world', (err, message) => {
      if (err)
        return event.returnValue = err

      event.returnValue = message
    })
  }
  else 
    event.returnValue = null
})