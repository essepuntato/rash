/**
 * 
 * Initilize TinyMCE editor with all required options
 */

// Invisible space constants
const ZERO_SPACE = '&#8203;'
const RAJE_SELECTOR = 'body#tinymce'

// Selector constants (to move inside a new const file)
const HEADER_SELECTOR = 'header.page-header.container.cgen'
const FIRST_HEADING = `${RAJE_SELECTOR}>section:first>h1:first`

const TINYMCE_TOOLBAR_HEIGTH = 76

let ipcRenderer, webFrame

if (hasBackend) {

  ipcRenderer = require('electron').ipcRenderer
  webFrame = require('electron').webFrame
  
  /**
   * Initilise TinyMCE 
   */
  $(document).ready(function () {

    // Override the margin botton given by RASH for the footer
    $('body').css({
      'margin-bottom': 0
    })

    //hide footer
    $('footer.footer').hide()

    //attach whole body inside a placeholder div
    $('body').html(`<div id="raje_root">${$('body').html()}</div>`)

    // 
    setNonEditableHeader()

    tinymce.init({

      // Select the element to wrap
      selector: '#raje_root',

      // Set window size
      height: window.innerHeight - TINYMCE_TOOLBAR_HEIGTH,

      // Set the styles of the content wrapped inside the element
      content_css: ['css/bootstrap.min.css', 'css/rash.css', 'css/rajemce.css'],

      // Set plugins
      plugins: "raje_inlineFigure fullscreen link codesample raje_inlineCode raje_inlineQuote raje_section table image noneditable raje_image raje_codeblock raje_table raje_listing raje_inline_formula raje_formula raje_crossref raje_footnotes raje_metadata paste raje_lists raje_save",

      // Remove menubar
      menubar: false,

      // Custom toolbar
      toolbar: 'undo redo bold italic link superscript subscript raje_inlineCode raje_inlineQuote raje_inline_formula raje_crossref raje_footnotes | raje_ol raje_ul raje_codeblock blockquote raje_table raje_image raje_listing raje_formula | raje_section raje_metadata raje_save',

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

          // Check if a change in the structure is made
          // Then notify the backend 
          if (tinymce.activeEditor.undoManager.hasUndo())
            updateDocumentState(true)
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
      convert_urls: false
    })
  })

  /**
   * Open and close the headings dropdown
   */
  $(window).load(function () {

    // Open and close menu headings Näive way
    $(`div[aria-label='heading']`).find('button').trigger('click')
    $(`div[aria-label='heading']`).find('button').trigger('click')
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

    tinymce.activeEditor.focus()
  }

  /**
   * 
   * @param {*} element 
   */
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

  /**
   * 
   * @param {*} element 
   */
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

  /**
   * 
   * @param {*} elementSelector 
   */
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

  /**
   * 
   */
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
  function setNonEditableHeader() {
    $(HEADER_SELECTOR).addClass('mceNonEditable')
  }

  /**
   * 
   */
  function checkIfApp() {
    return ipcRenderer.sendSync('isAppSync')
  }

  /**
   * 
   */
  function selectImage() {
    return ipcRenderer.sendSync('selectImageSync')
  }



  /**
   * Send a message to the backend, notify the structural change
   * 
   * If the document is draft state = true
   * If the document is saved state = false
   */
  function updateDocumentState(state) {
    return ipcRenderer.send('updateDocumentState', state)
  }

  /**
   * 
   */
  function saveAsArticle(options) {
    return ipcRenderer.send('saveAsArticle', options)
  }

  /**
   * 
   */
  function saveArticle(options) {
    return ipcRenderer.send('saveArticle', options)
  }

  /**
   * Start the save as process getting the data and sending it
   * to the main process
   */
  ipcRenderer.on('executeSaveAs', (event, data) => {
    saveManager.saveAs()
  })

  /**
   * Start the save process getting the data and sending it
   * to the main process
   */
  ipcRenderer.on('executeSave', (event, data) => {
    saveManager.save()
  })


  /**
   * 
   */
  ipcRenderer.on('notify', (event, data) => {
    notify(data.text, data.type, data.timeout)
  })
}
tinymce.PluginManager.add('raje_codeblock', function (editor, url) {})
tinymce.PluginManager.add('raje_crossref', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_crossref', {
    title: 'raje_crossref',
    icon: 'icon-anchor',
    tooltip: 'Cross-reference',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {

      tinymce.triggerSave()

      let referenceableList = {
        sections: crossref.getAllReferenceableSections(),
        tables: crossref.getAllReferenceableTables(),
        listings: crossref.getAllReferenceableListings(),
        formulas: crossref.getAllReferenceableFormulas(),
        references: crossref.getAllReferenceableReferences()
      }

      editor.windowManager.open({
          title: 'Cross-reference editor',
          url: 'js/rajemce/plugin/raje_crossref.html',
          width: 500,
          height: 800,
          onClose: function () {

            /**
             * 
             * This behaviour is called when user press "ADD NEW REFERENCE" 
             * button from the modal
             */
            if (tinymce.activeEditor.createNewReference) {

              tinymce.activeEditor.undoManager.transact(function () {

                // Get successive biblioentry id
                let id = getSuccessiveElementId(BIBLIOENTRY_SELECTOR, BIBLIOENTRY_SUFFIX)

                // Create the reference that points to the next id
                crossref.add(id)

                // Add the next biblioentry
                section.addBiblioentry(id)

                // Update the reference
                crossref.update()

                // Move caret to start of the new biblioentry element
                // Issue #105 Firefox + Chromium
                tinymce.activeEditor.selection.setCursorLocation($(tinymce.activeEditor.dom.get(id)).find('p')[0], false)
                scrollTo(`${BIBLIOENTRY_SELECTOR}#${id}`)
              })

              // Set variable null for successive usages
              tinymce.activeEditor.createNewReference = null
            }

            /**
             * This is called if a normal reference is selected from modal
             */
            else if (tinymce.activeEditor.reference) {

              tinymce.activeEditor.undoManager.transact(function () {

                // Create the empty anchor and update its content
                crossref.add(tinymce.activeEditor.reference)
                crossref.update()

                let selectedNode = $(tinymce.activeEditor.selection.getNode())

                // This select the last element (last by order) and collapse the selection after the node
                // #105 Firefox + Chromium
                //tinymce.activeEditor.selection.setCursorLocation($(tinymce.activeEditor.dom.select(`a[href="#${tinymce.activeEditor.reference}"]:last-child`))[0], false)
              })

              // Set variable null for successive usages
              tinymce.activeEditor.reference = null
            }
          }
        },

        // List of all referenceable elements
        referenceableList)
    }
  })

  crossref = {
    getAllReferenceableSections: function () {

      let sections = []

      $('section').each(function () {

        let level = ''

        // Sections without role have :after
        if (!$(this).attr('role')) {

          // Save its deepness
          let parentSections = $(this).parentsUntil('div#raje_root')

          if (parentSections.length) {

            // Iterate its parents backwards (higer first)
            for (let i = parentSections.length; i--; i > 0) {
              let section = $(parentSections[i])
              level += `${section.parent().children(SECTION_SELECTOR).index(section)+1}.`
            }
          }

          // Current index
          level += `${$(this).parent().children(SECTION_SELECTOR).index($(this))+1}.`
        }

        sections.push({
          reference: $(this).attr('id'),
          text: $(this).find(':header').first().text(),
          level: level
        })
      })

      return sections
    },

    getAllReferenceableTables: function () {
      let tables = []

      $('figure:has(table)').each(function () {
        tables.push({
          reference: $(this).attr('id'),
          text: $(this).find('figcaption').text()
        })
      })

      return tables
    },

    getAllReferenceableListings: function () {
      let listings = []

      $('figure:has(pre:has(code))').each(function () {
        listings.push({
          reference: $(this).attr('id'),
          text: $(this).find('figcaption').text()
        })
      })

      return listings
    },

    getAllReferenceableFormulas: function () {
      let formulas = []

      $(formulabox_selector).each(function () {

        formulas.push({
          reference: $(this).parents(FIGURE_SELECTOR).attr('id'),
          text: `Formula ${$(this).parents(FIGURE_SELECTOR).find('span.cgen').text()}`
        })
      })

      return formulas
    },

    getAllReferenceableReferences: function () {
      let references = []

      $('section[role=doc-bibliography] li').each(function () {
        references.push({
          reference: $(this).attr('id'),
          text: $(this).text(),
          level: $(this).index() + 1
        })
      })

      return references
    },

    add: function (reference, next) {

      // Create the empty reference with a whitespace at the end
      tinymce.activeEditor.selection.setContent(`<a contenteditable="false" href="#${reference}">&nbsp;</a>&nbsp;`)
      tinymce.triggerSave()
    },

    update: function () {

      // Update the reference (in saved content)
      references()

      // Prevent adding of nested a as footnotes
      $('a>sup>a').each(function () {
        $(this).parent().html($(this).text())
      })

      // Update editor with the right references
      updateIframeFromSavedContent()
    }
  }
})

tinymce.PluginManager.add('raje_footnotes', function (editor, url) {

  editor.addButton('raje_footnotes', {
    title: 'raje_footnotes',
    icon: 'icon-asterisk',
    tooltip: 'Footnote',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {

      tinymce.activeEditor.undoManager.transact(function () {

        // Get successive biblioentry id
        let reference = getSuccessiveElementId(ENDNOTE_SELECTOR, ENDNOTE_SUFFIX)

        // Create the reference that points to the next id
        crossref.add(reference)

        // Add the next biblioentry
        section.addEndnote(reference)

        // Update the reference
        crossref.update()

        // Move caret at the end of p in last inserted endnote
        tinymce.activeEditor.selection.setCursorLocation(tinymce.activeEditor.dom.select(`${ENDNOTE_SELECTOR}#${reference}>p`)[0], 1)
      })
    }
  })
})

function references() {
  /* References */
  $("a[href]").each(function () {
    if ($.trim($(this).text()) == '') {
      var cur_id = $(this).attr("href");
      original_content = $(this).html()
      original_reference = cur_id
      referenced_element = $(cur_id);

      if (referenced_element.length > 0) {
        referenced_element_figure = referenced_element.find(
          figurebox_selector_img + "," + figurebox_selector_svg);
        referenced_element_table = referenced_element.find(tablebox_selector_table);
        referenced_element_formula = referenced_element.find(
          formulabox_selector_img + "," + formulabox_selector_span + "," + formulabox_selector_math + "," + formulabox_selector_svg);
        referenced_element_listing = referenced_element.find(listingbox_selector_pre);
        /* Special sections */
        if (
          $("section[role=doc-abstract]" + cur_id).length > 0 ||
          $("section[role=doc-bibliography]" + cur_id).length > 0 ||
          $("section[role=doc-endnotes]" + cur_id + ", section[role=doc-footnotes]" + cur_id).length > 0 ||
          $("section[role=doc-acknowledgements]" + cur_id).length > 0) {
          $(this).html("<span class=\"cgen\" contenteditable=\"false\"  data-rash-original-content=\"" + original_content +
            "\">Section <q>" + $(cur_id + " > h1").text() + "</q></span>");
          /* Bibliographic references */
        } else if ($(cur_id).parents("section[role=doc-bibliography]").length > 0) {
          var cur_count = $(cur_id).prevAll("li").length + 1;
          $(this).html("<span class=\"cgen\" contenteditable=\"false\" data-rash-original-content=\"" + original_content +
            "\" title=\"Bibliographic reference " + cur_count + ": " +
            $(cur_id).text().replace(/\s+/g, " ").trim() + "\">[" + cur_count + "]</span>");
          /* Footnote references (doc-footnotes and doc-footnote included for easing back compatibility) */
        } else if ($(cur_id).parents("section[role=doc-endnotes], section[role=doc-footnotes]").length > 0) {
          var cur_contents = $(this).parent().contents();
          var cur_index = cur_contents.index($(this));
          var prev_tmp = null;
          while (cur_index > 0 && !prev_tmp) {
            cur_prev = cur_contents[cur_index - 1];
            if (cur_prev.nodeType != 3 || $(cur_prev).text().replace(/ /g, '') != '') {
              prev_tmp = cur_prev;
            } else {
              cur_index--;
            }
          }
          var prev_el = $(prev_tmp);
          var current_id = $(this).attr("href");
          var footnote_element = $(current_id);
          if (footnote_element.length > 0 &&
            footnote_element.parent("section[role=doc-endnotes], section[role=doc-footnotes]").length > 0) {
            var count = $(current_id).prevAll("section").length + 1;
            if (prev_el.find("sup").hasClass("fn")) {
              $(this).before("<sup class=\"cgen\" contenteditable=\"false\" data-rash-original-content=\"\">,</sup>");
            }
            $(this).html("<sup class=\"fn cgen\" contenteditable=\"false\" data-rash-original-content=\"" + original_content + "\">" +
              "<a name=\"fn_pointer_" + current_id.replace("#", "") +
              "\" title=\"Footnote " + count + ": " +
              $(current_id).text().replace(/\s+/g, " ").trim() + "\">" + count + "</a></sup>");
          } else {
            $(this).html("<span class=\"error cgen\" contenteditable=\"false\" data-rash-original-content=\"" + original_content +
              "\">ERR: footnote '" + current_id.replace("#", "") + "' does not exist</span>");
          }
          /* Common sections */
        } else if ($("section" + cur_id).length > 0) {
          var cur_count = $(cur_id).findHierarchicalNumber(
            "section:not([role=doc-abstract]):not([role=doc-bibliography]):" +
            "not([role=doc-endnotes]):not([role=doc-footnotes]):not([role=doc-acknowledgements])");
          if (cur_count != null && cur_count != "") {
            $(this).html("<span class=\"cgen\" contenteditable=\"false\" data-rash-original-content=\"" + original_content +
              "\">Section " + cur_count + "</span>");
          }
          /* Reference to figure boxes */
        } else if (referenced_element_figure.length > 0) {
          var cur_count = referenced_element_figure.findNumber(figurebox_selector);
          if (cur_count != 0) {
            $(this).html("<span class=\"cgen\" contenteditable=\"false\" data-rash-original-content=\"" + original_content +
              "\">Figure " + cur_count + "</span>");
          }
          /* Reference to table boxes */
        } else if (referenced_element_table.length > 0) {
          var cur_count = referenced_element_table.findNumber(tablebox_selector);
          if (cur_count != 0) {
            $(this).html("<span class=\"cgen\" contenteditable=\"false\" data-rash-original-content=\"" + original_content +
              "\">Table " + cur_count + "</span>");
          }
          /* Reference to formula boxes */
        } else if (referenced_element_formula.length > 0) {
          var cur_count = referenced_element_formula.findNumber(formulabox_selector);
          if (cur_count != 0) {
            $(this).html("<span class=\"cgen\" contenteditable=\"false\" data-rash-original-content=\"" + original_content +
              "\">Formula " + cur_count + "</span>");
          }
          /* Reference to listing boxes */
        } else if (referenced_element_listing.length > 0) {
          var cur_count = referenced_element_listing.findNumber(listingbox_selector);
          if (cur_count != 0) {
            $(this).html("<span class=\"cgen\" contenteditable=\"false\" data-rash-original-content=\"" + original_content +
              "\">Listing " + cur_count + "</span>");
          }
        } else {
          $(this).html("<span class=\"error cgen\" contenteditable=\"false\" data-rash-original-content=\"" + original_content +
            "\">ERR: referenced element '" + cur_id.replace("#", "") +
            "' has not the correct type (it should be either a figure, a table, a formula, a listing, or a section)</span>");
        }
      } else {
        $(this).replaceWith("<span class=\"error cgen\" contenteditable=\"false\" data-rash-original-content=\"" + original_content +
          "\">ERR: referenced element '" + cur_id.replace("#", "") + "' does not exist</span>");
      }
    }
  });
  /* /END References */
}

function updateReferences() {

  if ($('span.cgen[data-rash-original-content]').length) {

    // Restore all saved content
    $('span.cgen[data-rash-original-content]').each(function () {

      // Save original content and reference
      let original_content = $(this).attr('data-rash-original-content')
      let original_reference = $(this).parent('a').attr('href')

      $(this).parent('a').replaceWith(`<a contenteditable="false" href="${original_reference}">${original_content}</a>`)
    })

    references()
  }
}
/**
 * This script contains all figure box available with RASH.
 * 
 * plugins:
 *  raje_table
 *  raje_figure
 *  raje_formula
 *  raje_listing
 */
const DISABLE_SELECTOR_FIGURES = 'figure *, h1, h2, h3, h4, h5, h6'

const FIGURE_SELECTOR = 'figure[id]'

const FIGURE_TABLE_SELECTOR = `${FIGURE_SELECTOR}:has(table)`
const TABLE_SUFFIX = 'table_'

const FIGURE_IMAGE_SELECTOR = `${FIGURE_SELECTOR}:has(img:not([role=math]))`
const IMAGE_SUFFIX = 'img_'

const FIGURE_FORMULA_SELECTOR = `${FIGURE_SELECTOR}:has(svg[role=math])`
const INLINE_FORMULA_SELECTOR = `span:has(svg[role=math])`
const FORMULA_SUFFIX = 'formula_'

const FIGURE_LISTING_SELECTOR = `${FIGURE_SELECTOR}:has(pre:has(code))`
const LISTING_SUFFIX = 'listing_'

let remove_listing = 0

/**
 * Raje_table
 */
tinymce.PluginManager.add('raje_table', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_table', {
    title: 'raje_table',
    icon: 'icon-table',
    tooltip: 'Table',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {

      // On click a dialog is opened
      editor.windowManager.open({
        title: 'Select Table size',
        body: [{
          type: 'textbox',
          name: 'width',
          label: 'Columns'
        }, {
          type: 'textbox',
          name: 'heigth',
          label: 'Rows'
        }],
        onSubmit: function (e) {

          // Get width and heigth
          table.add(e.data.width, e.data.heigth)
        }
      })
    }
  })

  // Because some behaviours aren't accepted, RAJE must check selection and accept backspace, canc and enter press
  editor.on('keyDown', function (e) {

    // keyCode 8 is backspace, 46 is canc
    if (e.keyCode == 8)
      return handleFigureDelete(tinymce.activeEditor.selection)

    if (e.keyCode == 46)
      return handleFigureCanc(tinymce.activeEditor.selection)

    // Handle enter key in figcaption
    if (e.keyCode == 13)
      return handleFigureEnter(tinymce.activeEditor.selection)

    e.stopPropagation()
  })

  // Handle strange structural modification empty figures or with caption as first child
  editor.on('nodeChange', function (e) {
    handleFigureChange(tinymce.activeEditor.selection)
  })

  table = {

    /**
     * Add the new table (with given size) at the caret position
     */
    add: function (width, heigth) {

      // Get the reference of the current selected element
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      // Get the reference of the new created table
      let newTable = this.create(width, heigth, getSuccessiveElementId(FIGURE_TABLE_SELECTOR, TABLE_SUFFIX))

      // Begin atomic UNDO level 
      tinymce.activeEditor.undoManager.transact(function () {

        // Check if the selected element is not empty, and add table after
        if (selectedElement.text().trim().length != 0) {

          // If selection is at start of the selected element
          if (tinymce.activeEditor.selection.getRng().startOffset == 0)
            selectedElement.before(newTable)

          else
            selectedElement.after(newTable)
        }

        // If selected element is empty, replace it with the new table
        else
          selectedElement.replaceWith(newTable)

        // Save updates 
        tinymce.triggerSave()

        // Update all captions with RASH function
        captions()

        // Update Rendered RASH
        updateIframeFromSavedContent()
      })
    },

    /**
     * Create the new table using passed width and height
     */
    create: function (width, height, id) {

      // If width and heigth are positive
      try {
        if (width > 0 && height > 0) {

          // Create figure and table
          let figure = $(`<figure id="${id}"></figure>`)
          let table = $(`<table></table>`)

          // Populate with width & heigth
          for (let i = 0; i <= height; i++) {

            let row = $(`<tr></tr>`)
            for (let x = 0; x < width; x++) {

              if (i == 0)
                row.append(`<th>Heading cell ${x+1}</th>`)

              else
                row.append(`<td><p>Data cell ${x+1}</p></td>`)
            }

            table.append(row)
          }

          figure.append(table)
          figure.append(`<figcaption>Caption.</figcaption>`)

          return figure
        }
      } catch (e) {}
    }
  }
})

/**
 * Raje_figure
 */
tinymce.PluginManager.add('raje_image', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_image', {
    title: 'raje_image',
    icon: 'icon-image',
    tooltip: 'Image block',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {

      let filename = selectImage()

      image.add(filename, filename)
    }
  })

  // Because some behaviours aren't accepted, RAJE must check selection and accept backspace, canc and enter press
  editor.on('keyDown', function (e) {

    // keyCode 8 is backspace
    if (e.keyCode == 8)
      return handleFigureDelete(tinymce.activeEditor.selection)

    if (e.keyCode == 46)
      return handleFigureCanc(tinymce.activeEditor.selection)

    // Handle enter key in figcaption
    if (e.keyCode == 13)
      return handleFigureEnter(tinymce.activeEditor.selection)
  })

  image = {

    /**
     * 
     */
    add: function (url, alt) {

      // Get the referece of the selected element
      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let newFigure = this.create(url, alt, getSuccessiveElementId(FIGURE_IMAGE_SELECTOR, IMAGE_SUFFIX))

      // Begin atomic UNDO level 
      tinymce.activeEditor.undoManager.transact(function () {

        // Check if the selected element is not empty, and add table after
        if (selectedElement.text().trim().length != 0) {

          // If selection is at start of the selected element
          if (tinymce.activeEditor.selection.getRng().startOffset == 0)
            selectedElement.before(newFigure)

          else
            selectedElement.after(newFigure)
        }

        // If selected element is empty, replace it with the new table
        else
          selectedElement.replaceWith(newFigure)

        // Save updates 
        tinymce.triggerSave()

        // Update all captions with RASH function
        captions()

        // Update Rendered RASH
        updateIframeFromSavedContent()
      })
    },

    /**
     * 
     */
    create: function (url, alt, id) {
      return $(`<figure id="${id}"><p><img src="${url}" ${alt?'alt="'+alt+'"':''} /></p><figcaption>Caption.</figcaption></figure>`)
    }
  }
})

/**
 * Raje_formula
 */

function openFormulaEditor(formulaValue, callback) {
  tinymce.activeEditor.windowManager.open({
      title: 'Math formula editor',
      url: 'js/rajemce/plugin/raje_formula.html',
      width: 800,
      height: 500,
      onClose: function () {

        let output = tinymce.activeEditor.formula_output

        // If at least formula is written
        if (output != null) {

          // If has id, RAJE must update it
          if (output.formula_id)
            formula.update(output.formula_svg, output.formula_id)

          // Or add it normally
          else
            formula.add(output.formula_svg)

          // Set formula null
          tinymce.activeEditor.formula_output = null
        }

        tinymce.activeEditor.windowManager.close()
      }
    },
    formulaValue
  )
}

tinymce.PluginManager.add('raje_formula', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_formula', {
    text: 'raje_formula',
    icon: false,
    tooltip: 'Formula',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {
      openFormulaEditor()
    }
  })

  // Because some behaviours aren't accepted, RAJE must check selection and accept backspace, canc and enter press
  editor.on('keyDown', function (e) {

    // keyCode 8 is backspace
    if (e.keyCode == 8)
      return handleFigureDelete(tinymce.activeEditor.selection)

    if (e.keyCode == 46)
      return handleFigureCanc(tinymce.activeEditor.selection)

    // Handle enter key in figcaption
    if (e.keyCode == 13)
      return handleFigureEnter(tinymce.activeEditor.selection)
  })

  editor.on('click', function (e) {
    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    // Open formula editor clicking on math formulas
    if (selectedElement.parents(FIGURE_SELECTOR).length && selectedElement.children('svg[role=math]').length) {

      openFormulaEditor({
        formula_val: selectedElement.children('svg[role=math]').attr('data-math-original-input'),
        formula_id: selectedElement.parents(FIGURE_SELECTOR).attr('id')
      })
    }
  })

  formula = {
    /**
     * 
     */
    add: function (formula_svg) {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let newFormula = this.create(formula_svg, getSuccessiveElementId(`${FIGURE_FORMULA_SELECTOR},${INLINE_FORMULA_SELECTOR}`, FORMULA_SUFFIX))

      tinymce.activeEditor.undoManager.transact(function () {

        // Check if the selected element is not empty, and add table after
        if (selectedElement.text().trim().length != 0)
          selectedElement.after(newFormula)

        // If selected element is empty, replace it with the new table
        else
          selectedElement.replaceWith(newFormula)

        // Save updates 
        tinymce.triggerSave()

        captions()

        // Update Rendered RASH
        updateIframeFromSavedContent()
      })

    },

    /**
     * 
     */
    update: function (formula_svg, formula_id) {

      let selectedFigure = $(`#${formula_id}`)

      tinymce.activeEditor.undoManager.transact(function () {

        selectedFigure.find('svg').replaceWith(formula_svg)
        updateIframeFromSavedContent()
      })
    },

    /**
     * 
     */
    create: function (formula_svg, id) {
      //return `<figure id="${id}"><p><span role="math" contenteditable="false">\`\`${formula_input}\`\`</span></p></figure>`
      return `<figure id="${id}"><p><span contenteditable="false">${formula_svg[0].outerHTML}</span></p></figure>`
    }
  }
})

function openInlineFormulaEditor(formulaValue, callback) {
  tinymce.activeEditor.windowManager.open({
      title: 'Math formula editor',
      url: 'js/rajemce/plugin/raje_formula.html',
      width: 800,
      height: 500,
      onClose: function () {

        let output = tinymce.activeEditor.formula_output

        // If at least formula is written
        if (output != null) {

          // If has id, RAJE must update it
          if (output.formula_id)
            inline_formula.update(output.formula_svg, output.formula_id)

          // Or add it normally
          else
            inline_formula.add(output.formula_svg)

          // Set formula null
          tinymce.activeEditor.formula_output = null
        }

        tinymce.activeEditor.windowManager.close()
      }
    },
    formulaValue
  )
}

tinymce.PluginManager.add('raje_inline_formula', function (editor, url) {

  editor.addButton('raje_inline_formula', {
    text: 'raje_inline_formula',
    icon: false,
    tooltip: 'Inline formula',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {
      openInlineFormulaEditor()
    }
  })

  editor.on('click', function (e) {
    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    // Open formula editor clicking on math formulas
    if (selectedElement.children('svg[role=math]').length) {

      openInlineFormulaEditor({
        formula_val: selectedElement.children('svg[role=math]').attr('data-math-original-input'),
        formula_id: selectedElement.attr('id')
      })
    }
  })

  inline_formula = {
    /**
     * 
     */
    add: function (formula_svg) {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let newFormula = this.create(formula_svg, getSuccessiveElementId(`${FIGURE_FORMULA_SELECTOR},${INLINE_FORMULA_SELECTOR}`, FORMULA_SUFFIX))

      tinymce.activeEditor.undoManager.transact(function () {

        tinymce.activeEditor.selection.setContent(newFormula)

        // Save updates 
        tinymce.triggerSave()

        captions()

        // Update Rendered RASH
        updateIframeFromSavedContent()
      })

    },

    /**
     * 
     */
    update: function (formula_svg, formula_id) {

      let selectedFigure = $(`#${formula_id}`)

      tinymce.activeEditor.undoManager.transact(function () {

        selectedFigure.find('svg').replaceWith(formula_svg)
        updateIframeFromSavedContent()
      })
    },

    /**
     * 
     */
    create: function (formula_svg, id) {
      return `<span id="${id}" contenteditable="false">${formula_svg[0].outerHTML}</span>`
    }
  }
})

/**
 * Raje_listing
 */
tinymce.PluginManager.add('raje_listing', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_listing', {
    title: 'raje_listing',
    icon: 'icon-listing',
    tooltip: 'Listing',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {
      listing.add()
    }
  })

  // Because some behaviours aren't accepted, RAJE must check selection and accept backspace, canc and enter press
  editor.on('keyDown', function (e) {

    // keyCode 8 is backspace
    if (e.keyCode == 8)
      return handleFigureDelete(tinymce.activeEditor.selection)

    if (e.keyCode == 46)
      return handleFigureCanc(tinymce.activeEditor.selection)

    // Handle enter key in figcaption
    if (e.keyCode == 13)
      return handleFigureEnter(tinymce.activeEditor.selection)

    if (e.keyCode == 9) {
      if (tinymce.activeEditor.selection.isCollapsed() && $(tinymce.activeEditor.selection.getNode()).parents(`code,${FIGURE_SELECTOR}`).length) {
        tinymce.activeEditor.selection.setContent('\t')
        return false
      }
    }

    if (e.keyCode == 37) {
      let range = tinymce.activeEditor.selection.getRng()
      let startNode = $(range.startContainer)
      if (startNode.parent().is('code') && (startNode.parent().contents().index(startNode) == 0 && range.startOffset == 1)) {
        tinymce.activeEditor.selection.setCursorLocation(startNode.parents(FIGURE_SELECTOR).prev('p,:header')[0], 1)
        return false
      }
    }
  })

  listing = {
    /**
     * 
     */
    add: function () {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let newListing = this.create(getSuccessiveElementId(FIGURE_LISTING_SELECTOR, LISTING_SUFFIX))

      tinymce.activeEditor.undoManager.transact(function () {

        // Check if the selected element is not empty, and add table after
        if (selectedElement.text().trim().length != 0)
          selectedElement.after(newListing)

        // If selected element is empty, replace it with the new table
        else
          selectedElement.replaceWith(newListing)

        // Save updates 
        tinymce.triggerSave()

        // Update all captions with RASH function
        captions()

        tinymce.activeEditor.selection.select(newListing.find('code')[0])
        tinymce.activeEditor.selection.collapse(false)
        // Update Rendered RASH
        updateIframeFromSavedContent()
      })

    },

    /**
     * 
     */
    create: function (id) {
      return $(`<figure id="${id}"><pre><code>${ZERO_SPACE}</code></pre><figcaption>Caption.</figcaption></figure>`)
    }
  }
})

/**
 * Update table captions with a RASH funcion 
 */
function captions() {

  /* Captions */
  $(figurebox_selector).each(function () {
    var cur_caption = $(this).parents("figure").find("figcaption");
    var cur_number = $(this).findNumber(figurebox_selector);
    cur_caption.find('strong').remove();
    cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\" contenteditable=\"false\">Figure " + cur_number +
      ". </strong>" + cur_caption.html());
  });
  $(tablebox_selector).each(function () {
    var cur_caption = $(this).parents("figure").find("figcaption");
    var cur_number = $(this).findNumber(tablebox_selector);
    cur_caption.find('strong').remove();
    cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\" contenteditable=\"false\" >Table " + cur_number +
      ". </strong>" + cur_caption.html());
  });
  $(formulabox_selector).each(function () {
    var cur_caption = $(this).parents("figure").find("p");
    var cur_number = $(this).findNumber(formulabox_selector);
    cur_caption.find('span.cgen').remove();
    cur_caption.html(cur_caption.html() + "<span contenteditable=\"false\" class=\"cgen\" data-rash-original-content=\"\" > (" +
      cur_number + ")</span>");
  });
  $(listingbox_selector).each(function () {
    var cur_caption = $(this).parents("figure").find("figcaption");
    var cur_number = $(this).findNumber(listingbox_selector);
    cur_caption.find('strong').remove();
    cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\" contenteditable=\"false\">Listing " + cur_number +
      ". </strong>" + cur_caption.html());
  });
  /* /END Captions */
}

/**
 * 
 * @param {*} sel => tinymce selection
 * 
 * Mainly it checks where selection starts and ends to block unallowed deletion
 * In same figure aren't blocked, unless selection start OR end inside figcaption (not both)
 */
function handleFigureDelete(sel) {

  try {

    // Get reference of start and end node
    let startNode = $(sel.getRng().startContainer)
    let startNodeParent = startNode.parents(FIGURE_SELECTOR)

    let endNode = $(sel.getRng().endContainer)
    let endNodeParent = endNode.parents(FIGURE_SELECTOR)

    // If at least selection start or end is inside the figure
    if (startNodeParent.length || endNodeParent.length) {

      // If selection wraps entirely a figure from the start of first element (th in table) and selection ends
      if (endNode.parents('figcaption').length) {

        let contents = endNode.parent().contents()
        if (startNode.is(FIGURE_SELECTOR) && contents.index(endNode) == contents.length - 1 && sel.getRng().endOffset == endNode.text().length) {
          tinymce.activeEditor.undoManager.transact(function () {

            // Move cursor at the previous element and remove figure
            tinymce.activeEditor.focus()
            tinymce.activeEditor.selection.setCursorLocation(startNode.prev()[0], 1)
            startNode.remove()

            return false
          })
        }
      }

      // If selection doesn't start and end in the same figure, but one beetwen start or end is inside the figcaption, must block
      if (startNode.parents('figcaption').length != endNode.parents('figcaption').length && (startNode.parents('figcaption').length || endNode.parents('figcaption').length))
        return false

      // If the figure is not the same, must block
      // Because a selection can start in figureX and end in figureY
      if ((startNodeParent.attr('id') != endNodeParent.attr('id')))
        return false

      // If cursor is at start of code prevent
      if (startNode.parents(FIGURE_SELECTOR).find('pre').length) {

        // If at the start of pre>code, pressing 2times backspace will remove everything 
        if (startNode.parent().is('code') && (startNode.parent().contents().index(startNode) == 0 && sel.getRng().startOffset == 1)) {
          tinymce.activeEditor.undoManager.transact(function () {
            startNode.parents(FIGURE_SELECTOR).remove()
          })
          return false
        }


        if (startNode.parent().is('pre') && sel.getRng().startOffset == 0)
          return false
      }
    }

    return true
  } catch (e) {
    return false
  }
}

/**
 * 
 * @param {*} sel 
 */
function handleFigureCanc(sel) {

  // Get reference of start and end node
  let startNode = $(sel.getRng().startContainer)
  let startNodeParent = startNode.parents(FIGURE_SELECTOR)

  let endNode = $(sel.getRng().endContainer)
  let endNodeParent = endNode.parents(FIGURE_SELECTOR)

  // If at least selection start or end is inside the figure
  if (startNodeParent.length || endNodeParent.length) {

    // If selection doesn't start and end in the same figure, but one beetwen start or end is inside the figcaption, must block
    if (startNode.parents('figcaption').length != endNode.parents('figcaption').length && (startNode.parents('figcaption').length || endNode.parents('figcaption').length))
      return false

    // If the figure is not the same, must block
    // Because a selection can start in figureX and end in figureY
    if ((startNodeParent.attr('id') != endNodeParent.attr('id')))
      return false

  }

  // This algorithm doesn't work if caret is in empty text element

  // Current element can be or text or p
  let paragraph = startNode.is('p') ? startNode : startNode.parents('p').first()
  // Save all chldren nodes (text included)
  let paragraphContent = paragraph.contents()

  // If next there is a figure
  if (paragraph.next().is(FIGURE_SELECTOR)) {

    if (endNode[0].nodeType == 3) {

      // If the end node is a text inside a strong, its index will be -1.
      // In this case the editor must iterate until it face a inline element
      if (paragraphContent.index(endNode) == -1) //&& paragraph.parents(SECTION_SELECTOR).length)
        endNode = endNode.parent()

      // If index of the inline element is equal of children node length
      // AND the cursor is at the last position
      // Remove the next figure in one undo level
      if (paragraphContent.index(endNode) + 1 == paragraphContent.length && paragraphContent.last().text().length == sel.getRng().endOffset) {
        tinymce.activeEditor.undoManager.transact(function () {
          paragraph.next().remove()
        })
        return false
      }
    }
  }

  return true
}

/**
 * 
 * @param {*} sel => tinymce selection
 * 
 * Add a paragraph after the figure
 */
function handleFigureEnter(sel) {

  let selectedElement = $(sel.getNode())
  if (selectedElement.is('figcaption') || (selectedElement.parents(FIGURE_SELECTOR).length && selectedElement.is('p'))) {

    tinymce.activeEditor.undoManager.transact(function () {

      //add a new paragraph after the figure
      selectedElement.parent(FIGURE_SELECTOR).after('<p><br/></p>')

      //move caret at the start of new p
      tinymce.activeEditor.selection.setCursorLocation(selectedElement.parent(FIGURE_SELECTOR)[0].nextSibling, 0)
    })
    return false
  } else if (selectedElement.is('th'))
    return false
  return true
}

/**
 * 
 * @param {*} sel => tinymce selection
 */
function handleFigureChange(sel) {

  tinymce.triggerSave()

  // If rash-generated section is delete, re-add it
  if ($('figcaption:not(:has(strong))').length) {
    captions()
    updateIframeFromSavedContent()
  }
}
/**
 * raje_inline_code plugin RAJE
 */

const DISABLE_SELECTOR_INLINE = 'figure, section[role=doc-bibliography]'

const INLINE_ERRORS = 'Error, Inline elements can be ONLY created inside the same paragraph'

tinymce.PluginManager.add('raje_inlineCode', function (editor, url) {

  // Add a button that opens a window
  editor.addButton('raje_inlineCode', {
    title: 'inline_code',
    icon: 'icon-inline-code',
    tooltip: 'Inline code',
    disabledStateSelector: DISABLE_SELECTOR_INLINE,

    // Button behaviour
    onclick: function () {
      code.handle()
    }
  })

  editor.on('keyDown', function (e) {

    // On enter key 
    if (e.keyCode == 13) {
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      // If the current element is code, but it isn't inside pre
      if (selectedElement.is('code') && !selectedElement.parents(FIGURE_SELECTOR).length) {

        let contents = selectedElement.parent().contents()
        let index = contents.index(selectedElement)

        // Move caret to the next node (also text)
        if (contents[index + 1] != null) {
          tinymce.activeEditor.selection.setCursorLocation(contents[index + 1], 0)
          tinymce.activeEditor.selection.setContent(ZERO_SPACE)
        }

        return false
      }
    }
  })

  code = {
    /**
     * Insert or exit from inline code element
     */
    handle: function () {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      // If there isn't any inline code
      if (!selectedElement.is('code') && !selectedElement.parents('code').length) {

        let text = ZERO_SPACE

        // Check if the selection starts and ends in the same paragraph
        if (!tinymce.activeEditor.selection.isCollapsed()) {

          let startNode = tinymce.activeEditor.selection.getStart()
          let endNode = tinymce.activeEditor.selection.getEnd()

          // Notify the error and exit
          if (startNode != endNode) {
            notify(INLINE_ERRORS, 'error', 3000)
            return false
          }

          // Save the selected content as text
          text += tinymce.activeEditor.selection.getContent()
        }

        // Update the current selection with code element
        tinymce.activeEditor.undoManager.transact(function () {

          // Get the index of the current selected node
          let previousNodeIndex = selectedElement.contents().index($(tinymce.activeEditor.selection.getRng().startContainer))

          // Add code element
          tinymce.activeEditor.selection.setContent(`<code>${text}</code>`)
          tinymce.triggerSave()

          // Move caret at the end of the successive node of previous selected node
          tinymce.activeEditor.selection.setCursorLocation(selectedElement.contents()[previousNodeIndex + 1], 1)
        })
      }
    }
  }
})

