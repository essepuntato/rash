/**
 * 
 * Main process of Electron.js 
 */

const electron = require('electron')
const app = electron.app

global.ROOT = __dirname
global.IMAGE_TEMP = `${global.ROOT}/img`

global.hasChanged
global.isNew
global.savePath

global.ASSETS_DIRECTORIES = [
  `${global.ROOT}/js`,
  `${global.ROOT}/css`,
  `${global.ROOT}/fonts`,
  IMAGE_TEMP
]

const {
  BrowserWindow,
  ipcMain,
  dialog,
  Menu
} = electron

const url = require('url')
const path = require('path')
const windowManager = require('electron-window-manager')

const TEMPLATE = 'template.html'
const SPLASH = 'splash.html'

const RAJE_FS = require('./modules/raje_fs.js')
const RAJE_MENU = require('./modules/raje_menu.js')

const EDITOR_WINDOW = 'editor'
const SPLASH_WINDOW = 'splash'

const windows = {

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

    // Set the menu 
    Menu.setApplicationMenu(Menu.buildFromTemplate(RAJE_MENU.getSplashMenu()))
  },

  /**
   * Close the splash window
   */
  closeSplash: function () {

    windowManager.close(SPLASH_WINDOW)
  },

  /**
   * Open the editable template  
   */
  openEditor: function (size) {

    global.hasChanged = false
    global.isNew = true

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

    // Set the menu 
    Menu.setApplicationMenu(Menu.buildFromTemplate(RAJE_MENU.getEditorMenu()))

    /**
     * Catch the close 
     */
    windowManager.get(EDITOR_WINDOW).object.on('close', event => {

      // If the document is in hasChanged mode (need to be saved)
      if (global.hasChanged) {

        // Cancel the close event
        event.preventDefault()

        // Show the dialog box "the document need to be saved"
        dialog.showMessageBox({
          type: 'warning',
          buttons: ['Save changes', 'Discard changes', 'Cancel, continue editing'],
          title: 'Unsaved changes',
          message: 'The article has been changed, do you want to save the changes?',
          cancelId: 2
        }, (response) => {
          switch (response) {

            // The user wants to save the document
            case 0:
              // TODO save the document
              global.hasChanged = false
              windowManager.get(EDITOR_WINDOW).object.close()
              break

              // The user doesn't want to save the document
            case 1:
              global.hasChanged = false
              windowManager.get(EDITOR_WINDOW).object.close()
              break
          }
        })
      }
    })
  },

  /**
   * Return true to let know that the client has Electron behind
   */
  isApp: function () {
    return true
  }
}

// Event called when the app is ready
app.on('ready', windows.openSplash)

app.on('quit', RAJE_FS.removeImageTempFolder)

/**
 * This method is used to call the function that 
 * opens the editor with the template
 * 
 * Called by the splash window
 */
ipcMain.on('newArticle', (event, arg) => {

  // The document isnt' saved for the first time
  global.saved = false

  windows.openEditor(arg)
  windows.closeSplash()
})

/**
 * This method is used to let know to the client that
 * the HTML file it's opened by Electron (not by a browser)
 * 
 * If nothing is returned, tinymce isn't initialised
 * 
 * Called from the renderer process
 */
ipcMain.on('isAppSync', (event, arg) => {
  event.returnValue = windows.isApp()
})

/**
 * This method is used to save the current document 
 * calling the save dialog (in order to select where the document has to be saved)
 * 
 * Then The article is saved by the raje_fs module
 * 
 * After the save process, the url is updated loading the saved file url
 * 
 * Called from the renderer process
 */
ipcMain.on('saveAsArticle', (event, arg) => {

  // If the document isn't saved for the first time
  if (global.isNew) {
    // Show save dialog here
    let savePath = dialog.showSaveDialog(windowManager.get(EDITOR_WINDOW), {
      defaultPath: arg.title
    })

    // If the user select a folder, the article is saved for the first time
    if (savePath) {
      RAJE_FS.saveAsArticle(savePath, arg.document, (err, message) => {
        if (err)
          return console.log(`Error: ${err}`)

        global.isNew = false
        global.savePath = savePath
      })
    }
  }
})

/**
 * 
 */
ipcMain.on('saveArticle', (event, arg) => {

  // If the document has been saved before
  if (!global.isNew && typeof global.savePath != "undefined") {
    RAJE_FS.saveArticle(global.savePath, arg.document, (err, res) => {
      if(err) return console.log(err)
    })
  }
})


/**
 * This method is used to select the image to import in the document
 * 
 * When the image is selected it's saved inside the image temporary folder 
 * (which is deleted when the app is closed)
 */
ipcMain.on('selectImageSync', (event, arg) => {

  // Show the open dialog with options
  let imagePath = dialog.showOpenDialog({
    filters: [{
      name: 'Images',
      extensions: ['jpg', 'png']
    }]
  })

  // If a file is selected
  if (imagePath[0]) {

    // Save the image in the temporary folder
    RAJE_FS.saveImageTemp(imagePath[0], (err, result) => {

      if (err) return event.returnValue = err

      return event.returnValue = result
    })
  } else
    return event.returnValue = null
})

/**
 * 
 */
ipcMain.on('updateDocumentState', (event, arg) => {
  global.hasChanged = arg
})

/**
 * Send a message to the renderer process
 * Start the save as process
 */
global.executeSaveAs = function () {
  windowManager.get(EDITOR_WINDOW).object.webContents.send('executeSaveAs')
}

/**
 * Send a message to the renderer process
 * Start the save process
 */
global.executeSave = function(){
  windowManager.get(EDITOR_WINDOW).object.webContents.send('executeSave')
}