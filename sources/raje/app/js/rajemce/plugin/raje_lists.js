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


    // TODO Check if the selected element is a P inside a list (OL, UL)
    let selectedElement = $(tinymce.activeEditor.selection.getNode())
    if (selectedElement.is('p') && (selectedElement.parents('ul').length || selectedElement.parents('li').length)) {

      // Check if enter key is pressed 
      if (e.keyCode == 13) {

        // Check if the selection is collapsed
        if (tinymce.activeEditor.selection.isCollapsed()) {

          // Remove the empty LI
          if (!selectedElement.text().trim().length)
            list.removeListItem(selectedElement.parent('li'))

        }

        e.preventDefault()
      }

      // Check if tab key is pressed
      if (e.keyCode == 9) {
        console.log('Pressed TAB in list item')

        e.preventDefault()
      }
    }
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

        let newList = $(`<${type}><li><p>${text}</p></li></${type}>`)

        // Add the new element
        selectedElement.replaceWith(newList)

        // Save changes
        tinymce.triggerSave()

        // Move the cursor
        moveCaret(newList.find('p')[0], true)

        // Restore the whole content
        // updateIframeFromSavedContent()
      })
    },

    /**
     * 
     */
    addListItem: function (listItem) {

      // Get the remaining text until the end of the element
      let text = selectedElement.text()
      let startOffset = tinymce.activeEditor.selection.getRng().startOffset
      let remainingText = text.substring(startOffset, text.length).trim()

      tinymce.activeEditor.undoManager.transact(function () {

      })
    },

    /**
     * 
     */
    removeListItem: function (listItem) {

      tinymce.activeEditor.undoManager.transact(function () {

        // Check if the list has exactly one child remove the list
        if (listItem.parent().children('li').length == 1) {
          let list = listItem.parent()
          list.remove()
        }

        // If the list has more children remove the selected child
        else
          listItem.remove()

        // Update the content
        tinymce.triggerSave()
      })
    }
  }
})