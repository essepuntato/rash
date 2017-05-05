/**
 * 
 * Initilize TinyMCE editor with all required options
 */

// TinyMCE editor global reference
let Editor

const ZERO_SPACE = '&#8203;'

tinymce.init({

  // Select the element to wrap
  selector: '#raje_root',

  // Set the styles of the content wrapped inside the element
  content_css: ['css/bootstrap.min.css', 'css/rash.css'],

  // Set plugins
  plugins: "fullscreen link codesample inline_code",

  // Remove menubar
  menubar: false,

  // Custom toolbar
  toolbar: 'undo redo bold italic link codesample superscript subscript inline_code',

  // Setup full screen on init
  setup: function (editor) {

    // Setup global variable
    Editor = editor

    editor.on('init', function (e) {
      editor.execCommand('mceFullScreen');
    });

    // Intercept enter key press
    editor.on('KeyDown', function (e) {

      // Enter key press event
      if (e.keyCode == 13) {

        // inline code
        if (editor.selection.getNode().nodeName == 'CODE') {
          e.preventDefault()
          //Rajemce.inline.code.exit()
        }
      }
    });
  },

  // Set default target
  default_link_target: "_blank",

  // Prepend protocol if the link starts with www
  link_assume_external_targets: true,

  // Hide target list
  target_list: false,

  // Hide title
  link_title: false
});

$(document).ready(function () {
  //hide footer
  $('footer.footer').hide()

  //attach whole body inside a placeholder div
  $('body').html(`<div id="raje_root">${$('body').html()}</div>`)
})

/**
 * Inline code plugin RAJE
 */
tinymce.PluginManager.add('inline_code', function (editor, url) {

  // Add a button that opens a window
  editor.addButton('inline_code', {
    text: 'inline_code',
    icon: false,
    tooltip: 'Inline code',

    // Button behaviour
    onclick: function () {
      Rajemce.inline.code.insert()
    }
  });
});

/**
 * RajeMCE class
 * It contains every custom functions to attach to plugins
 */
Rajemce = {

  // Inline elements
  inline: {

    // Inline code functions
    code: {

      /**
       * Insert inline code element
       * It checks if the selection is collapsed, and add the right element
       */
      insert: function () {

        // Displayed text of the code
        let text = ZERO_SPACE

        // Check if the selection is collapsed
        if (!Editor.selection.isCollapsed())
          text = Editor.selection.getContent()

        // Insert the element with the right text
        Editor.execCommand('mceInsertContent', false, `<code>${text}</code>`)
      },

      exit: function () {

      }
    }
  }
}