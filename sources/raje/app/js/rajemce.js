/**
 * 
 * Initilize TinyMCE editor with all required options
 */

// TinyMCE DomQuery variable
let dom = tinymce.dom.DomQuery

// Invisible space constant
const ZERO_SPACE = '&#8203;'
const RAJE_SELECTOR = 'body#tinymce'
const SECTION_MENU_BASE = 2

$(document).ready(function () {
  //hide footer
  $('footer.footer').hide()

  //attach whole body inside a placeholder div
  $('body').html(`<div id="raje_root">${$('body').html()}</div>`)

  tinymce.init({

    // Select the element to wrap
    selector: '#raje_root',

    // Set the styles of the content wrapped inside the element
    content_css: ['css/bootstrap.min.css', 'css/rash.css'],

    // Set plugins
    plugins: "fullscreen link codesample inline_code inline_quote section table noneditable",

    // Remove menubar
    menubar: false,

    // Custom toolbar
    toolbar: 'undo redo bold italic link codesample superscript subscript inline_code | blockquote table figure | section',

    // Setup full screen on init
    setup: function (editor) {

      // Set fullscreen 
      editor.on('init', function (e) {

        editor.execCommand('mceFullScreen')
      })

      /*
            // Event triggered every time the selected element change
            editor.on('NodeChange', function (e) {

              
              // disable all section button
              for (let i = SECTION_MENU_BASE; i < 8; i++)
                tinyMCE.activeEditor.buttons['section'].menu[i].disabled = true

              // Save the reference of the selected node
              let selectedElement = tinymce.activeEditor.selection.getNode()

              // Check if the selected node is a paragraph only here can be added a new section
              if (tinymce.activeEditor.selection.getNode().nodeName == 'P') {

                // Get the deepness of the section which is the number of button to enable (+1 i.e. the 1st level subsection)
                let deepness = SECTION_MENU_BASE + dom(selectedElement).parents('section').length + 1
                for (let x = SECTION_MENU_BASE; x < deepness; x++) {
                  tinyMCE.activeEditor.buttons['section'].menu[x].disabled = false
                }
              }

              tinymce.triggerSave()
            })
      */
      editor.on('keyDown', function (e) {

        // instance of the selected element
        let selectedElement = $(tinymce.activeEditor.selection.getNode())

        // When press enter
        if (e.keyCode == 13) {

          // When enter is pressed inside an header, not at the end of it
          if (selectedElement.is('h1,h2,h3,h4,h5,h6') && selectedElement.text().trim().length != tinymce.activeEditor.selection.getRng().startOffset) {

            Rajemce.section.addWithEnter()
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
      },

      sections: {
        block: 'section'
      },
      heading: {
        block: 'h1'
      }
    },

    // Remove "powered by tinymce"
    branding: false
  });
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
      Rajemce.inline.code.handle()
    }
  });
});

/**
 *  Inline quote plugin RAJE
 */
tinymce.PluginManager.add('inline_quote', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('inline_quote', {
    text: 'inline_quote',
    icon: false,
    tooltip: 'Inline quote',

    // Button behaviour
    onclick: function () {
      Rajemce.inline.quote.handle()
    }
  });
});

/**
 * RASH section plugin RAJE
 */
tinymce.PluginManager.add('section', function (editor, url) {

  editor.addButton('section', {
    type: 'menubutton',
    text: 'Headings',
    title: 'heading',
    icons: false,

    // Sections sub menu
    menu: [{
      text: 'Downgrade',
      onclick: function () {
        Rajemce.section.downgrade()
      }
    }, {
      text: 'Upgrade',
      onclick: function () {
        Rajemce.section.upgrade()
      }
    }, {
      text: 'Heading 1.',
      onclick: function () {
        Rajemce.section.add(1)
      }
    }, {
      text: 'Heading 1.1.',
      onclick: function () {
        Rajemce.section.add(2)
      }
    }, {
      text: 'Heading 1.1.1.',
      onclick: function () {
        Rajemce.section.add(3)
      }
    }, {
      text: 'Heading 1.1.1.1.',
      onclick: function () {
        Rajemce.section.add(4)
      }
    }, {
      text: 'Heading 1.1.1.1.1.',
      onclick: function () {
        Rajemce.section.add(5)
      }
    }, {
      text: 'Heading 1.1.1.1.1.1.',
      onclick: function () {
        Rajemce.section.add(6)
      }
    }]
  })
})


/**
 * RajeMCE class
 * It contains every custom functions to attach to plugins
 */
Rajemce = {

  // Inline elements
  inline: {

    code: {
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
    },

    quote: {
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
  },

  // Section functions
  section: {

    /**
     * Function called when a new section needs to be attached, with buttons
     */
    add: function (level, text) {

      // Select current node
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      // Create the section
      let newSection = this.createSection(text ? text : selectedElement.html().trim(), level)

      tinymce.activeEditor.undoManager.transact(function () {

        // Check what kind of section needs to be inserted
        Rajemce.section.manageSection(selectedElement, newSection, level ? level : selectedElement.parentsUntil(RAJE_SELECTOR).length)

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
      let newSection = this.createSection(selectedElement.html().trim().substring(tinymce.activeEditor.selection.getRng().startOffset), level)

      tinymce.activeEditor.undoManager.transact(function () {

        // Check what kind of section needs to be inserted
        this.manageSection(selectedElement, newSection, level)

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
      dom('section[id]').each(function () {
        if (dom(this).attr('id').indexOf('section') > -1) {
          let currId = parseInt(dom(this).attr('id').replace('section', ''))
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
    createSection: function (text, level) {
      // Create the section
      return $(`<section data-pointer id="${this.getNextId()}"><h${level}>${ZERO_SPACE}${text}</h${level}></section>`)
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
    }
  }
}

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