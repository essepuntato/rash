/**
 * 
 */
module.exports = {

  /**
   * 
   */
  getEditorMenu: function () {
    const template = [

      // Edit
      {
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
      },

      // View
      {
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
      },

      // Window
      {
        role: 'window',
        submenu: [{
            role: 'minimize'
          },
          {
            role: 'close'
          }
        ]
      },

      // Help
      {
        role: 'help',
        submenu: [{
          label: 'Learn More',
          click() {
            require('electron').shell.openExternal('https://electron.atom.io')
          }
        }]
      }
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

      // Edit menu
      template[1].submenu.push({
        type: 'separator'
      }, {
        label: 'Speech',
        submenu: [{
            role: 'startspeaking'
          },
          {
            role: 'stopspeaking'
          }
        ]
      })

      // Window menu
      template[3].submenu = [{
          role: 'close'
        },
        {
          role: 'minimize'
        },
        {
          role: 'zoom'
        },
        {
          type: 'separator'
        },
        {
          role: 'front'
        }
      ]
    }

    return template
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