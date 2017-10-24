const { dialog, webFrame } = require('electron')
const fs = require('fs')
//const SpellCheckProvider = require('electron-spell-check-provider');

module.exports = {

  selectFolder: function (mainWindow) {
    return dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
  },

  /** 
   * Initilize new article creating the folder and all required assets
   * */
  initFolder: function (mainWindow, settings) {

    settings.title = settings.title.replace(/\s\s+/g, ' ')
    settings.title = settings.title.replace(' ', '_')

    let folderPath = `${settings.path}/${settings.title}`
    let articlePath = `${folderPath}/${settings.title}.html`
    let toSaveSettings = {
      'title': settings.title,
      'file': `${settings.title}.html`,
      'folderPath': folderPath,
      'fullPath': `${folderPath}/${settings.title}.html`
    }

    this.createFolder(folderPath)
    this.copyAssets(folderPath)
    this.replaceFile(articlePath)

    this.createSettingsFile(folderPath, toSaveSettings)
    this.openEditorWindow(mainWindow, toSaveSettings.fullPath, toSaveSettings.title)

    return toSaveSettings
  },

  openFolder: function (mainWindow, folder) {
    let hiddenSettingsPath = `${folder}/.raje`
    let articleSettings = JSON.parse(fs.readFileSync(hiddenSettingsPath))
    let articleName = articleSettings.file
    this.openEditorWindow(mainWindow, `${folder[0]}/${articleName}`)
    return articleSettings
  },

  createFolder: function (folderPath) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath)
    }
  },

  replaceFile: function (articlePath) {
    fs.createReadStream(`${__dirname}/../placeholder.html`).pipe(fs.createWriteStream(articlePath));
  },

  copyAssets: function (path) {

    this.copyAssetFolder('js', path)
    this.copyAssetFolder('css', path)
    this.copyAssetFolder('fonts', path)
    this.copyAssetFolder('js/libs', path)
  },

  copyAssetFolder: function (assetFolderName, folderPath) {

    fs.mkdir(`${folderPath}/${assetFolderName}`, (err) => {
      if (err) console.log(err)

      fs.readdirSync(`${__dirname}/../${assetFolderName}`).forEach((file) => {
        let fullFilePath = `${__dirname}/../${assetFolderName}/${file}`
        if (fs.lstatSync(fullFilePath).isFile())
          fs.createReadStream(fullFilePath).pipe(fs.createWriteStream(`${folderPath}/${assetFolderName}/${file}`))
      })
    })
  },

  openEditorWindow: function (mainWindow, articlePath, title) {
    mainWindow.loadURL(`file://${articlePath}`)
    mainWindow.maximize()
    //mainWindow.webContents.toggleDevTools()
    if (title)
      mainWindow.webContents.send('updateTitle', title)
  },

  createSettingsFile: function (folderPath, settings) {

    fs.writeFile(`${folderPath}/.raje`, JSON.stringify(settings), (err) => {
      if (err) throw err
    })
  },

  checkPath: function (path) {
    return fs.existsSync(path)
  }
}