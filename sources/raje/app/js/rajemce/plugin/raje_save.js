tinymce.PluginManager.add('raje_save', function (editor, url) {

  editor.addButton('raje_save', {
    title: 'raje_save',
    text: 'Save',
    icons: false,
    onclick: function () {

      saveManager.execute()
    }
  })

  saveManager = {

    /**
     * 
     */
    execute: function () {

      let result = saveDocument({
        title: saveManager.getTitle(),
        body: saveManager.getBody()
      })

      if (result)
        alert(result)
    },

    /**
     * 
     */
    getBody: function () {

      return $('#raje_root').html()
    },

    getTitle: function () {
      return $('title').text()
    }
  }
})