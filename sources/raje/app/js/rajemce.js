/**
 * 
 * Initilize TinyMCE editor with all required options
 */
tinymce.init({

  // Select the element to wrap
  selector: '#raje_root',

  // Set the styles of the content wrapped inside the element
  content_css: ['css/bootstrap.min.css', 'css/rash.css'],

  // Set plugins
  plugins: "fullscreen link",

  // Remove menubar
  menubar: false,

  // Custom toolbar
  toolbar: 'undo redo bold italic link superscript subscript',

  // Setup full screen on init
  setup: function (editor) {
    editor.on('init', function (e) {
      editor.execCommand('mceFullScreen');
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