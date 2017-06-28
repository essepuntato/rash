const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const { systemPreferences, ipcMain, Menu, globalShortcut, dialog, shell } = electron

const apiRequests = require('superagent')
const path = require('path')
const url = require('url')
const fs = require('fs')

const fsUtils = require('./main/fs_utils')
const storage = require('./main/storage')
const splash = require('./main/splash')

let mainWindow, authWindow, articleWindow, settings = {}
let edit_state

let removingAuthors = false, reorganizingAuthors = false

//storage.clear()

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 700,
    height: 450
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'template.html'),
    //pathname: path.join(__dirname, 'app', 'spinaci-rajedoc2016.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.maximize()

  //setSplashMenu()

  //fs.createReadStream('js/raje.js').pipe(fs.createWriteStream(`/Users/spino93/Desktop/test/js/raje.js`))
  //fs.createReadStream('js/rash.js').pipe(fs.createWriteStream(`/Users/spino93/Desktop/dummylol/js/rash.js`))
  //fs.createReadStream('css/rash-inline.css').pipe(fs.createWriteStream(`/Users/spino93/Desktop/test/css/rash-inline.css`))
  //fs.createReadStream('css/rash.css').pipe(fs.createWriteStream(`/Users/spino93/Desktop/spinaci-rajedoc2016/css/rash.css`))

  mainWindow.on('close', (event) => {

    //check if is modified
    if (edit_state) {

      event.preventDefault()

      //show save dialog
      dialog.showMessageBox({
        'type': 'warning',
        'buttons': [
          'Save changes',
          'Discard changes'
        ],
        'title': 'Save your changes',
        'message': 'You have some unsaved changes, do you really want to close this editor without saving?'
      }, (response) => {

        switch (response) {
          //case 0 => save 
          case 0:
            mainWindow.webContents.send('doSavefromMain', true)
            break

          case 1:
            edit_state = false
            mainWindow.close()
            break
        }
      })
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

ipcMain.on('closeWindow', (event, arg) => {
  if (mainWindow)
    mainWindow.close()
})

ipcMain.on('setEditState', (event, arg) => {
  edit_state = arg
})

ipcMain.on('isSoftware', (event) => {
  event.returnValue = true
})

// Get list of recent articles saved inside storage
ipcMain.on('getRecentArticles', (event, arg) => {
  storage.getRecentArticles((err, data) => {
    event.returnValue = data
  })
})

/** SPLASH FUNCTIONS */

// Initilize folder with the new given settings
ipcMain.on('createArticle', (event, newArticleSettings) => {

  if (splash.checkPath(newArticleSettings.path)) {
    let article = splash.initFolder(mainWindow, newArticleSettings)
    storage.pushRecentArticles(article)
    setEditorMenu()
    event.returnValue = false
  } else
    event.returnValue = "Error, the selected folder doesn't exists"
})

// Open the rticle inside the selected folder
ipcMain.on('openSelectedArticle', (event, article) => {
  splash.openEditorWindow(mainWindow, article.fullPath)
  storage.pushRecentArticles(article)
  setEditorMenu()
})

ipcMain.on('removeSelectedArticle', (event, article) => {
  storage.removeRecentArticle(article, (err) => {
    if (err) throw err
    event.returnValue = true
  })
})

ipcMain.on('selectDirectory', (event) => {
  folder = splash.selectFolder(mainWindow)

  if (folder) {
    let settingsContent = JSON.parse(fsUtils.getRajeSettingsContent(folder[0]))
    if (settingsContent) {
      splash.openEditorWindow(mainWindow, settingsContent.fullPath)
      storage.pushRecentArticles(settingsContent)
      setEditorMenu()
    }
  }
})

ipcMain.on('selectDirectorySync', (event) => {
  let folder = splash.selectFolder(mainWindow)

  if (!folder)
    event.returnValue = ""

  else
    event.returnValue = folder[0]
})


/** END SPLASH FUNCTIONS */

/** FS FUNCTIONS */

/**
 * When doSave is called, rewrite entirely the document ASYNC
 */
ipcMain.on('doSave', (event, articleBody) => {
  storage.getRecentArticles((err, recentArticles) => {
    fsUtils.writeArticleLocally(recentArticles[recentArticles.length - 1], articleBody)
  })
})

/**
 * When doSave is called, rewrite entirely the document SYNC
 */
ipcMain.on('doSaveSync', (event, articleBody) => {
  storage.getRecentArticles((err, recentArticles) => {
    fsUtils.writeArticleLocally(recentArticles[recentArticles.length - 1], articleBody)
    event.returnValue = true
  })
})

/**
 * Write figure in sync way
 */
ipcMain.on('writeFigureSync', (event, image) => {
  storage.getRecentArticles((err, recentArticles) => {
    fsUtils.writeFigureSync(recentArticles[recentArticles.length - 1], image, (err) => {
      if (err) throw err
      event.returnValue = true
    })
  })
})

/**
 * Write figure in async way
 */
ipcMain.on('writeFigureFromUrlSync', (event, arg) => {
  storage.getRecentArticles((err, recentArticles) => {
    fsUtils.writeFigureFromUrlSync(recentArticles[recentArticles.length - 1], arg.url, (err, name) => {
      if (err) throw err
      event.returnValue = name
    })
  })
})

/** END FS FUNCTIONS */

/** GITHUB FUNCTIONS */

const github = require('octonode')
const githubOptions = {
  client_id: '7964cf9a6911b9794567',
  client_secret: 'c681e5caaa052917b4cb355372e01e62c1734d3d',
  scopes: ["user", "notifications", "public_repo"] // Scopes limit access for OAuth tokens.
}

let client

/** Do github OAuth (1) */
ipcMain.on('doGithubOAuth', (event, arg) => {

  // create oauth window
  createOAuthWindow()
})

/** Save githubsettings (6) */
ipcMain.on('doSaveGithubSettings', (event, arg) => {
  settings.user = arg
  saveSettingsToStorage()
})

/** Get githubsettings sync (7) */
ipcMain.on('getGithubSettingsSync', (event, arg) => {
  storage.getGithubSettings((err, settings) => {
    event.returnValue = settings
  })
})

ipcMain.on('githubLogout', (event) => {
  storage.removeGithubSettings((err) => {
    if (err) throw err

    setEditorMenu()
  })
})

ipcMain.on('doPush', (event, arg) => {

  storage.getRecentArticles((err, recentArticles) => {

    // write local file
    fsUtils.writeArticleLocally(recentArticles[recentArticles.length - 1], arg.article)

    //push online
    storage.getGithubSettings((err, githubSettings) => {
      if (err) throw err

      if (!client)
        client = github.client(githubSettings.token)

      storage.getRecentArticles((err, recentArticles) => {

        let currentArticle = recentArticles[recentArticles.length - 1]
        let repoFullName = `${githubSettings.login}/${currentArticle.title}`
        let ghrepo = client.repo(repoFullName)

        ghrepo.info((err, data) => {
          if (err && err.statusCode === 404)
            createInitRepository(repoFullName, { 'name': currentArticle.file, 'content': arg.article })

          else
            updateFile(currentArticle.file, arg.article, arg.comment)
        })
      })
    })
  })
})

/** TODO */
ipcMain.on('cloneDirectory', (event, arg) => {

  if (!client)
    client = github.client(settings.user.token)

  let ghrepo = client.repo(`${settings.user.login}/${settings.article.title}`)

  ghrepo.contents('', (err, res) => {
    if (err) throw err
    console.log(res)
  });
})

function updateFile(name, content, comment) {

  storage.getGithubSettings((err, githubSettings) => {

    if (!client)
      client = github.client(githubSettings.token)

    storage.getRecentArticles((err, recentArticles) => {

      let currentArticle = recentArticles[recentArticles.length - 1]
      let ghrepo = client.repo(`${githubSettings.login}/${currentArticle.title}`)

      ghrepo.contents(name, "master", (err, res) => {
        if (err) {

          if (err.code == 'ENOTFOUND')
            return mainWindow.webContents.send('updateMessageDealer', { text: 'ERROR, you are not connected.', style: 'error', delay: 2000 })

          else throw err
        }
        ghrepo.updateContents(name, comment, content, res.sha, (err, res) => {
          if (err) throw err
          mainWindow.webContents.send('updateMessageDealer', { text: 'Push complete', style: 'primary', delay: 1000 })
        })
      })
    })
  })
}

function checkIfEmpty(ghrepo, callback) {

  ghrepo.contents('', (err, res) => {
    if (err && err.statusCode === 404)
      callback(true)
    else
      ret(false)
  });
}

function createInitRepository(repoFullName, article) {

  storage.getGithubSettings((err, githubSettings) => {
    if (err) throw err

    if (!client)
      client = github.client(githubSettings.token)

    var ghme = client.me()

    storage.getRecentArticles((err, recentArticles) => {

      let currentArticle = recentArticles[recentArticles.length - 1]

      ghme.repo({
        "name": currentArticle.title,
        "description": 'RAje | initilize RASH article',
      }, (err, res) => {
        if (err) throw err

        let readAndPushFolder = function (folderName, callback) {

          let returnValue = {}

          let path = `${currentArticle.folderPath}/${folderName}`
          let files = fs.readdirSync(path)

          pushDir(files, path, folderName, (err) => {
            if (err) return callback(err)

            return callback()
          })
        }

        let pushDir = function (collection, path, folder, callback) {

          let coll = collection.slice(0)

          let ret = function () {
            if (coll.length == 0)
              callback()
            else
              pushFile()
          }

          let pushFile = function () {
            var file = coll.splice(0, 1)[0]

            if (fs.lstatSync(`${path}/${file}`).isFile()) {

              let content = fs.readFileSync(`${path}/${file}`, 'utf8')

              createFile(`${folder}/${file}`, content, (err) => {
                if (err) console.log(err)//return callback(err)
                ret()
              })
            }

            else
              ret()
          }
          pushFile()
        }

        let createFile = function (file, content, callback) {
          ghrepo.createContents(file, `Uploaded ${file}`, content, (err, res) => {
            if (err) return callback(err)
            return callback()
          })
        }

        //initialize and push files
        ghrepo = client.repo(repoFullName)

        /** Read and push js */
        readAndPushFolder('js', (err) => {
          readAndPushFolder('css', (err) => {
            readAndPushFolder('fonts', (err) => {
              readAndPushFolder('js/libs', (err) => {
                createFile(article.name, article.content, (err) => {
                  mainWindow.webContents.send('updateMessageDealer', { text: 'Syncing complete', style: 'success', delay: 2000 })
                })
              })
            })
          })
        })

      })
    })
  })
}

function createOAuthWindow() {

  authWindow = new BrowserWindow({
    width: 800, height: 600, show: false, webPreferences: {
      nodeIntegration: false
    }
  })
  authWindow.loadURL(`https://github.com/login/oauth/authorize?client_id=${githubOptions.client_id}&scope=${githubOptions.scopes}`)
  authWindow.show()

  authWindow.webContents.on('will-navigate', function (event, url) {
    handleCallback(url)
  })

  authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
    handleCallback(newUrl)
  })

  authWindow.on('close', function () {
    authWindow = null;
  }, false)
}

/** Get github token (2) */
function handleCallback(url) {
  var raw_code = /code=([^&]*)/.exec(url) || null
  var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null
  var error = /\?error=(.+)$/.exec(url)

  if (code || error) {
    // Close the browser if code found or error
    authWindow.destroy()
  }

  // If there is a code, proceed to get token from github
  if (code) {
    requestGithubToken(githubOptions, code)
  } else if (error) {
    alert('Oops! Something went wrong and we couldn\'t' +
      'log you in using Github. Please try again.')
  }
}

function requestGithubToken(githubOptions, code) {

  apiRequests
    .post('https://github.com/login/oauth/access_token', {
      client_id: githubOptions.client_id,
      client_secret: githubOptions.client_secret,
      code: code,
    })
    .end(function (err, response) {
      if (response && response.ok) {

        /** Save github token to settings */
        storage.setGithubSettings({ 'token': response.body.access_token }, (err) => {
          if (err) throw err
          getUserInfo()
        })

      } else {
        // Error - Show messages.
        console.log(err)
      }
    })
}

function getUserInfo() {

  storage.getGithubSettings((err, settings) => {

    client = github.client(settings.token)
    client.me().info((err, res) => {
      if (err) throw err

      /** Save avatar and user login */
      settings.avatar = res.avatar_url
      settings.login = res.login

      mainWindow.webContents.send('githubSettings', settings)

      setEditorMenu()

      storage.setGithubSettings(settings, (err) => {
        if (err) throw err
      })
    })
  })
}

/** END Github functions */

/** Menu */

function updateMenu(template) {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function setSplashMenu() {
  let template = [menuUtils.File]
  if (process.platform === 'darwin')
    template.unshift(menuUtils.MacOSX)

  updateMenu(template)
}

function setEditorMenu() {
  chooseGithub((err, menu) => {
    if (err) throw err

    let template = [menuUtils.File, menuUtils.Edit, menuUtils.RASH, menu, menuUtils.Help]
    if (process.platform === 'darwin') {
      systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true)
      systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true)
      template.unshift(menuUtils.MacOSX)
    }

    updateMenu(template)
  })

}

