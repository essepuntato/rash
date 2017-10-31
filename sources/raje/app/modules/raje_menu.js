const RAJE_STORAGE = require('./raje_storage.js')

/**
 * 
 */
module.exports = {

  /**
   * 
   */
  getEditorMenu: function () {
    const template = [
      this.getTabArticle(),
      this.getTabView(),
      this.getTabEdit(),
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
  getTabArticle: function (canSave) {
    return {
      label: 'Article',
      submenu: [{
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          global.newArticle()
        }
      }, {
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O',
        click: () => {

        }
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
      label: 'Article',
      submenu: [{
        label: 'New',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          global.newArticle()
        }
      }, {
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          global.openArticle()
        }
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

    /*
    // Get recent articles
    let recentArticles = RAJE_STORAGE.getRecentArticlesSync()
    let dropdownEntry = {
      label: 'Recent articles'
    }

    // if there are some
    if (recentArticles.length > 0) {

      let tmp = []
      recentArticles.forEach(function (recentArticle) {
        tmp.push(recentArticle.path)
      })

      dropdownEntry.submenu = tmp
    } 
    
    // If there aren't 
    else
      dropdownEntry.enabled = false

    // Add the entry to the template
    template.push(dropdownEntry)
    */
    return template

  }
}