const electron = require('electron')
const app = electron.app

global.ROOT = __dirname
global.ASSETS_DIRECTORY = `${global.ROOT}/assets/`

const {
  BrowserWindow,
  ipcMain,
  dialog
} = electron

const url = require('url')
const path = require('path')
const windowManager = require('electron-window-manager')

const TEMPLATE = 'template.html'
const SPLASH = 'splash.html'

const raje_fs = require('./modules/raje_fs.js')

const EDITOR_WINDOW = 'editor'
const SPLASH_WINDOW = 'splash'

const splash = {

  /**
   * Init the windowmanager and open the splash window
   */
  openSplash: function () {

    // Init the window manager
    windowManager.init()

    // Get the url to the splash window
    let splashWindowUrl = url.format({
      pathname: path.join(__dirname, SPLASH),
      protocol: 'file:',
      slashes: true
    })

    // Open the splash window
    windowManager.open(SPLASH_WINDOW, 'RAJE', splashWindowUrl, null, {
      height: 400,
      width: 500,
      resizable: false,
      movable: true,
      fullscreenable: false
    })
  },

  /**
   * Close the splash window
   */
  closeSplash: function () {

    windowManager.close(SPLASH_WINDOW)
  },

  /**
   * 
   */
  openEditor: function (size) {

    // Get the URL to open the editor
    let editorWindowUrl = url.format({
      pathname: path.join(__dirname, TEMPLATE),
      protocol: 'file:',
      slashes: true
    })

    // Open the new window with the size given by the splash window
    windowManager.open(EDITOR_WINDOW, 'RAJE', editorWindowUrl, null, {
      width: size.width,
      height: size.height,
      resizable: true
    })
  },

  /**
   * 
   */
  isApp: function () {
    return true
  }
}

// Event called when the app is ready
app.on('ready', splash.openSplash)

/**
 * Open new article
 */
ipcMain.on('newArticle', (event, arg) => {
  splash.openEditor(arg)
  splash.closeSplash()
})

/**
 * 
 */
ipcMain.on('isAppSync', (event, arg) => {
  event.returnValue = splash.isApp()
})

/**
 * Triggered when the save event is called
 */
ipcMain.on('saveDocumentSync', (event, arg) => {

  // Show save dialog here
  let savePath = dialog.showSaveDialog(editorWindow, {
    defaultPath: arg.title
  })

  // If the user select a folder, the article is saved for the first time
  if (savePath) {
    raje_fs.saveArticleFirstTime(savePath, arg.document, (err, message) => {
      if (err)
        return event.returnValue = `Error: ${err}`

      editorWindow.loadURL(`${savePath}/template.html`)
      event.returnValue = message
    })
  } else
    event.returnValue = null
})