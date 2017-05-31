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

    if (e.keyCode == 13) {
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      if (selectedElement.is('FIGCAPTION')) {
        selectedElement.parent('figure[id]').after('<p><br/></p>')
        e.preventDefault()
        return false
      }
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
      $('figure[id]>table').each(function () {
        if ($(this).attr('id').indexOf('table') > -1) {
          let currId = parseInt($(this).attr('id').replace('table_', ''))
          id = id > currId ? id : currId
        }
      })
      return `table_${id+1}`
    },

    /**
     * Create the new table using 
     */
    create: function (width, height, id) {

      if (width > 0 && height > 0) {
        let figure = $(`<figure id="${id}"></figure>`)
        let table = $(`<table></table>`)

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
        figure.append(`<figcaption>Caption of the <code>table</code>.</figcaption>`)

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
    $(tablebox_selector).each(function () {
      var cur_caption = $(this).parents("figure").find("figcaption");
      var cur_number = $(this).findNumber(tablebox_selector);
      cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\" contenteditable=\"false\" >Table " + cur_number +
        ". </strong>" + cur_caption.html());
    });
  }
})