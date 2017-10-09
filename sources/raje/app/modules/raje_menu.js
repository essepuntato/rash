/**
 * 
 */
module.exports = {

  /**
   * 
   */
  getEditorMenu: function (canSave) {
    const template = [
      this.getTabFile(canSave),
      this.getTabView(),
      this.getTabHelp()
    ]

    if (process.platform === 'darwin') {
      template.unshift({
        label: 'RAJE',
        submenu: [{
            role: 'about'
          },
          {
            type: 'separator'
          },
          {
            role: 'services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            role: 'hide'
          },
          {
            role: 'hideothers'
          },
          {
            role: 'unhide'
          },
          {
            type: 'separator'
          },
          {
            role: 'quit'
          }
        ]
      })
    }

    return template
  },

  /**
   * 
   */
  getTabFile: function (canSave) {
    return {
      label: 'File',
      submenu: [{
        label: 'New',
        enabled: false
      }, {
        label: 'Open...',
        enabled: false
      }, {
        label: 'Recents',
        enabled: false,
        submenu: [{
          label: 'rencent'
        }]
      }, {
        type: 'separator'
      }, {
        label: 'Save as...',
        accelerator: 'CmdOrCtrl+Shift+S',
        click: () => {
          global.executeSaveAs()
        }
      }, {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        enabled: canSave,
        click: () => {
          global.executeSave()
        }
      }, {
        label: 'Close',
        role: 'close'
      }]
    }
  },

  /**
   * 
   */
  getTabView: function () {
    return {
      label: 'View',
      submenu: [{
          role: 'reload'
        },
        {
          role: 'forcereload'
        },
        {
          role: 'toggledevtools'
        },
        {
          type: 'separator'
        },
        {
          role: 'resetzoom'
        },
        {
          role: 'zoomin'
        },
        {
          role: 'zoomout'
        },
        {
          type: 'separator'
        },
        {
          role: 'togglefullscreen'
        }
      ]
    }
  },

  /**
   * 
   */
  getTabEdit: function () {
    return {
      label: 'Edit',
      submenu: [{
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'pasteandmatchstyle'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        }
      ]
    }
  },

  /**
   * 
   */
  getTabHelp: function () {
    return {
      role: 'help',
      submenu: [{
        label: 'Learn More',
        click() {
          require('electron').shell.openExternal('https://electron.atom.io')
        }
      }]
    }
  },

  /**
   * 
   */
  getSplashMenu: function () {
    const template = [{
      label: 'File',
      submenu: [{
        label: 'Create new '
      }, {
        label: 'Open local ...'
      }, {
        label: 'Import from Github ...'
      }]
    }]

    if (process.platform === 'darwin') {
      template.unshift({
        label: 'RAJE',
        submenu: [{
            role: 'about'
          },
          {
            type: 'separator'
          },
          {
            role: 'services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            role: 'hide'
          },
          {
            role: 'hideothers'
          },
          {
            role: 'unhide'
          },
          {
            type: 'separator'
          },
          {
            role: 'quit'
          }
        ]
      })
    }

    return template
  }
}