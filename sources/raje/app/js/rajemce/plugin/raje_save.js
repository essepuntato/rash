tinymce.PluginManager.add('raje_save', function (editor, url) {

  saveManager = {

    /**
     * 
     */
    execute: function () {

      // Clear all undo levels
      tinymce.activeEditor.undoManager.clear()

      // Update the new document state
      updateDocumentState(false)

      // Send message to the backend
      saveDocument({
        title: saveManager.getTitle(),
        document: saveManager.getDerashedArticle()
      })
    },

    /**
     * Return the RASH article rendered (without tinymce)
     */
    getDerashedArticle: function () {

      // Save html references
      let article = $('html').clone()
      let tinymceSavedContent = article.find('#raje_root')

      //replace body with the right one (this action remove tinymce)
      article.find('body').html(tinymceSavedContent.html())
      article.find('body').removeAttr('class')

      //remove all style and link un-needed from the head
      article.find('head').children('style').remove()
      article.find('head').children('link[id]').remove()

      // Execute derash (replace all cgen elements with its original content)
      article.find('*[data-rash-original-content]').each(function () {
        let originalContent = $(this).attr('data-rash-original-content')
        $(this).replaceWith(originalContent)
      })

      return article.html()
    },

    /**
     * Return the title 
     */
    getTitle: function () {
      return $('title').text()
    },

  }
})