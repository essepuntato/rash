/**
 * 
 */
tinymce.PluginManager.add('raje_listing', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_listing', {
    text: 'raje_listing',
    icon: false,
    tooltip: 'Listing',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {
      listing.add()
    }
  })

  listing = {
    /**
     * 
     */
    add: function () {

      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let newListing = this.create(this.getNextId())

      tinymce.activeEditor.undoManager.transact(function () {

        // Check if the selected element is not empty, and add table after
        if (selectedElement.text().trim().length != 0)
          selectedElement.after(newListing)

        // If selected element is empty, replace it with the new table
        else
          selectedElement.replaceWith(newListing)

        // Save updates 
        tinymce.triggerSave()

        // Update all captions with RASH function
        captions()

        // Update Rendered RASH
        updateIframeFromSavedContent()
      })

    },

    /**
     * 
     */
    create: function (id) {
      return `<figure id="${id}"><pre><code><br/></code></pre><figcaption>Caption.</figcaption></figure>`
    },

    /**
     * 
     */
    getNextId: function () {
      let id = 0
      $('figure[id]:has(pre:has(code))').each(function () {
        if ($(this).attr('id').indexOf('listing_') > -1) {
          let currId = parseInt($(this).attr('id').replace('listing_', ''))
          id = id > currId ? id : currId
        }
      })
      return `listing_${id+1}`
    },
  }
})