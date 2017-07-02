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
const HEADER_SELECTOR = 'header.page-header.container.cgen.mceNonEditable'
const FIRST_HEADING = `${RAJE_SELECTOR}>section:first>h1:first`

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
    plugins: "raje_inlineFigure fullscreen link codesample raje_inlineCode raje_inlineQuote raje_section table image noneditable raje_figure raje_table raje_listing raje_formula raje_crossref raje_footnotes paste lists",

    // Remove menubar
    menubar: false,

    // Custom toolbar
    toolbar: 'undo redo bold italic link superscript subscript raje_inlineCode raje_inlineQuote raje_inlineFigure raje_crossref raje_footnotes | numlist bullist codesample blockquote raje_table raje_figure raje_listing raje_formula | raje_section',

    // Setup full screen on init
    setup: function (editor) {

      // Set fullscreen 
      editor.on('init', function (e) {

        editor.execCommand('mceFullScreen')

        // Move caret at the first h1 element of main section
        // Or right after heading
        tinymce.activeEditor.selection.setCursorLocation(tinymce.activeEditor.dom.select(FIRST_HEADING)[0], 0)
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

        // Move caret to first heading if is after or before not editable header
        if (selectedElement.is('p') && (selectedElement.next().is(HEADER_SELECTOR) || (selectedElement.prev().is(HEADER_SELECTOR) && tinymce.activeEditor.dom.select(FIRST_HEADING).length)))
          tinymce.activeEditor.selection.setCursorLocation(tinymce.activeEditor.dom.select(FIRST_HEADING)[0], 0)

        // If the current element isn't inside header, only in section this is permitted
        if (selectedElement.parents('section').length) {

          if (selectedElement.is('span#_mce_caret[data-mce-bogus]') || selectedElement.parent().is('span#_mce_caret[data-mce-bogus]')) {

            // Remove span normally created with bold
            if (selectedElement.parent().is('span#_mce_caret[data-mce-bogus]'))
              selectedElement = selectedElement.parent()

            let bm = tinymce.activeEditor.selection.getBookmark()
            selectedElement.replaceWith(selectedElement.html())
            tinymce.activeEditor.selection.moveToBookmark(bm)
          }
        }

      })

      // Update saved content on undo and redo events
      editor.on('Undo', function (e) {
        tinymce.triggerSave()
      })

      editor.on('Redo', function (e) {
        tinymce.triggerSave()
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
    table_toolbar: "tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",

    image_advtab: true,

    paste_block_drop: true,
  })
})

/**
 * Update content in the iframe, with the one stored by tinymce
 * And save/restore the selection
 */
function updateIframeFromSavedContent() {

  // Save the bookmark 
  let bookmark = tinymce.activeEditor.selection.getBookmark(2, true)

  // Update iframe content
  tinymce.activeEditor.setContent($('#raje_root').html())

  // Restore the bookmark 
  tinymce.activeEditor.selection.moveToBookmark(bookmark)
}

/**
 * Accept a js object that exists in frame
 * @param {*} element 
 */
function moveCaret(element, toStart) {
  tinymce.activeEditor.selection.select(element)
  tinymce.activeEditor.selection.collapse(toStart)
}

/**
 * Create custom into notification
 * @param {*} text 
 * @param {*} timeout 
 */
function notify(text, type, timeout) {

  // Display only one notification, blocking all others
  if (tinymce.activeEditor.notificationManager.getNotifications().length == 0) {

    let notify = {
      text: text,
      type: type ? type : 'info',
      timeout: timeout ? timeout : 1000
    }

    tinymce.activeEditor.notificationManager.open(notify)
  }
}

function scrollTo(elementSelector) {
  $(tinymce.activeEditor.getBody()).find(elementSelector).get(0).scrollIntoView();
}


function headingDimension() {
  $(`${SECTION_SELECTOR}>h1,${SECTION_SELECTOR}>h2,${SECTION_SELECTOR}>h3,${SECTION_SELECTOR}>h4,${SECTION_SELECTOR}>h5,${SECTION_SELECTOR}>h6`).each(function () {
    var counter = 0;
    $(this).parents("section").each(function () {
      if ($(this).children("h1,h2,h3,h4,h5,h6").length > 0) {
        counter++;
      }
    });
    $(this).replaceWith("<h" + counter + ">" + $(this).html() + "</h" + counter + ">")
  });
}