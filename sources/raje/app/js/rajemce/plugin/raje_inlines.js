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

    // Check if the selected element is a CODE that isn't inside a FIGURE or PRE
    let selectedElement = $(tinymce.activeEditor.selection.getNode())
    if (selectedElement.is('code') && !selectedElement.parents(FIGURE_SELECTOR).length && !selectedElement.parents('pre').length) {

      /**
       * Check if ENTER is pressed
       */
      if (e.keyCode == 13) {

        e.preventDefault()
        code.exit()
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
    },

    /**
     * 
     */
    exit: function () {

      // Get the current node index, relative to its parent
      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let parentContent = selectedElement.parent().contents()
      let index = parentContent.index(selectedElement)

      tinymce.activeEditor.undoManager.transact(function () {

        // Check if the current node has a text after
        if (typeof parentContent[index + 1] != 'undefined' && $(parentContent[index + 1]).is('text')) {
          tinymce.activeEditor.selection.setCursorLocation(parentContent[index + 1], 0)
          tinymce.activeEditor.selection.setContent(ZERO_SPACE)
        }

        // If the node hasn't text after, raje has to add it
        else {
          selectedElement.after(ZERO_SPACE)
          tinymce.activeEditor.selection.setCursorLocation(parentContent[index + 1], 0)
        }
      })
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