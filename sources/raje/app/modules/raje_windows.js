module.exports = {

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
  openEditor: function (localRootPath, size) {

    global.hasChanged = false

    // Set the URL of the document
    let editorWindowUrl
    if (localRootPath) {

      // Remember that the document is already saved
      global.isNew = false
      global.savePath = localRootPath
      global.isWrapper = false

      // Get the URL to open the editor
      editorWindowUrl = url.format({
        pathname: path.join(localRootPath, TEMPLATE),
        protocol: 'file:',
        slashes: true
      })

    } else {

      // Remember that the document isn't saved yet
      global.isNew = true
      global.isWrapper = true

      editorWindowUrl = editorWindowUrl = url.format({
        pathname: path.join(__dirname, TEMPLATE),
        protocol: 'file:',
        slashes: true
      })
    }

    // Open the new window with the size given by the splash window
    windowManager.open(EDITOR_WINDOW, 'RAJE', editorWindowUrl, null, {
      width: size.width,
      height: size.height,
      resizable: true
    })

    // Update the app menu
    windows.updateEditorMenu(RAJE_MENU.getEditorMenu(!global.isNew))

    /**
     * Catch the close event
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
  },

  /**
   * 
   */
  updateEditorMenu: function (menu) {
    // Set the menu 
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
  }
}