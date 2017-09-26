/**
 * Check if JQuery is defined
 * is not the user is opening the file with Electron
 */
try {
  $('body').length

} catch (exception) {

  // Create the helper script 
  let requiredScript = document.createElement("script")
  requiredScript.innerHTML = `window.$ = window.jQuery = require(__dirname + '/js/jquery.min.js');`

  // Add the attribute used to remove the script
  requiredScript.setAttributeNode(document.createAttribute('data-rash-original-content'))

  document.head.appendChild(requiredScript);
}