/**
 *  Inline quote plugin RAJE
 */
tinymce.PluginManager.add('raje_inlineQuote', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_inlineQuote', {
    title: 'inline_quote',
    icon: 'icon-inline-quote',
    tooltip: 'Inline quote',
    disabledStateSelector: DISABLE_SELECTOR_INLINE,

    // Button behaviour
    onclick: function () {
      quote.handle()
    }
  })

  quote = {
    /**
     * Insert or exit from inline quote element
     */
    handle: function () {

      let name = tinymce.activeEditor.selection.getNode().nodeName

      if (name == 'Q')
        tinymce.activeEditor.formatter.remove('inline_quote')

      else
        tinymce.activeEditor.formatter.apply('inline_quote')
    }
  }
})

tinymce.PluginManager.add('raje_inlineFigure', function (editor, url) {
  editor.addButton('raje_inlineFigure', {
    text: 'inline_figure',
    tooltip: 'Inline quote',
    disabledStateSelector: DISABLE_SELECTOR_INLINE,

    // Button behaviour
    onclick: function () {}
  })
})
tinymce.PluginManager.add('raje_lists', function (editor, url) {

  const OL = 'ol'
  const UL = 'ul'

  editor.addButton('raje_ol', {
    title: 'raje_ol',
    icon: 'icon-ol',
    tooltip: 'Ordered list',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {
      list.add(OL)
    }
  })

  editor.addButton('raje_ul', {
    title: 'raje_ul',
    icon: 'icon-ul',
    tooltip: 'Unordered list',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {
      list.add(UL)
    }
  })

  /**
   * 
   */
  editor.on('keyDown', function (e) {

    // TODO Manage enter key
    // TODO 
  })


  /**
   * 
   */
  let list = {

    /**
     * 
     */
    add: function (type) {

      // Get the current element 
      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let text = '<br>'

      // If the current element has text, save it
      if (selectedElement.text().trim().length > 0)
        text = selectedElement.text().trim()

      tinymce.activeEditor.undoManager.transact(function () {

        // Add the new element
        selectedElement.replaceWith(`<${type} data-pointer><li><p>${text}</p></li></${type}>`)

        // Save changes
        tinymce.triggerSave()

        // Move the cursor
        moveCaret($(`${type}[data-pointer]`).find('p')[0])

        // Remove the pointer attribute
        $(`${type}[data-pointer]`).removeAttr('data-pointer')

        // Restore the whole content
        updateIframeFromSavedContent()
      })
    },


  }
})
/**
 * 
 */

function openMetadataDialog() {
  tinymce.activeEditor.windowManager.open({
    title: 'Edit metadata',
    url: 'js/rajemce/plugin/raje_metadata.html',
    width: 950,
    height: 800,
    onClose: function () {

      if (tinymce.activeEditor.updated_metadata != null) {

        metadata.update(tinymce.activeEditor.updated_metadata)

        tinymce.activeEditor.updated_metadata == null
      }

      tinymce.activeEditor.windowManager.close()
    }
  }, metadata.getAllMetadata())
}

tinymce.PluginManager.add('raje_metadata', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_metadata', {
    text: 'Metadata',
    icon: false,
    tooltip: 'Edit metadata',

    // Button behaviour
    onclick: function () {
      openMetadataDialog()
    }
  })

  editor.on('click', function (e) {
    if ($(tinymce.activeEditor.selection.getNode()).is(HEADER_SELECTOR))
      openMetadataDialog()
  })

  metadata = {

    /**
     * 
     */
    getAllMetadata: function () {
      let header = $(HEADER_SELECTOR)
      let subtitle = header.find('h1.title > small').text()
      let data = {
        subtitle: subtitle,
        title: header.find('h1.title').text().replace(subtitle, ''),
        authors: metadata.getAuthors(header),
        categories: metadata.getCategories(header),
        keywords: metadata.getKeywords(header)
      }

      return data
    },

    /**
     * 
     */
    getAuthors: function (header) {
      let authors = []

      header.find('address.lead.authors').each(function () {

        // Get all affiliations
        let affiliations = []
        $(this).find('span').each(function () {
          affiliations.push($(this).text())
        })

        // push single author
        authors.push({
          name: $(this).children('strong.author_name').text(),
          email: $(this).find('code.email > a').text(),
          affiliations: affiliations
        })
      })

      return authors
    },

    /**
     * 
     */
    getCategories: function (header) {
      let categories = []

      header.find('p.acm_subject_categories > code').each(function () {
        categories.push($(this).text())
      })

      return categories
    },

    /**
     * 
     */
    getKeywords: function (header) {
      let keywords = []

      header.find('ul.list-inline > li > code').each(function () {
        keywords.push($(this).text())
      })

      return keywords
    },

    /**
     * 
     */
    update: function (updatedMetadata) {

      $('head meta[property], head link[property], head meta[name]').remove()

      let currentMetadata = metadata.getAllMetadata()

      // Update title and subtitle
      if (updatedMetadata.title != currentMetadata.title || updatedMetadata.subtitle != currentMetadata.subtitle) {
        let text = updatedMetadata.title

        if (updatedMetadata.subtitle.trim().length)
          text += ` -- ${updatedMetadata.subtitle}`

        $('title').text(text)
      }

      let affiliationsCache = []

      updatedMetadata.authors.forEach(function (author) {

        $('head').append(`<meta about="mailto:${author.email}" typeof="schema:Person" property="schema:name" name="dc.creator" content="${author.name}">`)
        $('head').append(`<meta about="mailto:${author.email}" property="schema:email" content="${author.email}">`)

        author.affiliations.forEach(function (affiliation) {

          // Look up for already existing affiliation
          let toAdd = true
          let id

          affiliationsCache.forEach(function (affiliationCache) {
            if (affiliationCache.content == affiliation) {
              toAdd = false
              id = affiliationCache.id
            }
          })

          // If there is no existing affiliation, add it
          if (toAdd) {
            let generatedId = `#affiliation_${affiliationsCache.length+1}`
            affiliationsCache.push({
              id: generatedId,
              content: affiliation
            })
            id = generatedId
          }

          $('head').append(`<link about="mailto:${author.email}" property="schema:affiliation" href="${id}">`)
        })
      })

      affiliationsCache.forEach(function (affiliationCache) {
        $('head').append(`<meta about="${affiliationCache.id}" typeof="schema:Organization" property="schema:name" content="${affiliationCache.content}">`)
      })

      updatedMetadata.categories.forEach(function(category){
        $('head').append(`<meta name="dcterms.subject" content="${category}"/>`)
      })

      updatedMetadata.keywords.forEach(function(keyword){
        $('head').append(`<meta property="prism:keyword" content="${keyword}"/>`)
      })

      $('#raje_root').addHeaderHTML()
      setNonEditableHeader()
      updateIframeFromSavedContent()
    }
  }

})
tinymce.PluginManager.add('raje_save', function (editor, url) {

  saveManager = {

    /**
     * 
     */
    initSave: function () {

      // Clear all undo levels
      tinymce.activeEditor.undoManager.clear()

      // Update the new document state
      updateDocumentState(false)

      // Return the message for the backend
      return {
        title: saveManager.getTitle(),
        document: saveManager.getDerashedArticle()
      }
    },

    /**
     * 
     */
    saveAs: function () {

      // Send message to the backend
      saveAsArticle(saveManager.initSave())
    },

    /**
     * 
     */
    save: function () {

      // Send message to the backend
      saveArticle(saveManager.initSave())
    },

    /**
     * Return the RASH article rendered (without tinymce)
     */
    getDerashedArticle: function () {

      // Save html references
      let article = $('html').clone()
      let tinymceSavedContent = article.find('#raje_root')

      article.removeAttr('class')

      //replace body with the right one (this action remove tinymce)
      article.find('body').html(tinymceSavedContent.html())
      article.find('body').removeAttr('style')
      article.find('body').removeAttr('class')

      //remove all style and link un-needed from the head
      article.find('head').children('style[type="text/css"]').remove()
      article.find('head').children('link[id]').remove()

      // Execute derash (replace all cgen elements with its original content)
      article.find('*[data-rash-original-content]').each(function () {
        let originalContent = $(this).attr('data-rash-original-content')
        $(this).replaceWith(originalContent)
      })

      // Execute derash changing the wrapper
      article.find('*[data-rash-original-wrapper]').each(function () {
        let content = $(this).html()
        let wrapper = $(this).attr('data-rash-original-wrapper')
        $(this).replaceWith(`<${wrapper}>${content}</${wrapper}>`)
      })

      // Remove target from TinyMCE link
      article.find('a[target]').each(function () {
        $(this).removeAttr('target')
      })

      // Remove contenteditable from TinyMCE link
      article.find('a[contenteditable]').each(function () {
        $(this).removeAttr('contenteditable')
      })

      // Remove not allowed span elments inside the formula
      article.find(FIGURE_FORMULA_SELECTOR).each(function () {
        $(this).children('p').html($(this).find('span[contenteditable]').html())
      })

      article.find(`${FIGURE_FORMULA_SELECTOR},${INLINE_FORMULA_SELECTOR}`).each(function () {
        if ($(this).find('svg[data-mathml]').length) {
          $(this).children('p').html($(this).find('svg[data-mathml]').attr('data-mathml'))
        }
      })

      return new XMLSerializer().serializeToString(article[0])
    },

    /**
     * Return the title 
     */
    getTitle: function () {
      return $('title').text()
    },

  }
})
/**
 * RASH section plugin RAJE
 */

const NON_EDITABLE_HEADER_SELECTOR = 'header.page-header.container.cgen'
const BIBLIOENTRY_SUFFIX = 'biblioentry_'
const ENDNOTE_SUFFIX = 'endnote_'

const BIBLIOGRAPHY_SELECTOR = 'section[role=doc-bibliography]'
const BIBLIOENTRY_SELECTOR = 'li[role=doc-biblioentry]'

const ENDNOTES_SELECTOR = 'section[role=doc-endnotes]'
const ENDNOTE_SELECTOR = 'section[role=doc-endnote]'

const ABSTRACT_SELECTOR = 'section[role=doc-abstract]'
const ACKNOWLEDGEMENTS_SELECTOR = 'section[role=doc-acknowledgements]'

const MAIN_SECTION_SELECTOR = 'div#raje_root > section:not([role])'
const SECTION_SELECTOR = 'section:not([role])'
const SPECIAL_SECTION_SELECTOR = 'section[role]'

const MENU_SELECTOR = 'div[id^=mceu_][id$=-body][role=menu]'

const HEADING = 'Heading'

const HEADING_TRASFORMATION_FORBIDDEN = 'Error, you cannot transform the current header in this way!'

tinymce.PluginManager.add('raje_section', function (editor, url) {

  let raje_section_flag = false
  let raje_stored_selection

  editor.addButton('raje_section', {
    type: 'menubutton',
    text: 'Headings',
    title: 'heading',
    icons: false,

    // Sections sub menu
    menu: [{
      text: `${HEADING} 1.`,
      onclick: function () {
        section.add(1)
      }
    }, {
      text: `${HEADING} 1.1.`,
      onclick: function () {
        section.add(2)
      }
    }, {
      text: `${HEADING} 1.1.1.`,
      onclick: function () {
        section.add(3)
      }
    }, {
      text: `${HEADING} 1.1.1.1.`,
      onclick: function () {
        section.add(4)
      }
    }, {
      text: `${HEADING} 1.1.1.1.1.`,
      onclick: function () {
        section.add(5)
      }
    }, {
      text: `${HEADING} 1.1.1.1.1.1.`,
      onclick: function () {
        section.add(6)
      }
    }, {
      text: 'Special',
      menu: [{
          text: 'Abstract',
          onclick: function () {

            section.addAbstract()
          }
        },
        {
          text: 'Acknowledgements',
          onclick: function () {
            section.addAcknowledgements()
          }
        },
        {
          text: 'References',
          onclick: function () {

            tinymce.triggerSave()

            // Only if bibliography section doesn't exists
            if (!$(BIBLIOGRAPHY_SELECTOR).length) {

              // TODO change here
              tinymce.activeEditor.undoManager.transact(function () {
                // Add new biblioentry
                section.addBiblioentry()

                // Update iframe
                updateIframeFromSavedContent()

                //move caret and set focus to active aditor #105
                tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select(`${BIBLIOENTRY_SELECTOR}:last-child`)[0], true)
              })
            } else
              tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select(`${BIBLIOGRAPHY_SELECTOR}>h1`)[0])

            scrollTo(`${BIBLIOENTRY_SELECTOR}:last-child`)

            tinymce.activeEditor.focus()
          }
        }
      ]
    }]
  })

  editor.on('keyDown', function (e) {

    // instance of the selected element
    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    try {

      let keycode = e.keyCode

      // Save bounds of current selection (start and end)
      let startNode = $(tinymce.activeEditor.selection.getRng().startContainer)
      let endNode = $(tinymce.activeEditor.selection.getRng().endContainer)

      const SPECIAL_CHARS =
        (keycode > 47 && keycode < 58) || // number keys
        (keycode > 95 && keycode < 112) || // numpad keys
        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
        (keycode > 218 && keycode < 223); // [\]' (in order)

      // Block special chars in special elements
      if (SPECIAL_CHARS &&
        (startNode.parents(SPECIAL_SECTION_SELECTOR).length || endNode.parents(SPECIAL_SECTION_SELECTOR).length) &&
        (startNode.parents('h1').length > 0 || endNode.parents('h1').length > 0))
        return false

      // #################################
      // ### BACKSPACE && CANC PRESSED ###
      // #################################
      if (e.keyCode == 8 || e.keyCode == 46) {

        let toRemoveSections = section.getSectionsinSelection(tinymce.activeEditor.selection)
        raje_section_flag = true

        // Prevent remove from header
        if (selectedElement.is(NON_EDITABLE_HEADER_SELECTOR) ||
          (selectedElement.attr('data-mce-caret') == 'after' && selectedElement.parent().is(RAJE_SELECTOR)) ||
          (selectedElement.attr('data-mce-caret') && selectedElement.parent().is(RAJE_SELECTOR)) == 'before')
          return false

        // If selection isn't collapsed manage delete
        if (!tinymce.activeEditor.selection.isCollapsed()) {
          return section.manageDelete()
        }

        // If SELECTION STARTS or ENDS in special section
        else if (startNode.parents(SPECIAL_SECTION_SELECTOR).length || endNode.parents(SPECIAL_SECTION_SELECTOR).length) {

          let startOffset = tinymce.activeEditor.selection.getRng().startOffset
          let startOffsetNode = 0
          let endOffset = tinymce.activeEditor.selection.getRng().endOffset
          let endOffsetNode = tinymce.activeEditor.selection.getRng().endContainer.length

          // Completely remove the current special section if is entirely selected
          if (
            // Check if the selection contains the entire section
            startOffset == startOffsetNode && endOffset == endOffsetNode &&

            // Check if the selection starts from h1
            (startNode.parents('h1').length != endNode.parents('h1').length) && (startNode.parents('h1').length || endNode.parents('h1').length) &&

            // Check if the selection ends in the last child
            (startNode.parents(SPECIAL_SECTION_SELECTOR).children().length == $(tinymce.activeEditor.selection.getRng().endContainer).parentsUntil(SPECIAL_SECTION_SELECTOR).index() + 1)) {

          }

          // Remove the current special section if selection is at the start of h1 AND selection is collapsed 
          if (tinymce.activeEditor.selection.isCollapsed() && (startNode.parents('h1').length || startNode.is('h1')) && startOffset == 0) {

            tinymce.activeEditor.undoManager.transact(function () {

              // Remove the section and update 
              selectedElement.parent(SPECIAL_SECTION_SELECTOR).remove()
              tinymce.triggerSave()

              // Update references
              updateReferences()
              updateIframeFromSavedContent()
            })

            return false
          }

          // Chek if inside the selection to remove, there is bibliography
          let hasBibliography = false
          $(tinymce.activeEditor.selection.getContent()).each(function () {
            if ($(this).is(BIBLIOGRAPHY_SELECTOR))
              hasBibliography = true
          })

          if (hasBibliography) {

            tinymce.activeEditor.undoManager.transact(function () {

              // Execute normal delete
              tinymce.activeEditor.execCommand('delete')

              // Update saved content
              tinymce.triggerSave()

              // Remove selector without hader
              $(BIBLIOGRAPHY_SELECTOR).remove()

              // Update iframe and restore selection
              updateIframeFromSavedContent()
            })

            return false
          }

          // if selection starts or ends in a biblioentry
          if (startNode.parents(BIBLIOENTRY_SELECTOR).length || endNode.parents(BIBLIOENTRY_SELECTOR).length) {

            // Both delete event and update are stored in a single undo level
            tinymce.activeEditor.undoManager.transact(function () {

              tinymce.activeEditor.execCommand('delete')
              section.updateBibliographySection()
              updateReferences()

              // update iframe
              updateIframeFromSavedContent()
            })

            return false
          }
        }


      }
    } catch (exception) {}

    // #################################
    // ######### ENTER PRESSED #########
    // #################################
    if (e.keyCode == 13) {

      // When enter is pressed inside an header, not at the end of it
      if (selectedElement.is('h1,h2,h3,h4,h5,h6') && selectedElement.text().trim().length != tinymce.activeEditor.selection.getRng().startOffset) {

        section.addWithEnter()
        return false
      }

      // If selection is before/after header
      if (selectedElement.is('p')) {

        // Block enter before header
        if (selectedElement.attr('data-mce-caret') == 'before')
          return false


        // Add new section after header
        if (selectedElement.attr('data-mce-caret') == 'after') {
          section.add(1)
          return false
        }
      }

      // If enter is pressed inside bibliography selector
      if (selectedElement.parents(BIBLIOGRAPHY_SELECTOR).length) {

        tinymce.triggerSave()

        let id = getSuccessiveElementId(BIBLIOENTRY_SELECTOR, BIBLIOENTRY_SUFFIX)

        // Pressing enter in h1 will add a new biblioentry and caret reposition
        if (selectedElement.is('h1')) {

          section.addBiblioentry(id)
          updateIframeFromSavedContent()
        }

        // If selected element is inside text
        else if (selectedElement.is('p'))
          section.addBiblioentry(id, null, selectedElement.parent('li'))


        // If selected element is without text
        else if (selectedElement.is('li'))
          section.addBiblioentry(id, null, selectedElement)

        // Move caret #105
        tinymce.activeEditor.selection.setCursorLocation(tinymce.activeEditor.dom.select(`${BIBLIOENTRY_SELECTOR}#${id} > p`)[0], false)
        return false
      }

      // Adding sections with shortcuts #
      if (selectedElement.is('p') && selectedElement.text().trim().substring(0, 1) == '#') {

        let level = section.getLevelFromHash(selectedElement.text().trim())
        let deepness = $(selectedElement).parentsUntil(RAJE_SELECTOR).length - level + 1

        // Insert section only if caret is inside abstract section, and user is going to insert a sub section
        // OR the cursor isn't inside other special sections
        // AND selectedElement isn't inside a figure
        if (((selectedElement.parents(ABSTRACT_SELECTOR).length && deepness > 0) || !selectedElement.parents(SPECIAL_SECTION_SELECTOR).length) && !selectedElement.parents(FIGURE_SELECTOR).length) {

          section.add(level, selectedElement.text().substring(level).trim())
          return false
        }
      }
    }
  })

  editor.on('NodeChange', function (e) {
    section.updateSectionToolbar()
  })
})

