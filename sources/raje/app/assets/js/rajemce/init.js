/**
 * 
 * Initilize TinyMCE editor with all required options
 */

// Invisible space constant
const ZERO_SPACE = '&#8203;'
const RAJE_SELECTOR = 'body#tinymce'

const DISABLE_SELECTOR_FIGURES = 'figure *, h1, h2, h3, h4, h5, h6'
const HEADER_SELECTOR = 'header.page-header.container.cgen'
const FIRST_HEADING = `${RAJE_SELECTOR}>section:first>h1:first`


const BULLET_LIST_TITLE = 'Bullet list'
const NUMBERED_LIST_TITLE = 'Numbered list'
const BLOCKQUOTE_TITLE = 'Blockquote'

const {
  ipcRenderer,
  webFrame
} = require('electron')

$(window).load(function () {

  // If there are some tinymce elements after its initialisation
  // Process the rendered2storedRASH algorithm
  // In order to render it correctly
  if ($('div[id^=mceu_').length) {
    rendered2SavedRASH()
    rash()
  }


  //hide footer
  $('footer.footer').hide()

  //attach whole body inside a placeholder div
  $('body').html(`<div id="raje_root">${$('body').html()}</div>`)

  setNonEditableHeader()

  tinymce.init({

    // Select the element to wrap
    selector: '#raje_root',

    // Set the styles of the content wrapped inside the element
    content_css: ['css/bootstrap.min.css', 'css/rash.css', 'css/rajemce.css'],

    // Set plugins
    plugins: "raje_inlineFigure fullscreen link codesample raje_inlineCode raje_inlineQuote raje_section table image noneditable raje_image raje_codeblock raje_table raje_listing raje_inline_formula raje_formula raje_crossref raje_footnotes raje_metadata paste lists raje_save",

    // Remove menubar
    menubar: false,

    // Custom toolbar
    toolbar: 'undo redo bold italic link superscript subscript raje_inlineCode raje_inlineQuote raje_inline_formula raje_crossref raje_footnotes | numlist bullist raje_codeblock blockquote raje_table raje_image raje_listing raje_formula | raje_section raje_metadata raje_save',

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

    extended_valid_elements: "svg[*],defs[*],pattern[*],desc[*],metadata[*],g[*],mask[*],path[*],line[*],marker[*],rect[*],circle[*],ellipse[*],polygon[*],polyline[*],linearGradient[*],radialGradient[*],stop[*],image[*],view[*],text[*],textPath[*],title[*],tspan[*],glyph[*],symbol[*],switch[*],use[*]",

    formula: {
      path: 'node_modules/tinymce-formula/'
    },

    cleanup_on_startup: false,
    trim_span_elements: false,
    verify_html: false,
    cleanup: false,
    convert_urls: false,

    save_enablewhendirty: true,
    save_onsavecallback: function () {
      console.log('Saved');
    }
  })

  // Open and close menu headings Näive way
  $(`div[aria-label='heading']`).find('button').trigger('click')
  $(`div[aria-label='heading']`).find('button').trigger('click')

  // Add edit button
  // $('header.cgen').append(`<div style="visibility:hidden" id="btnEditHeader">Edit</div>`)
  // updateIframeFromSavedContent()
  markTinyMCE()
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

function moveCursorToEnd(element) {

  let heading = element
  let offset = 0

  if (heading.contents().length) {

    heading = heading.contents().last()

    // If the last node is a strong,em,q etc. we have to take its text 
    if (heading[0].nodeType != 3)
      heading = heading.contents().last()

    offset = heading[0].wholeText.length
  }

  tinymce.activeEditor.focus()
  tinymce.activeEditor.selection.setCursorLocation(heading[0], offset)
}

function moveCursorToStart(element) {

  let heading = element
  let offset = 0

  tinymce.activeEditor.focus()
  tinymce.activeEditor.selection.setCursorLocation(heading[0], offset)
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

/**
 * 
 */
function getSuccessiveElementId(elementSelector, SUFFIX) {

  let lastId = 0

  $(elementSelector).each(function () {
    let currentId = parseInt($(this).attr('id').replace(SUFFIX, ''))
    lastId = currentId > lastId ? currentId : lastId
  })

  return `${SUFFIX}${lastId+1}`
}


function headingDimension() {
  $('h1,h2,h3,h4,h5,h6').each(function () {

    if (!$(this).parents(HEADER_SELECTOR).length) {
      var counter = 0;
      $(this).parents("section").each(function () {
        if ($(this).children("h1,h2,h3,h4,h5,h6").length > 0) {
          counter++;
        }
      });
      $(this).replaceWith("<h" + counter + ">" + $(this).html() + "</h" + counter + ">")
    }
  });
}

/**
 * 
 */
function markTinyMCE() {
  $('div[id^=mceu_]').attr('data-rash-original-content', '')
}

/**
 * 
 */
function removeTinyMCE() {
  $('*[data-rash-original-content]').each(function () {
    $(this).replaceWith($(this).attr('data-rash-original-content'))
  })

  $('body').html($('#raje_root').html())
}

function rendered2SavedRASH() {
  markTinyMCE()
  removeTinyMCE()
}

function setNonEditableHeader() {
  $(HEADER_SELECTOR).addClass('mceNonEditable')
}

// Electron app methods

let IS_APP

try {

  loadRequiredScript()

  IS_APP = checkIfApp()
} catch (exception) {
  console.log(exception)
  IS_APP = false
}

console.log(IS_APP)

/**
 * 
 */
function checkIfApp() {
  return ipcRenderer.sendSync('isAppSync')
}

/**
 * 
 */
function loadRequiredScript() {

  if (IS_APP) {

    var requiredScript = document.createElement("script");

    requiredScript.innerHTML = `window.$ = window.jQuery = require(__dirname + '/js/jquery.min.js');`;

    document.head.appendChild(requiredScript);
  }
}

/**
 * 
 */
function saveDocument(options) {
  return ipcRenderer.sendSync('saveDocumentSync', options)
}