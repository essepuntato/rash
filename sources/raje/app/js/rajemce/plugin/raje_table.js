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

      // Check if selection has table

      try {

        let startNode = $(tinymce.activeEditor.selection.getRng().startContainer)
        let startNodeParent = startNode.parents('figure[id]')

        let endNode = $(tinymce.activeEditor.selection.getRng().endContainer)
        let endNodeParent = endNode.parents('figure[id]')

        console.log(startNodeParent)
        console.log(endNodeParent)

        if (startNodeParent.length || endNodeParent.length) {

          console.log(startNode.parents('figcaption').length)
          console.log(endNode.parents('figcaption').length)

          if (startNode.parents('figcaption').length != endNode.parents('figcaption').length && (startNode.parents('figcaption').length || endNode.parents('figcaption').length))
            return false

          if ((startNodeParent.attr('id') != endNodeParent.attr('id')))
            return false
        }
      } catch (e) {}
    }

    if (e.keyCode == 13) {
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      if (selectedElement.is('FIGCAPTION')) {
        selectedElement.parent('figure[id]').after('<p><br/></p>')
        e.preventDefault()
        return false
      }
    }
  })

  editor.on('nodeChange', function (e) {

    // Handle delete table
    let selectedElement = $(tinymce.activeEditor.selection.getNode())
    if (selectedElement.is('figure') && !selectedElement.find('table').length) {
      selectedElement.remove()
    }
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

      if (width > 0 && height > 0) {
        let figure = $(`<figure contenteditable="false" id="${id}"></figure>`)
        let table = $(`<table contenteditable="true"></table>`)

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
        figure.append(`<figcaption contenteditable="true">Caption of the <code>table</code>.</figcaption>`)

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

  function tableCaptions() {
    $(RAJE_SELECTOR).find(tablebox_selector).each(function () {
      var cur_caption = $(this).parents("figure").find("figcaption");
      var cur_number = $(this).findNumber(tablebox_selector);
      cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\" contenteditable=\"false\" >Table " + cur_number +
        ". </strong>" + cur_caption.html());
    });
  }
})