/**
 * raje_inline_code plugin RAJE
 */
tinymce.PluginManager.add('raje_inlineCode', function (editor, url) {

  // Add a button that opens a window
  editor.addButton('raje_inlineCode', {
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