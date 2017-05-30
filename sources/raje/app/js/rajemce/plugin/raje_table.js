tinymce.PluginManager.add('raje_table', function (editor, url) {

  let raje_table_flag = false

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

    // Check if a deletion is called
    if (e.keyCode == 8) {

      // Check if selection has table

      try {

        let startNodeParent = $(tinymce.activeEditor.selection.getRng().startContainer).parents('figure[id]')
        let endNodeParent = $(tinymce.activeEditor.selection.getRng().endContainer).parents('figure[id]')

        console.log(startNodeParent)
        console.log(endNodeParent)

        if (startNodeParent.length || endNodeParent.length) {

          if (startNodeParent.attr('id') != endNodeParent.attr('id')) {
            e.preventDefault()
            return false
          }
        }
      } catch (e) {}
    }
  })

  table = {
    add: function (width, heigth) {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let newTable = this.create(width, heigth, 'table_1')

      // Check if the selected element is empty or not (thw way to append the figure depends on it)
      if (selectedElement.text().trim().length != 0) {

        // Add and select a new paragraph (where the figure is added)
        let tmp = $('<p></p>')
        selectedElement.after(tmp)
        selectedElement = tmp
      }

      tinymce.activeEditor.undoManager.transact(function () {

        selectedElement.append(newTable)
        tinymce.triggerSave()
      })

    },

    /**
     * Create the new table using 
     */
    create: function (width, height, id) {

      if (width > 0 && height > 0) {
        let figure = $(`<figure contenteditable="false" id="${id}"></figure><br/>`)
        let table = $(`<table></table>`)

        for (let i = 0; i <= width; i++) {

          let row = $(`<tr></tr>`)

          for (let x = 0; x < height; x++) {

            if (i == 0)
              row.append(`<th contenteditable="true">Heading cell ${x+1}</th>`)

            else
              row.append(`<td contenteditable="true"><p>Data cell ${x+1}</p></td>`)
          }

          table.append(row)
        }

        figure.append(table)
        figure.append(`<figcaption contenteditable="true">Caption of the <code>table</code>.</figcaption>`)

        return figure
      }
    }
  }
})