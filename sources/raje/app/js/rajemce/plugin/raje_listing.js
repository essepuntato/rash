tinymce.PluginManager.add('raje_listing', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_listing', {
    text: 'raje_listing',
    icon: false,
    tooltip: 'Add listing',

    // Button behaviour
    onclick: function () {
      listing.add()
    }
  })

  listing = {
    add: function () {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let newListing = `<figure id="listing_1">
    <pre><code><br/></pre></code>
    <figcaption>Caption of the figure.</figcaption>
</figure>`

      // Check if the selected element is empty or not (thw way to append the figure depends on it)
      if (selectedElement.text().trim().length != 0) {

        // Add and select a new paragraph (where the figure is added)
        let tmp = $('<p></p>')
        selectedElement.after(tmp)
        selectedElement = tmp
      }

      tinymce.activeEditor.undoManager.transact(function () {

        selectedElement.append(newListing)
        tinymce.triggerSave()
      })

    }
  }
})