function chooseGithub(callback) {
  storage.getGithubSettings((err, data) => {
    if (err)
      return callback(err)

    if (data && data.token) {
      let menu = menuUtils.GithubLogin

      storage.getGithubSettings((err, github) => {
        storage.getRecentArticles((err, recentArticles) => {

          let currentArticle = recentArticles[recentArticles.length - 1]
          /** set show repositoy button */
          menu.submenu[1].click = function () { shell.openExternal(`https://github.com/${github.login}/${currentArticle.title}`) }
          menu.submenu[2].click = function () { shell.openExternal(`https://rawgit.com/${github.login}/${currentArticle.title}/master/${currentArticle.file}`) }
          return callback(null, menuUtils.GithubLogin)
        })
      })
    }

    return callback(null, menuUtils.GithubNoLogin)
  })
}

const menuUtils = {
  File: {
    label: 'File',
    submenu: [
      {
        label: 'New Article',
        enabled: false,
      },
      {
        label: 'Open Article...',
        enabled: false,
      },
      {
        label: 'Open Recent',
        enabled: false,
      },
      {
        label: 'Save',
        accelerator: 'CommandOrControl+S',
        click() {
          mainWindow.webContents.send('doSavefromMain')
        }
      },
      {
        label: 'Export As',
        enabled: false,
      }
    ]
  },
  Edit: {
    label: 'Edit',
    submenu: [
      {
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
        type: 'separator'
      }
    ]
  },
  RASH: {
    label: 'RASH',
    submenu: [
      {
        label: 'Editor mode',
        click() {
          mainWindow.webContents.send('setEditorMode')
        },
        enabled: false
      },
      {
        label: 'Preview mode',
        click() {
          mainWindow.webContents.send('setPreviewMode')
        },
        enabled: false
      },
      {
        type: 'separator'
      },
      {
        label: 'Insert Title',
        click() { }
      },
      {
        label: 'Insert Author',
        click() { mainWindow.webContents.send('addNewAuthor') }
      },
      {
        label: 'Insert ACM Subject Category',
        click() {
          mainWindow.webContents.send('insertSubject')
        }
      },
      {
        label: 'Insert Keyword',
        click() {
          mainWindow.webContents.send('insertKeyword')
        }
      },
      {
        label: 'Toggle Change Authors Position',
        click() {
          if (reorganizingAuthors)
            mainWindow.webContents.send('unsetReorganizeAuthors')
          else
            mainWindow.webContents.send('setReorganizeAuthors')

          reorganizingAuthors = !reorganizingAuthors
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'reload'
      },
      {
        role: 'toggledevtools'
      }
    ]
  },
  GithubNoLogin: {
    label: 'Github',
    submenu: [
      {
        label: 'Login',
        click() { createOAuthWindow() }
      },
      {
        label: 'Push',
        enabled: false,
        click() { }
      },
      {
        label: 'Check for updates',
        enabled: false,
        click() { }
      },
      {
        type: 'separator'
      },
      {
        label: 'Logout',
        enabled: false,
        click() { }
      },
    ]
  },
  GithubLogin: {
    label: 'Github',
    submenu: [
      {
        label: 'Login',
        enabled: false
      },
      {
        label: 'Show repository'
      },
      {
        label: 'Show Rawgit URL'
      },
      {
        label: 'Push',
        click() { }
      },
      {
        label: 'Check for updates',
        enabled: false,
        click() { }
      },
      {
        type: 'separator'
      },
      {
        label: 'Logout',
        click() { }
      },
    ]
  },
  Help: {
    label: 'Help',
    submenu: []
  },
  MacOSX: {
    label: app.name,
    submenu: [
      {
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
  }
}
/** END Menu */