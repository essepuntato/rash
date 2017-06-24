/**
 * raje_inline_code plugin RAJE
 */
tinymce.PluginManager.add('raje_inlineCode', function (editor, url) {

  // Add a button that opens a window
  editor.addButton('raje_inlineCode', {
    title: 'inline_code',
    icon: 'icon-inline-code',
    tooltip: 'Inline code',

    // Button behaviour
    onclick: function () {
      code.handle()
    }
  })

  editor.on('keyDown', function (e) {

    // On enter key 
    if (e.keyCode == 13) {
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      if (selectedElement.is('code'))
        return false
    }
  })

  code = {

    ELEMENT: `<code>${ZERO_SPACE}</code>`,
    /**
     * Insert or exit from inline code element
     */
    handle: function () {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      // If there isn't any inline code
      if (!selectedElement.is('code') && !selectedElement.parents('code').length) {
        tinymce.activeEditor.undoManager.transact(function () {

          tinymce.activeEditor.selection.setContent(code.ELEMENT)
          tinymce.triggerSave()
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