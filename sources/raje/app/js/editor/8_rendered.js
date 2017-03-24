const { ipcRenderer, webFrame } = require('electron'),
  fs = require('fs')

/** Receive settings info (3) */
ipcRenderer.on('githubSettings', (event, args) => {

  window['settings'] = args
  updateGithubButton()
  console.log(settings)
})

ipcRenderer.on('addNewAuthor', (event, arg) => {

  rashEditor.header.addAuthor()
})

ipcRenderer.on('setRemoveAuthors', (event, arg) => {

  rashEditor.header.setRemoveAuthors()
})

ipcRenderer.on('unsetRemoveAuthors', (event, arg) => {

  rashEditor.header.unsetRemoveAuthors()
})

ipcRenderer.on('setReorganizeAuthors', (event, arg) => {

  rashEditor.header.setReorganizeAuthors()
})

ipcRenderer.on('unsetReorganizeAuthors', (event, arg) => {

  rashEditor.header.unsetReorganizeAuthors()
})

ipcRenderer.on('insertKeyword', (event) => {
  rashEditor.header.insertKeyword()
})

ipcRenderer.on('insertSubject', (event) => {
  rashEditor.header.insertSubject()
})

ipcRenderer.on('setPreviewMode', (event) => {

  $(rash_inline_selector).setNotEditable()
})

ipcRenderer.on('setEditorMode', (event) => {

  $(rash_inline_selector).setEditable()
})

ipcRenderer.on('doSavefromMain', (event, arg) => {

  if (arg)
    executeSaveSync()

  else
    executeSave()

})

ipcRenderer.on('updateMessageDealer', (event, arg) => {
  hideMessageDealer()
  showMessageDealer(arg.text, arg.style, arg.delay)
})

ipcRenderer.on('updateTitle', (event, title) => {
  updateTitle(title)
})

/** check if is connected */
function checkLogin() {
  return typeof window['settings'] !== 'undefined'
}

function checkSoftware() {
  return ipcRenderer.sendSync('isSoftware')
}
/** Do login */
function githubLogin() {
  ipcRenderer.send('doGithubOAuth')
}

/** Do logout */
function githubLogout() {
  ipcRenderer.send('githubLogout')
  window['settings'] = null
  updateGithubButton()
}

function executeSaveAsync() {
  ipcRenderer.send('doSave', execDerash())
}

function executeSaveSync() {

  //set edit_state and body content
  updateEditState()

  ipcRenderer.sendSync('githubSettings', execDerash())
  ipcRenderer.send('closeWindow')
}

function executePush(comment) {
  ipcRenderer.send('doPush', { 'comment': comment, 'article': execDerash() })
  showMessageDealer('Syncing repo', 'primary')
  fancyLoadingMessageDealer()
}

function sendWriteFigure(file) {
  ipcRenderer.sendSync('writeFigureSync', { 'name': file.name, 'path': file.path })
}

function sendWriteFigureFromUrl(url) {
  return ipcRenderer.sendSync('writeFigureFromUrlSync', { 'url': url })
}

function setEditState() {
  ipcRenderer.send('setEditState', edit_state)
}


window['settings'] = ipcRenderer.sendSync('getGithubSettingsSync')
console.log(settings)