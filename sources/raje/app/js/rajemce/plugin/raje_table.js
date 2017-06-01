tinymce.PluginManager.add('raje_table', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_table', {
    text: 'raje_table',
    icon: false,
    tooltip: 'Add table',

    // Button behaviour
    onclick: function () {

      editor.windowManager.open({
        title: 'Select Table size',
        body: [{
          type: 'textbox',
          name: 'width',
          label: 'width'
        }, {
          type: 'textbox',
          name: 'heigth',
          label: 'heigth'
        }],
        onSubmit: function (e) {
          table.add(e.data.width, e.data.heigth)
        }
      })
    }
  })

  editor.on('keyDown', function (e) {

    // Handle delete
    if (e.keyCode == 8) {

      try {

        // Get reference of start and end node
        let startNode = $(tinymce.activeEditor.selection.getRng().startContainer)
        let startNodeParent = startNode.parents('figure[id]')

        let endNode = $(tinymce.activeEditor.selection.getRng().endContainer)
        let endNodeParent = endNode.parents('figure[id]')

        // If at least selection start or end is inside the figure
        if (startNodeParent.length || endNodeParent.length) {

          // If selection doesn't start and end in the figure, but one of start or end is inside the figcaption, must block
          if (startNode.parents('figcaption').length != endNode.parents('figcaption').length && (startNode.parents('figcaption').length || endNode.parents('figcaption').length))
            return false

          // If the figure is not the same, must block
          if ((startNodeParent.attr('id') != endNodeParent.attr('id')))
            return false
        }
      } catch (e) {}
    }

    // Handle enter key in figcaption
    if (e.keyCode == 13) {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      if (selectedElement.is('figcaption')) {

        //add a new paragraph after the figure
        selectedElement.parent('figure[id]').after('<p><br/></p>')
        return false
      }
    }
  })

  editor.on('nodeChange', function (e) {

    // Handle delete table, only inside the current first level section
    let selectedElementParent = $(tinymce.activeEditor.selection.getNode()).parentsUntil(RAJE_SELECTOR).last()

    // After the table is cancelled the selection is moved to the figure (with caption)
    // If the figure has figcaption as first child, must remove

    // Remove all figures with figcaption as first child (without table)
    selectedElementParent.find('figure[id]').each(function () {
      if ($(this).children().first().is('figcaption'))
        $(this).remove()
    })

    // Remove all tables which are not child of a figure
    selectedElementParent.find('table').each(function () {
      if (!$(this).parent().is('figure[id]')) {
        $(this).remove()
      }
    })

    // Remove all figcaptions which are not child of a figure
    selectedElementParent.find('figcaption').each(function () {
      if (!$(this).parent().is('figure[id]')) {
        $(this).remove()
      }
    })
  })

  table = {
    add: function (width, heigth) {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let newTable = this.create(width, heigth, this.getNextId())

      tinymce.activeEditor.undoManager.transact(function () {

        // Check if the selected element is not empty, and add table after
        if (selectedElement.text().trim().length != 0)
          selectedElement.after(newTable)

        // If selected element is empty, replace it with the new table
        else
          selectedElement.replaceWith(newTable)

        tinymce.triggerSave()

        // Add the caption, to change
        newTable.find('table').tableCaption()
      })
    },

    /**
     * Get the last inserted id
     */
    getNextId: function () {
      let id = 0
      $('figure[id]:has(table)').each(function () {
        if ($(this).attr('id').indexOf('table_') > -1) {
          let currId = parseInt($(this).attr('id').replace('table_', ''))
          id = id > currId ? id : currId
        }
      })
      return `table_${id+1}`
    },

    /**
     * Create the new table using passed width and height
     */
    create: function (width, height, id) {

      // If width and heigth are positive
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
        figure.append(`<figcaption>Caption</figcaption>`)

        return figure
      }
    }
  }

  jQuery.fn.extend({
    tableCaption: function () {
      var cur_caption = $(this).parents("figure").find("figcaption");
      var cur_number = $(this).findNumber(tablebox_selector);
      cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\" contenteditable=\"false\" >Table " + cur_number +
        ". </strong>" + cur_caption.html());
    }
  })
})