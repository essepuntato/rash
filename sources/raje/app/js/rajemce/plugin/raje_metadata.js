/**
 * 
 */
tinymce.PluginManager.add('raje_metadata', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_metadata', {
    text: 'Metadata',
    icon: false,
    tooltip: 'Edit metadata',

    // Button behaviour
    onclick: function () {
      editor.windowManager.open({
        title: 'Edit metadata',
        url: 'js/rajemce/plugin/raje_metadata.html',
        width: 800,
        height: 800,
        onClose: function () {}
      }, metadata.getAllMetadata())
    }
  })

  metadata = {

    /**
     * 
     */
    getAllMetadata: function () {
      let header = $(HEADER_SELECTOR)
      let subtitle = header.find('h1.title > small').text()
      let data = {
        subtitle: subtitle,
        title: header.find('h1.title').text().replace(subtitle, ''),
        authors: metadata.getAuthors(header),
        categories: metadata.getCategories(header),
        keywords: metadata.getKeywords(header)
      }

      return data
    },

    /**
     * 
     */
    getAuthors: function (header) {
      let authors = []

      header.find('address.lead.authors').each(function () {

        // Get all affiliations
        let affiliations = []
        $(this).find('span').each(function () {
          affiliations.push($(this).text())
        })

        // push single author
        authors.push({
          name: $(this).children('strong.author_name').text(),
          email: $(this).find('code.email > a').text(),
          affiliations: affiliations
        })
      })

      return authors
    },

    /**
     * 
     */
    getCategories: function (header) {
      let categories = []

      header.find('p.acm_subject_categories > code').each(function () {
        categories.push($(this).text())
      })

      return categories
    },

    /**
     * 
     */
    getKeywords: function (header) {
      let keywords = []

      header.find('ul.list-inline > li > code').each(function () {
        keywords.push($(this).text())
      })

      return keywords
    }
  }
})