/**
 * 
 * Initilize TinyMCE editor with all required options
 */

// TinyMCE DomQuery variable
let dom = tinymce.dom.DomQuery

// Invisible space constant
const ZERO_SPACE = '&#8203;'
const RAJE_SELECTOR = 'body#tinymce'
let flag = false

$(document).ready(function () {
  //hide footer
  $('footer.footer').hide()

  //attach whole body inside a placeholder div
  $('body').html(`<div id="raje_root">${$('body').html()}</div>`)

  $('header.page-header').addClass('mceNonEditable')

  tinymce.init({

    // Select the element to wrap
    selector: '#raje_root',

    // Set the styles of the content wrapped inside the element
    content_css: ['css/bootstrap.min.css', 'css/rash.css'],

    // Set plugins
    plugins: "fullscreen link codesample raje_inlineCode raje_inlineQuote raje_section table image noneditable raje_figure raje_table",

    // Remove menubar
    menubar: false,

    // Custom toolbar
    toolbar: 'undo redo bold italic link codesample superscript subscript raje_inlineCode raje_inlineQuote | blockquote table raje_table raje_figure image | raje_section',

    // Setup full screen on init
    setup: function (editor) {

      // Set fullscreen 
      editor.on('init', function (e) {

        editor.execCommand('mceFullScreen')
      })
    },

    // Set default target
    default_link_target: "_blank",

    // Prepend protocol if the link starts with www
    link_assume_external_targets: true,

    // Hide target list
    target_list: false,

    // Hide title
    link_title: false,

    // Set formats
    formats: {
      inline_code: {
        inline: 'code'
      },
      inline_quote: {
        inline: 'q'
      }
    },

    // Remove "powered by tinymce"
    branding: false,

    // Prevent auto br on element insert
    apply_source_formatting: false,

    image_dimensions: false,
    image_caption: true,
  });
})


jQuery.fn.extend({

  /**
   * 
   */
  headingDimension: function () {
    $(this).find('h1,h2,h3,h4,h5,h6').each(function () {
      var counter = 0;
      $(this).parents("section").each(function () {
        if ($(this).children("h1,h2,h3,h4,h5,h6").length > 0) {
          counter++;
        }
      });
      $(this).replaceWith("<h" + counter + ">" + $(this).html() + "</h" + counter + ">")
    });
  }
})