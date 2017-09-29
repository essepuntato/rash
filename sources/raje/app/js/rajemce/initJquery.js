/**
 * Check if JQuery is defined
 * is not the user is opening the file with Electron
 */

let IS_APP = false

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

  IS_APP = true
}