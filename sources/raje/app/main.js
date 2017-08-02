const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const url = require('url')
const path = require('path')

const TEMPLATE = 'template.html'

let editorWindow

// Event called when the app is ready
app.on('ready', createWindow)

function createWindow() {

  // Init browser window
  editorWindow = new BrowserWindow({})

  // Load HTML page
  editorWindow.loadURL(url.format({
    pathname: path.join(__dirname, TEMPLATE),
    protocol: 'file:',
    slashes: true
  }))

  // Maximize page
  editorWindow.maximize()
}