section = {

  /**
   * Function called when a new section needs to be attached, with buttons
   */
  add: function (level, text) {

    // Select current node
    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    // Create the section
    let newSection = this.create(text != null ? text : selectedElement.html().trim(), level)

    tinymce.activeEditor.undoManager.transact(function () {

      // Check what kind of section needs to be inserted
      if (section.manageSection(selectedElement, newSection, level ? level : selectedElement.parentsUntil(RAJE_SELECTOR).length)) {

        // Remove the selected section
        selectedElement.remove()

        // If the new heading has text nodes, the offset won't be 0 (as normal) but instead it'll be length of node text
        moveCaret(newSection.find(':header').first()[0])

        // Update editor content
        tinymce.triggerSave()
      }
    })
  },

  /**
   * Function called when a new section needs to be attached, with buttons
   */
  addWithEnter: function () {

    // Select current node
    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    // If the section isn't special
    if (!selectedElement.parent().attr('role')) {

      level = selectedElement.parentsUntil(RAJE_SELECTOR).length

      // Create the section
      let newSection = this.create(selectedElement.text().trim().substring(tinymce.activeEditor.selection.getRng().startOffset), level)

      tinymce.activeEditor.undoManager.transact(function () {

        // Check what kind of section needs to be inserted
        section.manageSection(selectedElement, newSection, level)

        // Remove the selected section
        selectedElement.html(selectedElement.text().trim().substring(0, tinymce.activeEditor.selection.getRng().startOffset))

        moveCaret(newSection.find(':header').first()[0])

        // Update editor
        tinymce.triggerSave()
      })
    } else
      notify('Error, headers of special sections (abstract, acknowledments) cannot be splitted', 'error', 4000)
  },

  /**
   * Get the last inserted id
   */
  getNextId: function () {
    let id = 0
    $('section[id]').each(function () {
      if ($(this).attr('id').indexOf('section') > -1) {
        let currId = parseInt($(this).attr('id').replace('section', ''))
        id = id > currId ? id : currId
      }
    })
    return `section${id+1}`
  },

  /**
   * Retrieve and then remove every successive elements 
   */
  getSuccessiveElements: function (element, deepness) {

    let successiveElements = $('<div></div>')

    while (deepness >= 0) {

      if (element.nextAll(':not(.footer)')) {

        // If the deepness is 0, only paragraph are saved (not sections)
        if (deepness == 0) {
          // Successive elements can be p or figures
          successiveElements.append(element.nextAll(`p,${FIGURE_SELECTOR}`))
          element.nextAll().remove(`p,${FIGURE_SELECTOR}`)
        } else {
          successiveElements.append(element.nextAll())
          element.nextAll().remove()
        }
      }

      element = element.parent('section')
      deepness--
    }

    return $(successiveElements.html())
  },

  /**
   * 
   */
  getLevelFromHash: function (text) {

    let level = 0
    text = text.substring(0, text.length >= 6 ? 6 : text.length)

    while (text.length > 0) {

      if (text.substring(text.length - 1) == '#')
        level++

        text = text.substring(0, text.length - 1)
    }

    return level
  },

  /**
   * Return JQeury object that represent the section
   */
  create: function (text, level) {
    // Create the section

    // Trim white spaces and add zero_space char if nothing is inside

    if (typeof text != "undefined") {
      text = text.trim()
      if (text.length == 0)
        text = "<br>"
    } else
      text = "<br>"

    return $(`<section id="${this.getNextId()}"><h${level} data-rash-original-wrapper="h1">${text}</h${level}></section>`)
  },

  /**
   * Check what kind of section needs to be added, and preceed
   */
  manageSection: function (selectedElement, newSection, level) {

    let deepness = $(selectedElement).parentsUntil(RAJE_SELECTOR).length - level + 1

    if (deepness >= 0) {

      // Block insert selection if caret is inside special section, and user is going to insert a sub section
      if ((selectedElement.parents(SPECIAL_SECTION_SELECTOR).length && deepness != 1) || (selectedElement.parents(ACKNOWLEDGEMENTS_SELECTOR).length &&
          selectedElement.parents(BIBLIOGRAPHY_SELECTOR) &&
          selectedElement.parents(ENDNOTES_SELECTOR)))
        return false

      // Get direct parent and ancestor reference
      let successiveElements = this.getSuccessiveElements(selectedElement, deepness)

      if (successiveElements.length)
        newSection.append(successiveElements)

      // CASE: sub section
      if (deepness == 0)
        selectedElement.after(newSection)

      // CASE: sibling section
      else if (deepness == 1)
        selectedElement.parent('section').after(newSection)

      // CASE: ancestor section at any uplevel
      else
        $(selectedElement.parents('section')[deepness - 1]).after(newSection)

      headingDimension()

      return true
    }
  },

  /**
   * 
   */
  upgrade: function () {

    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    if (selectedElement.is('h1,h2,h3,h4,h5,h6')) {

      // Get the references of selected and parent section
      let selectedSection = selectedElement.parent(SECTION_SELECTOR)
      let parentSection = selectedSection.parent(SECTION_SELECTOR)

      // If there is a parent section upgrade is allowed
      if (parentSection.length) {

        // Everything in here, is an atomic undo level
        tinymce.activeEditor.undoManager.transact(function () {

          // Save the section and detach
          let bodySection = $(selectedSection[0].outerHTML)
          selectedSection.detach()

          // Update dimension and move the section out
          parentSection.after(bodySection)

          tinymce.triggerSave()
          headingDimension()
          updateIframeFromSavedContent()
        })
      }

      // Notify error
      else
        notify(HEADING_TRASFORMATION_FORBIDDEN, 'error', 2000)
    }
  },

  /**
   * 
   */
  downgrade: function () {

    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    if (selectedElement.is('h1,h2,h3,h4,h5,h6')) {
      // Get the references of selected and sibling section
      let selectedSection = selectedElement.parent(SECTION_SELECTOR)
      let siblingSection = selectedSection.prev(SECTION_SELECTOR)

      // If there is a previous sibling section downgrade is allowed
      if (siblingSection.length) {

        // Everything in here, is an atomic undo level
        tinymce.activeEditor.undoManager.transact(function () {

          // Save the section and detach
          let bodySection = $(selectedSection[0].outerHTML)
          selectedSection.detach()

          // Update dimension and move the section out
          siblingSection.append(bodySection)

          tinymce.triggerSave()
          // Refresh tinymce content and set the heading dimension
          headingDimension()
          updateIframeFromSavedContent()
        })
      }
    }

    // Notify error
    else
      notify(HEADING_TRASFORMATION_FORBIDDEN, 'error', 2000)
  },

  /**
   * 
   */
  addAbstract: function () {

    if (!$(ABSTRACT_SELECTOR).length) {

      tinymce.activeEditor.undoManager.transact(function () {

        // This section can only be placed after non editable header
        $(NON_EDITABLE_HEADER_SELECTOR).after(`<section id="doc-abstract" role="doc-abstract"><h1>Abstract</h1></section>`)

        updateIframeFromSavedContent()
      })
    }

    //move caret and set focus to active aditor #105
    moveCaret(tinymce.activeEditor.dom.select(`${ABSTRACT_SELECTOR} > h1`)[0])
    scrollTo(ABSTRACT_SELECTOR)
  },

  /**
   * 
   */
  addAcknowledgements: function () {

    if (!$(ACKNOWLEDGEMENTS_SELECTOR).length) {

      let ack = $(`<section id="doc-acknowledgements" role="doc-acknowledgements"><h1>Acknowledgements</h1></section>`)

      tinymce.activeEditor.undoManager.transact(function () {

        // Insert this section after last non special section 
        // OR after abstract section 
        // OR after non editable header
        if ($(MAIN_SECTION_SELECTOR).length)
          $(MAIN_SECTION_SELECTOR).last().after(ack)

        else if ($(ABSTRACT_SELECTOR).length)
          $(ABSTRACT_SELECTOR).after(ack)

        else
          $(NON_EDITABLE_HEADER_SELECTOR).after(ack)

        updateIframeFromSavedContent()
      })
    }

    //move caret and set focus to active aditor #105
    moveCaret(tinymce.activeEditor.dom.select(`${ACKNOWLEDGEMENTS_SELECTOR} > h1`)[0])
    scrollTo(ACKNOWLEDGEMENTS_SELECTOR)
  },

  /**
   * This method is the main one. It's called because all times the intent is to add a new biblioentry (single reference)
   * Then it checks if is necessary to add the entire <section> or only the missing <ul>
   */
  addBiblioentry: function (id, text, listItem) {

    // Add bibliography section if not exists
    if (!$(BIBLIOGRAPHY_SELECTOR).length) {

      let bibliography = $(`<section id="doc-bibliography" role="doc-bibliography"><h1>References</h1><ul></ul></section>`)

      // This section is added after acknowledgements section
      // OR after last non special section
      // OR after abstract section
      // OR after non editable header 
      if ($(ACKNOWLEDGEMENTS_SELECTOR).length)
        $(ACKNOWLEDGEMENTS_SELECTOR).after(bibliography)

      else if ($(MAIN_SECTION_SELECTOR).length)
        $(MAIN_SECTION_SELECTOR).last().after(bibliography)

      else if ($(ABSTRACT_SELECTOR).length)
        $(ABSTRACT_SELECTOR).after(bibliography)

      else
        $(NON_EDITABLE_HEADER_SELECTOR).after(bibliography)

    }

    // Add ul in bibliography section if not exists
    if (!$(BIBLIOGRAPHY_SELECTOR).find('ul').length)
      $(BIBLIOGRAPHY_SELECTOR).append('<ul></ul>')

    // IF id and text aren't passed as parameters, these can be retrieved or init from here
    id = (id) ? id : getSuccessiveElementId(BIBLIOENTRY_SELECTOR, BIBLIOENTRY_SUFFIX)
    text = text ? text : '<br/>'

    let newItem = $(`<li role="doc-biblioentry" id="${id}"><p>${text}</p></li>`)

    // Append new li to ul at last position
    // OR insert the new li right after the current one
    if (!listItem)
      $(`${BIBLIOGRAPHY_SELECTOR} ul`).append(newItem)

    else
      listItem.after(newItem)
  },

  /**
   * 
   */
  updateBibliographySection: function () {

    // Synchronize iframe and stored content
    tinymce.triggerSave()

    // Remove all sections without p child
    $(`${BIBLIOENTRY_SELECTOR}:not(:has(p))`).each(function () {
      $(this).remove()
    })
  },

  /**
   * 
   */
  addEndnote: function (id) {

    // Add the section if it not exists
    if (!$(ENDNOTE_SELECTOR).length) {

      let endnotes = $(`<section id="doc-endnotes" role="doc-endnotes"><h1 data-rash-original-content="">Footnotes</h1></section>`)

      // Insert this section after bibliography section
      // OR after acknowledgements section
      // OR after non special section selector
      // OR after abstract section
      // OR after non editable header 
      if ($(BIBLIOGRAPHY_SELECTOR).length)
        $(BIBLIOGRAPHY_SELECTOR).after(endnotes)

      else if ($(ACKNOWLEDGEMENTS_SELECTOR).length)
        $(ACKNOWLEDGEMENTS_SELECTOR).after(endnotes)

      else if ($(MAIN_SECTION_SELECTOR).length)
        $(MAIN_SECTION_SELECTOR).last().after(endnotes)

      else if ($(ABSTRACT_SELECTOR).length)
        $(ABSTRACT_SELECTOR).after(endnotes)

      else
        $(NON_EDITABLE_HEADER_SELECTOR).after(endnotes)
    }

    // Create and append the new endnote
    let endnote = $(`<section role="doc-endnote" id="${id}"><p><br/></p></section>`)
    $(ENDNOTES_SELECTOR).append(endnote)
  },

  /**
   * 
   */
  updateSectionToolbar: function () {

    // Dropdown menu reference
    let menu = $(MENU_SELECTOR)

    if (menu.length) {
      section.restoreSectionToolbar(menu)

      // Save current selected element
      let selectedElement = $(tinymce.activeEditor.selection.getRng().startContainer)

      if (selectedElement[0].nodeType == 3)
        selectedElement = selectedElement.parent()

      // If current element is p
      if (selectedElement.is('p') || selectedElement.parent().is('p')) {

        // Disable upgrade/downgrade
        menu.children(':gt(10)').addClass('mce-disabled')

        // Check if caret is inside special section
        // In this case enable only first menuitem if caret is in abstract
        if (selectedElement.parents(SPECIAL_SECTION_SELECTOR).length) {

          if (selectedElement.parents(ABSTRACT_SELECTOR).length)
            menu.children(`:lt(1)`).removeClass('mce-disabled')

          return false
        }

        // Get deepness of the section
        let deepness = selectedElement.parents(SECTION_SELECTOR).length + 1

        // Remove disabling class on first {deepness} menu items
        menu.children(`:lt(${deepness})`).removeClass('mce-disabled')

        let preHeaders = []
        let parentSections = selectedElement.parents('section')

        // Save index of all parent sections
        for (let i = parentSections.length; i > 0; i--) {
          let elem = $(parentSections[i - 1])
          let index = elem.parent().children(SECTION_SELECTOR).index(elem) + 1
          preHeaders.push(index)
        }

        // Update text of all menu item
        for (let i = 0; i <= preHeaders.length; i++) {

          let text = `${HEADING} `

          // Update text based on section structure
          if (i != preHeaders.length) {
            for (let x = 0; x <= i; x++)
              text += `${preHeaders[x] + (x == i ? 1 : 0)}.`
          }

          // In this case raje changes text of next sub heading
          else {
            for (let x = 0; x < i; x++)
              text += `${preHeaders[x]}.`

            text += '1.'
          }

          menu.children(`:eq(${i})`).find('span.mce-text').text(text)
        }
      }

      // Disable 
      else if (selectedElement.is('h1') && selectedElement.parents(SPECIAL_SECTION_SELECTOR)) {
        menu.children(':gt(10)').addClass('mce-disabled')
      }
    }
  },

  /**
   * Restore normal text in section toolbar and disable all
   */
  restoreSectionToolbar: function (menu) {

    let cnt = 1

    menu.children(':lt(6)').each(function () {
      let text = `${HEADING} `

      for (let i = 0; i < cnt; i++)
        text += `1.`

      $(this).find('span.mce-text').text(text)
      $(this).addClass('mce-disabled')

      cnt++
    })

    // Enable upgrade/downgrade last three menu items
    menu.children(':gt(10)').removeClass('mce-disabled')
  },

  manageDelete: function () {

    let range = tinymce.activeEditor.selection.getRng()
    let startNode = $(range.startContainer).parent()
    let endNode = $(range.endContainer).parent()
    let commonAncestorContainer = $(range.commonAncestorContainer)

    // Deepness is relative to the common ancestor container of the range startContainer and end
    let deepness = endNode.parent('section').parentsUntil(commonAncestorContainer).length + 1
    let currentElement = endNode
    let toMoveElements = []

    tinymce.activeEditor.undoManager.transact(function () {

      // Get and detach all next_end
      for (let i = 0; i <= deepness; i++) {
        currentElement.nextAll('section,p,figure').each(function () {
          toMoveElements.push($(this))

          $(this).detach()
        })
        currentElement = currentElement.parent()
      }

      // Execute delete
      tinymce.activeEditor.execCommand('delete')

      // Detach all next_begin
      startNode.nextAll().each(function () {
        $(this).detach()
      })

      // Append all next_end to startnode parent
      toMoveElements.forEach(function (element) {
        startNode.parent('section').append(element)
      })

      tinymce.triggerSave()

      // Refresh headings
      headingDimension()

      // Update references if needed
      updateReferences()

      updateIframeFromSavedContent()
    })
    return false
  }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluaXQuanMiLCJyYWplX2Jsb2Nrcy5qcyIsInJhamVfY3Jvc3NyZWYuanMiLCJyYWplX2ZpZ3VyZXMuanMiLCJyYWplX2lubGluZXMuanMiLCJyYWplX2xpc3RzLmpzIiwicmFqZV9tZXRhZGF0YS5qcyIsInJhamVfc2F2ZS5qcyIsInJhamVfc2VjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDallBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNseEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InJhamVfY29yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogXG4gKiBJbml0aWxpemUgVGlueU1DRSBlZGl0b3Igd2l0aCBhbGwgcmVxdWlyZWQgb3B0aW9uc1xuICovXG5cbi8vIEludmlzaWJsZSBzcGFjZSBjb25zdGFudHNcbmNvbnN0IFpFUk9fU1BBQ0UgPSAnJiM4MjAzOydcbmNvbnN0IFJBSkVfU0VMRUNUT1IgPSAnYm9keSN0aW55bWNlJ1xuXG4vLyBTZWxlY3RvciBjb25zdGFudHMgKHRvIG1vdmUgaW5zaWRlIGEgbmV3IGNvbnN0IGZpbGUpXG5jb25zdCBIRUFERVJfU0VMRUNUT1IgPSAnaGVhZGVyLnBhZ2UtaGVhZGVyLmNvbnRhaW5lci5jZ2VuJ1xuY29uc3QgRklSU1RfSEVBRElORyA9IGAke1JBSkVfU0VMRUNUT1J9PnNlY3Rpb246Zmlyc3Q+aDE6Zmlyc3RgXG5cbmNvbnN0IFRJTllNQ0VfVE9PTEJBUl9IRUlHVEggPSA3NlxuXG5sZXQgaXBjUmVuZGVyZXIsIHdlYkZyYW1lXG5cbmlmIChoYXNCYWNrZW5kKSB7XG5cbiAgaXBjUmVuZGVyZXIgPSByZXF1aXJlKCdlbGVjdHJvbicpLmlwY1JlbmRlcmVyXG4gIHdlYkZyYW1lID0gcmVxdWlyZSgnZWxlY3Ryb24nKS53ZWJGcmFtZVxuICBcbiAgLyoqXG4gICAqIEluaXRpbGlzZSBUaW55TUNFIFxuICAgKi9cbiAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gT3ZlcnJpZGUgdGhlIG1hcmdpbiBib3R0b24gZ2l2ZW4gYnkgUkFTSCBmb3IgdGhlIGZvb3RlclxuICAgICQoJ2JvZHknKS5jc3Moe1xuICAgICAgJ21hcmdpbi1ib3R0b20nOiAwXG4gICAgfSlcblxuICAgIC8vaGlkZSBmb290ZXJcbiAgICAkKCdmb290ZXIuZm9vdGVyJykuaGlkZSgpXG5cbiAgICAvL2F0dGFjaCB3aG9sZSBib2R5IGluc2lkZSBhIHBsYWNlaG9sZGVyIGRpdlxuICAgICQoJ2JvZHknKS5odG1sKGA8ZGl2IGlkPVwicmFqZV9yb290XCI+JHskKCdib2R5JykuaHRtbCgpfTwvZGl2PmApXG5cbiAgICAvLyBcbiAgICBzZXROb25FZGl0YWJsZUhlYWRlcigpXG5cbiAgICB0aW55bWNlLmluaXQoe1xuXG4gICAgICAvLyBTZWxlY3QgdGhlIGVsZW1lbnQgdG8gd3JhcFxuICAgICAgc2VsZWN0b3I6ICcjcmFqZV9yb290JyxcblxuICAgICAgLy8gU2V0IHdpbmRvdyBzaXplXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCAtIFRJTllNQ0VfVE9PTEJBUl9IRUlHVEgsXG5cbiAgICAgIC8vIFNldCB0aGUgc3R5bGVzIG9mIHRoZSBjb250ZW50IHdyYXBwZWQgaW5zaWRlIHRoZSBlbGVtZW50XG4gICAgICBjb250ZW50X2NzczogWydjc3MvYm9vdHN0cmFwLm1pbi5jc3MnLCAnY3NzL3Jhc2guY3NzJywgJ2Nzcy9yYWplbWNlLmNzcyddLFxuXG4gICAgICAvLyBTZXQgcGx1Z2luc1xuICAgICAgcGx1Z2luczogXCJyYWplX2lubGluZUZpZ3VyZSBmdWxsc2NyZWVuIGxpbmsgY29kZXNhbXBsZSByYWplX2lubGluZUNvZGUgcmFqZV9pbmxpbmVRdW90ZSByYWplX3NlY3Rpb24gdGFibGUgaW1hZ2Ugbm9uZWRpdGFibGUgcmFqZV9pbWFnZSByYWplX2NvZGVibG9jayByYWplX3RhYmxlIHJhamVfbGlzdGluZyByYWplX2lubGluZV9mb3JtdWxhIHJhamVfZm9ybXVsYSByYWplX2Nyb3NzcmVmIHJhamVfZm9vdG5vdGVzIHJhamVfbWV0YWRhdGEgcGFzdGUgcmFqZV9saXN0cyByYWplX3NhdmVcIixcblxuICAgICAgLy8gUmVtb3ZlIG1lbnViYXJcbiAgICAgIG1lbnViYXI6IGZhbHNlLFxuXG4gICAgICAvLyBDdXN0b20gdG9vbGJhclxuICAgICAgdG9vbGJhcjogJ3VuZG8gcmVkbyBib2xkIGl0YWxpYyBsaW5rIHN1cGVyc2NyaXB0IHN1YnNjcmlwdCByYWplX2lubGluZUNvZGUgcmFqZV9pbmxpbmVRdW90ZSByYWplX2lubGluZV9mb3JtdWxhIHJhamVfY3Jvc3NyZWYgcmFqZV9mb290bm90ZXMgfCByYWplX29sIHJhamVfdWwgcmFqZV9jb2RlYmxvY2sgYmxvY2txdW90ZSByYWplX3RhYmxlIHJhamVfaW1hZ2UgcmFqZV9saXN0aW5nIHJhamVfZm9ybXVsYSB8IHJhamVfc2VjdGlvbiByYWplX21ldGFkYXRhIHJhamVfc2F2ZScsXG5cbiAgICAgIC8vIFNldHVwIGZ1bGwgc2NyZWVuIG9uIGluaXRcbiAgICAgIHNldHVwOiBmdW5jdGlvbiAoZWRpdG9yKSB7XG5cbiAgICAgICAgLy8gU2V0IGZ1bGxzY3JlZW4gXG4gICAgICAgIGVkaXRvci5vbignaW5pdCcsIGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICBlZGl0b3IuZXhlY0NvbW1hbmQoJ21jZUZ1bGxTY3JlZW4nKVxuXG4gICAgICAgICAgLy8gTW92ZSBjYXJldCBhdCB0aGUgZmlyc3QgaDEgZWxlbWVudCBvZiBtYWluIHNlY3Rpb25cbiAgICAgICAgICAvLyBPciByaWdodCBhZnRlciBoZWFkaW5nXG4gICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNldEN1cnNvckxvY2F0aW9uKHRpbnltY2UuYWN0aXZlRWRpdG9yLmRvbS5zZWxlY3QoRklSU1RfSEVBRElORylbMF0sIDApXG4gICAgICAgIH0pXG5cbiAgICAgICAgZWRpdG9yLm9uKCdrZXlEb3duJywgZnVuY3Rpb24gKGUpIHtcblxuICAgICAgICAgIC8vIFByZXZlbnQgc2hpZnQrZW50ZXJcbiAgICAgICAgICBpZiAoZS5rZXlDb2RlID09IDEzICYmIGUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyBQcmV2ZW50IHNwYW4gXG4gICAgICAgIGVkaXRvci5vbignbm9kZUNoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICBsZXQgc2VsZWN0ZWRFbGVtZW50ID0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpKVxuXG4gICAgICAgICAgLy8gTW92ZSBjYXJldCB0byBmaXJzdCBoZWFkaW5nIGlmIGlzIGFmdGVyIG9yIGJlZm9yZSBub3QgZWRpdGFibGUgaGVhZGVyXG4gICAgICAgICAgaWYgKHNlbGVjdGVkRWxlbWVudC5pcygncCcpICYmIChzZWxlY3RlZEVsZW1lbnQubmV4dCgpLmlzKEhFQURFUl9TRUxFQ1RPUikgfHwgKHNlbGVjdGVkRWxlbWVudC5wcmV2KCkuaXMoSEVBREVSX1NFTEVDVE9SKSAmJiB0aW55bWNlLmFjdGl2ZUVkaXRvci5kb20uc2VsZWN0KEZJUlNUX0hFQURJTkcpLmxlbmd0aCkpKVxuICAgICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNldEN1cnNvckxvY2F0aW9uKHRpbnltY2UuYWN0aXZlRWRpdG9yLmRvbS5zZWxlY3QoRklSU1RfSEVBRElORylbMF0sIDApXG5cbiAgICAgICAgICAvLyBJZiB0aGUgY3VycmVudCBlbGVtZW50IGlzbid0IGluc2lkZSBoZWFkZXIsIG9ubHkgaW4gc2VjdGlvbiB0aGlzIGlzIHBlcm1pdHRlZFxuICAgICAgICAgIGlmIChzZWxlY3RlZEVsZW1lbnQucGFyZW50cygnc2VjdGlvbicpLmxlbmd0aCkge1xuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRFbGVtZW50LmlzKCdzcGFuI19tY2VfY2FyZXRbZGF0YS1tY2UtYm9ndXNdJykgfHwgc2VsZWN0ZWRFbGVtZW50LnBhcmVudCgpLmlzKCdzcGFuI19tY2VfY2FyZXRbZGF0YS1tY2UtYm9ndXNdJykpIHtcblxuICAgICAgICAgICAgICAvLyBSZW1vdmUgc3BhbiBub3JtYWxseSBjcmVhdGVkIHdpdGggYm9sZFxuICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRFbGVtZW50LnBhcmVudCgpLmlzKCdzcGFuI19tY2VfY2FyZXRbZGF0YS1tY2UtYm9ndXNdJykpXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRFbGVtZW50ID0gc2VsZWN0ZWRFbGVtZW50LnBhcmVudCgpXG5cbiAgICAgICAgICAgICAgbGV0IGJtID0gdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldEJvb2ttYXJrKClcbiAgICAgICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LnJlcGxhY2VXaXRoKHNlbGVjdGVkRWxlbWVudC5odG1sKCkpXG4gICAgICAgICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5tb3ZlVG9Cb29rbWFyayhibSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBhIGNoYW5nZSBpbiB0aGUgc3RydWN0dXJlIGlzIG1hZGVcbiAgICAgICAgICAvLyBUaGVuIG5vdGlmeSB0aGUgYmFja2VuZCBcbiAgICAgICAgICBpZiAodGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIuaGFzVW5kbygpKVxuICAgICAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZSh0cnVlKVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIFVwZGF0ZSBzYXZlZCBjb250ZW50IG9uIHVuZG8gYW5kIHJlZG8gZXZlbnRzXG4gICAgICAgIGVkaXRvci5vbignVW5kbycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdGlueW1jZS50cmlnZ2VyU2F2ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZWRpdG9yLm9uKCdSZWRvJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB0aW55bWNlLnRyaWdnZXJTYXZlKClcbiAgICAgICAgfSlcbiAgICAgIH0sXG5cbiAgICAgIC8vIFNldCBkZWZhdWx0IHRhcmdldFxuICAgICAgZGVmYXVsdF9saW5rX3RhcmdldDogXCJfYmxhbmtcIixcblxuICAgICAgLy8gUHJlcGVuZCBwcm90b2NvbCBpZiB0aGUgbGluayBzdGFydHMgd2l0aCB3d3dcbiAgICAgIGxpbmtfYXNzdW1lX2V4dGVybmFsX3RhcmdldHM6IHRydWUsXG5cbiAgICAgIC8vIEhpZGUgdGFyZ2V0IGxpc3RcbiAgICAgIHRhcmdldF9saXN0OiBmYWxzZSxcblxuICAgICAgLy8gSGlkZSB0aXRsZVxuICAgICAgbGlua190aXRsZTogZmFsc2UsXG5cbiAgICAgIC8vIFNldCBmb3JtYXRzXG4gICAgICBmb3JtYXRzOiB7XG4gICAgICAgIGlubGluZV9xdW90ZToge1xuICAgICAgICAgIGlubGluZTogJ3EnXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIFJlbW92ZSBcInBvd2VyZWQgYnkgdGlueW1jZVwiXG4gICAgICBicmFuZGluZzogZmFsc2UsXG5cbiAgICAgIC8vIFByZXZlbnQgYXV0byBiciBvbiBlbGVtZW50IGluc2VydFxuICAgICAgYXBwbHlfc291cmNlX2Zvcm1hdHRpbmc6IGZhbHNlLFxuXG4gICAgICAvLyBQcmV2ZW50IG5vbiBlZGl0YWJsZSBvYmplY3QgcmVzaXplXG4gICAgICBvYmplY3RfcmVzaXppbmc6IGZhbHNlLFxuXG4gICAgICAvLyBVcGRhdGUgdGhlIHRhYmxlIHBvcG92ZXIgbGF5b3V0XG4gICAgICB0YWJsZV90b29sYmFyOiBcInRhYmxlaW5zZXJ0cm93YmVmb3JlIHRhYmxlaW5zZXJ0cm93YWZ0ZXIgdGFibGVkZWxldGVyb3cgfCB0YWJsZWluc2VydGNvbGJlZm9yZSB0YWJsZWluc2VydGNvbGFmdGVyIHRhYmxlZGVsZXRlY29sXCIsXG5cbiAgICAgIGltYWdlX2FkdnRhYjogdHJ1ZSxcblxuICAgICAgcGFzdGVfYmxvY2tfZHJvcDogdHJ1ZSxcblxuICAgICAgZXh0ZW5kZWRfdmFsaWRfZWxlbWVudHM6IFwic3ZnWypdLGRlZnNbKl0scGF0dGVyblsqXSxkZXNjWypdLG1ldGFkYXRhWypdLGdbKl0sbWFza1sqXSxwYXRoWypdLGxpbmVbKl0sbWFya2VyWypdLHJlY3RbKl0sY2lyY2xlWypdLGVsbGlwc2VbKl0scG9seWdvblsqXSxwb2x5bGluZVsqXSxsaW5lYXJHcmFkaWVudFsqXSxyYWRpYWxHcmFkaWVudFsqXSxzdG9wWypdLGltYWdlWypdLHZpZXdbKl0sdGV4dFsqXSx0ZXh0UGF0aFsqXSx0aXRsZVsqXSx0c3BhblsqXSxnbHlwaFsqXSxzeW1ib2xbKl0sc3dpdGNoWypdLHVzZVsqXVwiLFxuXG4gICAgICBmb3JtdWxhOiB7XG4gICAgICAgIHBhdGg6ICdub2RlX21vZHVsZXMvdGlueW1jZS1mb3JtdWxhLydcbiAgICAgIH0sXG5cbiAgICAgIGNsZWFudXBfb25fc3RhcnR1cDogZmFsc2UsXG4gICAgICB0cmltX3NwYW5fZWxlbWVudHM6IGZhbHNlLFxuICAgICAgdmVyaWZ5X2h0bWw6IGZhbHNlLFxuICAgICAgY2xlYW51cDogZmFsc2UsXG4gICAgICBjb252ZXJ0X3VybHM6IGZhbHNlXG4gICAgfSlcbiAgfSlcblxuICAvKipcbiAgICogT3BlbiBhbmQgY2xvc2UgdGhlIGhlYWRpbmdzIGRyb3Bkb3duXG4gICAqL1xuICAkKHdpbmRvdykubG9hZChmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBPcGVuIGFuZCBjbG9zZSBtZW51IGhlYWRpbmdzIE7DpGl2ZSB3YXlcbiAgICAkKGBkaXZbYXJpYS1sYWJlbD0naGVhZGluZyddYCkuZmluZCgnYnV0dG9uJykudHJpZ2dlcignY2xpY2snKVxuICAgICQoYGRpdlthcmlhLWxhYmVsPSdoZWFkaW5nJ11gKS5maW5kKCdidXR0b24nKS50cmlnZ2VyKCdjbGljaycpXG4gIH0pXG5cblxuICAvKipcbiAgICogVXBkYXRlIGNvbnRlbnQgaW4gdGhlIGlmcmFtZSwgd2l0aCB0aGUgb25lIHN0b3JlZCBieSB0aW55bWNlXG4gICAqIEFuZCBzYXZlL3Jlc3RvcmUgdGhlIHNlbGVjdGlvblxuICAgKi9cbiAgZnVuY3Rpb24gdXBkYXRlSWZyYW1lRnJvbVNhdmVkQ29udGVudCgpIHtcblxuICAgIC8vIFNhdmUgdGhlIGJvb2ttYXJrIFxuICAgIGxldCBib29rbWFyayA9IHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5nZXRCb29rbWFyaygyLCB0cnVlKVxuXG4gICAgLy8gVXBkYXRlIGlmcmFtZSBjb250ZW50XG4gICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2V0Q29udGVudCgkKCcjcmFqZV9yb290JykuaHRtbCgpKVxuXG4gICAgLy8gUmVzdG9yZSB0aGUgYm9va21hcmsgXG4gICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLm1vdmVUb0Jvb2ttYXJrKGJvb2ttYXJrKVxuICB9XG5cbiAgLyoqXG4gICAqIEFjY2VwdCBhIGpzIG9iamVjdCB0aGF0IGV4aXN0cyBpbiBmcmFtZVxuICAgKiBAcGFyYW0geyp9IGVsZW1lbnQgXG4gICAqL1xuICBmdW5jdGlvbiBtb3ZlQ2FyZXQoZWxlbWVudCwgdG9TdGFydCkge1xuICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5zZWxlY3QoZWxlbWVudClcbiAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uY29sbGFwc2UodG9TdGFydClcblxuICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLmZvY3VzKClcbiAgfVxuXG4gIC8qKlxuICAgKiBcbiAgICogQHBhcmFtIHsqfSBlbGVtZW50IFxuICAgKi9cbiAgZnVuY3Rpb24gbW92ZUN1cnNvclRvRW5kKGVsZW1lbnQpIHtcblxuICAgIGxldCBoZWFkaW5nID0gZWxlbWVudFxuICAgIGxldCBvZmZzZXQgPSAwXG5cbiAgICBpZiAoaGVhZGluZy5jb250ZW50cygpLmxlbmd0aCkge1xuXG4gICAgICBoZWFkaW5nID0gaGVhZGluZy5jb250ZW50cygpLmxhc3QoKVxuXG4gICAgICAvLyBJZiB0aGUgbGFzdCBub2RlIGlzIGEgc3Ryb25nLGVtLHEgZXRjLiB3ZSBoYXZlIHRvIHRha2UgaXRzIHRleHQgXG4gICAgICBpZiAoaGVhZGluZ1swXS5ub2RlVHlwZSAhPSAzKVxuICAgICAgICBoZWFkaW5nID0gaGVhZGluZy5jb250ZW50cygpLmxhc3QoKVxuXG4gICAgICBvZmZzZXQgPSBoZWFkaW5nWzBdLndob2xlVGV4dC5sZW5ndGhcbiAgICB9XG5cbiAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci5mb2N1cygpXG4gICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNldEN1cnNvckxvY2F0aW9uKGhlYWRpbmdbMF0sIG9mZnNldClcbiAgfVxuXG4gIC8qKlxuICAgKiBcbiAgICogQHBhcmFtIHsqfSBlbGVtZW50IFxuICAgKi9cbiAgZnVuY3Rpb24gbW92ZUN1cnNvclRvU3RhcnQoZWxlbWVudCkge1xuXG4gICAgbGV0IGhlYWRpbmcgPSBlbGVtZW50XG4gICAgbGV0IG9mZnNldCA9IDBcblxuICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLmZvY3VzKClcbiAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uc2V0Q3Vyc29yTG9jYXRpb24oaGVhZGluZ1swXSwgb2Zmc2V0KVxuICB9XG5cblxuICAvKipcbiAgICogQ3JlYXRlIGN1c3RvbSBpbnRvIG5vdGlmaWNhdGlvblxuICAgKiBAcGFyYW0geyp9IHRleHQgXG4gICAqIEBwYXJhbSB7Kn0gdGltZW91dCBcbiAgICovXG4gIGZ1bmN0aW9uIG5vdGlmeSh0ZXh0LCB0eXBlLCB0aW1lb3V0KSB7XG5cbiAgICAvLyBEaXNwbGF5IG9ubHkgb25lIG5vdGlmaWNhdGlvbiwgYmxvY2tpbmcgYWxsIG90aGVyc1xuICAgIGlmICh0aW55bWNlLmFjdGl2ZUVkaXRvci5ub3RpZmljYXRpb25NYW5hZ2VyLmdldE5vdGlmaWNhdGlvbnMoKS5sZW5ndGggPT0gMCkge1xuXG4gICAgICBsZXQgbm90aWZ5ID0ge1xuICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICB0eXBlOiB0eXBlID8gdHlwZSA6ICdpbmZvJyxcbiAgICAgICAgdGltZW91dDogdGltZW91dCA/IHRpbWVvdXQgOiAxMDAwXG4gICAgICB9XG5cbiAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLm5vdGlmaWNhdGlvbk1hbmFnZXIub3Blbihub3RpZnkpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFxuICAgKiBAcGFyYW0geyp9IGVsZW1lbnRTZWxlY3RvciBcbiAgICovXG4gIGZ1bmN0aW9uIHNjcm9sbFRvKGVsZW1lbnRTZWxlY3Rvcikge1xuICAgICQodGlueW1jZS5hY3RpdmVFZGl0b3IuZ2V0Qm9keSgpKS5maW5kKGVsZW1lbnRTZWxlY3RvcikuZ2V0KDApLnNjcm9sbEludG9WaWV3KCk7XG4gIH1cblxuICAvKipcbiAgICogXG4gICAqL1xuICBmdW5jdGlvbiBnZXRTdWNjZXNzaXZlRWxlbWVudElkKGVsZW1lbnRTZWxlY3RvciwgU1VGRklYKSB7XG5cbiAgICBsZXQgbGFzdElkID0gMFxuXG4gICAgJChlbGVtZW50U2VsZWN0b3IpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IGN1cnJlbnRJZCA9IHBhcnNlSW50KCQodGhpcykuYXR0cignaWQnKS5yZXBsYWNlKFNVRkZJWCwgJycpKVxuICAgICAgbGFzdElkID0gY3VycmVudElkID4gbGFzdElkID8gY3VycmVudElkIDogbGFzdElkXG4gICAgfSlcblxuICAgIHJldHVybiBgJHtTVUZGSVh9JHtsYXN0SWQrMX1gXG4gIH1cblxuICAvKipcbiAgICogXG4gICAqL1xuICBmdW5jdGlvbiBoZWFkaW5nRGltZW5zaW9uKCkge1xuICAgICQoJ2gxLGgyLGgzLGg0LGg1LGg2JykuZWFjaChmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGlmICghJCh0aGlzKS5wYXJlbnRzKEhFQURFUl9TRUxFQ1RPUikubGVuZ3RoKSB7XG4gICAgICAgIHZhciBjb3VudGVyID0gMDtcbiAgICAgICAgJCh0aGlzKS5wYXJlbnRzKFwic2VjdGlvblwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoJCh0aGlzKS5jaGlsZHJlbihcImgxLGgyLGgzLGg0LGg1LGg2XCIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkKHRoaXMpLnJlcGxhY2VXaXRoKFwiPGhcIiArIGNvdW50ZXIgKyBcIj5cIiArICQodGhpcykuaHRtbCgpICsgXCI8L2hcIiArIGNvdW50ZXIgKyBcIj5cIilcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcbiAgICovXG4gIGZ1bmN0aW9uIG1hcmtUaW55TUNFKCkge1xuICAgICQoJ2RpdltpZF49bWNldV9dJykuYXR0cignZGF0YS1yYXNoLW9yaWdpbmFsLWNvbnRlbnQnLCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBcbiAgICovXG4gIGZ1bmN0aW9uIHNldE5vbkVkaXRhYmxlSGVhZGVyKCkge1xuICAgICQoSEVBREVSX1NFTEVDVE9SKS5hZGRDbGFzcygnbWNlTm9uRWRpdGFibGUnKVxuICB9XG5cbiAgLyoqXG4gICAqIFxuICAgKi9cbiAgZnVuY3Rpb24gY2hlY2tJZkFwcCgpIHtcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuc2VuZFN5bmMoJ2lzQXBwU3luYycpXG4gIH1cblxuICAvKipcbiAgICogXG4gICAqL1xuICBmdW5jdGlvbiBzZWxlY3RJbWFnZSgpIHtcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuc2VuZFN5bmMoJ3NlbGVjdEltYWdlU3luYycpXG4gIH1cblxuXG5cbiAgLyoqXG4gICAqIFNlbmQgYSBtZXNzYWdlIHRvIHRoZSBiYWNrZW5kLCBub3RpZnkgdGhlIHN0cnVjdHVyYWwgY2hhbmdlXG4gICAqIFxuICAgKiBJZiB0aGUgZG9jdW1lbnQgaXMgZHJhZnQgc3RhdGUgPSB0cnVlXG4gICAqIElmIHRoZSBkb2N1bWVudCBpcyBzYXZlZCBzdGF0ZSA9IGZhbHNlXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGVEb2N1bWVudFN0YXRlKHN0YXRlKSB7XG4gICAgcmV0dXJuIGlwY1JlbmRlcmVyLnNlbmQoJ3VwZGF0ZURvY3VtZW50U3RhdGUnLCBzdGF0ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBcbiAgICovXG4gIGZ1bmN0aW9uIHNhdmVBc0FydGljbGUob3B0aW9ucykge1xuICAgIHJldHVybiBpcGNSZW5kZXJlci5zZW5kKCdzYXZlQXNBcnRpY2xlJywgb3B0aW9ucylcbiAgfVxuXG4gIC8qKlxuICAgKiBcbiAgICovXG4gIGZ1bmN0aW9uIHNhdmVBcnRpY2xlKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuc2VuZCgnc2F2ZUFydGljbGUnLCBvcHRpb25zKVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBzYXZlIGFzIHByb2Nlc3MgZ2V0dGluZyB0aGUgZGF0YSBhbmQgc2VuZGluZyBpdFxuICAgKiB0byB0aGUgbWFpbiBwcm9jZXNzXG4gICAqL1xuICBpcGNSZW5kZXJlci5vbignZXhlY3V0ZVNhdmVBcycsIChldmVudCwgZGF0YSkgPT4ge1xuICAgIHNhdmVNYW5hZ2VyLnNhdmVBcygpXG4gIH0pXG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBzYXZlIHByb2Nlc3MgZ2V0dGluZyB0aGUgZGF0YSBhbmQgc2VuZGluZyBpdFxuICAgKiB0byB0aGUgbWFpbiBwcm9jZXNzXG4gICAqL1xuICBpcGNSZW5kZXJlci5vbignZXhlY3V0ZVNhdmUnLCAoZXZlbnQsIGRhdGEpID0+IHtcbiAgICBzYXZlTWFuYWdlci5zYXZlKClcbiAgfSlcblxuXG4gIC8qKlxuICAgKiBcbiAgICovXG4gIGlwY1JlbmRlcmVyLm9uKCdub3RpZnknLCAoZXZlbnQsIGRhdGEpID0+IHtcbiAgICBub3RpZnkoZGF0YS50ZXh0LCBkYXRhLnR5cGUsIGRhdGEudGltZW91dClcbiAgfSlcbn0iLCJ0aW55bWNlLlBsdWdpbk1hbmFnZXIuYWRkKCdyYWplX2NvZGVibG9jaycsIGZ1bmN0aW9uIChlZGl0b3IsIHVybCkge30pIiwidGlueW1jZS5QbHVnaW5NYW5hZ2VyLmFkZCgncmFqZV9jcm9zc3JlZicsIGZ1bmN0aW9uIChlZGl0b3IsIHVybCkge1xuXG4gIC8vIEFkZCBhIGJ1dHRvbiB0aGF0IGhhbmRsZSB0aGUgaW5saW5lIGVsZW1lbnRcbiAgZWRpdG9yLmFkZEJ1dHRvbigncmFqZV9jcm9zc3JlZicsIHtcbiAgICB0aXRsZTogJ3JhamVfY3Jvc3NyZWYnLFxuICAgIGljb246ICdpY29uLWFuY2hvcicsXG4gICAgdG9vbHRpcDogJ0Nyb3NzLXJlZmVyZW5jZScsXG4gICAgZGlzYWJsZWRTdGF0ZVNlbGVjdG9yOiBESVNBQkxFX1NFTEVDVE9SX0ZJR1VSRVMsXG5cbiAgICAvLyBCdXR0b24gYmVoYXZpb3VyXG4gICAgb25jbGljazogZnVuY3Rpb24gKCkge1xuXG4gICAgICB0aW55bWNlLnRyaWdnZXJTYXZlKClcblxuICAgICAgbGV0IHJlZmVyZW5jZWFibGVMaXN0ID0ge1xuICAgICAgICBzZWN0aW9uczogY3Jvc3NyZWYuZ2V0QWxsUmVmZXJlbmNlYWJsZVNlY3Rpb25zKCksXG4gICAgICAgIHRhYmxlczogY3Jvc3NyZWYuZ2V0QWxsUmVmZXJlbmNlYWJsZVRhYmxlcygpLFxuICAgICAgICBsaXN0aW5nczogY3Jvc3NyZWYuZ2V0QWxsUmVmZXJlbmNlYWJsZUxpc3RpbmdzKCksXG4gICAgICAgIGZvcm11bGFzOiBjcm9zc3JlZi5nZXRBbGxSZWZlcmVuY2VhYmxlRm9ybXVsYXMoKSxcbiAgICAgICAgcmVmZXJlbmNlczogY3Jvc3NyZWYuZ2V0QWxsUmVmZXJlbmNlYWJsZVJlZmVyZW5jZXMoKVxuICAgICAgfVxuXG4gICAgICBlZGl0b3Iud2luZG93TWFuYWdlci5vcGVuKHtcbiAgICAgICAgICB0aXRsZTogJ0Nyb3NzLXJlZmVyZW5jZSBlZGl0b3InLFxuICAgICAgICAgIHVybDogJ2pzL3JhamVtY2UvcGx1Z2luL3JhamVfY3Jvc3NyZWYuaHRtbCcsXG4gICAgICAgICAgd2lkdGg6IDUwMCxcbiAgICAgICAgICBoZWlnaHQ6IDgwMCxcbiAgICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogXG4gICAgICAgICAgICAgKiBUaGlzIGJlaGF2aW91ciBpcyBjYWxsZWQgd2hlbiB1c2VyIHByZXNzIFwiQUREIE5FVyBSRUZFUkVOQ0VcIiBcbiAgICAgICAgICAgICAqIGJ1dHRvbiBmcm9tIHRoZSBtb2RhbFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAodGlueW1jZS5hY3RpdmVFZGl0b3IuY3JlYXRlTmV3UmVmZXJlbmNlKSB7XG5cbiAgICAgICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgLy8gR2V0IHN1Y2Nlc3NpdmUgYmlibGlvZW50cnkgaWRcbiAgICAgICAgICAgICAgICBsZXQgaWQgPSBnZXRTdWNjZXNzaXZlRWxlbWVudElkKEJJQkxJT0VOVFJZX1NFTEVDVE9SLCBCSUJMSU9FTlRSWV9TVUZGSVgpXG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIHJlZmVyZW5jZSB0aGF0IHBvaW50cyB0byB0aGUgbmV4dCBpZFxuICAgICAgICAgICAgICAgIGNyb3NzcmVmLmFkZChpZClcblxuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgbmV4dCBiaWJsaW9lbnRyeVxuICAgICAgICAgICAgICAgIHNlY3Rpb24uYWRkQmlibGlvZW50cnkoaWQpXG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgIGNyb3NzcmVmLnVwZGF0ZSgpXG5cbiAgICAgICAgICAgICAgICAvLyBNb3ZlIGNhcmV0IHRvIHN0YXJ0IG9mIHRoZSBuZXcgYmlibGlvZW50cnkgZWxlbWVudFxuICAgICAgICAgICAgICAgIC8vIElzc3VlICMxMDUgRmlyZWZveCArIENocm9taXVtXG4gICAgICAgICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNldEN1cnNvckxvY2F0aW9uKCQodGlueW1jZS5hY3RpdmVFZGl0b3IuZG9tLmdldChpZCkpLmZpbmQoJ3AnKVswXSwgZmFsc2UpXG4gICAgICAgICAgICAgICAgc2Nyb2xsVG8oYCR7QklCTElPRU5UUllfU0VMRUNUT1J9IyR7aWR9YClcbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAvLyBTZXQgdmFyaWFibGUgbnVsbCBmb3Igc3VjY2Vzc2l2ZSB1c2FnZXNcbiAgICAgICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IuY3JlYXRlTmV3UmVmZXJlbmNlID0gbnVsbFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoaXMgaXMgY2FsbGVkIGlmIGEgbm9ybWFsIHJlZmVyZW5jZSBpcyBzZWxlY3RlZCBmcm9tIG1vZGFsXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGVsc2UgaWYgKHRpbnltY2UuYWN0aXZlRWRpdG9yLnJlZmVyZW5jZSkge1xuXG4gICAgICAgICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnVuZG9NYW5hZ2VyLnRyYW5zYWN0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgZW1wdHkgYW5jaG9yIGFuZCB1cGRhdGUgaXRzIGNvbnRlbnRcbiAgICAgICAgICAgICAgICBjcm9zc3JlZi5hZGQodGlueW1jZS5hY3RpdmVFZGl0b3IucmVmZXJlbmNlKVxuICAgICAgICAgICAgICAgIGNyb3NzcmVmLnVwZGF0ZSgpXG5cbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWROb2RlID0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpKVxuXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzZWxlY3QgdGhlIGxhc3QgZWxlbWVudCAobGFzdCBieSBvcmRlcikgYW5kIGNvbGxhcHNlIHRoZSBzZWxlY3Rpb24gYWZ0ZXIgdGhlIG5vZGVcbiAgICAgICAgICAgICAgICAvLyAjMTA1IEZpcmVmb3ggKyBDaHJvbWl1bVxuICAgICAgICAgICAgICAgIC8vdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNldEN1cnNvckxvY2F0aW9uKCQodGlueW1jZS5hY3RpdmVFZGl0b3IuZG9tLnNlbGVjdChgYVtocmVmPVwiIyR7dGlueW1jZS5hY3RpdmVFZGl0b3IucmVmZXJlbmNlfVwiXTpsYXN0LWNoaWxkYCkpWzBdLCBmYWxzZSlcbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAvLyBTZXQgdmFyaWFibGUgbnVsbCBmb3Igc3VjY2Vzc2l2ZSB1c2FnZXNcbiAgICAgICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IucmVmZXJlbmNlID0gbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBMaXN0IG9mIGFsbCByZWZlcmVuY2VhYmxlIGVsZW1lbnRzXG4gICAgICAgIHJlZmVyZW5jZWFibGVMaXN0KVxuICAgIH1cbiAgfSlcblxuICBjcm9zc3JlZiA9IHtcbiAgICBnZXRBbGxSZWZlcmVuY2VhYmxlU2VjdGlvbnM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgbGV0IHNlY3Rpb25zID0gW11cblxuICAgICAgJCgnc2VjdGlvbicpLmVhY2goZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGxldCBsZXZlbCA9ICcnXG5cbiAgICAgICAgLy8gU2VjdGlvbnMgd2l0aG91dCByb2xlIGhhdmUgOmFmdGVyXG4gICAgICAgIGlmICghJCh0aGlzKS5hdHRyKCdyb2xlJykpIHtcblxuICAgICAgICAgIC8vIFNhdmUgaXRzIGRlZXBuZXNzXG4gICAgICAgICAgbGV0IHBhcmVudFNlY3Rpb25zID0gJCh0aGlzKS5wYXJlbnRzVW50aWwoJ2RpdiNyYWplX3Jvb3QnKVxuXG4gICAgICAgICAgaWYgKHBhcmVudFNlY3Rpb25zLmxlbmd0aCkge1xuXG4gICAgICAgICAgICAvLyBJdGVyYXRlIGl0cyBwYXJlbnRzIGJhY2t3YXJkcyAoaGlnZXIgZmlyc3QpXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gcGFyZW50U2VjdGlvbnMubGVuZ3RoOyBpLS07IGkgPiAwKSB7XG4gICAgICAgICAgICAgIGxldCBzZWN0aW9uID0gJChwYXJlbnRTZWN0aW9uc1tpXSlcbiAgICAgICAgICAgICAgbGV2ZWwgKz0gYCR7c2VjdGlvbi5wYXJlbnQoKS5jaGlsZHJlbihTRUNUSU9OX1NFTEVDVE9SKS5pbmRleChzZWN0aW9uKSsxfS5gXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ3VycmVudCBpbmRleFxuICAgICAgICAgIGxldmVsICs9IGAkeyQodGhpcykucGFyZW50KCkuY2hpbGRyZW4oU0VDVElPTl9TRUxFQ1RPUikuaW5kZXgoJCh0aGlzKSkrMX0uYFxuICAgICAgICB9XG5cbiAgICAgICAgc2VjdGlvbnMucHVzaCh7XG4gICAgICAgICAgcmVmZXJlbmNlOiAkKHRoaXMpLmF0dHIoJ2lkJyksXG4gICAgICAgICAgdGV4dDogJCh0aGlzKS5maW5kKCc6aGVhZGVyJykuZmlyc3QoKS50ZXh0KCksXG4gICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gc2VjdGlvbnNcbiAgICB9LFxuXG4gICAgZ2V0QWxsUmVmZXJlbmNlYWJsZVRhYmxlczogZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IHRhYmxlcyA9IFtdXG5cbiAgICAgICQoJ2ZpZ3VyZTpoYXModGFibGUpJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRhYmxlcy5wdXNoKHtcbiAgICAgICAgICByZWZlcmVuY2U6ICQodGhpcykuYXR0cignaWQnKSxcbiAgICAgICAgICB0ZXh0OiAkKHRoaXMpLmZpbmQoJ2ZpZ2NhcHRpb24nKS50ZXh0KClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiB0YWJsZXNcbiAgICB9LFxuXG4gICAgZ2V0QWxsUmVmZXJlbmNlYWJsZUxpc3RpbmdzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgbGlzdGluZ3MgPSBbXVxuXG4gICAgICAkKCdmaWd1cmU6aGFzKHByZTpoYXMoY29kZSkpJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxpc3RpbmdzLnB1c2goe1xuICAgICAgICAgIHJlZmVyZW5jZTogJCh0aGlzKS5hdHRyKCdpZCcpLFxuICAgICAgICAgIHRleHQ6ICQodGhpcykuZmluZCgnZmlnY2FwdGlvbicpLnRleHQoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIGxpc3RpbmdzXG4gICAgfSxcblxuICAgIGdldEFsbFJlZmVyZW5jZWFibGVGb3JtdWxhczogZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IGZvcm11bGFzID0gW11cblxuICAgICAgJChmb3JtdWxhYm94X3NlbGVjdG9yKS5lYWNoKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBmb3JtdWxhcy5wdXNoKHtcbiAgICAgICAgICByZWZlcmVuY2U6ICQodGhpcykucGFyZW50cyhGSUdVUkVfU0VMRUNUT1IpLmF0dHIoJ2lkJyksXG4gICAgICAgICAgdGV4dDogYEZvcm11bGEgJHskKHRoaXMpLnBhcmVudHMoRklHVVJFX1NFTEVDVE9SKS5maW5kKCdzcGFuLmNnZW4nKS50ZXh0KCl9YFxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIGZvcm11bGFzXG4gICAgfSxcblxuICAgIGdldEFsbFJlZmVyZW5jZWFibGVSZWZlcmVuY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgcmVmZXJlbmNlcyA9IFtdXG5cbiAgICAgICQoJ3NlY3Rpb25bcm9sZT1kb2MtYmlibGlvZ3JhcGh5XSBsaScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICByZWZlcmVuY2VzLnB1c2goe1xuICAgICAgICAgIHJlZmVyZW5jZTogJCh0aGlzKS5hdHRyKCdpZCcpLFxuICAgICAgICAgIHRleHQ6ICQodGhpcykudGV4dCgpLFxuICAgICAgICAgIGxldmVsOiAkKHRoaXMpLmluZGV4KCkgKyAxXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcmVmZXJlbmNlc1xuICAgIH0sXG5cbiAgICBhZGQ6IGZ1bmN0aW9uIChyZWZlcmVuY2UsIG5leHQpIHtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBlbXB0eSByZWZlcmVuY2Ugd2l0aCBhIHdoaXRlc3BhY2UgYXQgdGhlIGVuZFxuICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNldENvbnRlbnQoYDxhIGNvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCIgaHJlZj1cIiMke3JlZmVyZW5jZX1cIj4mbmJzcDs8L2E+Jm5ic3A7YClcbiAgICAgIHRpbnltY2UudHJpZ2dlclNhdmUoKVxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gVXBkYXRlIHRoZSByZWZlcmVuY2UgKGluIHNhdmVkIGNvbnRlbnQpXG4gICAgICByZWZlcmVuY2VzKClcblxuICAgICAgLy8gUHJldmVudCBhZGRpbmcgb2YgbmVzdGVkIGEgYXMgZm9vdG5vdGVzXG4gICAgICAkKCdhPnN1cD5hJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykucGFyZW50KCkuaHRtbCgkKHRoaXMpLnRleHQoKSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIFVwZGF0ZSBlZGl0b3Igd2l0aCB0aGUgcmlnaHQgcmVmZXJlbmNlc1xuICAgICAgdXBkYXRlSWZyYW1lRnJvbVNhdmVkQ29udGVudCgpXG4gICAgfVxuICB9XG59KVxuXG50aW55bWNlLlBsdWdpbk1hbmFnZXIuYWRkKCdyYWplX2Zvb3Rub3RlcycsIGZ1bmN0aW9uIChlZGl0b3IsIHVybCkge1xuXG4gIGVkaXRvci5hZGRCdXR0b24oJ3JhamVfZm9vdG5vdGVzJywge1xuICAgIHRpdGxlOiAncmFqZV9mb290bm90ZXMnLFxuICAgIGljb246ICdpY29uLWFzdGVyaXNrJyxcbiAgICB0b29sdGlwOiAnRm9vdG5vdGUnLFxuICAgIGRpc2FibGVkU3RhdGVTZWxlY3RvcjogRElTQUJMRV9TRUxFQ1RPUl9GSUdVUkVTLFxuXG4gICAgLy8gQnV0dG9uIGJlaGF2aW91clxuICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIC8vIEdldCBzdWNjZXNzaXZlIGJpYmxpb2VudHJ5IGlkXG4gICAgICAgIGxldCByZWZlcmVuY2UgPSBnZXRTdWNjZXNzaXZlRWxlbWVudElkKEVORE5PVEVfU0VMRUNUT1IsIEVORE5PVEVfU1VGRklYKVxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgcmVmZXJlbmNlIHRoYXQgcG9pbnRzIHRvIHRoZSBuZXh0IGlkXG4gICAgICAgIGNyb3NzcmVmLmFkZChyZWZlcmVuY2UpXG5cbiAgICAgICAgLy8gQWRkIHRoZSBuZXh0IGJpYmxpb2VudHJ5XG4gICAgICAgIHNlY3Rpb24uYWRkRW5kbm90ZShyZWZlcmVuY2UpXG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSByZWZlcmVuY2VcbiAgICAgICAgY3Jvc3NyZWYudXBkYXRlKClcblxuICAgICAgICAvLyBNb3ZlIGNhcmV0IGF0IHRoZSBlbmQgb2YgcCBpbiBsYXN0IGluc2VydGVkIGVuZG5vdGVcbiAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNldEN1cnNvckxvY2F0aW9uKHRpbnltY2UuYWN0aXZlRWRpdG9yLmRvbS5zZWxlY3QoYCR7RU5ETk9URV9TRUxFQ1RPUn0jJHtyZWZlcmVuY2V9PnBgKVswXSwgMSlcbiAgICAgIH0pXG4gICAgfVxuICB9KVxufSlcblxuZnVuY3Rpb24gcmVmZXJlbmNlcygpIHtcbiAgLyogUmVmZXJlbmNlcyAqL1xuICAkKFwiYVtocmVmXVwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoJC50cmltKCQodGhpcykudGV4dCgpKSA9PSAnJykge1xuICAgICAgdmFyIGN1cl9pZCA9ICQodGhpcykuYXR0cihcImhyZWZcIik7XG4gICAgICBvcmlnaW5hbF9jb250ZW50ID0gJCh0aGlzKS5odG1sKClcbiAgICAgIG9yaWdpbmFsX3JlZmVyZW5jZSA9IGN1cl9pZFxuICAgICAgcmVmZXJlbmNlZF9lbGVtZW50ID0gJChjdXJfaWQpO1xuXG4gICAgICBpZiAocmVmZXJlbmNlZF9lbGVtZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmVmZXJlbmNlZF9lbGVtZW50X2ZpZ3VyZSA9IHJlZmVyZW5jZWRfZWxlbWVudC5maW5kKFxuICAgICAgICAgIGZpZ3VyZWJveF9zZWxlY3Rvcl9pbWcgKyBcIixcIiArIGZpZ3VyZWJveF9zZWxlY3Rvcl9zdmcpO1xuICAgICAgICByZWZlcmVuY2VkX2VsZW1lbnRfdGFibGUgPSByZWZlcmVuY2VkX2VsZW1lbnQuZmluZCh0YWJsZWJveF9zZWxlY3Rvcl90YWJsZSk7XG4gICAgICAgIHJlZmVyZW5jZWRfZWxlbWVudF9mb3JtdWxhID0gcmVmZXJlbmNlZF9lbGVtZW50LmZpbmQoXG4gICAgICAgICAgZm9ybXVsYWJveF9zZWxlY3Rvcl9pbWcgKyBcIixcIiArIGZvcm11bGFib3hfc2VsZWN0b3Jfc3BhbiArIFwiLFwiICsgZm9ybXVsYWJveF9zZWxlY3Rvcl9tYXRoICsgXCIsXCIgKyBmb3JtdWxhYm94X3NlbGVjdG9yX3N2Zyk7XG4gICAgICAgIHJlZmVyZW5jZWRfZWxlbWVudF9saXN0aW5nID0gcmVmZXJlbmNlZF9lbGVtZW50LmZpbmQobGlzdGluZ2JveF9zZWxlY3Rvcl9wcmUpO1xuICAgICAgICAvKiBTcGVjaWFsIHNlY3Rpb25zICovXG4gICAgICAgIGlmIChcbiAgICAgICAgICAkKFwic2VjdGlvbltyb2xlPWRvYy1hYnN0cmFjdF1cIiArIGN1cl9pZCkubGVuZ3RoID4gMCB8fFxuICAgICAgICAgICQoXCJzZWN0aW9uW3JvbGU9ZG9jLWJpYmxpb2dyYXBoeV1cIiArIGN1cl9pZCkubGVuZ3RoID4gMCB8fFxuICAgICAgICAgICQoXCJzZWN0aW9uW3JvbGU9ZG9jLWVuZG5vdGVzXVwiICsgY3VyX2lkICsgXCIsIHNlY3Rpb25bcm9sZT1kb2MtZm9vdG5vdGVzXVwiICsgY3VyX2lkKS5sZW5ndGggPiAwIHx8XG4gICAgICAgICAgJChcInNlY3Rpb25bcm9sZT1kb2MtYWNrbm93bGVkZ2VtZW50c11cIiArIGN1cl9pZCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICQodGhpcykuaHRtbChcIjxzcGFuIGNsYXNzPVxcXCJjZ2VuXFxcIiBjb250ZW50ZWRpdGFibGU9XFxcImZhbHNlXFxcIiAgZGF0YS1yYXNoLW9yaWdpbmFsLWNvbnRlbnQ9XFxcIlwiICsgb3JpZ2luYWxfY29udGVudCArXG4gICAgICAgICAgICBcIlxcXCI+U2VjdGlvbiA8cT5cIiArICQoY3VyX2lkICsgXCIgPiBoMVwiKS50ZXh0KCkgKyBcIjwvcT48L3NwYW4+XCIpO1xuICAgICAgICAgIC8qIEJpYmxpb2dyYXBoaWMgcmVmZXJlbmNlcyAqL1xuICAgICAgICB9IGVsc2UgaWYgKCQoY3VyX2lkKS5wYXJlbnRzKFwic2VjdGlvbltyb2xlPWRvYy1iaWJsaW9ncmFwaHldXCIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgY3VyX2NvdW50ID0gJChjdXJfaWQpLnByZXZBbGwoXCJsaVwiKS5sZW5ndGggKyAxO1xuICAgICAgICAgICQodGhpcykuaHRtbChcIjxzcGFuIGNsYXNzPVxcXCJjZ2VuXFxcIiBjb250ZW50ZWRpdGFibGU9XFxcImZhbHNlXFxcIiBkYXRhLXJhc2gtb3JpZ2luYWwtY29udGVudD1cXFwiXCIgKyBvcmlnaW5hbF9jb250ZW50ICtcbiAgICAgICAgICAgIFwiXFxcIiB0aXRsZT1cXFwiQmlibGlvZ3JhcGhpYyByZWZlcmVuY2UgXCIgKyBjdXJfY291bnQgKyBcIjogXCIgK1xuICAgICAgICAgICAgJChjdXJfaWQpLnRleHQoKS5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKS50cmltKCkgKyBcIlxcXCI+W1wiICsgY3VyX2NvdW50ICsgXCJdPC9zcGFuPlwiKTtcbiAgICAgICAgICAvKiBGb290bm90ZSByZWZlcmVuY2VzIChkb2MtZm9vdG5vdGVzIGFuZCBkb2MtZm9vdG5vdGUgaW5jbHVkZWQgZm9yIGVhc2luZyBiYWNrIGNvbXBhdGliaWxpdHkpICovXG4gICAgICAgIH0gZWxzZSBpZiAoJChjdXJfaWQpLnBhcmVudHMoXCJzZWN0aW9uW3JvbGU9ZG9jLWVuZG5vdGVzXSwgc2VjdGlvbltyb2xlPWRvYy1mb290bm90ZXNdXCIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgY3VyX2NvbnRlbnRzID0gJCh0aGlzKS5wYXJlbnQoKS5jb250ZW50cygpO1xuICAgICAgICAgIHZhciBjdXJfaW5kZXggPSBjdXJfY29udGVudHMuaW5kZXgoJCh0aGlzKSk7XG4gICAgICAgICAgdmFyIHByZXZfdG1wID0gbnVsbDtcbiAgICAgICAgICB3aGlsZSAoY3VyX2luZGV4ID4gMCAmJiAhcHJldl90bXApIHtcbiAgICAgICAgICAgIGN1cl9wcmV2ID0gY3VyX2NvbnRlbnRzW2N1cl9pbmRleCAtIDFdO1xuICAgICAgICAgICAgaWYgKGN1cl9wcmV2Lm5vZGVUeXBlICE9IDMgfHwgJChjdXJfcHJldikudGV4dCgpLnJlcGxhY2UoLyAvZywgJycpICE9ICcnKSB7XG4gICAgICAgICAgICAgIHByZXZfdG1wID0gY3VyX3ByZXY7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjdXJfaW5kZXgtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHByZXZfZWwgPSAkKHByZXZfdG1wKTtcbiAgICAgICAgICB2YXIgY3VycmVudF9pZCA9ICQodGhpcykuYXR0cihcImhyZWZcIik7XG4gICAgICAgICAgdmFyIGZvb3Rub3RlX2VsZW1lbnQgPSAkKGN1cnJlbnRfaWQpO1xuICAgICAgICAgIGlmIChmb290bm90ZV9lbGVtZW50Lmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgIGZvb3Rub3RlX2VsZW1lbnQucGFyZW50KFwic2VjdGlvbltyb2xlPWRvYy1lbmRub3Rlc10sIHNlY3Rpb25bcm9sZT1kb2MtZm9vdG5vdGVzXVwiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgY291bnQgPSAkKGN1cnJlbnRfaWQpLnByZXZBbGwoXCJzZWN0aW9uXCIpLmxlbmd0aCArIDE7XG4gICAgICAgICAgICBpZiAocHJldl9lbC5maW5kKFwic3VwXCIpLmhhc0NsYXNzKFwiZm5cIikpIHtcbiAgICAgICAgICAgICAgJCh0aGlzKS5iZWZvcmUoXCI8c3VwIGNsYXNzPVxcXCJjZ2VuXFxcIiBjb250ZW50ZWRpdGFibGU9XFxcImZhbHNlXFxcIiBkYXRhLXJhc2gtb3JpZ2luYWwtY29udGVudD1cXFwiXFxcIj4sPC9zdXA+XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJCh0aGlzKS5odG1sKFwiPHN1cCBjbGFzcz1cXFwiZm4gY2dlblxcXCIgY29udGVudGVkaXRhYmxlPVxcXCJmYWxzZVxcXCIgZGF0YS1yYXNoLW9yaWdpbmFsLWNvbnRlbnQ9XFxcIlwiICsgb3JpZ2luYWxfY29udGVudCArIFwiXFxcIj5cIiArXG4gICAgICAgICAgICAgIFwiPGEgbmFtZT1cXFwiZm5fcG9pbnRlcl9cIiArIGN1cnJlbnRfaWQucmVwbGFjZShcIiNcIiwgXCJcIikgK1xuICAgICAgICAgICAgICBcIlxcXCIgdGl0bGU9XFxcIkZvb3Rub3RlIFwiICsgY291bnQgKyBcIjogXCIgK1xuICAgICAgICAgICAgICAkKGN1cnJlbnRfaWQpLnRleHQoKS5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKS50cmltKCkgKyBcIlxcXCI+XCIgKyBjb3VudCArIFwiPC9hPjwvc3VwPlwiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCh0aGlzKS5odG1sKFwiPHNwYW4gY2xhc3M9XFxcImVycm9yIGNnZW5cXFwiIGNvbnRlbnRlZGl0YWJsZT1cXFwiZmFsc2VcXFwiIGRhdGEtcmFzaC1vcmlnaW5hbC1jb250ZW50PVxcXCJcIiArIG9yaWdpbmFsX2NvbnRlbnQgK1xuICAgICAgICAgICAgICBcIlxcXCI+RVJSOiBmb290bm90ZSAnXCIgKyBjdXJyZW50X2lkLnJlcGxhY2UoXCIjXCIsIFwiXCIpICsgXCInIGRvZXMgbm90IGV4aXN0PC9zcGFuPlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLyogQ29tbW9uIHNlY3Rpb25zICovXG4gICAgICAgIH0gZWxzZSBpZiAoJChcInNlY3Rpb25cIiArIGN1cl9pZCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBjdXJfY291bnQgPSAkKGN1cl9pZCkuZmluZEhpZXJhcmNoaWNhbE51bWJlcihcbiAgICAgICAgICAgIFwic2VjdGlvbjpub3QoW3JvbGU9ZG9jLWFic3RyYWN0XSk6bm90KFtyb2xlPWRvYy1iaWJsaW9ncmFwaHldKTpcIiArXG4gICAgICAgICAgICBcIm5vdChbcm9sZT1kb2MtZW5kbm90ZXNdKTpub3QoW3JvbGU9ZG9jLWZvb3Rub3Rlc10pOm5vdChbcm9sZT1kb2MtYWNrbm93bGVkZ2VtZW50c10pXCIpO1xuICAgICAgICAgIGlmIChjdXJfY291bnQgIT0gbnVsbCAmJiBjdXJfY291bnQgIT0gXCJcIikge1xuICAgICAgICAgICAgJCh0aGlzKS5odG1sKFwiPHNwYW4gY2xhc3M9XFxcImNnZW5cXFwiIGNvbnRlbnRlZGl0YWJsZT1cXFwiZmFsc2VcXFwiIGRhdGEtcmFzaC1vcmlnaW5hbC1jb250ZW50PVxcXCJcIiArIG9yaWdpbmFsX2NvbnRlbnQgK1xuICAgICAgICAgICAgICBcIlxcXCI+U2VjdGlvbiBcIiArIGN1cl9jb3VudCArIFwiPC9zcGFuPlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLyogUmVmZXJlbmNlIHRvIGZpZ3VyZSBib3hlcyAqL1xuICAgICAgICB9IGVsc2UgaWYgKHJlZmVyZW5jZWRfZWxlbWVudF9maWd1cmUubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBjdXJfY291bnQgPSByZWZlcmVuY2VkX2VsZW1lbnRfZmlndXJlLmZpbmROdW1iZXIoZmlndXJlYm94X3NlbGVjdG9yKTtcbiAgICAgICAgICBpZiAoY3VyX2NvdW50ICE9IDApIHtcbiAgICAgICAgICAgICQodGhpcykuaHRtbChcIjxzcGFuIGNsYXNzPVxcXCJjZ2VuXFxcIiBjb250ZW50ZWRpdGFibGU9XFxcImZhbHNlXFxcIiBkYXRhLXJhc2gtb3JpZ2luYWwtY29udGVudD1cXFwiXCIgKyBvcmlnaW5hbF9jb250ZW50ICtcbiAgICAgICAgICAgICAgXCJcXFwiPkZpZ3VyZSBcIiArIGN1cl9jb3VudCArIFwiPC9zcGFuPlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLyogUmVmZXJlbmNlIHRvIHRhYmxlIGJveGVzICovXG4gICAgICAgIH0gZWxzZSBpZiAocmVmZXJlbmNlZF9lbGVtZW50X3RhYmxlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgY3VyX2NvdW50ID0gcmVmZXJlbmNlZF9lbGVtZW50X3RhYmxlLmZpbmROdW1iZXIodGFibGVib3hfc2VsZWN0b3IpO1xuICAgICAgICAgIGlmIChjdXJfY291bnQgIT0gMCkge1xuICAgICAgICAgICAgJCh0aGlzKS5odG1sKFwiPHNwYW4gY2xhc3M9XFxcImNnZW5cXFwiIGNvbnRlbnRlZGl0YWJsZT1cXFwiZmFsc2VcXFwiIGRhdGEtcmFzaC1vcmlnaW5hbC1jb250ZW50PVxcXCJcIiArIG9yaWdpbmFsX2NvbnRlbnQgK1xuICAgICAgICAgICAgICBcIlxcXCI+VGFibGUgXCIgKyBjdXJfY291bnQgKyBcIjwvc3Bhbj5cIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8qIFJlZmVyZW5jZSB0byBmb3JtdWxhIGJveGVzICovXG4gICAgICAgIH0gZWxzZSBpZiAocmVmZXJlbmNlZF9lbGVtZW50X2Zvcm11bGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBjdXJfY291bnQgPSByZWZlcmVuY2VkX2VsZW1lbnRfZm9ybXVsYS5maW5kTnVtYmVyKGZvcm11bGFib3hfc2VsZWN0b3IpO1xuICAgICAgICAgIGlmIChjdXJfY291bnQgIT0gMCkge1xuICAgICAgICAgICAgJCh0aGlzKS5odG1sKFwiPHNwYW4gY2xhc3M9XFxcImNnZW5cXFwiIGNvbnRlbnRlZGl0YWJsZT1cXFwiZmFsc2VcXFwiIGRhdGEtcmFzaC1vcmlnaW5hbC1jb250ZW50PVxcXCJcIiArIG9yaWdpbmFsX2NvbnRlbnQgK1xuICAgICAgICAgICAgICBcIlxcXCI+Rm9ybXVsYSBcIiArIGN1cl9jb3VudCArIFwiPC9zcGFuPlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLyogUmVmZXJlbmNlIHRvIGxpc3RpbmcgYm94ZXMgKi9cbiAgICAgICAgfSBlbHNlIGlmIChyZWZlcmVuY2VkX2VsZW1lbnRfbGlzdGluZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIGN1cl9jb3VudCA9IHJlZmVyZW5jZWRfZWxlbWVudF9saXN0aW5nLmZpbmROdW1iZXIobGlzdGluZ2JveF9zZWxlY3Rvcik7XG4gICAgICAgICAgaWYgKGN1cl9jb3VudCAhPSAwKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmh0bWwoXCI8c3BhbiBjbGFzcz1cXFwiY2dlblxcXCIgY29udGVudGVkaXRhYmxlPVxcXCJmYWxzZVxcXCIgZGF0YS1yYXNoLW9yaWdpbmFsLWNvbnRlbnQ9XFxcIlwiICsgb3JpZ2luYWxfY29udGVudCArXG4gICAgICAgICAgICAgIFwiXFxcIj5MaXN0aW5nIFwiICsgY3VyX2NvdW50ICsgXCI8L3NwYW4+XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKHRoaXMpLmh0bWwoXCI8c3BhbiBjbGFzcz1cXFwiZXJyb3IgY2dlblxcXCIgY29udGVudGVkaXRhYmxlPVxcXCJmYWxzZVxcXCIgZGF0YS1yYXNoLW9yaWdpbmFsLWNvbnRlbnQ9XFxcIlwiICsgb3JpZ2luYWxfY29udGVudCArXG4gICAgICAgICAgICBcIlxcXCI+RVJSOiByZWZlcmVuY2VkIGVsZW1lbnQgJ1wiICsgY3VyX2lkLnJlcGxhY2UoXCIjXCIsIFwiXCIpICtcbiAgICAgICAgICAgIFwiJyBoYXMgbm90IHRoZSBjb3JyZWN0IHR5cGUgKGl0IHNob3VsZCBiZSBlaXRoZXIgYSBmaWd1cmUsIGEgdGFibGUsIGEgZm9ybXVsYSwgYSBsaXN0aW5nLCBvciBhIHNlY3Rpb24pPC9zcGFuPlwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCh0aGlzKS5yZXBsYWNlV2l0aChcIjxzcGFuIGNsYXNzPVxcXCJlcnJvciBjZ2VuXFxcIiBjb250ZW50ZWRpdGFibGU9XFxcImZhbHNlXFxcIiBkYXRhLXJhc2gtb3JpZ2luYWwtY29udGVudD1cXFwiXCIgKyBvcmlnaW5hbF9jb250ZW50ICtcbiAgICAgICAgICBcIlxcXCI+RVJSOiByZWZlcmVuY2VkIGVsZW1lbnQgJ1wiICsgY3VyX2lkLnJlcGxhY2UoXCIjXCIsIFwiXCIpICsgXCInIGRvZXMgbm90IGV4aXN0PC9zcGFuPlwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICAvKiAvRU5EIFJlZmVyZW5jZXMgKi9cbn1cblxuZnVuY3Rpb24gdXBkYXRlUmVmZXJlbmNlcygpIHtcblxuICBpZiAoJCgnc3Bhbi5jZ2VuW2RhdGEtcmFzaC1vcmlnaW5hbC1jb250ZW50XScpLmxlbmd0aCkge1xuXG4gICAgLy8gUmVzdG9yZSBhbGwgc2F2ZWQgY29udGVudFxuICAgICQoJ3NwYW4uY2dlbltkYXRhLXJhc2gtb3JpZ2luYWwtY29udGVudF0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gU2F2ZSBvcmlnaW5hbCBjb250ZW50IGFuZCByZWZlcmVuY2VcbiAgICAgIGxldCBvcmlnaW5hbF9jb250ZW50ID0gJCh0aGlzKS5hdHRyKCdkYXRhLXJhc2gtb3JpZ2luYWwtY29udGVudCcpXG4gICAgICBsZXQgb3JpZ2luYWxfcmVmZXJlbmNlID0gJCh0aGlzKS5wYXJlbnQoJ2EnKS5hdHRyKCdocmVmJylcblxuICAgICAgJCh0aGlzKS5wYXJlbnQoJ2EnKS5yZXBsYWNlV2l0aChgPGEgY29udGVudGVkaXRhYmxlPVwiZmFsc2VcIiBocmVmPVwiJHtvcmlnaW5hbF9yZWZlcmVuY2V9XCI+JHtvcmlnaW5hbF9jb250ZW50fTwvYT5gKVxuICAgIH0pXG5cbiAgICByZWZlcmVuY2VzKClcbiAgfVxufSIsIi8qKlxuICogVGhpcyBzY3JpcHQgY29udGFpbnMgYWxsIGZpZ3VyZSBib3ggYXZhaWxhYmxlIHdpdGggUkFTSC5cbiAqIFxuICogcGx1Z2luczpcbiAqICByYWplX3RhYmxlXG4gKiAgcmFqZV9maWd1cmVcbiAqICByYWplX2Zvcm11bGFcbiAqICByYWplX2xpc3RpbmdcbiAqL1xuY29uc3QgRElTQUJMRV9TRUxFQ1RPUl9GSUdVUkVTID0gJ2ZpZ3VyZSAqLCBoMSwgaDIsIGgzLCBoNCwgaDUsIGg2J1xuXG5jb25zdCBGSUdVUkVfU0VMRUNUT1IgPSAnZmlndXJlW2lkXSdcblxuY29uc3QgRklHVVJFX1RBQkxFX1NFTEVDVE9SID0gYCR7RklHVVJFX1NFTEVDVE9SfTpoYXModGFibGUpYFxuY29uc3QgVEFCTEVfU1VGRklYID0gJ3RhYmxlXydcblxuY29uc3QgRklHVVJFX0lNQUdFX1NFTEVDVE9SID0gYCR7RklHVVJFX1NFTEVDVE9SfTpoYXMoaW1nOm5vdChbcm9sZT1tYXRoXSkpYFxuY29uc3QgSU1BR0VfU1VGRklYID0gJ2ltZ18nXG5cbmNvbnN0IEZJR1VSRV9GT1JNVUxBX1NFTEVDVE9SID0gYCR7RklHVVJFX1NFTEVDVE9SfTpoYXMoc3ZnW3JvbGU9bWF0aF0pYFxuY29uc3QgSU5MSU5FX0ZPUk1VTEFfU0VMRUNUT1IgPSBgc3BhbjpoYXMoc3ZnW3JvbGU9bWF0aF0pYFxuY29uc3QgRk9STVVMQV9TVUZGSVggPSAnZm9ybXVsYV8nXG5cbmNvbnN0IEZJR1VSRV9MSVNUSU5HX1NFTEVDVE9SID0gYCR7RklHVVJFX1NFTEVDVE9SfTpoYXMocHJlOmhhcyhjb2RlKSlgXG5jb25zdCBMSVNUSU5HX1NVRkZJWCA9ICdsaXN0aW5nXydcblxubGV0IHJlbW92ZV9saXN0aW5nID0gMFxuXG4vKipcbiAqIFJhamVfdGFibGVcbiAqL1xudGlueW1jZS5QbHVnaW5NYW5hZ2VyLmFkZCgncmFqZV90YWJsZScsIGZ1bmN0aW9uIChlZGl0b3IsIHVybCkge1xuXG4gIC8vIEFkZCBhIGJ1dHRvbiB0aGF0IGhhbmRsZSB0aGUgaW5saW5lIGVsZW1lbnRcbiAgZWRpdG9yLmFkZEJ1dHRvbigncmFqZV90YWJsZScsIHtcbiAgICB0aXRsZTogJ3JhamVfdGFibGUnLFxuICAgIGljb246ICdpY29uLXRhYmxlJyxcbiAgICB0b29sdGlwOiAnVGFibGUnLFxuICAgIGRpc2FibGVkU3RhdGVTZWxlY3RvcjogRElTQUJMRV9TRUxFQ1RPUl9GSUdVUkVTLFxuXG4gICAgLy8gQnV0dG9uIGJlaGF2aW91clxuICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gT24gY2xpY2sgYSBkaWFsb2cgaXMgb3BlbmVkXG4gICAgICBlZGl0b3Iud2luZG93TWFuYWdlci5vcGVuKHtcbiAgICAgICAgdGl0bGU6ICdTZWxlY3QgVGFibGUgc2l6ZScsXG4gICAgICAgIGJvZHk6IFt7XG4gICAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICAgIG5hbWU6ICd3aWR0aCcsXG4gICAgICAgICAgbGFiZWw6ICdDb2x1bW5zJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgdHlwZTogJ3RleHRib3gnLFxuICAgICAgICAgIG5hbWU6ICdoZWlndGgnLFxuICAgICAgICAgIGxhYmVsOiAnUm93cydcbiAgICAgICAgfV0sXG4gICAgICAgIG9uU3VibWl0OiBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgLy8gR2V0IHdpZHRoIGFuZCBoZWlndGhcbiAgICAgICAgICB0YWJsZS5hZGQoZS5kYXRhLndpZHRoLCBlLmRhdGEuaGVpZ3RoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfSlcblxuICAvLyBCZWNhdXNlIHNvbWUgYmVoYXZpb3VycyBhcmVuJ3QgYWNjZXB0ZWQsIFJBSkUgbXVzdCBjaGVjayBzZWxlY3Rpb24gYW5kIGFjY2VwdCBiYWNrc3BhY2UsIGNhbmMgYW5kIGVudGVyIHByZXNzXG4gIGVkaXRvci5vbigna2V5RG93bicsIGZ1bmN0aW9uIChlKSB7XG5cbiAgICAvLyBrZXlDb2RlIDggaXMgYmFja3NwYWNlLCA0NiBpcyBjYW5jXG4gICAgaWYgKGUua2V5Q29kZSA9PSA4KVxuICAgICAgcmV0dXJuIGhhbmRsZUZpZ3VyZURlbGV0ZSh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24pXG5cbiAgICBpZiAoZS5rZXlDb2RlID09IDQ2KVxuICAgICAgcmV0dXJuIGhhbmRsZUZpZ3VyZUNhbmModGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uKVxuXG4gICAgLy8gSGFuZGxlIGVudGVyIGtleSBpbiBmaWdjYXB0aW9uXG4gICAgaWYgKGUua2V5Q29kZSA9PSAxMylcbiAgICAgIHJldHVybiBoYW5kbGVGaWd1cmVFbnRlcih0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24pXG5cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gIH0pXG5cbiAgLy8gSGFuZGxlIHN0cmFuZ2Ugc3RydWN0dXJhbCBtb2RpZmljYXRpb24gZW1wdHkgZmlndXJlcyBvciB3aXRoIGNhcHRpb24gYXMgZmlyc3QgY2hpbGRcbiAgZWRpdG9yLm9uKCdub2RlQ2hhbmdlJywgZnVuY3Rpb24gKGUpIHtcbiAgICBoYW5kbGVGaWd1cmVDaGFuZ2UodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uKVxuICB9KVxuXG4gIHRhYmxlID0ge1xuXG4gICAgLyoqXG4gICAgICogQWRkIHRoZSBuZXcgdGFibGUgKHdpdGggZ2l2ZW4gc2l6ZSkgYXQgdGhlIGNhcmV0IHBvc2l0aW9uXG4gICAgICovXG4gICAgYWRkOiBmdW5jdGlvbiAod2lkdGgsIGhlaWd0aCkge1xuXG4gICAgICAvLyBHZXQgdGhlIHJlZmVyZW5jZSBvZiB0aGUgY3VycmVudCBzZWxlY3RlZCBlbGVtZW50XG4gICAgICBsZXQgc2VsZWN0ZWRFbGVtZW50ID0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpKVxuXG4gICAgICAvLyBHZXQgdGhlIHJlZmVyZW5jZSBvZiB0aGUgbmV3IGNyZWF0ZWQgdGFibGVcbiAgICAgIGxldCBuZXdUYWJsZSA9IHRoaXMuY3JlYXRlKHdpZHRoLCBoZWlndGgsIGdldFN1Y2Nlc3NpdmVFbGVtZW50SWQoRklHVVJFX1RBQkxFX1NFTEVDVE9SLCBUQUJMRV9TVUZGSVgpKVxuXG4gICAgICAvLyBCZWdpbiBhdG9taWMgVU5ETyBsZXZlbCBcbiAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnVuZG9NYW5hZ2VyLnRyYW5zYWN0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgc2VsZWN0ZWQgZWxlbWVudCBpcyBub3QgZW1wdHksIGFuZCBhZGQgdGFibGUgYWZ0ZXJcbiAgICAgICAgaWYgKHNlbGVjdGVkRWxlbWVudC50ZXh0KCkudHJpbSgpLmxlbmd0aCAhPSAwKSB7XG5cbiAgICAgICAgICAvLyBJZiBzZWxlY3Rpb24gaXMgYXQgc3RhcnQgb2YgdGhlIHNlbGVjdGVkIGVsZW1lbnRcbiAgICAgICAgICBpZiAodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldFJuZygpLnN0YXJ0T2Zmc2V0ID09IDApXG4gICAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQuYmVmb3JlKG5ld1RhYmxlKVxuXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LmFmdGVyKG5ld1RhYmxlKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgc2VsZWN0ZWQgZWxlbWVudCBpcyBlbXB0eSwgcmVwbGFjZSBpdCB3aXRoIHRoZSBuZXcgdGFibGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNlbGVjdGVkRWxlbWVudC5yZXBsYWNlV2l0aChuZXdUYWJsZSlcblxuICAgICAgICAvLyBTYXZlIHVwZGF0ZXMgXG4gICAgICAgIHRpbnltY2UudHJpZ2dlclNhdmUoKVxuXG4gICAgICAgIC8vIFVwZGF0ZSBhbGwgY2FwdGlvbnMgd2l0aCBSQVNIIGZ1bmN0aW9uXG4gICAgICAgIGNhcHRpb25zKClcblxuICAgICAgICAvLyBVcGRhdGUgUmVuZGVyZWQgUkFTSFxuICAgICAgICB1cGRhdGVJZnJhbWVGcm9tU2F2ZWRDb250ZW50KClcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aGUgbmV3IHRhYmxlIHVzaW5nIHBhc3NlZCB3aWR0aCBhbmQgaGVpZ2h0XG4gICAgICovXG4gICAgY3JlYXRlOiBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgaWQpIHtcblxuICAgICAgLy8gSWYgd2lkdGggYW5kIGhlaWd0aCBhcmUgcG9zaXRpdmVcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICh3aWR0aCA+IDAgJiYgaGVpZ2h0ID4gMCkge1xuXG4gICAgICAgICAgLy8gQ3JlYXRlIGZpZ3VyZSBhbmQgdGFibGVcbiAgICAgICAgICBsZXQgZmlndXJlID0gJChgPGZpZ3VyZSBpZD1cIiR7aWR9XCI+PC9maWd1cmU+YClcbiAgICAgICAgICBsZXQgdGFibGUgPSAkKGA8dGFibGU+PC90YWJsZT5gKVxuXG4gICAgICAgICAgLy8gUG9wdWxhdGUgd2l0aCB3aWR0aCAmIGhlaWd0aFxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGhlaWdodDsgaSsrKSB7XG5cbiAgICAgICAgICAgIGxldCByb3cgPSAkKGA8dHI+PC90cj5gKVxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG5cbiAgICAgICAgICAgICAgaWYgKGkgPT0gMClcbiAgICAgICAgICAgICAgICByb3cuYXBwZW5kKGA8dGg+SGVhZGluZyBjZWxsICR7eCsxfTwvdGg+YClcblxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcm93LmFwcGVuZChgPHRkPjxwPkRhdGEgY2VsbCAke3grMX08L3A+PC90ZD5gKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YWJsZS5hcHBlbmQocm93KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGZpZ3VyZS5hcHBlbmQodGFibGUpXG4gICAgICAgICAgZmlndXJlLmFwcGVuZChgPGZpZ2NhcHRpb24+Q2FwdGlvbi48L2ZpZ2NhcHRpb24+YClcblxuICAgICAgICAgIHJldHVybiBmaWd1cmVcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gIH1cbn0pXG5cbi8qKlxuICogUmFqZV9maWd1cmVcbiAqL1xudGlueW1jZS5QbHVnaW5NYW5hZ2VyLmFkZCgncmFqZV9pbWFnZScsIGZ1bmN0aW9uIChlZGl0b3IsIHVybCkge1xuXG4gIC8vIEFkZCBhIGJ1dHRvbiB0aGF0IGhhbmRsZSB0aGUgaW5saW5lIGVsZW1lbnRcbiAgZWRpdG9yLmFkZEJ1dHRvbigncmFqZV9pbWFnZScsIHtcbiAgICB0aXRsZTogJ3JhamVfaW1hZ2UnLFxuICAgIGljb246ICdpY29uLWltYWdlJyxcbiAgICB0b29sdGlwOiAnSW1hZ2UgYmxvY2snLFxuICAgIGRpc2FibGVkU3RhdGVTZWxlY3RvcjogRElTQUJMRV9TRUxFQ1RPUl9GSUdVUkVTLFxuXG4gICAgLy8gQnV0dG9uIGJlaGF2aW91clxuICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgbGV0IGZpbGVuYW1lID0gc2VsZWN0SW1hZ2UoKVxuXG4gICAgICBpbWFnZS5hZGQoZmlsZW5hbWUsIGZpbGVuYW1lKVxuICAgIH1cbiAgfSlcblxuICAvLyBCZWNhdXNlIHNvbWUgYmVoYXZpb3VycyBhcmVuJ3QgYWNjZXB0ZWQsIFJBSkUgbXVzdCBjaGVjayBzZWxlY3Rpb24gYW5kIGFjY2VwdCBiYWNrc3BhY2UsIGNhbmMgYW5kIGVudGVyIHByZXNzXG4gIGVkaXRvci5vbigna2V5RG93bicsIGZ1bmN0aW9uIChlKSB7XG5cbiAgICAvLyBrZXlDb2RlIDggaXMgYmFja3NwYWNlXG4gICAgaWYgKGUua2V5Q29kZSA9PSA4KVxuICAgICAgcmV0dXJuIGhhbmRsZUZpZ3VyZURlbGV0ZSh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24pXG5cbiAgICBpZiAoZS5rZXlDb2RlID09IDQ2KVxuICAgICAgcmV0dXJuIGhhbmRsZUZpZ3VyZUNhbmModGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uKVxuXG4gICAgLy8gSGFuZGxlIGVudGVyIGtleSBpbiBmaWdjYXB0aW9uXG4gICAgaWYgKGUua2V5Q29kZSA9PSAxMylcbiAgICAgIHJldHVybiBoYW5kbGVGaWd1cmVFbnRlcih0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24pXG4gIH0pXG5cbiAgaW1hZ2UgPSB7XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKi9cbiAgICBhZGQ6IGZ1bmN0aW9uICh1cmwsIGFsdCkge1xuXG4gICAgICAvLyBHZXQgdGhlIHJlZmVyZWNlIG9mIHRoZSBzZWxlY3RlZCBlbGVtZW50XG4gICAgICBsZXQgc2VsZWN0ZWRFbGVtZW50ID0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpKVxuICAgICAgbGV0IG5ld0ZpZ3VyZSA9IHRoaXMuY3JlYXRlKHVybCwgYWx0LCBnZXRTdWNjZXNzaXZlRWxlbWVudElkKEZJR1VSRV9JTUFHRV9TRUxFQ1RPUiwgSU1BR0VfU1VGRklYKSlcblxuICAgICAgLy8gQmVnaW4gYXRvbWljIFVORE8gbGV2ZWwgXG4gICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci51bmRvTWFuYWdlci50cmFuc2FjdChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNlbGVjdGVkIGVsZW1lbnQgaXMgbm90IGVtcHR5LCBhbmQgYWRkIHRhYmxlIGFmdGVyXG4gICAgICAgIGlmIChzZWxlY3RlZEVsZW1lbnQudGV4dCgpLnRyaW0oKS5sZW5ndGggIT0gMCkge1xuXG4gICAgICAgICAgLy8gSWYgc2VsZWN0aW9uIGlzIGF0IHN0YXJ0IG9mIHRoZSBzZWxlY3RlZCBlbGVtZW50XG4gICAgICAgICAgaWYgKHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5nZXRSbmcoKS5zdGFydE9mZnNldCA9PSAwKVxuICAgICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LmJlZm9yZShuZXdGaWd1cmUpXG5cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQuYWZ0ZXIobmV3RmlndXJlKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgc2VsZWN0ZWQgZWxlbWVudCBpcyBlbXB0eSwgcmVwbGFjZSBpdCB3aXRoIHRoZSBuZXcgdGFibGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNlbGVjdGVkRWxlbWVudC5yZXBsYWNlV2l0aChuZXdGaWd1cmUpXG5cbiAgICAgICAgLy8gU2F2ZSB1cGRhdGVzIFxuICAgICAgICB0aW55bWNlLnRyaWdnZXJTYXZlKClcblxuICAgICAgICAvLyBVcGRhdGUgYWxsIGNhcHRpb25zIHdpdGggUkFTSCBmdW5jdGlvblxuICAgICAgICBjYXB0aW9ucygpXG5cbiAgICAgICAgLy8gVXBkYXRlIFJlbmRlcmVkIFJBU0hcbiAgICAgICAgdXBkYXRlSWZyYW1lRnJvbVNhdmVkQ29udGVudCgpXG4gICAgICB9KVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKi9cbiAgICBjcmVhdGU6IGZ1bmN0aW9uICh1cmwsIGFsdCwgaWQpIHtcbiAgICAgIHJldHVybiAkKGA8ZmlndXJlIGlkPVwiJHtpZH1cIj48cD48aW1nIHNyYz1cIiR7dXJsfVwiICR7YWx0PydhbHQ9XCInK2FsdCsnXCInOicnfSAvPjwvcD48ZmlnY2FwdGlvbj5DYXB0aW9uLjwvZmlnY2FwdGlvbj48L2ZpZ3VyZT5gKVxuICAgIH1cbiAgfVxufSlcblxuLyoqXG4gKiBSYWplX2Zvcm11bGFcbiAqL1xuXG5mdW5jdGlvbiBvcGVuRm9ybXVsYUVkaXRvcihmb3JtdWxhVmFsdWUsIGNhbGxiYWNrKSB7XG4gIHRpbnltY2UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIub3Blbih7XG4gICAgICB0aXRsZTogJ01hdGggZm9ybXVsYSBlZGl0b3InLFxuICAgICAgdXJsOiAnanMvcmFqZW1jZS9wbHVnaW4vcmFqZV9mb3JtdWxhLmh0bWwnLFxuICAgICAgd2lkdGg6IDgwMCxcbiAgICAgIGhlaWdodDogNTAwLFxuICAgICAgb25DbG9zZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGxldCBvdXRwdXQgPSB0aW55bWNlLmFjdGl2ZUVkaXRvci5mb3JtdWxhX291dHB1dFxuXG4gICAgICAgIC8vIElmIGF0IGxlYXN0IGZvcm11bGEgaXMgd3JpdHRlblxuICAgICAgICBpZiAob3V0cHV0ICE9IG51bGwpIHtcblxuICAgICAgICAgIC8vIElmIGhhcyBpZCwgUkFKRSBtdXN0IHVwZGF0ZSBpdFxuICAgICAgICAgIGlmIChvdXRwdXQuZm9ybXVsYV9pZClcbiAgICAgICAgICAgIGZvcm11bGEudXBkYXRlKG91dHB1dC5mb3JtdWxhX3N2Zywgb3V0cHV0LmZvcm11bGFfaWQpXG5cbiAgICAgICAgICAvLyBPciBhZGQgaXQgbm9ybWFsbHlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBmb3JtdWxhLmFkZChvdXRwdXQuZm9ybXVsYV9zdmcpXG5cbiAgICAgICAgICAvLyBTZXQgZm9ybXVsYSBudWxsXG4gICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IuZm9ybXVsYV9vdXRwdXQgPSBudWxsXG4gICAgICAgIH1cblxuICAgICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci53aW5kb3dNYW5hZ2VyLmNsb3NlKClcbiAgICAgIH1cbiAgICB9LFxuICAgIGZvcm11bGFWYWx1ZVxuICApXG59XG5cbnRpbnltY2UuUGx1Z2luTWFuYWdlci5hZGQoJ3JhamVfZm9ybXVsYScsIGZ1bmN0aW9uIChlZGl0b3IsIHVybCkge1xuXG4gIC8vIEFkZCBhIGJ1dHRvbiB0aGF0IGhhbmRsZSB0aGUgaW5saW5lIGVsZW1lbnRcbiAgZWRpdG9yLmFkZEJ1dHRvbigncmFqZV9mb3JtdWxhJywge1xuICAgIHRleHQ6ICdyYWplX2Zvcm11bGEnLFxuICAgIGljb246IGZhbHNlLFxuICAgIHRvb2x0aXA6ICdGb3JtdWxhJyxcbiAgICBkaXNhYmxlZFN0YXRlU2VsZWN0b3I6IERJU0FCTEVfU0VMRUNUT1JfRklHVVJFUyxcblxuICAgIC8vIEJ1dHRvbiBiZWhhdmlvdXJcbiAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICBvcGVuRm9ybXVsYUVkaXRvcigpXG4gICAgfVxuICB9KVxuXG4gIC8vIEJlY2F1c2Ugc29tZSBiZWhhdmlvdXJzIGFyZW4ndCBhY2NlcHRlZCwgUkFKRSBtdXN0IGNoZWNrIHNlbGVjdGlvbiBhbmQgYWNjZXB0IGJhY2tzcGFjZSwgY2FuYyBhbmQgZW50ZXIgcHJlc3NcbiAgZWRpdG9yLm9uKCdrZXlEb3duJywgZnVuY3Rpb24gKGUpIHtcblxuICAgIC8vIGtleUNvZGUgOCBpcyBiYWNrc3BhY2VcbiAgICBpZiAoZS5rZXlDb2RlID09IDgpXG4gICAgICByZXR1cm4gaGFuZGxlRmlndXJlRGVsZXRlKHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbilcblxuICAgIGlmIChlLmtleUNvZGUgPT0gNDYpXG4gICAgICByZXR1cm4gaGFuZGxlRmlndXJlQ2FuYyh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24pXG5cbiAgICAvLyBIYW5kbGUgZW50ZXIga2V5IGluIGZpZ2NhcHRpb25cbiAgICBpZiAoZS5rZXlDb2RlID09IDEzKVxuICAgICAgcmV0dXJuIGhhbmRsZUZpZ3VyZUVudGVyKHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbilcbiAgfSlcblxuICBlZGl0b3Iub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBsZXQgc2VsZWN0ZWRFbGVtZW50ID0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpKVxuXG4gICAgLy8gT3BlbiBmb3JtdWxhIGVkaXRvciBjbGlja2luZyBvbiBtYXRoIGZvcm11bGFzXG4gICAgaWYgKHNlbGVjdGVkRWxlbWVudC5wYXJlbnRzKEZJR1VSRV9TRUxFQ1RPUikubGVuZ3RoICYmIHNlbGVjdGVkRWxlbWVudC5jaGlsZHJlbignc3ZnW3JvbGU9bWF0aF0nKS5sZW5ndGgpIHtcblxuICAgICAgb3BlbkZvcm11bGFFZGl0b3Ioe1xuICAgICAgICBmb3JtdWxhX3ZhbDogc2VsZWN0ZWRFbGVtZW50LmNoaWxkcmVuKCdzdmdbcm9sZT1tYXRoXScpLmF0dHIoJ2RhdGEtbWF0aC1vcmlnaW5hbC1pbnB1dCcpLFxuICAgICAgICBmb3JtdWxhX2lkOiBzZWxlY3RlZEVsZW1lbnQucGFyZW50cyhGSUdVUkVfU0VMRUNUT1IpLmF0dHIoJ2lkJylcbiAgICAgIH0pXG4gICAgfVxuICB9KVxuXG4gIGZvcm11bGEgPSB7XG4gICAgLyoqXG4gICAgICogXG4gICAgICovXG4gICAgYWRkOiBmdW5jdGlvbiAoZm9ybXVsYV9zdmcpIHtcblxuICAgICAgbGV0IHNlbGVjdGVkRWxlbWVudCA9ICQodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldE5vZGUoKSlcbiAgICAgIGxldCBuZXdGb3JtdWxhID0gdGhpcy5jcmVhdGUoZm9ybXVsYV9zdmcsIGdldFN1Y2Nlc3NpdmVFbGVtZW50SWQoYCR7RklHVVJFX0ZPUk1VTEFfU0VMRUNUT1J9LCR7SU5MSU5FX0ZPUk1VTEFfU0VMRUNUT1J9YCwgRk9STVVMQV9TVUZGSVgpKVxuXG4gICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci51bmRvTWFuYWdlci50cmFuc2FjdChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNlbGVjdGVkIGVsZW1lbnQgaXMgbm90IGVtcHR5LCBhbmQgYWRkIHRhYmxlIGFmdGVyXG4gICAgICAgIGlmIChzZWxlY3RlZEVsZW1lbnQudGV4dCgpLnRyaW0oKS5sZW5ndGggIT0gMClcbiAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQuYWZ0ZXIobmV3Rm9ybXVsYSlcblxuICAgICAgICAvLyBJZiBzZWxlY3RlZCBlbGVtZW50IGlzIGVtcHR5LCByZXBsYWNlIGl0IHdpdGggdGhlIG5ldyB0YWJsZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0Zvcm11bGEpXG5cbiAgICAgICAgLy8gU2F2ZSB1cGRhdGVzIFxuICAgICAgICB0aW55bWNlLnRyaWdnZXJTYXZlKClcblxuICAgICAgICBjYXB0aW9ucygpXG5cbiAgICAgICAgLy8gVXBkYXRlIFJlbmRlcmVkIFJBU0hcbiAgICAgICAgdXBkYXRlSWZyYW1lRnJvbVNhdmVkQ29udGVudCgpXG4gICAgICB9KVxuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqL1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGZvcm11bGFfc3ZnLCBmb3JtdWxhX2lkKSB7XG5cbiAgICAgIGxldCBzZWxlY3RlZEZpZ3VyZSA9ICQoYCMke2Zvcm11bGFfaWR9YClcblxuICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHNlbGVjdGVkRmlndXJlLmZpbmQoJ3N2ZycpLnJlcGxhY2VXaXRoKGZvcm11bGFfc3ZnKVxuICAgICAgICB1cGRhdGVJZnJhbWVGcm9tU2F2ZWRDb250ZW50KClcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqL1xuICAgIGNyZWF0ZTogZnVuY3Rpb24gKGZvcm11bGFfc3ZnLCBpZCkge1xuICAgICAgLy9yZXR1cm4gYDxmaWd1cmUgaWQ9XCIke2lkfVwiPjxwPjxzcGFuIHJvbGU9XCJtYXRoXCIgY29udGVudGVkaXRhYmxlPVwiZmFsc2VcIj5cXGBcXGAke2Zvcm11bGFfaW5wdXR9XFxgXFxgPC9zcGFuPjwvcD48L2ZpZ3VyZT5gXG4gICAgICByZXR1cm4gYDxmaWd1cmUgaWQ9XCIke2lkfVwiPjxwPjxzcGFuIGNvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCI+JHtmb3JtdWxhX3N2Z1swXS5vdXRlckhUTUx9PC9zcGFuPjwvcD48L2ZpZ3VyZT5gXG4gICAgfVxuICB9XG59KVxuXG5mdW5jdGlvbiBvcGVuSW5saW5lRm9ybXVsYUVkaXRvcihmb3JtdWxhVmFsdWUsIGNhbGxiYWNrKSB7XG4gIHRpbnltY2UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIub3Blbih7XG4gICAgICB0aXRsZTogJ01hdGggZm9ybXVsYSBlZGl0b3InLFxuICAgICAgdXJsOiAnanMvcmFqZW1jZS9wbHVnaW4vcmFqZV9mb3JtdWxhLmh0bWwnLFxuICAgICAgd2lkdGg6IDgwMCxcbiAgICAgIGhlaWdodDogNTAwLFxuICAgICAgb25DbG9zZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGxldCBvdXRwdXQgPSB0aW55bWNlLmFjdGl2ZUVkaXRvci5mb3JtdWxhX291dHB1dFxuXG4gICAgICAgIC8vIElmIGF0IGxlYXN0IGZvcm11bGEgaXMgd3JpdHRlblxuICAgICAgICBpZiAob3V0cHV0ICE9IG51bGwpIHtcblxuICAgICAgICAgIC8vIElmIGhhcyBpZCwgUkFKRSBtdXN0IHVwZGF0ZSBpdFxuICAgICAgICAgIGlmIChvdXRwdXQuZm9ybXVsYV9pZClcbiAgICAgICAgICAgIGlubGluZV9mb3JtdWxhLnVwZGF0ZShvdXRwdXQuZm9ybXVsYV9zdmcsIG91dHB1dC5mb3JtdWxhX2lkKVxuXG4gICAgICAgICAgLy8gT3IgYWRkIGl0IG5vcm1hbGx5XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgaW5saW5lX2Zvcm11bGEuYWRkKG91dHB1dC5mb3JtdWxhX3N2ZylcblxuICAgICAgICAgIC8vIFNldCBmb3JtdWxhIG51bGxcbiAgICAgICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci5mb3JtdWxhX291dHB1dCA9IG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIuY2xvc2UoKVxuICAgICAgfVxuICAgIH0sXG4gICAgZm9ybXVsYVZhbHVlXG4gIClcbn1cblxudGlueW1jZS5QbHVnaW5NYW5hZ2VyLmFkZCgncmFqZV9pbmxpbmVfZm9ybXVsYScsIGZ1bmN0aW9uIChlZGl0b3IsIHVybCkge1xuXG4gIGVkaXRvci5hZGRCdXR0b24oJ3JhamVfaW5saW5lX2Zvcm11bGEnLCB7XG4gICAgdGV4dDogJ3JhamVfaW5saW5lX2Zvcm11bGEnLFxuICAgIGljb246IGZhbHNlLFxuICAgIHRvb2x0aXA6ICdJbmxpbmUgZm9ybXVsYScsXG4gICAgZGlzYWJsZWRTdGF0ZVNlbGVjdG9yOiBESVNBQkxFX1NFTEVDVE9SX0ZJR1VSRVMsXG5cbiAgICAvLyBCdXR0b24gYmVoYXZpb3VyXG4gICAgb25jbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgb3BlbklubGluZUZvcm11bGFFZGl0b3IoKVxuICAgIH1cbiAgfSlcblxuICBlZGl0b3Iub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBsZXQgc2VsZWN0ZWRFbGVtZW50ID0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpKVxuXG4gICAgLy8gT3BlbiBmb3JtdWxhIGVkaXRvciBjbGlja2luZyBvbiBtYXRoIGZvcm11bGFzXG4gICAgaWYgKHNlbGVjdGVkRWxlbWVudC5jaGlsZHJlbignc3ZnW3JvbGU9bWF0aF0nKS5sZW5ndGgpIHtcblxuICAgICAgb3BlbklubGluZUZvcm11bGFFZGl0b3Ioe1xuICAgICAgICBmb3JtdWxhX3ZhbDogc2VsZWN0ZWRFbGVtZW50LmNoaWxkcmVuKCdzdmdbcm9sZT1tYXRoXScpLmF0dHIoJ2RhdGEtbWF0aC1vcmlnaW5hbC1pbnB1dCcpLFxuICAgICAgICBmb3JtdWxhX2lkOiBzZWxlY3RlZEVsZW1lbnQuYXR0cignaWQnKVxuICAgICAgfSlcbiAgICB9XG4gIH0pXG5cbiAgaW5saW5lX2Zvcm11bGEgPSB7XG4gICAgLyoqXG4gICAgICogXG4gICAgICovXG4gICAgYWRkOiBmdW5jdGlvbiAoZm9ybXVsYV9zdmcpIHtcblxuICAgICAgbGV0IHNlbGVjdGVkRWxlbWVudCA9ICQodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldE5vZGUoKSlcbiAgICAgIGxldCBuZXdGb3JtdWxhID0gdGhpcy5jcmVhdGUoZm9ybXVsYV9zdmcsIGdldFN1Y2Nlc3NpdmVFbGVtZW50SWQoYCR7RklHVVJFX0ZPUk1VTEFfU0VMRUNUT1J9LCR7SU5MSU5FX0ZPUk1VTEFfU0VMRUNUT1J9YCwgRk9STVVMQV9TVUZGSVgpKVxuXG4gICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci51bmRvTWFuYWdlci50cmFuc2FjdChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNldENvbnRlbnQobmV3Rm9ybXVsYSlcblxuICAgICAgICAvLyBTYXZlIHVwZGF0ZXMgXG4gICAgICAgIHRpbnltY2UudHJpZ2dlclNhdmUoKVxuXG4gICAgICAgIGNhcHRpb25zKClcblxuICAgICAgICAvLyBVcGRhdGUgUmVuZGVyZWQgUkFTSFxuICAgICAgICB1cGRhdGVJZnJhbWVGcm9tU2F2ZWRDb250ZW50KClcbiAgICAgIH0pXG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICovXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZm9ybXVsYV9zdmcsIGZvcm11bGFfaWQpIHtcblxuICAgICAgbGV0IHNlbGVjdGVkRmlndXJlID0gJChgIyR7Zm9ybXVsYV9pZH1gKVxuXG4gICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci51bmRvTWFuYWdlci50cmFuc2FjdChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgc2VsZWN0ZWRGaWd1cmUuZmluZCgnc3ZnJykucmVwbGFjZVdpdGgoZm9ybXVsYV9zdmcpXG4gICAgICAgIHVwZGF0ZUlmcmFtZUZyb21TYXZlZENvbnRlbnQoKVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICovXG4gICAgY3JlYXRlOiBmdW5jdGlvbiAoZm9ybXVsYV9zdmcsIGlkKSB7XG4gICAgICByZXR1cm4gYDxzcGFuIGlkPVwiJHtpZH1cIiBjb250ZW50ZWRpdGFibGU9XCJmYWxzZVwiPiR7Zm9ybXVsYV9zdmdbMF0ub3V0ZXJIVE1MfTwvc3Bhbj5gXG4gICAgfVxuICB9XG59KVxuXG4vKipcbiAqIFJhamVfbGlzdGluZ1xuICovXG50aW55bWNlLlBsdWdpbk1hbmFnZXIuYWRkKCdyYWplX2xpc3RpbmcnLCBmdW5jdGlvbiAoZWRpdG9yLCB1cmwpIHtcblxuICAvLyBBZGQgYSBidXR0b24gdGhhdCBoYW5kbGUgdGhlIGlubGluZSBlbGVtZW50XG4gIGVkaXRvci5hZGRCdXR0b24oJ3JhamVfbGlzdGluZycsIHtcbiAgICB0aXRsZTogJ3JhamVfbGlzdGluZycsXG4gICAgaWNvbjogJ2ljb24tbGlzdGluZycsXG4gICAgdG9vbHRpcDogJ0xpc3RpbmcnLFxuICAgIGRpc2FibGVkU3RhdGVTZWxlY3RvcjogRElTQUJMRV9TRUxFQ1RPUl9GSUdVUkVTLFxuXG4gICAgLy8gQnV0dG9uIGJlaGF2aW91clxuICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxpc3RpbmcuYWRkKClcbiAgICB9XG4gIH0pXG5cbiAgLy8gQmVjYXVzZSBzb21lIGJlaGF2aW91cnMgYXJlbid0IGFjY2VwdGVkLCBSQUpFIG11c3QgY2hlY2sgc2VsZWN0aW9uIGFuZCBhY2NlcHQgYmFja3NwYWNlLCBjYW5jIGFuZCBlbnRlciBwcmVzc1xuICBlZGl0b3Iub24oJ2tleURvd24nLCBmdW5jdGlvbiAoZSkge1xuXG4gICAgLy8ga2V5Q29kZSA4IGlzIGJhY2tzcGFjZVxuICAgIGlmIChlLmtleUNvZGUgPT0gOClcbiAgICAgIHJldHVybiBoYW5kbGVGaWd1cmVEZWxldGUodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uKVxuXG4gICAgaWYgKGUua2V5Q29kZSA9PSA0NilcbiAgICAgIHJldHVybiBoYW5kbGVGaWd1cmVDYW5jKHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbilcblxuICAgIC8vIEhhbmRsZSBlbnRlciBrZXkgaW4gZmlnY2FwdGlvblxuICAgIGlmIChlLmtleUNvZGUgPT0gMTMpXG4gICAgICByZXR1cm4gaGFuZGxlRmlndXJlRW50ZXIodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uKVxuXG4gICAgaWYgKGUua2V5Q29kZSA9PSA5KSB7XG4gICAgICBpZiAodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmlzQ29sbGFwc2VkKCkgJiYgJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpKS5wYXJlbnRzKGBjb2RlLCR7RklHVVJFX1NFTEVDVE9SfWApLmxlbmd0aCkge1xuICAgICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uc2V0Q29udGVudCgnXFx0JylcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGUua2V5Q29kZSA9PSAzNykge1xuICAgICAgbGV0IHJhbmdlID0gdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldFJuZygpXG4gICAgICBsZXQgc3RhcnROb2RlID0gJChyYW5nZS5zdGFydENvbnRhaW5lcilcbiAgICAgIGlmIChzdGFydE5vZGUucGFyZW50KCkuaXMoJ2NvZGUnKSAmJiAoc3RhcnROb2RlLnBhcmVudCgpLmNvbnRlbnRzKCkuaW5kZXgoc3RhcnROb2RlKSA9PSAwICYmIHJhbmdlLnN0YXJ0T2Zmc2V0ID09IDEpKSB7XG4gICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5zZXRDdXJzb3JMb2NhdGlvbihzdGFydE5vZGUucGFyZW50cyhGSUdVUkVfU0VMRUNUT1IpLnByZXYoJ3AsOmhlYWRlcicpWzBdLCAxKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgbGlzdGluZyA9IHtcbiAgICAvKipcbiAgICAgKiBcbiAgICAgKi9cbiAgICBhZGQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgbGV0IHNlbGVjdGVkRWxlbWVudCA9ICQodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldE5vZGUoKSlcbiAgICAgIGxldCBuZXdMaXN0aW5nID0gdGhpcy5jcmVhdGUoZ2V0U3VjY2Vzc2l2ZUVsZW1lbnRJZChGSUdVUkVfTElTVElOR19TRUxFQ1RPUiwgTElTVElOR19TVUZGSVgpKVxuXG4gICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci51bmRvTWFuYWdlci50cmFuc2FjdChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNlbGVjdGVkIGVsZW1lbnQgaXMgbm90IGVtcHR5LCBhbmQgYWRkIHRhYmxlIGFmdGVyXG4gICAgICAgIGlmIChzZWxlY3RlZEVsZW1lbnQudGV4dCgpLnRyaW0oKS5sZW5ndGggIT0gMClcbiAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQuYWZ0ZXIobmV3TGlzdGluZylcblxuICAgICAgICAvLyBJZiBzZWxlY3RlZCBlbGVtZW50IGlzIGVtcHR5LCByZXBsYWNlIGl0IHdpdGggdGhlIG5ldyB0YWJsZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0xpc3RpbmcpXG5cbiAgICAgICAgLy8gU2F2ZSB1cGRhdGVzIFxuICAgICAgICB0aW55bWNlLnRyaWdnZXJTYXZlKClcblxuICAgICAgICAvLyBVcGRhdGUgYWxsIGNhcHRpb25zIHdpdGggUkFTSCBmdW5jdGlvblxuICAgICAgICBjYXB0aW9ucygpXG5cbiAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNlbGVjdChuZXdMaXN0aW5nLmZpbmQoJ2NvZGUnKVswXSlcbiAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmNvbGxhcHNlKGZhbHNlKVxuICAgICAgICAvLyBVcGRhdGUgUmVuZGVyZWQgUkFTSFxuICAgICAgICB1cGRhdGVJZnJhbWVGcm9tU2F2ZWRDb250ZW50KClcbiAgICAgIH0pXG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICovXG4gICAgY3JlYXRlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHJldHVybiAkKGA8ZmlndXJlIGlkPVwiJHtpZH1cIj48cHJlPjxjb2RlPiR7WkVST19TUEFDRX08L2NvZGU+PC9wcmU+PGZpZ2NhcHRpb24+Q2FwdGlvbi48L2ZpZ2NhcHRpb24+PC9maWd1cmU+YClcbiAgICB9XG4gIH1cbn0pXG5cbi8qKlxuICogVXBkYXRlIHRhYmxlIGNhcHRpb25zIHdpdGggYSBSQVNIIGZ1bmNpb24gXG4gKi9cbmZ1bmN0aW9uIGNhcHRpb25zKCkge1xuXG4gIC8qIENhcHRpb25zICovXG4gICQoZmlndXJlYm94X3NlbGVjdG9yKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3VyX2NhcHRpb24gPSAkKHRoaXMpLnBhcmVudHMoXCJmaWd1cmVcIikuZmluZChcImZpZ2NhcHRpb25cIik7XG4gICAgdmFyIGN1cl9udW1iZXIgPSAkKHRoaXMpLmZpbmROdW1iZXIoZmlndXJlYm94X3NlbGVjdG9yKTtcbiAgICBjdXJfY2FwdGlvbi5maW5kKCdzdHJvbmcnKS5yZW1vdmUoKTtcbiAgICBjdXJfY2FwdGlvbi5odG1sKFwiPHN0cm9uZyBjbGFzcz1cXFwiY2dlblxcXCIgZGF0YS1yYXNoLW9yaWdpbmFsLWNvbnRlbnQ9XFxcIlxcXCIgY29udGVudGVkaXRhYmxlPVxcXCJmYWxzZVxcXCI+RmlndXJlIFwiICsgY3VyX251bWJlciArXG4gICAgICBcIi4gPC9zdHJvbmc+XCIgKyBjdXJfY2FwdGlvbi5odG1sKCkpO1xuICB9KTtcbiAgJCh0YWJsZWJveF9zZWxlY3RvcikuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN1cl9jYXB0aW9uID0gJCh0aGlzKS5wYXJlbnRzKFwiZmlndXJlXCIpLmZpbmQoXCJmaWdjYXB0aW9uXCIpO1xuICAgIHZhciBjdXJfbnVtYmVyID0gJCh0aGlzKS5maW5kTnVtYmVyKHRhYmxlYm94X3NlbGVjdG9yKTtcbiAgICBjdXJfY2FwdGlvbi5maW5kKCdzdHJvbmcnKS5yZW1vdmUoKTtcbiAgICBjdXJfY2FwdGlvbi5odG1sKFwiPHN0cm9uZyBjbGFzcz1cXFwiY2dlblxcXCIgZGF0YS1yYXNoLW9yaWdpbmFsLWNvbnRlbnQ9XFxcIlxcXCIgY29udGVudGVkaXRhYmxlPVxcXCJmYWxzZVxcXCIgPlRhYmxlIFwiICsgY3VyX251bWJlciArXG4gICAgICBcIi4gPC9zdHJvbmc+XCIgKyBjdXJfY2FwdGlvbi5odG1sKCkpO1xuICB9KTtcbiAgJChmb3JtdWxhYm94X3NlbGVjdG9yKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3VyX2NhcHRpb24gPSAkKHRoaXMpLnBhcmVudHMoXCJmaWd1cmVcIikuZmluZChcInBcIik7XG4gICAgdmFyIGN1cl9udW1iZXIgPSAkKHRoaXMpLmZpbmROdW1iZXIoZm9ybXVsYWJveF9zZWxlY3Rvcik7XG4gICAgY3VyX2NhcHRpb24uZmluZCgnc3Bhbi5jZ2VuJykucmVtb3ZlKCk7XG4gICAgY3VyX2NhcHRpb24uaHRtbChjdXJfY2FwdGlvbi5odG1sKCkgKyBcIjxzcGFuIGNvbnRlbnRlZGl0YWJsZT1cXFwiZmFsc2VcXFwiIGNsYXNzPVxcXCJjZ2VuXFxcIiBkYXRhLXJhc2gtb3JpZ2luYWwtY29udGVudD1cXFwiXFxcIiA+IChcIiArXG4gICAgICBjdXJfbnVtYmVyICsgXCIpPC9zcGFuPlwiKTtcbiAgfSk7XG4gICQobGlzdGluZ2JveF9zZWxlY3RvcikuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN1cl9jYXB0aW9uID0gJCh0aGlzKS5wYXJlbnRzKFwiZmlndXJlXCIpLmZpbmQoXCJmaWdjYXB0aW9uXCIpO1xuICAgIHZhciBjdXJfbnVtYmVyID0gJCh0aGlzKS5maW5kTnVtYmVyKGxpc3Rpbmdib3hfc2VsZWN0b3IpO1xuICAgIGN1cl9jYXB0aW9uLmZpbmQoJ3N0cm9uZycpLnJlbW92ZSgpO1xuICAgIGN1cl9jYXB0aW9uLmh0bWwoXCI8c3Ryb25nIGNsYXNzPVxcXCJjZ2VuXFxcIiBkYXRhLXJhc2gtb3JpZ2luYWwtY29udGVudD1cXFwiXFxcIiBjb250ZW50ZWRpdGFibGU9XFxcImZhbHNlXFxcIj5MaXN0aW5nIFwiICsgY3VyX251bWJlciArXG4gICAgICBcIi4gPC9zdHJvbmc+XCIgKyBjdXJfY2FwdGlvbi5odG1sKCkpO1xuICB9KTtcbiAgLyogL0VORCBDYXB0aW9ucyAqL1xufVxuXG4vKipcbiAqIFxuICogQHBhcmFtIHsqfSBzZWwgPT4gdGlueW1jZSBzZWxlY3Rpb25cbiAqIFxuICogTWFpbmx5IGl0IGNoZWNrcyB3aGVyZSBzZWxlY3Rpb24gc3RhcnRzIGFuZCBlbmRzIHRvIGJsb2NrIHVuYWxsb3dlZCBkZWxldGlvblxuICogSW4gc2FtZSBmaWd1cmUgYXJlbid0IGJsb2NrZWQsIHVubGVzcyBzZWxlY3Rpb24gc3RhcnQgT1IgZW5kIGluc2lkZSBmaWdjYXB0aW9uIChub3QgYm90aClcbiAqL1xuZnVuY3Rpb24gaGFuZGxlRmlndXJlRGVsZXRlKHNlbCkge1xuXG4gIHRyeSB7XG5cbiAgICAvLyBHZXQgcmVmZXJlbmNlIG9mIHN0YXJ0IGFuZCBlbmQgbm9kZVxuICAgIGxldCBzdGFydE5vZGUgPSAkKHNlbC5nZXRSbmcoKS5zdGFydENvbnRhaW5lcilcbiAgICBsZXQgc3RhcnROb2RlUGFyZW50ID0gc3RhcnROb2RlLnBhcmVudHMoRklHVVJFX1NFTEVDVE9SKVxuXG4gICAgbGV0IGVuZE5vZGUgPSAkKHNlbC5nZXRSbmcoKS5lbmRDb250YWluZXIpXG4gICAgbGV0IGVuZE5vZGVQYXJlbnQgPSBlbmROb2RlLnBhcmVudHMoRklHVVJFX1NFTEVDVE9SKVxuXG4gICAgLy8gSWYgYXQgbGVhc3Qgc2VsZWN0aW9uIHN0YXJ0IG9yIGVuZCBpcyBpbnNpZGUgdGhlIGZpZ3VyZVxuICAgIGlmIChzdGFydE5vZGVQYXJlbnQubGVuZ3RoIHx8IGVuZE5vZGVQYXJlbnQubGVuZ3RoKSB7XG5cbiAgICAgIC8vIElmIHNlbGVjdGlvbiB3cmFwcyBlbnRpcmVseSBhIGZpZ3VyZSBmcm9tIHRoZSBzdGFydCBvZiBmaXJzdCBlbGVtZW50ICh0aCBpbiB0YWJsZSkgYW5kIHNlbGVjdGlvbiBlbmRzXG4gICAgICBpZiAoZW5kTm9kZS5wYXJlbnRzKCdmaWdjYXB0aW9uJykubGVuZ3RoKSB7XG5cbiAgICAgICAgbGV0IGNvbnRlbnRzID0gZW5kTm9kZS5wYXJlbnQoKS5jb250ZW50cygpXG4gICAgICAgIGlmIChzdGFydE5vZGUuaXMoRklHVVJFX1NFTEVDVE9SKSAmJiBjb250ZW50cy5pbmRleChlbmROb2RlKSA9PSBjb250ZW50cy5sZW5ndGggLSAxICYmIHNlbC5nZXRSbmcoKS5lbmRPZmZzZXQgPT0gZW5kTm9kZS50ZXh0KCkubGVuZ3RoKSB7XG4gICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAvLyBNb3ZlIGN1cnNvciBhdCB0aGUgcHJldmlvdXMgZWxlbWVudCBhbmQgcmVtb3ZlIGZpZ3VyZVxuICAgICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IuZm9jdXMoKVxuICAgICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNldEN1cnNvckxvY2F0aW9uKHN0YXJ0Tm9kZS5wcmV2KClbMF0sIDEpXG4gICAgICAgICAgICBzdGFydE5vZGUucmVtb3ZlKClcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBzZWxlY3Rpb24gZG9lc24ndCBzdGFydCBhbmQgZW5kIGluIHRoZSBzYW1lIGZpZ3VyZSwgYnV0IG9uZSBiZWV0d2VuIHN0YXJ0IG9yIGVuZCBpcyBpbnNpZGUgdGhlIGZpZ2NhcHRpb24sIG11c3QgYmxvY2tcbiAgICAgIGlmIChzdGFydE5vZGUucGFyZW50cygnZmlnY2FwdGlvbicpLmxlbmd0aCAhPSBlbmROb2RlLnBhcmVudHMoJ2ZpZ2NhcHRpb24nKS5sZW5ndGggJiYgKHN0YXJ0Tm9kZS5wYXJlbnRzKCdmaWdjYXB0aW9uJykubGVuZ3RoIHx8IGVuZE5vZGUucGFyZW50cygnZmlnY2FwdGlvbicpLmxlbmd0aCkpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAvLyBJZiB0aGUgZmlndXJlIGlzIG5vdCB0aGUgc2FtZSwgbXVzdCBibG9ja1xuICAgICAgLy8gQmVjYXVzZSBhIHNlbGVjdGlvbiBjYW4gc3RhcnQgaW4gZmlndXJlWCBhbmQgZW5kIGluIGZpZ3VyZVlcbiAgICAgIGlmICgoc3RhcnROb2RlUGFyZW50LmF0dHIoJ2lkJykgIT0gZW5kTm9kZVBhcmVudC5hdHRyKCdpZCcpKSlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgIC8vIElmIGN1cnNvciBpcyBhdCBzdGFydCBvZiBjb2RlIHByZXZlbnRcbiAgICAgIGlmIChzdGFydE5vZGUucGFyZW50cyhGSUdVUkVfU0VMRUNUT1IpLmZpbmQoJ3ByZScpLmxlbmd0aCkge1xuXG4gICAgICAgIC8vIElmIGF0IHRoZSBzdGFydCBvZiBwcmU+Y29kZSwgcHJlc3NpbmcgMnRpbWVzIGJhY2tzcGFjZSB3aWxsIHJlbW92ZSBldmVyeXRoaW5nIFxuICAgICAgICBpZiAoc3RhcnROb2RlLnBhcmVudCgpLmlzKCdjb2RlJykgJiYgKHN0YXJ0Tm9kZS5wYXJlbnQoKS5jb250ZW50cygpLmluZGV4KHN0YXJ0Tm9kZSkgPT0gMCAmJiBzZWwuZ2V0Um5nKCkuc3RhcnRPZmZzZXQgPT0gMSkpIHtcbiAgICAgICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci51bmRvTWFuYWdlci50cmFuc2FjdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzdGFydE5vZGUucGFyZW50cyhGSUdVUkVfU0VMRUNUT1IpLnJlbW92ZSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKHN0YXJ0Tm9kZS5wYXJlbnQoKS5pcygncHJlJykgJiYgc2VsLmdldFJuZygpLnN0YXJ0T2Zmc2V0ID09IDApXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbi8qKlxuICogXG4gKiBAcGFyYW0geyp9IHNlbCBcbiAqL1xuZnVuY3Rpb24gaGFuZGxlRmlndXJlQ2FuYyhzZWwpIHtcblxuICAvLyBHZXQgcmVmZXJlbmNlIG9mIHN0YXJ0IGFuZCBlbmQgbm9kZVxuICBsZXQgc3RhcnROb2RlID0gJChzZWwuZ2V0Um5nKCkuc3RhcnRDb250YWluZXIpXG4gIGxldCBzdGFydE5vZGVQYXJlbnQgPSBzdGFydE5vZGUucGFyZW50cyhGSUdVUkVfU0VMRUNUT1IpXG5cbiAgbGV0IGVuZE5vZGUgPSAkKHNlbC5nZXRSbmcoKS5lbmRDb250YWluZXIpXG4gIGxldCBlbmROb2RlUGFyZW50ID0gZW5kTm9kZS5wYXJlbnRzKEZJR1VSRV9TRUxFQ1RPUilcblxuICAvLyBJZiBhdCBsZWFzdCBzZWxlY3Rpb24gc3RhcnQgb3IgZW5kIGlzIGluc2lkZSB0aGUgZmlndXJlXG4gIGlmIChzdGFydE5vZGVQYXJlbnQubGVuZ3RoIHx8IGVuZE5vZGVQYXJlbnQubGVuZ3RoKSB7XG5cbiAgICAvLyBJZiBzZWxlY3Rpb24gZG9lc24ndCBzdGFydCBhbmQgZW5kIGluIHRoZSBzYW1lIGZpZ3VyZSwgYnV0IG9uZSBiZWV0d2VuIHN0YXJ0IG9yIGVuZCBpcyBpbnNpZGUgdGhlIGZpZ2NhcHRpb24sIG11c3QgYmxvY2tcbiAgICBpZiAoc3RhcnROb2RlLnBhcmVudHMoJ2ZpZ2NhcHRpb24nKS5sZW5ndGggIT0gZW5kTm9kZS5wYXJlbnRzKCdmaWdjYXB0aW9uJykubGVuZ3RoICYmIChzdGFydE5vZGUucGFyZW50cygnZmlnY2FwdGlvbicpLmxlbmd0aCB8fCBlbmROb2RlLnBhcmVudHMoJ2ZpZ2NhcHRpb24nKS5sZW5ndGgpKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAvLyBJZiB0aGUgZmlndXJlIGlzIG5vdCB0aGUgc2FtZSwgbXVzdCBibG9ja1xuICAgIC8vIEJlY2F1c2UgYSBzZWxlY3Rpb24gY2FuIHN0YXJ0IGluIGZpZ3VyZVggYW5kIGVuZCBpbiBmaWd1cmVZXG4gICAgaWYgKChzdGFydE5vZGVQYXJlbnQuYXR0cignaWQnKSAhPSBlbmROb2RlUGFyZW50LmF0dHIoJ2lkJykpKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgfVxuXG4gIC8vIFRoaXMgYWxnb3JpdGhtIGRvZXNuJ3Qgd29yayBpZiBjYXJldCBpcyBpbiBlbXB0eSB0ZXh0IGVsZW1lbnRcblxuICAvLyBDdXJyZW50IGVsZW1lbnQgY2FuIGJlIG9yIHRleHQgb3IgcFxuICBsZXQgcGFyYWdyYXBoID0gc3RhcnROb2RlLmlzKCdwJykgPyBzdGFydE5vZGUgOiBzdGFydE5vZGUucGFyZW50cygncCcpLmZpcnN0KClcbiAgLy8gU2F2ZSBhbGwgY2hsZHJlbiBub2RlcyAodGV4dCBpbmNsdWRlZClcbiAgbGV0IHBhcmFncmFwaENvbnRlbnQgPSBwYXJhZ3JhcGguY29udGVudHMoKVxuXG4gIC8vIElmIG5leHQgdGhlcmUgaXMgYSBmaWd1cmVcbiAgaWYgKHBhcmFncmFwaC5uZXh0KCkuaXMoRklHVVJFX1NFTEVDVE9SKSkge1xuXG4gICAgaWYgKGVuZE5vZGVbMF0ubm9kZVR5cGUgPT0gMykge1xuXG4gICAgICAvLyBJZiB0aGUgZW5kIG5vZGUgaXMgYSB0ZXh0IGluc2lkZSBhIHN0cm9uZywgaXRzIGluZGV4IHdpbGwgYmUgLTEuXG4gICAgICAvLyBJbiB0aGlzIGNhc2UgdGhlIGVkaXRvciBtdXN0IGl0ZXJhdGUgdW50aWwgaXQgZmFjZSBhIGlubGluZSBlbGVtZW50XG4gICAgICBpZiAocGFyYWdyYXBoQ29udGVudC5pbmRleChlbmROb2RlKSA9PSAtMSkgLy8mJiBwYXJhZ3JhcGgucGFyZW50cyhTRUNUSU9OX1NFTEVDVE9SKS5sZW5ndGgpXG4gICAgICAgIGVuZE5vZGUgPSBlbmROb2RlLnBhcmVudCgpXG5cbiAgICAgIC8vIElmIGluZGV4IG9mIHRoZSBpbmxpbmUgZWxlbWVudCBpcyBlcXVhbCBvZiBjaGlsZHJlbiBub2RlIGxlbmd0aFxuICAgICAgLy8gQU5EIHRoZSBjdXJzb3IgaXMgYXQgdGhlIGxhc3QgcG9zaXRpb25cbiAgICAgIC8vIFJlbW92ZSB0aGUgbmV4dCBmaWd1cmUgaW4gb25lIHVuZG8gbGV2ZWxcbiAgICAgIGlmIChwYXJhZ3JhcGhDb250ZW50LmluZGV4KGVuZE5vZGUpICsgMSA9PSBwYXJhZ3JhcGhDb250ZW50Lmxlbmd0aCAmJiBwYXJhZ3JhcGhDb250ZW50Lmxhc3QoKS50ZXh0KCkubGVuZ3RoID09IHNlbC5nZXRSbmcoKS5lbmRPZmZzZXQpIHtcbiAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHBhcmFncmFwaC5uZXh0KCkucmVtb3ZlKClcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuLyoqXG4gKiBcbiAqIEBwYXJhbSB7Kn0gc2VsID0+IHRpbnltY2Ugc2VsZWN0aW9uXG4gKiBcbiAqIEFkZCBhIHBhcmFncmFwaCBhZnRlciB0aGUgZmlndXJlXG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUZpZ3VyZUVudGVyKHNlbCkge1xuXG4gIGxldCBzZWxlY3RlZEVsZW1lbnQgPSAkKHNlbC5nZXROb2RlKCkpXG4gIGlmIChzZWxlY3RlZEVsZW1lbnQuaXMoJ2ZpZ2NhcHRpb24nKSB8fCAoc2VsZWN0ZWRFbGVtZW50LnBhcmVudHMoRklHVVJFX1NFTEVDVE9SKS5sZW5ndGggJiYgc2VsZWN0ZWRFbGVtZW50LmlzKCdwJykpKSB7XG5cbiAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci51bmRvTWFuYWdlci50cmFuc2FjdChmdW5jdGlvbiAoKSB7XG5cbiAgICAgIC8vYWRkIGEgbmV3IHBhcmFncmFwaCBhZnRlciB0aGUgZmlndXJlXG4gICAgICBzZWxlY3RlZEVsZW1lbnQucGFyZW50KEZJR1VSRV9TRUxFQ1RPUikuYWZ0ZXIoJzxwPjxici8+PC9wPicpXG5cbiAgICAgIC8vbW92ZSBjYXJldCBhdCB0aGUgc3RhcnQgb2YgbmV3IHBcbiAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5zZXRDdXJzb3JMb2NhdGlvbihzZWxlY3RlZEVsZW1lbnQucGFyZW50KEZJR1VSRV9TRUxFQ1RPUilbMF0ubmV4dFNpYmxpbmcsIDApXG4gICAgfSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfSBlbHNlIGlmIChzZWxlY3RlZEVsZW1lbnQuaXMoJ3RoJykpXG4gICAgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB0cnVlXG59XG5cbi8qKlxuICogXG4gKiBAcGFyYW0geyp9IHNlbCA9PiB0aW55bWNlIHNlbGVjdGlvblxuICovXG5mdW5jdGlvbiBoYW5kbGVGaWd1cmVDaGFuZ2Uoc2VsKSB7XG5cbiAgdGlueW1jZS50cmlnZ2VyU2F2ZSgpXG5cbiAgLy8gSWYgcmFzaC1nZW5lcmF0ZWQgc2VjdGlvbiBpcyBkZWxldGUsIHJlLWFkZCBpdFxuICBpZiAoJCgnZmlnY2FwdGlvbjpub3QoOmhhcyhzdHJvbmcpKScpLmxlbmd0aCkge1xuICAgIGNhcHRpb25zKClcbiAgICB1cGRhdGVJZnJhbWVGcm9tU2F2ZWRDb250ZW50KClcbiAgfVxufSIsIi8qKlxuICogcmFqZV9pbmxpbmVfY29kZSBwbHVnaW4gUkFKRVxuICovXG5cbmNvbnN0IERJU0FCTEVfU0VMRUNUT1JfSU5MSU5FID0gJ2ZpZ3VyZSwgc2VjdGlvbltyb2xlPWRvYy1iaWJsaW9ncmFwaHldJ1xuXG5jb25zdCBJTkxJTkVfRVJST1JTID0gJ0Vycm9yLCBJbmxpbmUgZWxlbWVudHMgY2FuIGJlIE9OTFkgY3JlYXRlZCBpbnNpZGUgdGhlIHNhbWUgcGFyYWdyYXBoJ1xuXG50aW55bWNlLlBsdWdpbk1hbmFnZXIuYWRkKCdyYWplX2lubGluZUNvZGUnLCBmdW5jdGlvbiAoZWRpdG9yLCB1cmwpIHtcblxuICAvLyBBZGQgYSBidXR0b24gdGhhdCBvcGVucyBhIHdpbmRvd1xuICBlZGl0b3IuYWRkQnV0dG9uKCdyYWplX2lubGluZUNvZGUnLCB7XG4gICAgdGl0bGU6ICdpbmxpbmVfY29kZScsXG4gICAgaWNvbjogJ2ljb24taW5saW5lLWNvZGUnLFxuICAgIHRvb2x0aXA6ICdJbmxpbmUgY29kZScsXG4gICAgZGlzYWJsZWRTdGF0ZVNlbGVjdG9yOiBESVNBQkxFX1NFTEVDVE9SX0lOTElORSxcblxuICAgIC8vIEJ1dHRvbiBiZWhhdmlvdXJcbiAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb2RlLmhhbmRsZSgpXG4gICAgfVxuICB9KVxuXG4gIGVkaXRvci5vbigna2V5RG93bicsIGZ1bmN0aW9uIChlKSB7XG5cbiAgICAvLyBPbiBlbnRlciBrZXkgXG4gICAgaWYgKGUua2V5Q29kZSA9PSAxMykge1xuICAgICAgbGV0IHNlbGVjdGVkRWxlbWVudCA9ICQodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldE5vZGUoKSlcblxuICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgZWxlbWVudCBpcyBjb2RlLCBidXQgaXQgaXNuJ3QgaW5zaWRlIHByZVxuICAgICAgaWYgKHNlbGVjdGVkRWxlbWVudC5pcygnY29kZScpICYmICFzZWxlY3RlZEVsZW1lbnQucGFyZW50cyhGSUdVUkVfU0VMRUNUT1IpLmxlbmd0aCkge1xuXG4gICAgICAgIGxldCBjb250ZW50cyA9IHNlbGVjdGVkRWxlbWVudC5wYXJlbnQoKS5jb250ZW50cygpXG4gICAgICAgIGxldCBpbmRleCA9IGNvbnRlbnRzLmluZGV4KHNlbGVjdGVkRWxlbWVudClcblxuICAgICAgICAvLyBNb3ZlIGNhcmV0IHRvIHRoZSBuZXh0IG5vZGUgKGFsc28gdGV4dClcbiAgICAgICAgaWYgKGNvbnRlbnRzW2luZGV4ICsgMV0gIT0gbnVsbCkge1xuICAgICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5zZXRDdXJzb3JMb2NhdGlvbihjb250ZW50c1tpbmRleCArIDFdLCAwKVxuICAgICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5zZXRDb250ZW50KFpFUk9fU1BBQ0UpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgY29kZSA9IHtcbiAgICAvKipcbiAgICAgKiBJbnNlcnQgb3IgZXhpdCBmcm9tIGlubGluZSBjb2RlIGVsZW1lbnRcbiAgICAgKi9cbiAgICBoYW5kbGU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgbGV0IHNlbGVjdGVkRWxlbWVudCA9ICQodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldE5vZGUoKSlcblxuICAgICAgLy8gSWYgdGhlcmUgaXNuJ3QgYW55IGlubGluZSBjb2RlXG4gICAgICBpZiAoIXNlbGVjdGVkRWxlbWVudC5pcygnY29kZScpICYmICFzZWxlY3RlZEVsZW1lbnQucGFyZW50cygnY29kZScpLmxlbmd0aCkge1xuXG4gICAgICAgIGxldCB0ZXh0ID0gWkVST19TUEFDRVxuXG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBzZWxlY3Rpb24gc3RhcnRzIGFuZCBlbmRzIGluIHRoZSBzYW1lIHBhcmFncmFwaFxuICAgICAgICBpZiAoIXRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5pc0NvbGxhcHNlZCgpKSB7XG5cbiAgICAgICAgICBsZXQgc3RhcnROb2RlID0gdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldFN0YXJ0KClcbiAgICAgICAgICBsZXQgZW5kTm9kZSA9IHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5nZXRFbmQoKVxuXG4gICAgICAgICAgLy8gTm90aWZ5IHRoZSBlcnJvciBhbmQgZXhpdFxuICAgICAgICAgIGlmIChzdGFydE5vZGUgIT0gZW5kTm9kZSkge1xuICAgICAgICAgICAgbm90aWZ5KElOTElORV9FUlJPUlMsICdlcnJvcicsIDMwMDApXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTYXZlIHRoZSBzZWxlY3RlZCBjb250ZW50IGFzIHRleHRcbiAgICAgICAgICB0ZXh0ICs9IHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5nZXRDb250ZW50KClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgY3VycmVudCBzZWxlY3Rpb24gd2l0aCBjb2RlIGVsZW1lbnRcbiAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgLy8gR2V0IHRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBzZWxlY3RlZCBub2RlXG4gICAgICAgICAgbGV0IHByZXZpb3VzTm9kZUluZGV4ID0gc2VsZWN0ZWRFbGVtZW50LmNvbnRlbnRzKCkuaW5kZXgoJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Um5nKCkuc3RhcnRDb250YWluZXIpKVxuXG4gICAgICAgICAgLy8gQWRkIGNvZGUgZWxlbWVudFxuICAgICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5zZXRDb250ZW50KGA8Y29kZT4ke3RleHR9PC9jb2RlPmApXG4gICAgICAgICAgdGlueW1jZS50cmlnZ2VyU2F2ZSgpXG5cbiAgICAgICAgICAvLyBNb3ZlIGNhcmV0IGF0IHRoZSBlbmQgb2YgdGhlIHN1Y2Nlc3NpdmUgbm9kZSBvZiBwcmV2aW91cyBzZWxlY3RlZCBub2RlXG4gICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLnNldEN1cnNvckxvY2F0aW9uKHNlbGVjdGVkRWxlbWVudC5jb250ZW50cygpW3ByZXZpb3VzTm9kZUluZGV4ICsgMV0sIDEpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuXG4vKipcbiAqICBJbmxpbmUgcXVvdGUgcGx1Z2luIFJBSkVcbiAqL1xudGlueW1jZS5QbHVnaW5NYW5hZ2VyLmFkZCgncmFqZV9pbmxpbmVRdW90ZScsIGZ1bmN0aW9uIChlZGl0b3IsIHVybCkge1xuXG4gIC8vIEFkZCBhIGJ1dHRvbiB0aGF0IGhhbmRsZSB0aGUgaW5saW5lIGVsZW1lbnRcbiAgZWRpdG9yLmFkZEJ1dHRvbigncmFqZV9pbmxpbmVRdW90ZScsIHtcbiAgICB0aXRsZTogJ2lubGluZV9xdW90ZScsXG4gICAgaWNvbjogJ2ljb24taW5saW5lLXF1b3RlJyxcbiAgICB0b29sdGlwOiAnSW5saW5lIHF1b3RlJyxcbiAgICBkaXNhYmxlZFN0YXRlU2VsZWN0b3I6IERJU0FCTEVfU0VMRUNUT1JfSU5MSU5FLFxuXG4gICAgLy8gQnV0dG9uIGJlaGF2aW91clxuICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHF1b3RlLmhhbmRsZSgpXG4gICAgfVxuICB9KVxuXG4gIHF1b3RlID0ge1xuICAgIC8qKlxuICAgICAqIEluc2VydCBvciBleGl0IGZyb20gaW5saW5lIHF1b3RlIGVsZW1lbnRcbiAgICAgKi9cbiAgICBoYW5kbGU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgbGV0IG5hbWUgPSB0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpLm5vZGVOYW1lXG5cbiAgICAgIGlmIChuYW1lID09ICdRJylcbiAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IuZm9ybWF0dGVyLnJlbW92ZSgnaW5saW5lX3F1b3RlJylcblxuICAgICAgZWxzZVxuICAgICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci5mb3JtYXR0ZXIuYXBwbHkoJ2lubGluZV9xdW90ZScpXG4gICAgfVxuICB9XG59KVxuXG50aW55bWNlLlBsdWdpbk1hbmFnZXIuYWRkKCdyYWplX2lubGluZUZpZ3VyZScsIGZ1bmN0aW9uIChlZGl0b3IsIHVybCkge1xuICBlZGl0b3IuYWRkQnV0dG9uKCdyYWplX2lubGluZUZpZ3VyZScsIHtcbiAgICB0ZXh0OiAnaW5saW5lX2ZpZ3VyZScsXG4gICAgdG9vbHRpcDogJ0lubGluZSBxdW90ZScsXG4gICAgZGlzYWJsZWRTdGF0ZVNlbGVjdG9yOiBESVNBQkxFX1NFTEVDVE9SX0lOTElORSxcblxuICAgIC8vIEJ1dHRvbiBiZWhhdmlvdXJcbiAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7fVxuICB9KVxufSkiLCJ0aW55bWNlLlBsdWdpbk1hbmFnZXIuYWRkKCdyYWplX2xpc3RzJywgZnVuY3Rpb24gKGVkaXRvciwgdXJsKSB7XG5cbiAgY29uc3QgT0wgPSAnb2wnXG4gIGNvbnN0IFVMID0gJ3VsJ1xuXG4gIGVkaXRvci5hZGRCdXR0b24oJ3JhamVfb2wnLCB7XG4gICAgdGl0bGU6ICdyYWplX29sJyxcbiAgICBpY29uOiAnaWNvbi1vbCcsXG4gICAgdG9vbHRpcDogJ09yZGVyZWQgbGlzdCcsXG4gICAgZGlzYWJsZWRTdGF0ZVNlbGVjdG9yOiBESVNBQkxFX1NFTEVDVE9SX0ZJR1VSRVMsXG5cbiAgICAvLyBCdXR0b24gYmVoYXZpb3VyXG4gICAgb25jbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgbGlzdC5hZGQoT0wpXG4gICAgfVxuICB9KVxuXG4gIGVkaXRvci5hZGRCdXR0b24oJ3JhamVfdWwnLCB7XG4gICAgdGl0bGU6ICdyYWplX3VsJyxcbiAgICBpY29uOiAnaWNvbi11bCcsXG4gICAgdG9vbHRpcDogJ1Vub3JkZXJlZCBsaXN0JyxcbiAgICBkaXNhYmxlZFN0YXRlU2VsZWN0b3I6IERJU0FCTEVfU0VMRUNUT1JfRklHVVJFUyxcblxuICAgIC8vIEJ1dHRvbiBiZWhhdmlvdXJcbiAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsaXN0LmFkZChVTClcbiAgICB9XG4gIH0pXG5cbiAgLyoqXG4gICAqIFxuICAgKi9cbiAgZWRpdG9yLm9uKCdrZXlEb3duJywgZnVuY3Rpb24gKGUpIHtcblxuICAgIC8vIFRPRE8gTWFuYWdlIGVudGVyIGtleVxuICAgIC8vIFRPRE8gXG4gIH0pXG5cblxuICAvKipcbiAgICogXG4gICAqL1xuICBsZXQgbGlzdCA9IHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24gKHR5cGUpIHtcblxuICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IGVsZW1lbnQgXG4gICAgICBsZXQgc2VsZWN0ZWRFbGVtZW50ID0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpKVxuICAgICAgbGV0IHRleHQgPSAnPGJyPidcblxuICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgZWxlbWVudCBoYXMgdGV4dCwgc2F2ZSBpdFxuICAgICAgaWYgKHNlbGVjdGVkRWxlbWVudC50ZXh0KCkudHJpbSgpLmxlbmd0aCA+IDApXG4gICAgICAgIHRleHQgPSBzZWxlY3RlZEVsZW1lbnQudGV4dCgpLnRyaW0oKVxuXG4gICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci51bmRvTWFuYWdlci50cmFuc2FjdChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBuZXcgZWxlbWVudFxuICAgICAgICBzZWxlY3RlZEVsZW1lbnQucmVwbGFjZVdpdGgoYDwke3R5cGV9IGRhdGEtcG9pbnRlcj48bGk+PHA+JHt0ZXh0fTwvcD48L2xpPjwvJHt0eXBlfT5gKVxuXG4gICAgICAgIC8vIFNhdmUgY2hhbmdlc1xuICAgICAgICB0aW55bWNlLnRyaWdnZXJTYXZlKClcblxuICAgICAgICAvLyBNb3ZlIHRoZSBjdXJzb3JcbiAgICAgICAgbW92ZUNhcmV0KCQoYCR7dHlwZX1bZGF0YS1wb2ludGVyXWApLmZpbmQoJ3AnKVswXSlcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIHBvaW50ZXIgYXR0cmlidXRlXG4gICAgICAgICQoYCR7dHlwZX1bZGF0YS1wb2ludGVyXWApLnJlbW92ZUF0dHIoJ2RhdGEtcG9pbnRlcicpXG5cbiAgICAgICAgLy8gUmVzdG9yZSB0aGUgd2hvbGUgY29udGVudFxuICAgICAgICB1cGRhdGVJZnJhbWVGcm9tU2F2ZWRDb250ZW50KClcbiAgICAgIH0pXG4gICAgfSxcblxuXG4gIH1cbn0pIiwiLyoqXG4gKiBcbiAqL1xuXG5mdW5jdGlvbiBvcGVuTWV0YWRhdGFEaWFsb2coKSB7XG4gIHRpbnltY2UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIub3Blbih7XG4gICAgdGl0bGU6ICdFZGl0IG1ldGFkYXRhJyxcbiAgICB1cmw6ICdqcy9yYWplbWNlL3BsdWdpbi9yYWplX21ldGFkYXRhLmh0bWwnLFxuICAgIHdpZHRoOiA5NTAsXG4gICAgaGVpZ2h0OiA4MDAsXG4gICAgb25DbG9zZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAodGlueW1jZS5hY3RpdmVFZGl0b3IudXBkYXRlZF9tZXRhZGF0YSAhPSBudWxsKSB7XG5cbiAgICAgICAgbWV0YWRhdGEudXBkYXRlKHRpbnltY2UuYWN0aXZlRWRpdG9yLnVwZGF0ZWRfbWV0YWRhdGEpXG5cbiAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudXBkYXRlZF9tZXRhZGF0YSA9PSBudWxsXG4gICAgICB9XG5cbiAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLndpbmRvd01hbmFnZXIuY2xvc2UoKVxuICAgIH1cbiAgfSwgbWV0YWRhdGEuZ2V0QWxsTWV0YWRhdGEoKSlcbn1cblxudGlueW1jZS5QbHVnaW5NYW5hZ2VyLmFkZCgncmFqZV9tZXRhZGF0YScsIGZ1bmN0aW9uIChlZGl0b3IsIHVybCkge1xuXG4gIC8vIEFkZCBhIGJ1dHRvbiB0aGF0IGhhbmRsZSB0aGUgaW5saW5lIGVsZW1lbnRcbiAgZWRpdG9yLmFkZEJ1dHRvbigncmFqZV9tZXRhZGF0YScsIHtcbiAgICB0ZXh0OiAnTWV0YWRhdGEnLFxuICAgIGljb246IGZhbHNlLFxuICAgIHRvb2x0aXA6ICdFZGl0IG1ldGFkYXRhJyxcblxuICAgIC8vIEJ1dHRvbiBiZWhhdmlvdXJcbiAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICBvcGVuTWV0YWRhdGFEaWFsb2coKVxuICAgIH1cbiAgfSlcblxuICBlZGl0b3Iub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpKS5pcyhIRUFERVJfU0VMRUNUT1IpKVxuICAgICAgb3Blbk1ldGFkYXRhRGlhbG9nKClcbiAgfSlcblxuICBtZXRhZGF0YSA9IHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqL1xuICAgIGdldEFsbE1ldGFkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgaGVhZGVyID0gJChIRUFERVJfU0VMRUNUT1IpXG4gICAgICBsZXQgc3VidGl0bGUgPSBoZWFkZXIuZmluZCgnaDEudGl0bGUgPiBzbWFsbCcpLnRleHQoKVxuICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgIHN1YnRpdGxlOiBzdWJ0aXRsZSxcbiAgICAgICAgdGl0bGU6IGhlYWRlci5maW5kKCdoMS50aXRsZScpLnRleHQoKS5yZXBsYWNlKHN1YnRpdGxlLCAnJyksXG4gICAgICAgIGF1dGhvcnM6IG1ldGFkYXRhLmdldEF1dGhvcnMoaGVhZGVyKSxcbiAgICAgICAgY2F0ZWdvcmllczogbWV0YWRhdGEuZ2V0Q2F0ZWdvcmllcyhoZWFkZXIpLFxuICAgICAgICBrZXl3b3JkczogbWV0YWRhdGEuZ2V0S2V5d29yZHMoaGVhZGVyKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGF0YVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKi9cbiAgICBnZXRBdXRob3JzOiBmdW5jdGlvbiAoaGVhZGVyKSB7XG4gICAgICBsZXQgYXV0aG9ycyA9IFtdXG5cbiAgICAgIGhlYWRlci5maW5kKCdhZGRyZXNzLmxlYWQuYXV0aG9ycycpLmVhY2goZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIC8vIEdldCBhbGwgYWZmaWxpYXRpb25zXG4gICAgICAgIGxldCBhZmZpbGlhdGlvbnMgPSBbXVxuICAgICAgICAkKHRoaXMpLmZpbmQoJ3NwYW4nKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBhZmZpbGlhdGlvbnMucHVzaCgkKHRoaXMpLnRleHQoKSlcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBwdXNoIHNpbmdsZSBhdXRob3JcbiAgICAgICAgYXV0aG9ycy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiAkKHRoaXMpLmNoaWxkcmVuKCdzdHJvbmcuYXV0aG9yX25hbWUnKS50ZXh0KCksXG4gICAgICAgICAgZW1haWw6ICQodGhpcykuZmluZCgnY29kZS5lbWFpbCA+IGEnKS50ZXh0KCksXG4gICAgICAgICAgYWZmaWxpYXRpb25zOiBhZmZpbGlhdGlvbnNcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBhdXRob3JzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqL1xuICAgIGdldENhdGVnb3JpZXM6IGZ1bmN0aW9uIChoZWFkZXIpIHtcbiAgICAgIGxldCBjYXRlZ29yaWVzID0gW11cblxuICAgICAgaGVhZGVyLmZpbmQoJ3AuYWNtX3N1YmplY3RfY2F0ZWdvcmllcyA+IGNvZGUnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2F0ZWdvcmllcy5wdXNoKCQodGhpcykudGV4dCgpKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIGNhdGVnb3JpZXNcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogXG4gICAgICovXG4gICAgZ2V0S2V5d29yZHM6IGZ1bmN0aW9uIChoZWFkZXIpIHtcbiAgICAgIGxldCBrZXl3b3JkcyA9IFtdXG5cbiAgICAgIGhlYWRlci5maW5kKCd1bC5saXN0LWlubGluZSA+IGxpID4gY29kZScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBrZXl3b3Jkcy5wdXNoKCQodGhpcykudGV4dCgpKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIGtleXdvcmRzXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqL1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gKHVwZGF0ZWRNZXRhZGF0YSkge1xuXG4gICAgICAkKCdoZWFkIG1ldGFbcHJvcGVydHldLCBoZWFkIGxpbmtbcHJvcGVydHldLCBoZWFkIG1ldGFbbmFtZV0nKS5yZW1vdmUoKVxuXG4gICAgICBsZXQgY3VycmVudE1ldGFkYXRhID0gbWV0YWRhdGEuZ2V0QWxsTWV0YWRhdGEoKVxuXG4gICAgICAvLyBVcGRhdGUgdGl0bGUgYW5kIHN1YnRpdGxlXG4gICAgICBpZiAodXBkYXRlZE1ldGFkYXRhLnRpdGxlICE9IGN1cnJlbnRNZXRhZGF0YS50aXRsZSB8fCB1cGRhdGVkTWV0YWRhdGEuc3VidGl0bGUgIT0gY3VycmVudE1ldGFkYXRhLnN1YnRpdGxlKSB7XG4gICAgICAgIGxldCB0ZXh0ID0gdXBkYXRlZE1ldGFkYXRhLnRpdGxlXG5cbiAgICAgICAgaWYgKHVwZGF0ZWRNZXRhZGF0YS5zdWJ0aXRsZS50cmltKCkubGVuZ3RoKVxuICAgICAgICAgIHRleHQgKz0gYCAtLSAke3VwZGF0ZWRNZXRhZGF0YS5zdWJ0aXRsZX1gXG5cbiAgICAgICAgJCgndGl0bGUnKS50ZXh0KHRleHQpXG4gICAgICB9XG5cbiAgICAgIGxldCBhZmZpbGlhdGlvbnNDYWNoZSA9IFtdXG5cbiAgICAgIHVwZGF0ZWRNZXRhZGF0YS5hdXRob3JzLmZvckVhY2goZnVuY3Rpb24gKGF1dGhvcikge1xuXG4gICAgICAgICQoJ2hlYWQnKS5hcHBlbmQoYDxtZXRhIGFib3V0PVwibWFpbHRvOiR7YXV0aG9yLmVtYWlsfVwiIHR5cGVvZj1cInNjaGVtYTpQZXJzb25cIiBwcm9wZXJ0eT1cInNjaGVtYTpuYW1lXCIgbmFtZT1cImRjLmNyZWF0b3JcIiBjb250ZW50PVwiJHthdXRob3IubmFtZX1cIj5gKVxuICAgICAgICAkKCdoZWFkJykuYXBwZW5kKGA8bWV0YSBhYm91dD1cIm1haWx0bzoke2F1dGhvci5lbWFpbH1cIiBwcm9wZXJ0eT1cInNjaGVtYTplbWFpbFwiIGNvbnRlbnQ9XCIke2F1dGhvci5lbWFpbH1cIj5gKVxuXG4gICAgICAgIGF1dGhvci5hZmZpbGlhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoYWZmaWxpYXRpb24pIHtcblxuICAgICAgICAgIC8vIExvb2sgdXAgZm9yIGFscmVhZHkgZXhpc3RpbmcgYWZmaWxpYXRpb25cbiAgICAgICAgICBsZXQgdG9BZGQgPSB0cnVlXG4gICAgICAgICAgbGV0IGlkXG5cbiAgICAgICAgICBhZmZpbGlhdGlvbnNDYWNoZS5mb3JFYWNoKGZ1bmN0aW9uIChhZmZpbGlhdGlvbkNhY2hlKSB7XG4gICAgICAgICAgICBpZiAoYWZmaWxpYXRpb25DYWNoZS5jb250ZW50ID09IGFmZmlsaWF0aW9uKSB7XG4gICAgICAgICAgICAgIHRvQWRkID0gZmFsc2VcbiAgICAgICAgICAgICAgaWQgPSBhZmZpbGlhdGlvbkNhY2hlLmlkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcblxuICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGV4aXN0aW5nIGFmZmlsaWF0aW9uLCBhZGQgaXRcbiAgICAgICAgICBpZiAodG9BZGQpIHtcbiAgICAgICAgICAgIGxldCBnZW5lcmF0ZWRJZCA9IGAjYWZmaWxpYXRpb25fJHthZmZpbGlhdGlvbnNDYWNoZS5sZW5ndGgrMX1gXG4gICAgICAgICAgICBhZmZpbGlhdGlvbnNDYWNoZS5wdXNoKHtcbiAgICAgICAgICAgICAgaWQ6IGdlbmVyYXRlZElkLFxuICAgICAgICAgICAgICBjb250ZW50OiBhZmZpbGlhdGlvblxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGlkID0gZ2VuZXJhdGVkSWRcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkKCdoZWFkJykuYXBwZW5kKGA8bGluayBhYm91dD1cIm1haWx0bzoke2F1dGhvci5lbWFpbH1cIiBwcm9wZXJ0eT1cInNjaGVtYTphZmZpbGlhdGlvblwiIGhyZWY9XCIke2lkfVwiPmApXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBhZmZpbGlhdGlvbnNDYWNoZS5mb3JFYWNoKGZ1bmN0aW9uIChhZmZpbGlhdGlvbkNhY2hlKSB7XG4gICAgICAgICQoJ2hlYWQnKS5hcHBlbmQoYDxtZXRhIGFib3V0PVwiJHthZmZpbGlhdGlvbkNhY2hlLmlkfVwiIHR5cGVvZj1cInNjaGVtYTpPcmdhbml6YXRpb25cIiBwcm9wZXJ0eT1cInNjaGVtYTpuYW1lXCIgY29udGVudD1cIiR7YWZmaWxpYXRpb25DYWNoZS5jb250ZW50fVwiPmApXG4gICAgICB9KVxuXG4gICAgICB1cGRhdGVkTWV0YWRhdGEuY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGNhdGVnb3J5KXtcbiAgICAgICAgJCgnaGVhZCcpLmFwcGVuZChgPG1ldGEgbmFtZT1cImRjdGVybXMuc3ViamVjdFwiIGNvbnRlbnQ9XCIke2NhdGVnb3J5fVwiLz5gKVxuICAgICAgfSlcblxuICAgICAgdXBkYXRlZE1ldGFkYXRhLmtleXdvcmRzLmZvckVhY2goZnVuY3Rpb24oa2V5d29yZCl7XG4gICAgICAgICQoJ2hlYWQnKS5hcHBlbmQoYDxtZXRhIHByb3BlcnR5PVwicHJpc206a2V5d29yZFwiIGNvbnRlbnQ9XCIke2tleXdvcmR9XCIvPmApXG4gICAgICB9KVxuXG4gICAgICAkKCcjcmFqZV9yb290JykuYWRkSGVhZGVySFRNTCgpXG4gICAgICBzZXROb25FZGl0YWJsZUhlYWRlcigpXG4gICAgICB1cGRhdGVJZnJhbWVGcm9tU2F2ZWRDb250ZW50KClcbiAgICB9XG4gIH1cblxufSkiLCJ0aW55bWNlLlBsdWdpbk1hbmFnZXIuYWRkKCdyYWplX3NhdmUnLCBmdW5jdGlvbiAoZWRpdG9yLCB1cmwpIHtcblxuICBzYXZlTWFuYWdlciA9IHtcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqL1xuICAgIGluaXRTYXZlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIC8vIENsZWFyIGFsbCB1bmRvIGxldmVsc1xuICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIuY2xlYXIoKVxuXG4gICAgICAvLyBVcGRhdGUgdGhlIG5ldyBkb2N1bWVudCBzdGF0ZVxuICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZShmYWxzZSlcblxuICAgICAgLy8gUmV0dXJuIHRoZSBtZXNzYWdlIGZvciB0aGUgYmFja2VuZFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IHNhdmVNYW5hZ2VyLmdldFRpdGxlKCksXG4gICAgICAgIGRvY3VtZW50OiBzYXZlTWFuYWdlci5nZXREZXJhc2hlZEFydGljbGUoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKi9cbiAgICBzYXZlQXM6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gU2VuZCBtZXNzYWdlIHRvIHRoZSBiYWNrZW5kXG4gICAgICBzYXZlQXNBcnRpY2xlKHNhdmVNYW5hZ2VyLmluaXRTYXZlKCkpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqL1xuICAgIHNhdmU6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gU2VuZCBtZXNzYWdlIHRvIHRoZSBiYWNrZW5kXG4gICAgICBzYXZlQXJ0aWNsZShzYXZlTWFuYWdlci5pbml0U2F2ZSgpKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIFJBU0ggYXJ0aWNsZSByZW5kZXJlZCAod2l0aG91dCB0aW55bWNlKVxuICAgICAqL1xuICAgIGdldERlcmFzaGVkQXJ0aWNsZTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBTYXZlIGh0bWwgcmVmZXJlbmNlc1xuICAgICAgbGV0IGFydGljbGUgPSAkKCdodG1sJykuY2xvbmUoKVxuICAgICAgbGV0IHRpbnltY2VTYXZlZENvbnRlbnQgPSBhcnRpY2xlLmZpbmQoJyNyYWplX3Jvb3QnKVxuXG4gICAgICBhcnRpY2xlLnJlbW92ZUF0dHIoJ2NsYXNzJylcblxuICAgICAgLy9yZXBsYWNlIGJvZHkgd2l0aCB0aGUgcmlnaHQgb25lICh0aGlzIGFjdGlvbiByZW1vdmUgdGlueW1jZSlcbiAgICAgIGFydGljbGUuZmluZCgnYm9keScpLmh0bWwodGlueW1jZVNhdmVkQ29udGVudC5odG1sKCkpXG4gICAgICBhcnRpY2xlLmZpbmQoJ2JvZHknKS5yZW1vdmVBdHRyKCdzdHlsZScpXG4gICAgICBhcnRpY2xlLmZpbmQoJ2JvZHknKS5yZW1vdmVBdHRyKCdjbGFzcycpXG5cbiAgICAgIC8vcmVtb3ZlIGFsbCBzdHlsZSBhbmQgbGluayB1bi1uZWVkZWQgZnJvbSB0aGUgaGVhZFxuICAgICAgYXJ0aWNsZS5maW5kKCdoZWFkJykuY2hpbGRyZW4oJ3N0eWxlW3R5cGU9XCJ0ZXh0L2Nzc1wiXScpLnJlbW92ZSgpXG4gICAgICBhcnRpY2xlLmZpbmQoJ2hlYWQnKS5jaGlsZHJlbignbGlua1tpZF0nKS5yZW1vdmUoKVxuXG4gICAgICAvLyBFeGVjdXRlIGRlcmFzaCAocmVwbGFjZSBhbGwgY2dlbiBlbGVtZW50cyB3aXRoIGl0cyBvcmlnaW5hbCBjb250ZW50KVxuICAgICAgYXJ0aWNsZS5maW5kKCcqW2RhdGEtcmFzaC1vcmlnaW5hbC1jb250ZW50XScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBsZXQgb3JpZ2luYWxDb250ZW50ID0gJCh0aGlzKS5hdHRyKCdkYXRhLXJhc2gtb3JpZ2luYWwtY29udGVudCcpXG4gICAgICAgICQodGhpcykucmVwbGFjZVdpdGgob3JpZ2luYWxDb250ZW50KVxuICAgICAgfSlcblxuICAgICAgLy8gRXhlY3V0ZSBkZXJhc2ggY2hhbmdpbmcgdGhlIHdyYXBwZXJcbiAgICAgIGFydGljbGUuZmluZCgnKltkYXRhLXJhc2gtb3JpZ2luYWwtd3JhcHBlcl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSAkKHRoaXMpLmh0bWwoKVxuICAgICAgICBsZXQgd3JhcHBlciA9ICQodGhpcykuYXR0cignZGF0YS1yYXNoLW9yaWdpbmFsLXdyYXBwZXInKVxuICAgICAgICAkKHRoaXMpLnJlcGxhY2VXaXRoKGA8JHt3cmFwcGVyfT4ke2NvbnRlbnR9PC8ke3dyYXBwZXJ9PmApXG4gICAgICB9KVxuXG4gICAgICAvLyBSZW1vdmUgdGFyZ2V0IGZyb20gVGlueU1DRSBsaW5rXG4gICAgICBhcnRpY2xlLmZpbmQoJ2FbdGFyZ2V0XScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLnJlbW92ZUF0dHIoJ3RhcmdldCcpXG4gICAgICB9KVxuXG4gICAgICAvLyBSZW1vdmUgY29udGVudGVkaXRhYmxlIGZyb20gVGlueU1DRSBsaW5rXG4gICAgICBhcnRpY2xlLmZpbmQoJ2FbY29udGVudGVkaXRhYmxlXScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAkKHRoaXMpLnJlbW92ZUF0dHIoJ2NvbnRlbnRlZGl0YWJsZScpXG4gICAgICB9KVxuXG4gICAgICAvLyBSZW1vdmUgbm90IGFsbG93ZWQgc3BhbiBlbG1lbnRzIGluc2lkZSB0aGUgZm9ybXVsYVxuICAgICAgYXJ0aWNsZS5maW5kKEZJR1VSRV9GT1JNVUxBX1NFTEVDVE9SKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5jaGlsZHJlbigncCcpLmh0bWwoJCh0aGlzKS5maW5kKCdzcGFuW2NvbnRlbnRlZGl0YWJsZV0nKS5odG1sKCkpXG4gICAgICB9KVxuXG4gICAgICBhcnRpY2xlLmZpbmQoYCR7RklHVVJFX0ZPUk1VTEFfU0VMRUNUT1J9LCR7SU5MSU5FX0ZPUk1VTEFfU0VMRUNUT1J9YCkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgkKHRoaXMpLmZpbmQoJ3N2Z1tkYXRhLW1hdGhtbF0nKS5sZW5ndGgpIHtcbiAgICAgICAgICAkKHRoaXMpLmNoaWxkcmVuKCdwJykuaHRtbCgkKHRoaXMpLmZpbmQoJ3N2Z1tkYXRhLW1hdGhtbF0nKS5hdHRyKCdkYXRhLW1hdGhtbCcpKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gbmV3IFhNTFNlcmlhbGl6ZXIoKS5zZXJpYWxpemVUb1N0cmluZyhhcnRpY2xlWzBdKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHRpdGxlIFxuICAgICAqL1xuICAgIGdldFRpdGxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJCgndGl0bGUnKS50ZXh0KClcbiAgICB9LFxuXG4gIH1cbn0pIiwiLyoqXG4gKiBSQVNIIHNlY3Rpb24gcGx1Z2luIFJBSkVcbiAqL1xuXG5jb25zdCBOT05fRURJVEFCTEVfSEVBREVSX1NFTEVDVE9SID0gJ2hlYWRlci5wYWdlLWhlYWRlci5jb250YWluZXIuY2dlbidcbmNvbnN0IEJJQkxJT0VOVFJZX1NVRkZJWCA9ICdiaWJsaW9lbnRyeV8nXG5jb25zdCBFTkROT1RFX1NVRkZJWCA9ICdlbmRub3RlXydcblxuY29uc3QgQklCTElPR1JBUEhZX1NFTEVDVE9SID0gJ3NlY3Rpb25bcm9sZT1kb2MtYmlibGlvZ3JhcGh5XSdcbmNvbnN0IEJJQkxJT0VOVFJZX1NFTEVDVE9SID0gJ2xpW3JvbGU9ZG9jLWJpYmxpb2VudHJ5XSdcblxuY29uc3QgRU5ETk9URVNfU0VMRUNUT1IgPSAnc2VjdGlvbltyb2xlPWRvYy1lbmRub3Rlc10nXG5jb25zdCBFTkROT1RFX1NFTEVDVE9SID0gJ3NlY3Rpb25bcm9sZT1kb2MtZW5kbm90ZV0nXG5cbmNvbnN0IEFCU1RSQUNUX1NFTEVDVE9SID0gJ3NlY3Rpb25bcm9sZT1kb2MtYWJzdHJhY3RdJ1xuY29uc3QgQUNLTk9XTEVER0VNRU5UU19TRUxFQ1RPUiA9ICdzZWN0aW9uW3JvbGU9ZG9jLWFja25vd2xlZGdlbWVudHNdJ1xuXG5jb25zdCBNQUlOX1NFQ1RJT05fU0VMRUNUT1IgPSAnZGl2I3JhamVfcm9vdCA+IHNlY3Rpb246bm90KFtyb2xlXSknXG5jb25zdCBTRUNUSU9OX1NFTEVDVE9SID0gJ3NlY3Rpb246bm90KFtyb2xlXSknXG5jb25zdCBTUEVDSUFMX1NFQ1RJT05fU0VMRUNUT1IgPSAnc2VjdGlvbltyb2xlXSdcblxuY29uc3QgTUVOVV9TRUxFQ1RPUiA9ICdkaXZbaWRePW1jZXVfXVtpZCQ9LWJvZHldW3JvbGU9bWVudV0nXG5cbmNvbnN0IEhFQURJTkcgPSAnSGVhZGluZydcblxuY29uc3QgSEVBRElOR19UUkFTRk9STUFUSU9OX0ZPUkJJRERFTiA9ICdFcnJvciwgeW91IGNhbm5vdCB0cmFuc2Zvcm0gdGhlIGN1cnJlbnQgaGVhZGVyIGluIHRoaXMgd2F5ISdcblxudGlueW1jZS5QbHVnaW5NYW5hZ2VyLmFkZCgncmFqZV9zZWN0aW9uJywgZnVuY3Rpb24gKGVkaXRvciwgdXJsKSB7XG5cbiAgbGV0IHJhamVfc2VjdGlvbl9mbGFnID0gZmFsc2VcbiAgbGV0IHJhamVfc3RvcmVkX3NlbGVjdGlvblxuXG4gIGVkaXRvci5hZGRCdXR0b24oJ3JhamVfc2VjdGlvbicsIHtcbiAgICB0eXBlOiAnbWVudWJ1dHRvbicsXG4gICAgdGV4dDogJ0hlYWRpbmdzJyxcbiAgICB0aXRsZTogJ2hlYWRpbmcnLFxuICAgIGljb25zOiBmYWxzZSxcblxuICAgIC8vIFNlY3Rpb25zIHN1YiBtZW51XG4gICAgbWVudTogW3tcbiAgICAgIHRleHQ6IGAke0hFQURJTkd9IDEuYCxcbiAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VjdGlvbi5hZGQoMSlcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICB0ZXh0OiBgJHtIRUFESU5HfSAxLjEuYCxcbiAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VjdGlvbi5hZGQoMilcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICB0ZXh0OiBgJHtIRUFESU5HfSAxLjEuMS5gLFxuICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWN0aW9uLmFkZCgzKVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIHRleHQ6IGAke0hFQURJTkd9IDEuMS4xLjEuYCxcbiAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VjdGlvbi5hZGQoNClcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICB0ZXh0OiBgJHtIRUFESU5HfSAxLjEuMS4xLjEuYCxcbiAgICAgIG9uY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VjdGlvbi5hZGQoNSlcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICB0ZXh0OiBgJHtIRUFESU5HfSAxLjEuMS4xLjEuMS5gLFxuICAgICAgb25jbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWN0aW9uLmFkZCg2KVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIHRleHQ6ICdTcGVjaWFsJyxcbiAgICAgIG1lbnU6IFt7XG4gICAgICAgICAgdGV4dDogJ0Fic3RyYWN0JyxcbiAgICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHNlY3Rpb24uYWRkQWJzdHJhY3QoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdBY2tub3dsZWRnZW1lbnRzJyxcbiAgICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWN0aW9uLmFkZEFja25vd2xlZGdlbWVudHMoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdSZWZlcmVuY2VzJyxcbiAgICAgICAgICBvbmNsaWNrOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHRpbnltY2UudHJpZ2dlclNhdmUoKVxuXG4gICAgICAgICAgICAvLyBPbmx5IGlmIGJpYmxpb2dyYXBoeSBzZWN0aW9uIGRvZXNuJ3QgZXhpc3RzXG4gICAgICAgICAgICBpZiAoISQoQklCTElPR1JBUEhZX1NFTEVDVE9SKS5sZW5ndGgpIHtcblxuICAgICAgICAgICAgICAvLyBUT0RPIGNoYW5nZSBoZXJlXG4gICAgICAgICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnVuZG9NYW5hZ2VyLnRyYW5zYWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgbmV3IGJpYmxpb2VudHJ5XG4gICAgICAgICAgICAgICAgc2VjdGlvbi5hZGRCaWJsaW9lbnRyeSgpXG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgaWZyYW1lXG4gICAgICAgICAgICAgICAgdXBkYXRlSWZyYW1lRnJvbVNhdmVkQ29udGVudCgpXG5cbiAgICAgICAgICAgICAgICAvL21vdmUgY2FyZXQgYW5kIHNldCBmb2N1cyB0byBhY3RpdmUgYWRpdG9yICMxMDVcbiAgICAgICAgICAgICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uc2VsZWN0KHRpbnltY2UuYWN0aXZlRWRpdG9yLmRvbS5zZWxlY3QoYCR7QklCTElPRU5UUllfU0VMRUNUT1J9Omxhc3QtY2hpbGRgKVswXSwgdHJ1ZSlcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uc2VsZWN0KHRpbnltY2UuYWN0aXZlRWRpdG9yLmRvbS5zZWxlY3QoYCR7QklCTElPR1JBUEhZX1NFTEVDVE9SfT5oMWApWzBdKVxuXG4gICAgICAgICAgICBzY3JvbGxUbyhgJHtCSUJMSU9FTlRSWV9TRUxFQ1RPUn06bGFzdC1jaGlsZGApXG5cbiAgICAgICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLmZvY3VzKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XVxuICB9KVxuXG4gIGVkaXRvci5vbigna2V5RG93bicsIGZ1bmN0aW9uIChlKSB7XG5cbiAgICAvLyBpbnN0YW5jZSBvZiB0aGUgc2VsZWN0ZWQgZWxlbWVudFxuICAgIGxldCBzZWxlY3RlZEVsZW1lbnQgPSAkKHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5nZXROb2RlKCkpXG5cbiAgICB0cnkge1xuXG4gICAgICBsZXQga2V5Y29kZSA9IGUua2V5Q29kZVxuXG4gICAgICAvLyBTYXZlIGJvdW5kcyBvZiBjdXJyZW50IHNlbGVjdGlvbiAoc3RhcnQgYW5kIGVuZClcbiAgICAgIGxldCBzdGFydE5vZGUgPSAkKHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5nZXRSbmcoKS5zdGFydENvbnRhaW5lcilcbiAgICAgIGxldCBlbmROb2RlID0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Um5nKCkuZW5kQ29udGFpbmVyKVxuXG4gICAgICBjb25zdCBTUEVDSUFMX0NIQVJTID1cbiAgICAgICAgKGtleWNvZGUgPiA0NyAmJiBrZXljb2RlIDwgNTgpIHx8IC8vIG51bWJlciBrZXlzXG4gICAgICAgIChrZXljb2RlID4gOTUgJiYga2V5Y29kZSA8IDExMikgfHwgLy8gbnVtcGFkIGtleXNcbiAgICAgICAgKGtleWNvZGUgPiAxODUgJiYga2V5Y29kZSA8IDE5MykgfHwgLy8gOz0sLS4vYCAoaW4gb3JkZXIpXG4gICAgICAgIChrZXljb2RlID4gMjE4ICYmIGtleWNvZGUgPCAyMjMpOyAvLyBbXFxdJyAoaW4gb3JkZXIpXG5cbiAgICAgIC8vIEJsb2NrIHNwZWNpYWwgY2hhcnMgaW4gc3BlY2lhbCBlbGVtZW50c1xuICAgICAgaWYgKFNQRUNJQUxfQ0hBUlMgJiZcbiAgICAgICAgKHN0YXJ0Tm9kZS5wYXJlbnRzKFNQRUNJQUxfU0VDVElPTl9TRUxFQ1RPUikubGVuZ3RoIHx8IGVuZE5vZGUucGFyZW50cyhTUEVDSUFMX1NFQ1RJT05fU0VMRUNUT1IpLmxlbmd0aCkgJiZcbiAgICAgICAgKHN0YXJ0Tm9kZS5wYXJlbnRzKCdoMScpLmxlbmd0aCA+IDAgfHwgZW5kTm9kZS5wYXJlbnRzKCdoMScpLmxlbmd0aCA+IDApKVxuICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgLy8gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgICAvLyAjIyMgQkFDS1NQQUNFICYmIENBTkMgUFJFU1NFRCAjIyNcbiAgICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAgICAgaWYgKGUua2V5Q29kZSA9PSA4IHx8IGUua2V5Q29kZSA9PSA0Nikge1xuXG4gICAgICAgIGxldCB0b1JlbW92ZVNlY3Rpb25zID0gc2VjdGlvbi5nZXRTZWN0aW9uc2luU2VsZWN0aW9uKHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbilcbiAgICAgICAgcmFqZV9zZWN0aW9uX2ZsYWcgPSB0cnVlXG5cbiAgICAgICAgLy8gUHJldmVudCByZW1vdmUgZnJvbSBoZWFkZXJcbiAgICAgICAgaWYgKHNlbGVjdGVkRWxlbWVudC5pcyhOT05fRURJVEFCTEVfSEVBREVSX1NFTEVDVE9SKSB8fFxuICAgICAgICAgIChzZWxlY3RlZEVsZW1lbnQuYXR0cignZGF0YS1tY2UtY2FyZXQnKSA9PSAnYWZ0ZXInICYmIHNlbGVjdGVkRWxlbWVudC5wYXJlbnQoKS5pcyhSQUpFX1NFTEVDVE9SKSkgfHxcbiAgICAgICAgICAoc2VsZWN0ZWRFbGVtZW50LmF0dHIoJ2RhdGEtbWNlLWNhcmV0JykgJiYgc2VsZWN0ZWRFbGVtZW50LnBhcmVudCgpLmlzKFJBSkVfU0VMRUNUT1IpKSA9PSAnYmVmb3JlJylcbiAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICAvLyBJZiBzZWxlY3Rpb24gaXNuJ3QgY29sbGFwc2VkIG1hbmFnZSBkZWxldGVcbiAgICAgICAgaWYgKCF0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uaXNDb2xsYXBzZWQoKSkge1xuICAgICAgICAgIHJldHVybiBzZWN0aW9uLm1hbmFnZURlbGV0ZSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBTRUxFQ1RJT04gU1RBUlRTIG9yIEVORFMgaW4gc3BlY2lhbCBzZWN0aW9uXG4gICAgICAgIGVsc2UgaWYgKHN0YXJ0Tm9kZS5wYXJlbnRzKFNQRUNJQUxfU0VDVElPTl9TRUxFQ1RPUikubGVuZ3RoIHx8IGVuZE5vZGUucGFyZW50cyhTUEVDSUFMX1NFQ1RJT05fU0VMRUNUT1IpLmxlbmd0aCkge1xuXG4gICAgICAgICAgbGV0IHN0YXJ0T2Zmc2V0ID0gdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldFJuZygpLnN0YXJ0T2Zmc2V0XG4gICAgICAgICAgbGV0IHN0YXJ0T2Zmc2V0Tm9kZSA9IDBcbiAgICAgICAgICBsZXQgZW5kT2Zmc2V0ID0gdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldFJuZygpLmVuZE9mZnNldFxuICAgICAgICAgIGxldCBlbmRPZmZzZXROb2RlID0gdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldFJuZygpLmVuZENvbnRhaW5lci5sZW5ndGhcblxuICAgICAgICAgIC8vIENvbXBsZXRlbHkgcmVtb3ZlIHRoZSBjdXJyZW50IHNwZWNpYWwgc2VjdGlvbiBpZiBpcyBlbnRpcmVseSBzZWxlY3RlZFxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBzZWxlY3Rpb24gY29udGFpbnMgdGhlIGVudGlyZSBzZWN0aW9uXG4gICAgICAgICAgICBzdGFydE9mZnNldCA9PSBzdGFydE9mZnNldE5vZGUgJiYgZW5kT2Zmc2V0ID09IGVuZE9mZnNldE5vZGUgJiZcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHNlbGVjdGlvbiBzdGFydHMgZnJvbSBoMVxuICAgICAgICAgICAgKHN0YXJ0Tm9kZS5wYXJlbnRzKCdoMScpLmxlbmd0aCAhPSBlbmROb2RlLnBhcmVudHMoJ2gxJykubGVuZ3RoKSAmJiAoc3RhcnROb2RlLnBhcmVudHMoJ2gxJykubGVuZ3RoIHx8IGVuZE5vZGUucGFyZW50cygnaDEnKS5sZW5ndGgpICYmXG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBzZWxlY3Rpb24gZW5kcyBpbiB0aGUgbGFzdCBjaGlsZFxuICAgICAgICAgICAgKHN0YXJ0Tm9kZS5wYXJlbnRzKFNQRUNJQUxfU0VDVElPTl9TRUxFQ1RPUikuY2hpbGRyZW4oKS5sZW5ndGggPT0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Um5nKCkuZW5kQ29udGFpbmVyKS5wYXJlbnRzVW50aWwoU1BFQ0lBTF9TRUNUSU9OX1NFTEVDVE9SKS5pbmRleCgpICsgMSkpIHtcblxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJlbW92ZSB0aGUgY3VycmVudCBzcGVjaWFsIHNlY3Rpb24gaWYgc2VsZWN0aW9uIGlzIGF0IHRoZSBzdGFydCBvZiBoMSBBTkQgc2VsZWN0aW9uIGlzIGNvbGxhcHNlZCBcbiAgICAgICAgICBpZiAodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmlzQ29sbGFwc2VkKCkgJiYgKHN0YXJ0Tm9kZS5wYXJlbnRzKCdoMScpLmxlbmd0aCB8fCBzdGFydE5vZGUuaXMoJ2gxJykpICYmIHN0YXJ0T2Zmc2V0ID09IDApIHtcblxuICAgICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgc2VjdGlvbiBhbmQgdXBkYXRlIFxuICAgICAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQucGFyZW50KFNQRUNJQUxfU0VDVElPTl9TRUxFQ1RPUikucmVtb3ZlKClcbiAgICAgICAgICAgICAgdGlueW1jZS50cmlnZ2VyU2F2ZSgpXG5cbiAgICAgICAgICAgICAgLy8gVXBkYXRlIHJlZmVyZW5jZXNcbiAgICAgICAgICAgICAgdXBkYXRlUmVmZXJlbmNlcygpXG4gICAgICAgICAgICAgIHVwZGF0ZUlmcmFtZUZyb21TYXZlZENvbnRlbnQoKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlayBpZiBpbnNpZGUgdGhlIHNlbGVjdGlvbiB0byByZW1vdmUsIHRoZXJlIGlzIGJpYmxpb2dyYXBoeVxuICAgICAgICAgIGxldCBoYXNCaWJsaW9ncmFwaHkgPSBmYWxzZVxuICAgICAgICAgICQodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldENvbnRlbnQoKSkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5pcyhCSUJMSU9HUkFQSFlfU0VMRUNUT1IpKVxuICAgICAgICAgICAgICBoYXNCaWJsaW9ncmFwaHkgPSB0cnVlXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGlmIChoYXNCaWJsaW9ncmFwaHkpIHtcblxuICAgICAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgIC8vIEV4ZWN1dGUgbm9ybWFsIGRlbGV0ZVxuICAgICAgICAgICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci5leGVjQ29tbWFuZCgnZGVsZXRlJylcblxuICAgICAgICAgICAgICAvLyBVcGRhdGUgc2F2ZWQgY29udGVudFxuICAgICAgICAgICAgICB0aW55bWNlLnRyaWdnZXJTYXZlKClcblxuICAgICAgICAgICAgICAvLyBSZW1vdmUgc2VsZWN0b3Igd2l0aG91dCBoYWRlclxuICAgICAgICAgICAgICAkKEJJQkxJT0dSQVBIWV9TRUxFQ1RPUikucmVtb3ZlKClcblxuICAgICAgICAgICAgICAvLyBVcGRhdGUgaWZyYW1lIGFuZCByZXN0b3JlIHNlbGVjdGlvblxuICAgICAgICAgICAgICB1cGRhdGVJZnJhbWVGcm9tU2F2ZWRDb250ZW50KClcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGlmIHNlbGVjdGlvbiBzdGFydHMgb3IgZW5kcyBpbiBhIGJpYmxpb2VudHJ5XG4gICAgICAgICAgaWYgKHN0YXJ0Tm9kZS5wYXJlbnRzKEJJQkxJT0VOVFJZX1NFTEVDVE9SKS5sZW5ndGggfHwgZW5kTm9kZS5wYXJlbnRzKEJJQkxJT0VOVFJZX1NFTEVDVE9SKS5sZW5ndGgpIHtcblxuICAgICAgICAgICAgLy8gQm90aCBkZWxldGUgZXZlbnQgYW5kIHVwZGF0ZSBhcmUgc3RvcmVkIGluIGEgc2luZ2xlIHVuZG8gbGV2ZWxcbiAgICAgICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnVuZG9NYW5hZ2VyLnRyYW5zYWN0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci5leGVjQ29tbWFuZCgnZGVsZXRlJylcbiAgICAgICAgICAgICAgc2VjdGlvbi51cGRhdGVCaWJsaW9ncmFwaHlTZWN0aW9uKClcbiAgICAgICAgICAgICAgdXBkYXRlUmVmZXJlbmNlcygpXG5cbiAgICAgICAgICAgICAgLy8gdXBkYXRlIGlmcmFtZVxuICAgICAgICAgICAgICB1cGRhdGVJZnJhbWVGcm9tU2F2ZWRDb250ZW50KClcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgIH1cbiAgICB9IGNhdGNoIChleGNlcHRpb24pIHt9XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICAvLyAjIyMjIyMjIyMgRU5URVIgUFJFU1NFRCAjIyMjIyMjIyNcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgICBpZiAoZS5rZXlDb2RlID09IDEzKSB7XG5cbiAgICAgIC8vIFdoZW4gZW50ZXIgaXMgcHJlc3NlZCBpbnNpZGUgYW4gaGVhZGVyLCBub3QgYXQgdGhlIGVuZCBvZiBpdFxuICAgICAgaWYgKHNlbGVjdGVkRWxlbWVudC5pcygnaDEsaDIsaDMsaDQsaDUsaDYnKSAmJiBzZWxlY3RlZEVsZW1lbnQudGV4dCgpLnRyaW0oKS5sZW5ndGggIT0gdGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldFJuZygpLnN0YXJ0T2Zmc2V0KSB7XG5cbiAgICAgICAgc2VjdGlvbi5hZGRXaXRoRW50ZXIoKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cblxuICAgICAgLy8gSWYgc2VsZWN0aW9uIGlzIGJlZm9yZS9hZnRlciBoZWFkZXJcbiAgICAgIGlmIChzZWxlY3RlZEVsZW1lbnQuaXMoJ3AnKSkge1xuXG4gICAgICAgIC8vIEJsb2NrIGVudGVyIGJlZm9yZSBoZWFkZXJcbiAgICAgICAgaWYgKHNlbGVjdGVkRWxlbWVudC5hdHRyKCdkYXRhLW1jZS1jYXJldCcpID09ICdiZWZvcmUnKVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuXG5cbiAgICAgICAgLy8gQWRkIG5ldyBzZWN0aW9uIGFmdGVyIGhlYWRlclxuICAgICAgICBpZiAoc2VsZWN0ZWRFbGVtZW50LmF0dHIoJ2RhdGEtbWNlLWNhcmV0JykgPT0gJ2FmdGVyJykge1xuICAgICAgICAgIHNlY3Rpb24uYWRkKDEpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgZW50ZXIgaXMgcHJlc3NlZCBpbnNpZGUgYmlibGlvZ3JhcGh5IHNlbGVjdG9yXG4gICAgICBpZiAoc2VsZWN0ZWRFbGVtZW50LnBhcmVudHMoQklCTElPR1JBUEhZX1NFTEVDVE9SKS5sZW5ndGgpIHtcblxuICAgICAgICB0aW55bWNlLnRyaWdnZXJTYXZlKClcblxuICAgICAgICBsZXQgaWQgPSBnZXRTdWNjZXNzaXZlRWxlbWVudElkKEJJQkxJT0VOVFJZX1NFTEVDVE9SLCBCSUJMSU9FTlRSWV9TVUZGSVgpXG5cbiAgICAgICAgLy8gUHJlc3NpbmcgZW50ZXIgaW4gaDEgd2lsbCBhZGQgYSBuZXcgYmlibGlvZW50cnkgYW5kIGNhcmV0IHJlcG9zaXRpb25cbiAgICAgICAgaWYgKHNlbGVjdGVkRWxlbWVudC5pcygnaDEnKSkge1xuXG4gICAgICAgICAgc2VjdGlvbi5hZGRCaWJsaW9lbnRyeShpZClcbiAgICAgICAgICB1cGRhdGVJZnJhbWVGcm9tU2F2ZWRDb250ZW50KClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHNlbGVjdGVkIGVsZW1lbnQgaXMgaW5zaWRlIHRleHRcbiAgICAgICAgZWxzZSBpZiAoc2VsZWN0ZWRFbGVtZW50LmlzKCdwJykpXG4gICAgICAgICAgc2VjdGlvbi5hZGRCaWJsaW9lbnRyeShpZCwgbnVsbCwgc2VsZWN0ZWRFbGVtZW50LnBhcmVudCgnbGknKSlcblxuXG4gICAgICAgIC8vIElmIHNlbGVjdGVkIGVsZW1lbnQgaXMgd2l0aG91dCB0ZXh0XG4gICAgICAgIGVsc2UgaWYgKHNlbGVjdGVkRWxlbWVudC5pcygnbGknKSlcbiAgICAgICAgICBzZWN0aW9uLmFkZEJpYmxpb2VudHJ5KGlkLCBudWxsLCBzZWxlY3RlZEVsZW1lbnQpXG5cbiAgICAgICAgLy8gTW92ZSBjYXJldCAjMTA1XG4gICAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5zZXRDdXJzb3JMb2NhdGlvbih0aW55bWNlLmFjdGl2ZUVkaXRvci5kb20uc2VsZWN0KGAke0JJQkxJT0VOVFJZX1NFTEVDVE9SfSMke2lkfSA+IHBgKVswXSwgZmFsc2UpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICAvLyBBZGRpbmcgc2VjdGlvbnMgd2l0aCBzaG9ydGN1dHMgI1xuICAgICAgaWYgKHNlbGVjdGVkRWxlbWVudC5pcygncCcpICYmIHNlbGVjdGVkRWxlbWVudC50ZXh0KCkudHJpbSgpLnN1YnN0cmluZygwLCAxKSA9PSAnIycpIHtcblxuICAgICAgICBsZXQgbGV2ZWwgPSBzZWN0aW9uLmdldExldmVsRnJvbUhhc2goc2VsZWN0ZWRFbGVtZW50LnRleHQoKS50cmltKCkpXG4gICAgICAgIGxldCBkZWVwbmVzcyA9ICQoc2VsZWN0ZWRFbGVtZW50KS5wYXJlbnRzVW50aWwoUkFKRV9TRUxFQ1RPUikubGVuZ3RoIC0gbGV2ZWwgKyAxXG5cbiAgICAgICAgLy8gSW5zZXJ0IHNlY3Rpb24gb25seSBpZiBjYXJldCBpcyBpbnNpZGUgYWJzdHJhY3Qgc2VjdGlvbiwgYW5kIHVzZXIgaXMgZ29pbmcgdG8gaW5zZXJ0IGEgc3ViIHNlY3Rpb25cbiAgICAgICAgLy8gT1IgdGhlIGN1cnNvciBpc24ndCBpbnNpZGUgb3RoZXIgc3BlY2lhbCBzZWN0aW9uc1xuICAgICAgICAvLyBBTkQgc2VsZWN0ZWRFbGVtZW50IGlzbid0IGluc2lkZSBhIGZpZ3VyZVxuICAgICAgICBpZiAoKChzZWxlY3RlZEVsZW1lbnQucGFyZW50cyhBQlNUUkFDVF9TRUxFQ1RPUikubGVuZ3RoICYmIGRlZXBuZXNzID4gMCkgfHwgIXNlbGVjdGVkRWxlbWVudC5wYXJlbnRzKFNQRUNJQUxfU0VDVElPTl9TRUxFQ1RPUikubGVuZ3RoKSAmJiAhc2VsZWN0ZWRFbGVtZW50LnBhcmVudHMoRklHVVJFX1NFTEVDVE9SKS5sZW5ndGgpIHtcblxuICAgICAgICAgIHNlY3Rpb24uYWRkKGxldmVsLCBzZWxlY3RlZEVsZW1lbnQudGV4dCgpLnN1YnN0cmluZyhsZXZlbCkudHJpbSgpKVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIGVkaXRvci5vbignTm9kZUNoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgc2VjdGlvbi51cGRhdGVTZWN0aW9uVG9vbGJhcigpXG4gIH0pXG59KVxuXG5zZWN0aW9uID0ge1xuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiBjYWxsZWQgd2hlbiBhIG5ldyBzZWN0aW9uIG5lZWRzIHRvIGJlIGF0dGFjaGVkLCB3aXRoIGJ1dHRvbnNcbiAgICovXG4gIGFkZDogZnVuY3Rpb24gKGxldmVsLCB0ZXh0KSB7XG5cbiAgICAvLyBTZWxlY3QgY3VycmVudCBub2RlXG4gICAgbGV0IHNlbGVjdGVkRWxlbWVudCA9ICQodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldE5vZGUoKSlcblxuICAgIC8vIENyZWF0ZSB0aGUgc2VjdGlvblxuICAgIGxldCBuZXdTZWN0aW9uID0gdGhpcy5jcmVhdGUodGV4dCAhPSBudWxsID8gdGV4dCA6IHNlbGVjdGVkRWxlbWVudC5odG1sKCkudHJpbSgpLCBsZXZlbClcblxuICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnVuZG9NYW5hZ2VyLnRyYW5zYWN0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gQ2hlY2sgd2hhdCBraW5kIG9mIHNlY3Rpb24gbmVlZHMgdG8gYmUgaW5zZXJ0ZWRcbiAgICAgIGlmIChzZWN0aW9uLm1hbmFnZVNlY3Rpb24oc2VsZWN0ZWRFbGVtZW50LCBuZXdTZWN0aW9uLCBsZXZlbCA/IGxldmVsIDogc2VsZWN0ZWRFbGVtZW50LnBhcmVudHNVbnRpbChSQUpFX1NFTEVDVE9SKS5sZW5ndGgpKSB7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBzZWxlY3RlZCBzZWN0aW9uXG4gICAgICAgIHNlbGVjdGVkRWxlbWVudC5yZW1vdmUoKVxuXG4gICAgICAgIC8vIElmIHRoZSBuZXcgaGVhZGluZyBoYXMgdGV4dCBub2RlcywgdGhlIG9mZnNldCB3b24ndCBiZSAwIChhcyBub3JtYWwpIGJ1dCBpbnN0ZWFkIGl0J2xsIGJlIGxlbmd0aCBvZiBub2RlIHRleHRcbiAgICAgICAgbW92ZUNhcmV0KG5ld1NlY3Rpb24uZmluZCgnOmhlYWRlcicpLmZpcnN0KClbMF0pXG5cbiAgICAgICAgLy8gVXBkYXRlIGVkaXRvciBjb250ZW50XG4gICAgICAgIHRpbnltY2UudHJpZ2dlclNhdmUoKVxuICAgICAgfVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGNhbGxlZCB3aGVuIGEgbmV3IHNlY3Rpb24gbmVlZHMgdG8gYmUgYXR0YWNoZWQsIHdpdGggYnV0dG9uc1xuICAgKi9cbiAgYWRkV2l0aEVudGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBTZWxlY3QgY3VycmVudCBub2RlXG4gICAgbGV0IHNlbGVjdGVkRWxlbWVudCA9ICQodGlueW1jZS5hY3RpdmVFZGl0b3Iuc2VsZWN0aW9uLmdldE5vZGUoKSlcblxuICAgIC8vIElmIHRoZSBzZWN0aW9uIGlzbid0IHNwZWNpYWxcbiAgICBpZiAoIXNlbGVjdGVkRWxlbWVudC5wYXJlbnQoKS5hdHRyKCdyb2xlJykpIHtcblxuICAgICAgbGV2ZWwgPSBzZWxlY3RlZEVsZW1lbnQucGFyZW50c1VudGlsKFJBSkVfU0VMRUNUT1IpLmxlbmd0aFxuXG4gICAgICAvLyBDcmVhdGUgdGhlIHNlY3Rpb25cbiAgICAgIGxldCBuZXdTZWN0aW9uID0gdGhpcy5jcmVhdGUoc2VsZWN0ZWRFbGVtZW50LnRleHQoKS50cmltKCkuc3Vic3RyaW5nKHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5nZXRSbmcoKS5zdGFydE9mZnNldCksIGxldmVsKVxuXG4gICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci51bmRvTWFuYWdlci50cmFuc2FjdChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gQ2hlY2sgd2hhdCBraW5kIG9mIHNlY3Rpb24gbmVlZHMgdG8gYmUgaW5zZXJ0ZWRcbiAgICAgICAgc2VjdGlvbi5tYW5hZ2VTZWN0aW9uKHNlbGVjdGVkRWxlbWVudCwgbmV3U2VjdGlvbiwgbGV2ZWwpXG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBzZWxlY3RlZCBzZWN0aW9uXG4gICAgICAgIHNlbGVjdGVkRWxlbWVudC5odG1sKHNlbGVjdGVkRWxlbWVudC50ZXh0KCkudHJpbSgpLnN1YnN0cmluZygwLCB0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Um5nKCkuc3RhcnRPZmZzZXQpKVxuXG4gICAgICAgIG1vdmVDYXJldChuZXdTZWN0aW9uLmZpbmQoJzpoZWFkZXInKS5maXJzdCgpWzBdKVxuXG4gICAgICAgIC8vIFVwZGF0ZSBlZGl0b3JcbiAgICAgICAgdGlueW1jZS50cmlnZ2VyU2F2ZSgpXG4gICAgICB9KVxuICAgIH0gZWxzZVxuICAgICAgbm90aWZ5KCdFcnJvciwgaGVhZGVycyBvZiBzcGVjaWFsIHNlY3Rpb25zIChhYnN0cmFjdCwgYWNrbm93bGVkbWVudHMpIGNhbm5vdCBiZSBzcGxpdHRlZCcsICdlcnJvcicsIDQwMDApXG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbGFzdCBpbnNlcnRlZCBpZFxuICAgKi9cbiAgZ2V0TmV4dElkOiBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IGlkID0gMFxuICAgICQoJ3NlY3Rpb25baWRdJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoJCh0aGlzKS5hdHRyKCdpZCcpLmluZGV4T2YoJ3NlY3Rpb24nKSA+IC0xKSB7XG4gICAgICAgIGxldCBjdXJySWQgPSBwYXJzZUludCgkKHRoaXMpLmF0dHIoJ2lkJykucmVwbGFjZSgnc2VjdGlvbicsICcnKSlcbiAgICAgICAgaWQgPSBpZCA+IGN1cnJJZCA/IGlkIDogY3VycklkXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gYHNlY3Rpb24ke2lkKzF9YFxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhbmQgdGhlbiByZW1vdmUgZXZlcnkgc3VjY2Vzc2l2ZSBlbGVtZW50cyBcbiAgICovXG4gIGdldFN1Y2Nlc3NpdmVFbGVtZW50czogZnVuY3Rpb24gKGVsZW1lbnQsIGRlZXBuZXNzKSB7XG5cbiAgICBsZXQgc3VjY2Vzc2l2ZUVsZW1lbnRzID0gJCgnPGRpdj48L2Rpdj4nKVxuXG4gICAgd2hpbGUgKGRlZXBuZXNzID49IDApIHtcblxuICAgICAgaWYgKGVsZW1lbnQubmV4dEFsbCgnOm5vdCguZm9vdGVyKScpKSB7XG5cbiAgICAgICAgLy8gSWYgdGhlIGRlZXBuZXNzIGlzIDAsIG9ubHkgcGFyYWdyYXBoIGFyZSBzYXZlZCAobm90IHNlY3Rpb25zKVxuICAgICAgICBpZiAoZGVlcG5lc3MgPT0gMCkge1xuICAgICAgICAgIC8vIFN1Y2Nlc3NpdmUgZWxlbWVudHMgY2FuIGJlIHAgb3IgZmlndXJlc1xuICAgICAgICAgIHN1Y2Nlc3NpdmVFbGVtZW50cy5hcHBlbmQoZWxlbWVudC5uZXh0QWxsKGBwLCR7RklHVVJFX1NFTEVDVE9SfWApKVxuICAgICAgICAgIGVsZW1lbnQubmV4dEFsbCgpLnJlbW92ZShgcCwke0ZJR1VSRV9TRUxFQ1RPUn1gKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1Y2Nlc3NpdmVFbGVtZW50cy5hcHBlbmQoZWxlbWVudC5uZXh0QWxsKCkpXG4gICAgICAgICAgZWxlbWVudC5uZXh0QWxsKCkucmVtb3ZlKClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnQoJ3NlY3Rpb24nKVxuICAgICAgZGVlcG5lc3MtLVxuICAgIH1cblxuICAgIHJldHVybiAkKHN1Y2Nlc3NpdmVFbGVtZW50cy5odG1sKCkpXG4gIH0sXG5cbiAgLyoqXG4gICAqIFxuICAgKi9cbiAgZ2V0TGV2ZWxGcm9tSGFzaDogZnVuY3Rpb24gKHRleHQpIHtcblxuICAgIGxldCBsZXZlbCA9IDBcbiAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMCwgdGV4dC5sZW5ndGggPj0gNiA/IDYgOiB0ZXh0Lmxlbmd0aClcblxuICAgIHdoaWxlICh0ZXh0Lmxlbmd0aCA+IDApIHtcblxuICAgICAgaWYgKHRleHQuc3Vic3RyaW5nKHRleHQubGVuZ3RoIC0gMSkgPT0gJyMnKVxuICAgICAgICBsZXZlbCsrXG5cbiAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGVuZ3RoIC0gMSlcbiAgICB9XG5cbiAgICByZXR1cm4gbGV2ZWxcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJuIEpRZXVyeSBvYmplY3QgdGhhdCByZXByZXNlbnQgdGhlIHNlY3Rpb25cbiAgICovXG4gIGNyZWF0ZTogZnVuY3Rpb24gKHRleHQsIGxldmVsKSB7XG4gICAgLy8gQ3JlYXRlIHRoZSBzZWN0aW9uXG5cbiAgICAvLyBUcmltIHdoaXRlIHNwYWNlcyBhbmQgYWRkIHplcm9fc3BhY2UgY2hhciBpZiBub3RoaW5nIGlzIGluc2lkZVxuXG4gICAgaWYgKHR5cGVvZiB0ZXh0ICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRleHQgPSB0ZXh0LnRyaW0oKVxuICAgICAgaWYgKHRleHQubGVuZ3RoID09IDApXG4gICAgICAgIHRleHQgPSBcIjxicj5cIlxuICAgIH0gZWxzZVxuICAgICAgdGV4dCA9IFwiPGJyPlwiXG5cbiAgICByZXR1cm4gJChgPHNlY3Rpb24gaWQ9XCIke3RoaXMuZ2V0TmV4dElkKCl9XCI+PGgke2xldmVsfSBkYXRhLXJhc2gtb3JpZ2luYWwtd3JhcHBlcj1cImgxXCI+JHt0ZXh0fTwvaCR7bGV2ZWx9Pjwvc2VjdGlvbj5gKVxuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGF0IGtpbmQgb2Ygc2VjdGlvbiBuZWVkcyB0byBiZSBhZGRlZCwgYW5kIHByZWNlZWRcbiAgICovXG4gIG1hbmFnZVNlY3Rpb246IGZ1bmN0aW9uIChzZWxlY3RlZEVsZW1lbnQsIG5ld1NlY3Rpb24sIGxldmVsKSB7XG5cbiAgICBsZXQgZGVlcG5lc3MgPSAkKHNlbGVjdGVkRWxlbWVudCkucGFyZW50c1VudGlsKFJBSkVfU0VMRUNUT1IpLmxlbmd0aCAtIGxldmVsICsgMVxuXG4gICAgaWYgKGRlZXBuZXNzID49IDApIHtcblxuICAgICAgLy8gQmxvY2sgaW5zZXJ0IHNlbGVjdGlvbiBpZiBjYXJldCBpcyBpbnNpZGUgc3BlY2lhbCBzZWN0aW9uLCBhbmQgdXNlciBpcyBnb2luZyB0byBpbnNlcnQgYSBzdWIgc2VjdGlvblxuICAgICAgaWYgKChzZWxlY3RlZEVsZW1lbnQucGFyZW50cyhTUEVDSUFMX1NFQ1RJT05fU0VMRUNUT1IpLmxlbmd0aCAmJiBkZWVwbmVzcyAhPSAxKSB8fCAoc2VsZWN0ZWRFbGVtZW50LnBhcmVudHMoQUNLTk9XTEVER0VNRU5UU19TRUxFQ1RPUikubGVuZ3RoICYmXG4gICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LnBhcmVudHMoQklCTElPR1JBUEhZX1NFTEVDVE9SKSAmJlxuICAgICAgICAgIHNlbGVjdGVkRWxlbWVudC5wYXJlbnRzKEVORE5PVEVTX1NFTEVDVE9SKSkpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAvLyBHZXQgZGlyZWN0IHBhcmVudCBhbmQgYW5jZXN0b3IgcmVmZXJlbmNlXG4gICAgICBsZXQgc3VjY2Vzc2l2ZUVsZW1lbnRzID0gdGhpcy5nZXRTdWNjZXNzaXZlRWxlbWVudHMoc2VsZWN0ZWRFbGVtZW50LCBkZWVwbmVzcylcblxuICAgICAgaWYgKHN1Y2Nlc3NpdmVFbGVtZW50cy5sZW5ndGgpXG4gICAgICAgIG5ld1NlY3Rpb24uYXBwZW5kKHN1Y2Nlc3NpdmVFbGVtZW50cylcblxuICAgICAgLy8gQ0FTRTogc3ViIHNlY3Rpb25cbiAgICAgIGlmIChkZWVwbmVzcyA9PSAwKVxuICAgICAgICBzZWxlY3RlZEVsZW1lbnQuYWZ0ZXIobmV3U2VjdGlvbilcblxuICAgICAgLy8gQ0FTRTogc2libGluZyBzZWN0aW9uXG4gICAgICBlbHNlIGlmIChkZWVwbmVzcyA9PSAxKVxuICAgICAgICBzZWxlY3RlZEVsZW1lbnQucGFyZW50KCdzZWN0aW9uJykuYWZ0ZXIobmV3U2VjdGlvbilcblxuICAgICAgLy8gQ0FTRTogYW5jZXN0b3Igc2VjdGlvbiBhdCBhbnkgdXBsZXZlbFxuICAgICAgZWxzZVxuICAgICAgICAkKHNlbGVjdGVkRWxlbWVudC5wYXJlbnRzKCdzZWN0aW9uJylbZGVlcG5lc3MgLSAxXSkuYWZ0ZXIobmV3U2VjdGlvbilcblxuICAgICAgaGVhZGluZ0RpbWVuc2lvbigpXG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBcbiAgICovXG4gIHVwZ3JhZGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIGxldCBzZWxlY3RlZEVsZW1lbnQgPSAkKHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5nZXROb2RlKCkpXG5cbiAgICBpZiAoc2VsZWN0ZWRFbGVtZW50LmlzKCdoMSxoMixoMyxoNCxoNSxoNicpKSB7XG5cbiAgICAgIC8vIEdldCB0aGUgcmVmZXJlbmNlcyBvZiBzZWxlY3RlZCBhbmQgcGFyZW50IHNlY3Rpb25cbiAgICAgIGxldCBzZWxlY3RlZFNlY3Rpb24gPSBzZWxlY3RlZEVsZW1lbnQucGFyZW50KFNFQ1RJT05fU0VMRUNUT1IpXG4gICAgICBsZXQgcGFyZW50U2VjdGlvbiA9IHNlbGVjdGVkU2VjdGlvbi5wYXJlbnQoU0VDVElPTl9TRUxFQ1RPUilcblxuICAgICAgLy8gSWYgdGhlcmUgaXMgYSBwYXJlbnQgc2VjdGlvbiB1cGdyYWRlIGlzIGFsbG93ZWRcbiAgICAgIGlmIChwYXJlbnRTZWN0aW9uLmxlbmd0aCkge1xuXG4gICAgICAgIC8vIEV2ZXJ5dGhpbmcgaW4gaGVyZSwgaXMgYW4gYXRvbWljIHVuZG8gbGV2ZWxcbiAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgLy8gU2F2ZSB0aGUgc2VjdGlvbiBhbmQgZGV0YWNoXG4gICAgICAgICAgbGV0IGJvZHlTZWN0aW9uID0gJChzZWxlY3RlZFNlY3Rpb25bMF0ub3V0ZXJIVE1MKVxuICAgICAgICAgIHNlbGVjdGVkU2VjdGlvbi5kZXRhY2goKVxuXG4gICAgICAgICAgLy8gVXBkYXRlIGRpbWVuc2lvbiBhbmQgbW92ZSB0aGUgc2VjdGlvbiBvdXRcbiAgICAgICAgICBwYXJlbnRTZWN0aW9uLmFmdGVyKGJvZHlTZWN0aW9uKVxuXG4gICAgICAgICAgdGlueW1jZS50cmlnZ2VyU2F2ZSgpXG4gICAgICAgICAgaGVhZGluZ0RpbWVuc2lvbigpXG4gICAgICAgICAgdXBkYXRlSWZyYW1lRnJvbVNhdmVkQ29udGVudCgpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIC8vIE5vdGlmeSBlcnJvclxuICAgICAgZWxzZVxuICAgICAgICBub3RpZnkoSEVBRElOR19UUkFTRk9STUFUSU9OX0ZPUkJJRERFTiwgJ2Vycm9yJywgMjAwMClcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFxuICAgKi9cbiAgZG93bmdyYWRlOiBmdW5jdGlvbiAoKSB7XG5cbiAgICBsZXQgc2VsZWN0ZWRFbGVtZW50ID0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Tm9kZSgpKVxuXG4gICAgaWYgKHNlbGVjdGVkRWxlbWVudC5pcygnaDEsaDIsaDMsaDQsaDUsaDYnKSkge1xuICAgICAgLy8gR2V0IHRoZSByZWZlcmVuY2VzIG9mIHNlbGVjdGVkIGFuZCBzaWJsaW5nIHNlY3Rpb25cbiAgICAgIGxldCBzZWxlY3RlZFNlY3Rpb24gPSBzZWxlY3RlZEVsZW1lbnQucGFyZW50KFNFQ1RJT05fU0VMRUNUT1IpXG4gICAgICBsZXQgc2libGluZ1NlY3Rpb24gPSBzZWxlY3RlZFNlY3Rpb24ucHJldihTRUNUSU9OX1NFTEVDVE9SKVxuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBhIHByZXZpb3VzIHNpYmxpbmcgc2VjdGlvbiBkb3duZ3JhZGUgaXMgYWxsb3dlZFxuICAgICAgaWYgKHNpYmxpbmdTZWN0aW9uLmxlbmd0aCkge1xuXG4gICAgICAgIC8vIEV2ZXJ5dGhpbmcgaW4gaGVyZSwgaXMgYW4gYXRvbWljIHVuZG8gbGV2ZWxcbiAgICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgLy8gU2F2ZSB0aGUgc2VjdGlvbiBhbmQgZGV0YWNoXG4gICAgICAgICAgbGV0IGJvZHlTZWN0aW9uID0gJChzZWxlY3RlZFNlY3Rpb25bMF0ub3V0ZXJIVE1MKVxuICAgICAgICAgIHNlbGVjdGVkU2VjdGlvbi5kZXRhY2goKVxuXG4gICAgICAgICAgLy8gVXBkYXRlIGRpbWVuc2lvbiBhbmQgbW92ZSB0aGUgc2VjdGlvbiBvdXRcbiAgICAgICAgICBzaWJsaW5nU2VjdGlvbi5hcHBlbmQoYm9keVNlY3Rpb24pXG5cbiAgICAgICAgICB0aW55bWNlLnRyaWdnZXJTYXZlKClcbiAgICAgICAgICAvLyBSZWZyZXNoIHRpbnltY2UgY29udGVudCBhbmQgc2V0IHRoZSBoZWFkaW5nIGRpbWVuc2lvblxuICAgICAgICAgIGhlYWRpbmdEaW1lbnNpb24oKVxuICAgICAgICAgIHVwZGF0ZUlmcmFtZUZyb21TYXZlZENvbnRlbnQoKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE5vdGlmeSBlcnJvclxuICAgIGVsc2VcbiAgICAgIG5vdGlmeShIRUFESU5HX1RSQVNGT1JNQVRJT05fRk9SQklEREVOLCAnZXJyb3InLCAyMDAwKVxuICB9LFxuXG4gIC8qKlxuICAgKiBcbiAgICovXG4gIGFkZEFic3RyYWN0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoISQoQUJTVFJBQ1RfU0VMRUNUT1IpLmxlbmd0aCkge1xuXG4gICAgICB0aW55bWNlLmFjdGl2ZUVkaXRvci51bmRvTWFuYWdlci50cmFuc2FjdChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gVGhpcyBzZWN0aW9uIGNhbiBvbmx5IGJlIHBsYWNlZCBhZnRlciBub24gZWRpdGFibGUgaGVhZGVyXG4gICAgICAgICQoTk9OX0VESVRBQkxFX0hFQURFUl9TRUxFQ1RPUikuYWZ0ZXIoYDxzZWN0aW9uIGlkPVwiZG9jLWFic3RyYWN0XCIgcm9sZT1cImRvYy1hYnN0cmFjdFwiPjxoMT5BYnN0cmFjdDwvaDE+PC9zZWN0aW9uPmApXG5cbiAgICAgICAgdXBkYXRlSWZyYW1lRnJvbVNhdmVkQ29udGVudCgpXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vbW92ZSBjYXJldCBhbmQgc2V0IGZvY3VzIHRvIGFjdGl2ZSBhZGl0b3IgIzEwNVxuICAgIG1vdmVDYXJldCh0aW55bWNlLmFjdGl2ZUVkaXRvci5kb20uc2VsZWN0KGAke0FCU1RSQUNUX1NFTEVDVE9SfSA+IGgxYClbMF0pXG4gICAgc2Nyb2xsVG8oQUJTVFJBQ1RfU0VMRUNUT1IpXG4gIH0sXG5cbiAgLyoqXG4gICAqIFxuICAgKi9cbiAgYWRkQWNrbm93bGVkZ2VtZW50czogZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCEkKEFDS05PV0xFREdFTUVOVFNfU0VMRUNUT1IpLmxlbmd0aCkge1xuXG4gICAgICBsZXQgYWNrID0gJChgPHNlY3Rpb24gaWQ9XCJkb2MtYWNrbm93bGVkZ2VtZW50c1wiIHJvbGU9XCJkb2MtYWNrbm93bGVkZ2VtZW50c1wiPjxoMT5BY2tub3dsZWRnZW1lbnRzPC9oMT48L3NlY3Rpb24+YClcblxuICAgICAgdGlueW1jZS5hY3RpdmVFZGl0b3IudW5kb01hbmFnZXIudHJhbnNhY3QoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIC8vIEluc2VydCB0aGlzIHNlY3Rpb24gYWZ0ZXIgbGFzdCBub24gc3BlY2lhbCBzZWN0aW9uIFxuICAgICAgICAvLyBPUiBhZnRlciBhYnN0cmFjdCBzZWN0aW9uIFxuICAgICAgICAvLyBPUiBhZnRlciBub24gZWRpdGFibGUgaGVhZGVyXG4gICAgICAgIGlmICgkKE1BSU5fU0VDVElPTl9TRUxFQ1RPUikubGVuZ3RoKVxuICAgICAgICAgICQoTUFJTl9TRUNUSU9OX1NFTEVDVE9SKS5sYXN0KCkuYWZ0ZXIoYWNrKVxuXG4gICAgICAgIGVsc2UgaWYgKCQoQUJTVFJBQ1RfU0VMRUNUT1IpLmxlbmd0aClcbiAgICAgICAgICAkKEFCU1RSQUNUX1NFTEVDVE9SKS5hZnRlcihhY2spXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICQoTk9OX0VESVRBQkxFX0hFQURFUl9TRUxFQ1RPUikuYWZ0ZXIoYWNrKVxuXG4gICAgICAgIHVwZGF0ZUlmcmFtZUZyb21TYXZlZENvbnRlbnQoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvL21vdmUgY2FyZXQgYW5kIHNldCBmb2N1cyB0byBhY3RpdmUgYWRpdG9yICMxMDVcbiAgICBtb3ZlQ2FyZXQodGlueW1jZS5hY3RpdmVFZGl0b3IuZG9tLnNlbGVjdChgJHtBQ0tOT1dMRURHRU1FTlRTX1NFTEVDVE9SfSA+IGgxYClbMF0pXG4gICAgc2Nyb2xsVG8oQUNLTk9XTEVER0VNRU5UU19TRUxFQ1RPUilcbiAgfSxcblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgdGhlIG1haW4gb25lLiBJdCdzIGNhbGxlZCBiZWNhdXNlIGFsbCB0aW1lcyB0aGUgaW50ZW50IGlzIHRvIGFkZCBhIG5ldyBiaWJsaW9lbnRyeSAoc2luZ2xlIHJlZmVyZW5jZSlcbiAgICogVGhlbiBpdCBjaGVja3MgaWYgaXMgbmVjZXNzYXJ5IHRvIGFkZCB0aGUgZW50aXJlIDxzZWN0aW9uPiBvciBvbmx5IHRoZSBtaXNzaW5nIDx1bD5cbiAgICovXG4gIGFkZEJpYmxpb2VudHJ5OiBmdW5jdGlvbiAoaWQsIHRleHQsIGxpc3RJdGVtKSB7XG5cbiAgICAvLyBBZGQgYmlibGlvZ3JhcGh5IHNlY3Rpb24gaWYgbm90IGV4aXN0c1xuICAgIGlmICghJChCSUJMSU9HUkFQSFlfU0VMRUNUT1IpLmxlbmd0aCkge1xuXG4gICAgICBsZXQgYmlibGlvZ3JhcGh5ID0gJChgPHNlY3Rpb24gaWQ9XCJkb2MtYmlibGlvZ3JhcGh5XCIgcm9sZT1cImRvYy1iaWJsaW9ncmFwaHlcIj48aDE+UmVmZXJlbmNlczwvaDE+PHVsPjwvdWw+PC9zZWN0aW9uPmApXG5cbiAgICAgIC8vIFRoaXMgc2VjdGlvbiBpcyBhZGRlZCBhZnRlciBhY2tub3dsZWRnZW1lbnRzIHNlY3Rpb25cbiAgICAgIC8vIE9SIGFmdGVyIGxhc3Qgbm9uIHNwZWNpYWwgc2VjdGlvblxuICAgICAgLy8gT1IgYWZ0ZXIgYWJzdHJhY3Qgc2VjdGlvblxuICAgICAgLy8gT1IgYWZ0ZXIgbm9uIGVkaXRhYmxlIGhlYWRlciBcbiAgICAgIGlmICgkKEFDS05PV0xFREdFTUVOVFNfU0VMRUNUT1IpLmxlbmd0aClcbiAgICAgICAgJChBQ0tOT1dMRURHRU1FTlRTX1NFTEVDVE9SKS5hZnRlcihiaWJsaW9ncmFwaHkpXG5cbiAgICAgIGVsc2UgaWYgKCQoTUFJTl9TRUNUSU9OX1NFTEVDVE9SKS5sZW5ndGgpXG4gICAgICAgICQoTUFJTl9TRUNUSU9OX1NFTEVDVE9SKS5sYXN0KCkuYWZ0ZXIoYmlibGlvZ3JhcGh5KVxuXG4gICAgICBlbHNlIGlmICgkKEFCU1RSQUNUX1NFTEVDVE9SKS5sZW5ndGgpXG4gICAgICAgICQoQUJTVFJBQ1RfU0VMRUNUT1IpLmFmdGVyKGJpYmxpb2dyYXBoeSlcblxuICAgICAgZWxzZVxuICAgICAgICAkKE5PTl9FRElUQUJMRV9IRUFERVJfU0VMRUNUT1IpLmFmdGVyKGJpYmxpb2dyYXBoeSlcblxuICAgIH1cblxuICAgIC8vIEFkZCB1bCBpbiBiaWJsaW9ncmFwaHkgc2VjdGlvbiBpZiBub3QgZXhpc3RzXG4gICAgaWYgKCEkKEJJQkxJT0dSQVBIWV9TRUxFQ1RPUikuZmluZCgndWwnKS5sZW5ndGgpXG4gICAgICAkKEJJQkxJT0dSQVBIWV9TRUxFQ1RPUikuYXBwZW5kKCc8dWw+PC91bD4nKVxuXG4gICAgLy8gSUYgaWQgYW5kIHRleHQgYXJlbid0IHBhc3NlZCBhcyBwYXJhbWV0ZXJzLCB0aGVzZSBjYW4gYmUgcmV0cmlldmVkIG9yIGluaXQgZnJvbSBoZXJlXG4gICAgaWQgPSAoaWQpID8gaWQgOiBnZXRTdWNjZXNzaXZlRWxlbWVudElkKEJJQkxJT0VOVFJZX1NFTEVDVE9SLCBCSUJMSU9FTlRSWV9TVUZGSVgpXG4gICAgdGV4dCA9IHRleHQgPyB0ZXh0IDogJzxici8+J1xuXG4gICAgbGV0IG5ld0l0ZW0gPSAkKGA8bGkgcm9sZT1cImRvYy1iaWJsaW9lbnRyeVwiIGlkPVwiJHtpZH1cIj48cD4ke3RleHR9PC9wPjwvbGk+YClcblxuICAgIC8vIEFwcGVuZCBuZXcgbGkgdG8gdWwgYXQgbGFzdCBwb3NpdGlvblxuICAgIC8vIE9SIGluc2VydCB0aGUgbmV3IGxpIHJpZ2h0IGFmdGVyIHRoZSBjdXJyZW50IG9uZVxuICAgIGlmICghbGlzdEl0ZW0pXG4gICAgICAkKGAke0JJQkxJT0dSQVBIWV9TRUxFQ1RPUn0gdWxgKS5hcHBlbmQobmV3SXRlbSlcblxuICAgIGVsc2VcbiAgICAgIGxpc3RJdGVtLmFmdGVyKG5ld0l0ZW0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIFxuICAgKi9cbiAgdXBkYXRlQmlibGlvZ3JhcGh5U2VjdGlvbjogZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gU3luY2hyb25pemUgaWZyYW1lIGFuZCBzdG9yZWQgY29udGVudFxuICAgIHRpbnltY2UudHJpZ2dlclNhdmUoKVxuXG4gICAgLy8gUmVtb3ZlIGFsbCBzZWN0aW9ucyB3aXRob3V0IHAgY2hpbGRcbiAgICAkKGAke0JJQkxJT0VOVFJZX1NFTEVDVE9SfTpub3QoOmhhcyhwKSlgKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICQodGhpcykucmVtb3ZlKClcbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBcbiAgICovXG4gIGFkZEVuZG5vdGU6IGZ1bmN0aW9uIChpZCkge1xuXG4gICAgLy8gQWRkIHRoZSBzZWN0aW9uIGlmIGl0IG5vdCBleGlzdHNcbiAgICBpZiAoISQoRU5ETk9URV9TRUxFQ1RPUikubGVuZ3RoKSB7XG5cbiAgICAgIGxldCBlbmRub3RlcyA9ICQoYDxzZWN0aW9uIGlkPVwiZG9jLWVuZG5vdGVzXCIgcm9sZT1cImRvYy1lbmRub3Rlc1wiPjxoMSBkYXRhLXJhc2gtb3JpZ2luYWwtY29udGVudD1cIlwiPkZvb3Rub3RlczwvaDE+PC9zZWN0aW9uPmApXG5cbiAgICAgIC8vIEluc2VydCB0aGlzIHNlY3Rpb24gYWZ0ZXIgYmlibGlvZ3JhcGh5IHNlY3Rpb25cbiAgICAgIC8vIE9SIGFmdGVyIGFja25vd2xlZGdlbWVudHMgc2VjdGlvblxuICAgICAgLy8gT1IgYWZ0ZXIgbm9uIHNwZWNpYWwgc2VjdGlvbiBzZWxlY3RvclxuICAgICAgLy8gT1IgYWZ0ZXIgYWJzdHJhY3Qgc2VjdGlvblxuICAgICAgLy8gT1IgYWZ0ZXIgbm9uIGVkaXRhYmxlIGhlYWRlciBcbiAgICAgIGlmICgkKEJJQkxJT0dSQVBIWV9TRUxFQ1RPUikubGVuZ3RoKVxuICAgICAgICAkKEJJQkxJT0dSQVBIWV9TRUxFQ1RPUikuYWZ0ZXIoZW5kbm90ZXMpXG5cbiAgICAgIGVsc2UgaWYgKCQoQUNLTk9XTEVER0VNRU5UU19TRUxFQ1RPUikubGVuZ3RoKVxuICAgICAgICAkKEFDS05PV0xFREdFTUVOVFNfU0VMRUNUT1IpLmFmdGVyKGVuZG5vdGVzKVxuXG4gICAgICBlbHNlIGlmICgkKE1BSU5fU0VDVElPTl9TRUxFQ1RPUikubGVuZ3RoKVxuICAgICAgICAkKE1BSU5fU0VDVElPTl9TRUxFQ1RPUikubGFzdCgpLmFmdGVyKGVuZG5vdGVzKVxuXG4gICAgICBlbHNlIGlmICgkKEFCU1RSQUNUX1NFTEVDVE9SKS5sZW5ndGgpXG4gICAgICAgICQoQUJTVFJBQ1RfU0VMRUNUT1IpLmFmdGVyKGVuZG5vdGVzKVxuXG4gICAgICBlbHNlXG4gICAgICAgICQoTk9OX0VESVRBQkxFX0hFQURFUl9TRUxFQ1RPUikuYWZ0ZXIoZW5kbm90ZXMpXG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGFuZCBhcHBlbmQgdGhlIG5ldyBlbmRub3RlXG4gICAgbGV0IGVuZG5vdGUgPSAkKGA8c2VjdGlvbiByb2xlPVwiZG9jLWVuZG5vdGVcIiBpZD1cIiR7aWR9XCI+PHA+PGJyLz48L3A+PC9zZWN0aW9uPmApXG4gICAgJChFTkROT1RFU19TRUxFQ1RPUikuYXBwZW5kKGVuZG5vdGUpXG4gIH0sXG5cbiAgLyoqXG4gICAqIFxuICAgKi9cbiAgdXBkYXRlU2VjdGlvblRvb2xiYXI6IGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIERyb3Bkb3duIG1lbnUgcmVmZXJlbmNlXG4gICAgbGV0IG1lbnUgPSAkKE1FTlVfU0VMRUNUT1IpXG5cbiAgICBpZiAobWVudS5sZW5ndGgpIHtcbiAgICAgIHNlY3Rpb24ucmVzdG9yZVNlY3Rpb25Ub29sYmFyKG1lbnUpXG5cbiAgICAgIC8vIFNhdmUgY3VycmVudCBzZWxlY3RlZCBlbGVtZW50XG4gICAgICBsZXQgc2VsZWN0ZWRFbGVtZW50ID0gJCh0aW55bWNlLmFjdGl2ZUVkaXRvci5zZWxlY3Rpb24uZ2V0Um5nKCkuc3RhcnRDb250YWluZXIpXG5cbiAgICAgIGlmIChzZWxlY3RlZEVsZW1lbnRbMF0ubm9kZVR5cGUgPT0gMylcbiAgICAgICAgc2VsZWN0ZWRFbGVtZW50ID0gc2VsZWN0ZWRFbGVtZW50LnBhcmVudCgpXG5cbiAgICAgIC8vIElmIGN1cnJlbnQgZWxlbWVudCBpcyBwXG4gICAgICBpZiAoc2VsZWN0ZWRFbGVtZW50LmlzKCdwJykgfHwgc2VsZWN0ZWRFbGVtZW50LnBhcmVudCgpLmlzKCdwJykpIHtcblxuICAgICAgICAvLyBEaXNhYmxlIHVwZ3JhZGUvZG93bmdyYWRlXG4gICAgICAgIG1lbnUuY2hpbGRyZW4oJzpndCgxMCknKS5hZGRDbGFzcygnbWNlLWRpc2FibGVkJylcblxuICAgICAgICAvLyBDaGVjayBpZiBjYXJldCBpcyBpbnNpZGUgc3BlY2lhbCBzZWN0aW9uXG4gICAgICAgIC8vIEluIHRoaXMgY2FzZSBlbmFibGUgb25seSBmaXJzdCBtZW51aXRlbSBpZiBjYXJldCBpcyBpbiBhYnN0cmFjdFxuICAgICAgICBpZiAoc2VsZWN0ZWRFbGVtZW50LnBhcmVudHMoU1BFQ0lBTF9TRUNUSU9OX1NFTEVDVE9SKS5sZW5ndGgpIHtcblxuICAgICAgICAgIGlmIChzZWxlY3RlZEVsZW1lbnQucGFyZW50cyhBQlNUUkFDVF9TRUxFQ1RPUikubGVuZ3RoKVxuICAgICAgICAgICAgbWVudS5jaGlsZHJlbihgOmx0KDEpYCkucmVtb3ZlQ2xhc3MoJ21jZS1kaXNhYmxlZCcpXG5cbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBkZWVwbmVzcyBvZiB0aGUgc2VjdGlvblxuICAgICAgICBsZXQgZGVlcG5lc3MgPSBzZWxlY3RlZEVsZW1lbnQucGFyZW50cyhTRUNUSU9OX1NFTEVDVE9SKS5sZW5ndGggKyAxXG5cbiAgICAgICAgLy8gUmVtb3ZlIGRpc2FibGluZyBjbGFzcyBvbiBmaXJzdCB7ZGVlcG5lc3N9IG1lbnUgaXRlbXNcbiAgICAgICAgbWVudS5jaGlsZHJlbihgOmx0KCR7ZGVlcG5lc3N9KWApLnJlbW92ZUNsYXNzKCdtY2UtZGlzYWJsZWQnKVxuXG4gICAgICAgIGxldCBwcmVIZWFkZXJzID0gW11cbiAgICAgICAgbGV0IHBhcmVudFNlY3Rpb25zID0gc2VsZWN0ZWRFbGVtZW50LnBhcmVudHMoJ3NlY3Rpb24nKVxuXG4gICAgICAgIC8vIFNhdmUgaW5kZXggb2YgYWxsIHBhcmVudCBzZWN0aW9uc1xuICAgICAgICBmb3IgKGxldCBpID0gcGFyZW50U2VjdGlvbnMubGVuZ3RoOyBpID4gMDsgaS0tKSB7XG4gICAgICAgICAgbGV0IGVsZW0gPSAkKHBhcmVudFNlY3Rpb25zW2kgLSAxXSlcbiAgICAgICAgICBsZXQgaW5kZXggPSBlbGVtLnBhcmVudCgpLmNoaWxkcmVuKFNFQ1RJT05fU0VMRUNUT1IpLmluZGV4KGVsZW0pICsgMVxuICAgICAgICAgIHByZUhlYWRlcnMucHVzaChpbmRleClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSB0ZXh0IG9mIGFsbCBtZW51IGl0ZW1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gcHJlSGVhZGVycy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgbGV0IHRleHQgPSBgJHtIRUFESU5HfSBgXG5cbiAgICAgICAgICAvLyBVcGRhdGUgdGV4dCBiYXNlZCBvbiBzZWN0aW9uIHN0cnVjdHVyZVxuICAgICAgICAgIGlmIChpICE9IHByZUhlYWRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8PSBpOyB4KyspXG4gICAgICAgICAgICAgIHRleHQgKz0gYCR7cHJlSGVhZGVyc1t4XSArICh4ID09IGkgPyAxIDogMCl9LmBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJbiB0aGlzIGNhc2UgcmFqZSBjaGFuZ2VzIHRleHQgb2YgbmV4dCBzdWIgaGVhZGluZ1xuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBpOyB4KyspXG4gICAgICAgICAgICAgIHRleHQgKz0gYCR7cHJlSGVhZGVyc1t4XX0uYFxuXG4gICAgICAgICAgICB0ZXh0ICs9ICcxLidcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtZW51LmNoaWxkcmVuKGA6ZXEoJHtpfSlgKS5maW5kKCdzcGFuLm1jZS10ZXh0JykudGV4dCh0ZXh0KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIERpc2FibGUgXG4gICAgICBlbHNlIGlmIChzZWxlY3RlZEVsZW1lbnQuaXMoJ2gxJykgJiYgc2VsZWN0ZWRFbGVtZW50LnBhcmVudHMoU1BFQ0lBTF9TRUNUSU9OX1NFTEVDVE9SKSkge1xuICAgICAgICBtZW51LmNoaWxkcmVuKCc6Z3QoMTApJykuYWRkQ2xhc3MoJ21jZS1kaXNhYmxlZCcpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXN0b3JlIG5vcm1hbCB0ZXh0IGluIHNlY3Rpb24gdG9vbGJhciBhbmQgZGlzYWJsZSBhbGxcbiAgICovXG4gIHJlc3RvcmVTZWN0aW9uVG9vbGJhcjogZnVuY3Rpb24gKG1lbnUpIHtcblxuICAgIGxldCBjbnQgPSAxXG5cbiAgICBtZW51LmNoaWxkcmVuKCc6bHQoNiknKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCB0ZXh0ID0gYCR7SEVBRElOR30gYFxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNudDsgaSsrKVxuICAgICAgICB0ZXh0ICs9IGAxLmBcblxuICAgICAgJCh0aGlzKS5maW5kKCdzcGFuLm1jZS10ZXh0JykudGV4dCh0ZXh0KVxuICAgICAgJCh0aGlzKS5hZGRDbGFzcygnbWNlLWRpc2FibGVkJylcblxuICAgICAgY250KytcbiAgICB9KVxuXG4gICAgLy8gRW5hYmxlIHVwZ3JhZGUvZG93bmdyYWRlIGxhc3QgdGhyZWUgbWVudSBpdGVtc1xuICAgIG1lbnUuY2hpbGRyZW4oJzpndCgxMCknKS5yZW1vdmVDbGFzcygnbWNlLWRpc2FibGVkJylcbiAgfSxcblxuICBtYW5hZ2VEZWxldGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIGxldCByYW5nZSA9IHRpbnltY2UuYWN0aXZlRWRpdG9yLnNlbGVjdGlvbi5nZXRSbmcoKVxuICAgIGxldCBzdGFydE5vZGUgPSAkKHJhbmdlLnN0YXJ0Q29udGFpbmVyKS5wYXJlbnQoKVxuICAgIGxldCBlbmROb2RlID0gJChyYW5nZS5lbmRDb250YWluZXIpLnBhcmVudCgpXG4gICAgbGV0IGNvbW1vbkFuY2VzdG9yQ29udGFpbmVyID0gJChyYW5nZS5jb21tb25BbmNlc3RvckNvbnRhaW5lcilcblxuICAgIC8vIERlZXBuZXNzIGlzIHJlbGF0aXZlIHRvIHRoZSBjb21tb24gYW5jZXN0b3IgY29udGFpbmVyIG9mIHRoZSByYW5nZSBzdGFydENvbnRhaW5lciBhbmQgZW5kXG4gICAgbGV0IGRlZXBuZXNzID0gZW5kTm9kZS5wYXJlbnQoJ3NlY3Rpb24nKS5wYXJlbnRzVW50aWwoY29tbW9uQW5jZXN0b3JDb250YWluZXIpLmxlbmd0aCArIDFcbiAgICBsZXQgY3VycmVudEVsZW1lbnQgPSBlbmROb2RlXG4gICAgbGV0IHRvTW92ZUVsZW1lbnRzID0gW11cblxuICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLnVuZG9NYW5hZ2VyLnRyYW5zYWN0KGZ1bmN0aW9uICgpIHtcblxuICAgICAgLy8gR2V0IGFuZCBkZXRhY2ggYWxsIG5leHRfZW5kXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBkZWVwbmVzczsgaSsrKSB7XG4gICAgICAgIGN1cnJlbnRFbGVtZW50Lm5leHRBbGwoJ3NlY3Rpb24scCxmaWd1cmUnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0b01vdmVFbGVtZW50cy5wdXNoKCQodGhpcykpXG5cbiAgICAgICAgICAkKHRoaXMpLmRldGFjaCgpXG4gICAgICAgIH0pXG4gICAgICAgIGN1cnJlbnRFbGVtZW50ID0gY3VycmVudEVsZW1lbnQucGFyZW50KClcbiAgICAgIH1cblxuICAgICAgLy8gRXhlY3V0ZSBkZWxldGVcbiAgICAgIHRpbnltY2UuYWN0aXZlRWRpdG9yLmV4ZWNDb21tYW5kKCdkZWxldGUnKVxuXG4gICAgICAvLyBEZXRhY2ggYWxsIG5leHRfYmVnaW5cbiAgICAgIHN0YXJ0Tm9kZS5uZXh0QWxsKCkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykuZGV0YWNoKClcbiAgICAgIH0pXG5cbiAgICAgIC8vIEFwcGVuZCBhbGwgbmV4dF9lbmQgdG8gc3RhcnRub2RlIHBhcmVudFxuICAgICAgdG9Nb3ZlRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBzdGFydE5vZGUucGFyZW50KCdzZWN0aW9uJykuYXBwZW5kKGVsZW1lbnQpXG4gICAgICB9KVxuXG4gICAgICB0aW55bWNlLnRyaWdnZXJTYXZlKClcblxuICAgICAgLy8gUmVmcmVzaCBoZWFkaW5nc1xuICAgICAgaGVhZGluZ0RpbWVuc2lvbigpXG5cbiAgICAgIC8vIFVwZGF0ZSByZWZlcmVuY2VzIGlmIG5lZWRlZFxuICAgICAgdXBkYXRlUmVmZXJlbmNlcygpXG5cbiAgICAgIHVwZGF0ZUlmcmFtZUZyb21TYXZlZENvbnRlbnQoKVxuICAgIH0pXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0iXX0=
