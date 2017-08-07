const electron = require('electron')
const app = electron.app

const {
  BrowserWindow,
  ipcMain
} = electron

const url = require('url')
const path = require('path')

const TEMPLATE = 'template.html'
const SPLASH = 'splash.html'

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
  isStandAlone: function () {
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
ipcMain.on('isStandAloneSync', (event, arg) => {
  event.returnValue = splash.isStandAlone()
})