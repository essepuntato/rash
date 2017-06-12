/**
 * 
 * Initilize TinyMCE editor with all required options
 */

// TinyMCE DomQuery variable
let dom = tinymce.dom.DomQuery

// Invisible space constant
const ZERO_SPACE = '&#8203;'
const RAJE_SELECTOR = 'body#tinymce'

const DISABLE_SELECTOR_FIGURES = 'figure *, h1, h2, h3, h4, h5, h6'

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
    content_css: ['css/bootstrap.min.css', 'css/rash.css', 'css/rajemce.css'],

    // Set plugins
    plugins: "fullscreen link codesample raje_inlineCode raje_inlineQuote raje_section table image noneditable raje_figure raje_table raje_listing raje_formula paste",

    // Remove menubar
    menubar: false,

    // Custom toolbar
    toolbar: 'undo redo bold italic link superscript subscript raje_inlineCode raje_inlineQuote | codesample blockquote raje_table raje_figure raje_listing raje_formula | raje_section',

    // Setup full screen on init
    setup: function (editor) {

      // Set fullscreen 
      editor.on('init', function (e) {

        editor.execCommand('mceFullScreen')
      })

      editor.on('keyDown', function (e) {

        // Prevent shift+enter
        if (e.keyCode == 13 && e.shiftKey) {
          e.preventDefault()
        }
      })

      // Prevent span 
      editor.on('nodeChange', function (e) {

        let selectedElement = $(tinymce.activeEditor.selection.getNode())

        // If the current element isn't inside header, only in section this is permitted
        if (selectedElement.parents('section').length) {

          if (selectedElement.is('span'))
            selectedElement.replaceWith(selectedElement.text())

          if (selectedElement.find('span').length)
            selectedElement.find('span').replaceWith(selectedElement.find('span').text())
        }
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

    // Prevent non editable object resize
    object_resizing: false,

    // Update the table popover layout
    table_toolbar: "tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",

    image_advtab: true,
    
    paste_block_drop: true
  })
})

// Update content in the iframe, with the hidden content saved
function updateIframeFromSavedContent() {
  tinyMCE.activeEditor.setContent($('#raje_root').html())
}

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