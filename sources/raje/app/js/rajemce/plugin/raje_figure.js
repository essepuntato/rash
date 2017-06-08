/**
 * 
 */
tinymce.PluginManager.add('raje_figure', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_figure', {
    text: 'raje_figure',
    icon: false,
    tooltip: 'Image block',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {

      editor.windowManager.open({
        title: 'Select image',
        body: [{
          type: 'textbox',
          name: 'url',
          label: 'url'
        }, {
          type: 'textbox',
          name: 'alt',
          label: 'alt'
        }],
        onSubmit: function (e) {
          figure.add(e.data.url, e.data.alt)
        }
      })
    }
  })

  figure = {

    /**
     * 
     */
    add: function (url, alt) {

      // Get the referece of the selected element
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      // Check if the selected element is empty or not (thw way to append the figure depends on it)
      if (selectedElement.text().trim().length != 0) {

        // Add and select a new paragraph (where the figure is added)
        let tmp = $('<p></p>')
        selectedElement.after(tmp)
        selectedElement = tmp
      }

      // Create the object of the figure
      let newFigure = this.create(url, alt)


      // append the new figure
      selectedElement.append(newFigure)
      tinymce.triggerSave()
      caption()

      tinymce.dom.DomQuery('figcaption').html("<strong class=\"cgen\" data-rash-original-content=\"\">Figure 1. </strong> Caption.")
    },

    /**
     * 
     */
    create: function (url, alt) {
      return $(`<figure contenteditable="false" id="${this.getNextId()}"><p><img src="${url}" alt="${alt}"/></p><figcaption contenteditable="true">Caption.</figcaption></figure>`)
    },

    /**
     * 
     */
    getNextId: function () {
      let id = 1
      $('figurebox_selector').each(function () {
        if ($(this).attr('id').indexOf('section') > -1) {
          let currId = parseInt($(this).attr('id').replace('figure', ''))
          id = id > currId ? id : currId
        }
      })
      return `figure_${id+1}`
    }
  }

  function caption() {

    /* Captions */
    $(figurebox_selector).each(function () {
      var cur_caption = $(this).parents("figure").find("figcaption");
      var cur_number = $(this).findNumber(figurebox_selector);
      cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\">Figure " + cur_number +
        ". </strong>" + cur_caption.html());
    });
    $(tablebox_selector).each(function () {
      var cur_caption = $(this).parents("figure").find("figcaption");
      var cur_number = $(this).findNumber(tablebox_selector);
      cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\">Table " + cur_number +
        ". </strong>" + cur_caption.html());
    });
    $(formulabox_selector).each(function () {
      var cur_caption = $(this).parents("figure").find("p");
      var cur_number = $(this).findNumber(formulabox_selector);
      cur_caption.html(cur_caption.html() + "<span class=\"cgen\" data-rash-original-content=\"\"> (" +
        cur_number + ")</span>");
    });
    $(listingbox_selector).each(function () {
      var cur_caption = $(this).parents("figure").find("figcaption");
      var cur_number = $(this).findNumber(listingbox_selector);
      cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\">Listing " + cur_number +
        ". </strong>" + cur_caption.html());
    });
    /* /END Captions */
  }
})