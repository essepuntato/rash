/**
 * Check if JQuery is defined
 * is not the user is opening the file with Electron
 */

let hasBackend = false

/**
 * Check if JQuery is imported, if not create the auxiliary script
 * If the script throw an exception, 
 * 
 * By default the app is tought as if it's opened with the browser
 */
try {

  /**
   * If this JQuery operation throw and exception, Jquery isn't imported.
   * So the project is opened with Electron.js
   */
  $('body').length

}

//The app is opened with Electron.js
catch (exception) {

  // Create the helper script 
  let requiredScript = document.createElement("script")
  requiredScript.innerHTML = `window.$ = window.jQuery = require(__dirname + '/js/jquery.min.js');`

  // Add the attribute used to remove the script
  requiredScript.setAttributeNode(document.createAttribute('data-rash-original-content'))
  document.head.appendChild(requiredScript);

  hasBackend = true
}

/**
 * Here the script try to call the backend to know if it exists
 */
try {

  // Init the ipcRenderer and ask for the existency of backend
  let ipcRenderer = require('electron').ipcRenderer
  hasbackend = ipcRenderer.sendSync('hasBackendSync')

} catch (exception) {

  hasBackend = false
}

$(document).ready(function () {
  if (hasBackend) {
    let thisScript = $('script[src="js/rajemce/init_rajemce.js"]')

    // Remove and re-add RASH
    $('script[src="js/rash.js"]').remove()
    //thisScript.after('<script src="js/rash.js"></script>')

    // Add TinyMCE in the right position
    thisScript.after('<script src="js/tinymce/tinymce.js" data-rash-original-content=""></script>')
    thisScript.after('<script src="js/rajemce/raje_core.js" data-rash-original-content=""></script>')

    // Add CSS stylesheets
    thisScript.after('<link rel="stylesheet" href="css/font-awesome.min.css" data-rash-original-content="">')
    thisScript.after('<link rel="stylesheet" href="css/rajemce.css" data-rash-original-content="">')
  }
})