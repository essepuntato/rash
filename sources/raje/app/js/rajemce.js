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
    plugins: "fullscreen link codesample raje_inlineCode raje_inlineQuote raje_section table noneditable raje_figure",

    // Remove menubar
    menubar: false,

    // Custom toolbar
    toolbar: 'undo redo bold italic link codesample superscript subscript raje_inlineCode | blockquote table raje_figure | raje_section',

    // Setup full screen on init
    setup: function (editor) {

      // Set fullscreen 
      editor.on('init', function (e) {

        editor.execCommand('mceFullScreen')
      })

      editor.on('keyDown', function (e) {

        // instance of the selected element
        let selectedElement = $(tinymce.activeEditor.selection.getNode())

        // When press enter
        if (e.keyCode == 13) {

          // When enter is pressed inside an header, not at the end of it
          if (selectedElement.is('h1,h2,h3,h4,h5,h6') && selectedElement.text().trim().length != tinymce.activeEditor.selection.getRng().startOffset) {

            section.addWithEnter()
            return false
          }

          /*
          if (selectedElement.is('p') && selectedElement.text().trim().indexOf('#') != -1) {
            let level = Rajemce.section.getLevelFromHash(selectedElement.text().trim())

            Rajemce.section.add(level, selectedElement.text().substring(level).trim())
          }*/
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
    branding: false
  });
})
/**
 * raje_inline_code plugin RAJE
 */
tinymce.PluginManager.add('raje_inlineCode', function (editor, url) {

  // Add a button that opens a window
  editor.addButton('inline_code', {
    text: 'inline_code',
    icon: false,
    tooltip: 'Inline code',

    // Button behaviour
    onclick: function () {
      code.handle()
    }
  })

  code = {
    /**
     * Insert or exit from inline code element
     */
    handle: function () {

      let name = tinymce.activeEditor.selection.getNode().nodeName

      if (name == 'CODE')
        tinymce.activeEditor.formatter.remove('inline_code')

      else
        tinymce.activeEditor.formatter.apply('inline_code')
    }
  }
})

/**
 *  Inline quote plugin RAJE
 */
