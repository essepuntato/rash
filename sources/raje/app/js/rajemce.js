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

      editor.on('keyDown', function (e) {

        // instance of the selected element
        let selectedElement = $(tinymce.activeEditor.selection.getNode())

        // When press enter
        if (e.keyCode == 13) {

          // When enter is pressed inside an header, not at the end of it
          if (selectedElement.is('h1,h2,h3,h4,h5,h6') && selectedElement.text().trim().length != tinymce.activeEditor.selection.getRng().startOffset) {

            return false
          }
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
      onclick: function () {}
    }, {
      text: 'Heading 1.',
      onclick: function () {
        Rajemce.section.insert(1)
      }
    }, {
      text: 'Heading 1.1.',
      onclick: function () {
        Rajemce.section.insert(2)
      }
    }, {
      text: 'Heading 1.1.1.',
      onclick: function () {
        Rajemce.section.insert(3)
      }
    }, {
      text: 'Heading 1.1.1.1.',
      onclick: function () {
        Rajemce.section.insert(4)
      }
    }, {
      text: 'Heading 1.1.1.1.1.',
      onclick: function () {
        Rajemce.section.insert(5)
      }
    }, {
      text: 'Heading 1.1.1.1.1.1.',
      onclick: function () {
        Rajemce.section.insert(6)
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
    insert: function (level) {

      // Select current node
      let selectedElement = tinymce.activeEditor.selection.getNode()
      let id = this.getNextId()

      // Create the section
      let newSection = dom(`<section id="${id}"><h${level}>${ZERO_SPACE}${dom(selectedElement).html().trim()}</h${level}></section>`)

      // Check what kind of section needs to be inserted
      let deepness = dom(selectedElement).parentsUntil(RAJE_SELECTOR).length - level + 1

      if (deepness >= 0) {

        // Get direct parent and ancestor reference
        let parentSection = $(selectedElement).parent('section')
        let ancestorSection = $($(selectedElement).parents('section')[deepness - 1])
        let successiveElements = this.getSuccessiveElements($(selectedElement), deepness)

        newSection.append(successiveElements)

        // CASE: a new sub section
        if (deepness == 0)
          $(selectedElement).after(newSection)

        else if (deepness == 1)
          parentSection.after(newSection)

        // CASE: an ancestor section at any uplevel
        else
          ancestorSection.after(newSection)

        // Remove the selected section
        $(selectedElement).remove()

        // Refresh tinymce content and set the heading dimension
        tinymce.triggerSave()

        // Add the change to the undo manager
        tinymce.activeEditor.undoManager.add()
      }
    },

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

    getSuccessiveElements: function (element, deepness) {

      let successiveElements = $('<div></div>')

      while (deepness > 0) {

        if (element.nextAll(':not(.footer)')) {
          successiveElements.append(element.nextAll())
          element.nextAll().remove()
        }

        element = element.parent('section')
        deepness--
      }

      return successiveElements.html()
    }
  }
}

jQuery.fn.extend({
  updateChildrenHeading: function () {
    $(this).find('h1,h2,h3,h4,h5,h6').each(function () {
      let l = dom(this).parentsUntil(RAJE_SELECTOR).length + 1
      dom(this).html(`<h${l}>${dom(this).html()}</h${l}>`)
    })
  }
})