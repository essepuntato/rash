tinymce.PluginManager.add('raje_crossref', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_crossref', {
    text: 'raje_crossref',
    icon: false,
    tooltip: 'Cross-reference',

    // Button behaviour
    onclick: function () {

      tinymce.triggerSave()

      let referenceableList = {
        sections: crossref.getAllReferenceableSections()
      }

      editor.windowManager.open({
          title: 'Cross-reference editor',
          url: 'js/rajemce/plugin/raje_crossref.html',
          width: 500,
          height: 800,
          onClose: function () {

            // If at least formula is written
            if (tinymce.activeEditor.reference != null) {

              crossref.add(tinymce.activeEditor.reference)

              // Set formula null
              tinymce.activeEditor.reference = null
            }
          }
        },

        // List of all referenceable elements
        referenceableList)
    }
  })

  crossref = {
    getAllReferenceableSections: function () {
      let sections = []

      $('section').each(function () {

        let level

        if (!$(this).attr('role')) {

          switch ($(this).children(':header').first().prop('tagName')) {
            case 'H1':
              level = '1.'
              break

            case 'H2':
              level = '1.1.'
              break

            case 'H3':
              level = '1.1.1.'
              break

            case 'H4':
              level = '1.1.1.1.'
              break

            case 'H5':
              level = '1.1.1.1.1.'
              break

            case 'H6':
              level = '1.1.1.1.1.1.'
              break
          }
        }

        sections.push({
          reference: $(this).attr('id'),
          text: $(this).find(':header').first().text(),
          level: level
        })
      })

      return sections
    },

    add: function (reference) {
      //tinymce.activeEditor.execCommand('mceInsertContent', false, '')
      tinymce.activeEditor.execCommand('mceInsertContent',false,"<a href=\"#" + reference + "\"> </a>")

      tinymce.triggerSave()
    }
  }
})