tinymce.PluginManager.add('raje_inlineQuote', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('inline_quote', {
    text: 'inline_quote',
    icon: false,
    tooltip: 'Inline quote',

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

/**
 * RASH section plugin RAJE
 */
tinymce.PluginManager.add('raje_section', function (editor, url) {

  editor.addButton('raje_section', {
    type: 'menubutton',
    text: 'Headings',
    title: 'heading',
    icons: false,

    // Sections sub menu
    menu: [{
      text: 'Heading 1.',
      onclick: function () {
        section.add(1)
      }
    }, {
      text: 'Heading 1.1.',
      onclick: function () {
        section.add(2)
      }
    }, {
      text: 'Heading 1.1.1.',
      onclick: function () {
        section.add(3)
      }
    }, {
      text: 'Heading 1.1.1.1.',
      onclick: function () {
        section.add(4)
      }
    }, {
      text: 'Heading 1.1.1.1.1.',
      onclick: function () {
        section.add(5)
      }
    }, {
      text: 'Heading 1.1.1.1.1.1.',
      onclick: function () {
        section.add(6)
      }
    }]
  })

  editor.on('keyDown', function (e) {

    // Check if a deletion is called
    if (e.keyCode == 8)
      flag = true
  })

  editor.on('NodeChange', function (e) {

    //tinymce.activeEditor.controlManager.get('section').setDisabled(true);
    /*

    let menu = tinymce.activeEditor.buttons['section'].menu

    // Update button menu
    for (let i = 0; i < 6; i++)
      menu[i].disabled = true

    // Save the reference of the selected node
    let selectedElement = tinymce.activeEditor.selection.getNode()

    // Check if the selected node is a paragraph only here can be added a new section
    if (tinymce.activeEditor.selection.getNode().nodeName == 'P') {

      // Get the deepness of the section which is the number of button to enable (+1 i.e. the 1st level subsection)
      let deepness = $(selectedElement).parents('section').length + 1
      for (let i = 0; i < deepness; i++)
        menu[i].disabled = false
    }

    editor.theme.panel.find('toolbar buttongroup').repaint()
    */

    if (flag) {
      flag = false
      section.updateSectionStructure()
    }
  })

  section = {

    /**
     * Function called when a new section needs to be attached, with buttons
     */
    add: function (level, text) {

      // Select current node
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      // Create the section
      let newSection = this.create(text ? text : selectedElement.html().trim(), level)

      tinymce.activeEditor.undoManager.transact(function () {

        // Check what kind of section needs to be inserted
        section.manageSection(selectedElement, newSection, level ? level : selectedElement.parentsUntil(RAJE_SELECTOR).length)

        // Remove the selected section
        selectedElement.remove()

        // Update editor content
        tinymce.triggerSave()
      })
    },

    /**
     * Function called when a new section needs to be attached, with buttons
     */
    addWithEnter: function (level) {

      // Select current node
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      level = level ? level : selectedElement.parentsUntil(RAJE_SELECTOR).length

      // Create the section
      let newSection = this.create(selectedElement.html().trim().substring(tinymce.activeEditor.selection.getRng().startOffset), level)

      tinymce.activeEditor.undoManager.transact(function () {

        // Check what kind of section needs to be inserted
        section.manageSection(selectedElement, newSection, level)

        // Remove the selected section
        selectedElement.html(selectedElement.html().trim().substring(0, tinymce.activeEditor.selection.getRng().startOffset))

        // Update editor
        tinymce.triggerSave()
      })
    },

    /**
     * Get the last inserted id
     */
    getNextId: function () {
      let id = 1
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
            successiveElements.append(element.nextAll('p'))
            element.nextAll().remove('p')
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
      return $(`<section id="${this.getNextId()}"><h${level}>${ZERO_SPACE}${text}</h${level}></section>`)
    },

    /**
     * Check what kind of section needs to be added, and preceed
     */
    manageSection: function (selectedElement, newSection, level) {

      let deepness = $(selectedElement).parentsUntil(RAJE_SELECTOR).length - level + 1

      if (deepness >= 0) {

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

        newSection.headingDimension()
      }
    },

    /**
     * Refresh editor and save the transaction inside the Undo buffer
     */
    commit: function () {

      // Refresh tinymce content and set the heading dimension
      tinymce.triggerSave()

      // Add the change to the undo manager
      tinymce.activeEditor.undoManager.add()
    },

    /**
     * 
     */
    upgrade: function () {

      // Get the references of selected and parent section
      let selectedSection = $(tinymce.activeEditor.selection.getNode()).parent('section')
      let parentSection = selectedSection.parent('section')

      // If there is a parent section upgrade is allowed
      if (parentSection.length) {

        // Everything in here, is an atomic undo level
        tinymce.activeEditor.undoManager.transact(function () {

          // Save the section and detach
          let bodySection = $(selectedSection[0].outerHTML)
          selectedSection.detach()

          // Update dimension and move the section out
          parentSection.after(bodySection)

          // Refresh tinymce content and set the heading dimension
          bodySection.headingDimension()
          tinymce.triggerSave()
        })
      }
    },

    /**
     * 
     */
    downgrade: function () {

      // Get the references of selected and sibling section
      let selectedSection = $(tinymce.activeEditor.selection.getNode()).parent('section')
      let siblingSection = selectedSection.prev('section')

      // If there is a previous sibling section downgrade is allowed
      if (siblingSection.length) {

        // Everything in here, is an atomic undo level
        tinymce.activeEditor.undoManager.transact(function () {

          // Save the section and detach
          let bodySection = $(selectedSection[0].outerHTML)
          selectedSection.detach()

          // Update dimension and move the section out
          siblingSection.append(bodySection)

          // Refresh tinymce content and set the heading dimension
          bodySection.headingDimension()
          tinymce.triggerSave()
        })
      }
    },

    /**
     * 
     * After any delete, the editor must update the unvalidated elements
     */
    updateSectionStructure: function () {

      // Save selected element and ancestor section references
      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let ancestorSection = selectedElement.parents(RAJE_SELECTOR)

      // TODO update algorithm #issue96

      let toRemoveSections = []

      ancestorSection.find('section').each(function () {

        if ($(this).children().first().is('section')) {

          toRemoveSections.push($(this))
        }
      })

      // Get the list of the section without h1, those who have another section as first child
      //let toRemoveSections = ancestorSection.find('section:has(section:first-child)')

      // If there are sections to be removed
      if (toRemoveSections.length > 0) {

        // Move everything after 
        selectedElement.after(toRemoveSections[length].html())

        toRemoveSections[0].remove()

        ancestorSection.children('section').headingDimension()
        tinymce.triggerSave()
      }
    },
  }
})

/**
 * 
 */
tinymce.PluginManager.add('raje_figure', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_figure', {
    text: 'raje_figure',
    icon: false,
    tooltip: 'Add figure',

    // Button behaviour
    onclick: function () {


      editor.windowManager.open({
        title: 'Select image',
        body: [{
          type: 'textbox',
          name: 'url',
          label: 'url'
        }, {
          type: 'textbox',
          name: 'alt',
          label: 'alt'
        }],
        onSubmit: function (e) {
          figure.add(e.data.url, e.data.alt)
        }
      })
    }
  })

  figure = {

    /**
     * s
     */
    add: function (url, alt) {

      // Get the referece of the selected element
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      if (selectedElement.text().trim().length != 0) {
        let tmp = $('<p></p>')
        selectedElement.after(tmp)

        selectedElement = tmp
      }

      // Create the object of the figure
      let newFigure = this.create(url, alt)

      tinymce.activeEditor.undoManager.transact(function () {

        selectedElement.append(newFigure)
        tinymce.triggerSave()
      })
    },

    /**
     * 
     */
    create: function (url, alt) {
      return $(`<figure id="${this.getNextId()}"><p><img src="${url}" alt="${alt}"/></p><figcaption>Caption.</figcaption></figure>`)
    },

    /**
     * 
     */
    getNextId: function () {
      let id = 1
      $('figurebox_selector').each(function () {
        if ($(this).attr('id').indexOf('section') > -1) {
          let currId = parseInt($(this).attr('id').replace('figure', ''))
          id = id > currId ? id : currId
        }
      })
      return `figure_${id+1}`
    }
  }
})

jQuery.fn.extend({
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