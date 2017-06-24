/**
 * This script contains all figure box available with RASH.
 * 
 * plugins:
 *  raje_table
 *  raje_figure
 *  raje_formula
 *  raje_listing
 */


/**
 * Raje_table
 */
tinymce.PluginManager.add('raje_table', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_table', {
    text: 'raje_table',
    icon: false,
    tooltip: 'Table',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {

      // On click a dialog is opened
      editor.windowManager.open({
        title: 'Select Table size',
        body: [{
          type: 'textbox',
          name: 'width',
          label: 'Columns'
        }, {
          type: 'textbox',
          name: 'heigth',
          label: 'Rows'
        }],
        onSubmit: function (e) {

          // Get width and heigth
          table.add(e.data.width, e.data.heigth)
        }
      })
    }
  })

  // Because some behaviours aren't accepted, RAJE must check selection and accept backspace, canc and enter press
  editor.on('keyDown', function (e) {

    // keyCode 8 is backspace, 46 is canc
    if (e.keyCode == 8)
      return handleFigureDelete(tinymce.activeEditor.selection)

    if (e.keyCode == 46)
      return handleFigureCanc(tinymce.activeEditor.selection)

    // Handle enter key in figcaption
    if (e.keyCode == 13)
      return handleFigureEnter(tinymce.activeEditor.selection)

    e.stopPropagation()
  })

  // Handle strange structural modification empty figures or with caption as first child
  editor.on('nodeChange', function (e) {
    handleFigureChange(tinymce.activeEditor.selection)
  })

  table = {

    /**
     * Add the new table (with given size) at the caret position
     */
    add: function (width, heigth) {

      // Get the reference of the current selected element
      let selectedElement = $(tinymce.activeEditor.selection.getNode())

      // Get the reference of the new created table
      let newTable = this.create(width, heigth, this.getNextId())

      // Begin atomic UNDO level 
      tinymce.activeEditor.undoManager.transact(function () {

        // Check if the selected element is not empty, and add table after
        if (selectedElement.text().trim().length != 0) {

          // If selection is at start of the selected element
          if (tinymce.activeEditor.selection.getRng().startOffset == 0)
            selectedElement.before(newTable)

          else
            selectedElement.after(newTable)
        }

        // If selected element is empty, replace it with the new table
        else
          selectedElement.replaceWith(newTable)

        // Save updates 
        tinymce.triggerSave()

        // Update all captions with RASH function
        captions()

        // Update Rendered RASH
        updateIframeFromSavedContent()
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

      // If width and heigth are positive
      try {
        if (width > 0 && height > 0) {

          // Create figure and table
          let figure = $(`<figure id="${id}"></figure>`)
          let table = $(`<table></table>`)

          // Populate with width & heigth
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
          figure.append(`<figcaption>Caption.</figcaption>`)

          return figure
        }
      } catch (e) {}
    }
  }
})

/**
 * Raje_figure
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

  // Because some behaviours aren't accepted, RAJE must check selection and accept backspace, canc and enter press
  editor.on('keyDown', function (e) {

    // keyCode 8 is backspace
    if (e.keyCode == 8 || e.keyCode == 46)
      return handleFigureDelete(tinymce.activeEditor.selection)

    // Handle enter key in figcaption
    if (e.keyCode == 13)
      return handleFigureEnter(tinymce.activeEditor.selection)
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
})

/**
 * Raje_formula
 */
tinymce.PluginManager.add('raje_formula', function (editor, url) {

  // Add a button that handle the inline element
  editor.addButton('raje_formula', {
    text: 'raje_formula',
    icon: false,
    tooltip: 'Formula',
    disabledStateSelector: DISABLE_SELECTOR_FIGURES,

    // Button behaviour
    onclick: function () {
      editor.windowManager.open({
        title: 'Math formula editor',
        url: 'js/rajemce/plugin/raje_formula.html',
        onClose: function () {

          // If at least formula is written
          if (tinymce.activeEditor.formula_input != null) {

            formula.add(tinymce.activeEditor.formula_input)

            // Set formula null
            tinymce.activeEditor.formula_input = null
          }
        }
      })
    }
  })

  // Because some behaviours aren't accepted, RAJE must check selection and accept backspace, canc and enter press
  editor.on('keyDown', function (e) {

    // keyCode 8 is backspace
    if (e.keyCode == 8 || e.keyCode == 46)
      return handleFigureDelete(tinymce.activeEditor.selection)

    // Handle enter key in figcaption
    if (e.keyCode == 13)
      return handleFigureEnter(tinymce.activeEditor.selection)
  })

  formula = {
    /**
     * 
     */
    add: function (formula_input) {

      let id = 'formula_1'

      let selectedElement = $(tinymce.activeEditor.selection.getNode())
      let newFormula = this.create(formula_input, id)

      tinymce.activeEditor.undoManager.transact(function () {

        // Check if the selected element is not empty, and add table after
        if (selectedElement.text().trim().length != 0)
          selectedElement.after(newFormula)

        // If selected element is empty, replace it with the new table
        else
          selectedElement.replaceWith(newFormula)

        // Save updates 
        tinymce.triggerSave()

        MathJax.Hub.Queue(["Typeset", MathJax.Hub])

        captions()

        //console.log($('figure#' + id).html())
        //console.log($('figure#'+id).find('span[data-mathml]').attr('data-mathml'))
        //$('figure#'+id).find('p').replaceWith(`<p>${$('figure#'+id).find('span[data-mathml]').attr('data-mathml')}</p>`)

        // Update Rendered RASH
        updateIframeFromSavedContent()

        //let mathml = $('figure#' + id).find('span[data-mathml]').data('mathml')
        //$('figure#' + id).html(`<p>${mathml}</p>`)
      })

    },

    /**
     * 
     */
    create: function (formula_input, id) {
      return `<figure id="${id}"><p class="rash-math">\`\`${formula_input}\`\`</p></figure>`
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

/**
 * Raje_listing
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

  // Because some behaviours aren't accepted, RAJE must check selection and accept backspace, canc and enter press
  editor.on('keyDown', function (e) {

    // keyCode 8 is backspace
    if (e.keyCode == 8 || e.keyCode == 46)
      return handleFigureDelete(tinymce.activeEditor.selection)

    // Handle enter key in figcaption
    if (e.keyCode == 13)
      return handleFigureEnter(tinymce.activeEditor.selection)
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

/**
 * Update table captions with a RASH funcion 
 */
function captions() {

  /* Captions */
  $(figurebox_selector).each(function () {
    var cur_caption = $(this).parents("figure").find("figcaption");
    var cur_number = $(this).findNumber(figurebox_selector);
    cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\" contenteditable=\"false\">Figure " + cur_number +
      ". </strong>" + cur_caption.html());
  });
  $(tablebox_selector).each(function () {
    var cur_caption = $(this).parents("figure").find("figcaption");
    var cur_number = $(this).findNumber(tablebox_selector);
    cur_caption.find('strong').remove();
    cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\" contenteditable=\"false\" >Table " + cur_number +
      ". </strong>" + cur_caption.html());
  });
  $(formulabox_selector).each(function () {
    var cur_caption = $(this).parents("figure").find("p");
    var cur_number = $(this).findNumber(formulabox_selector);
    cur_caption.html(cur_caption.html() + "<span class=\"cgen\" data-rash-original-content=\"\" > (" +
      cur_number + ")</span>");
  });
  $(listingbox_selector).each(function () {
    var cur_caption = $(this).parents("figure").find("figcaption");
    var cur_number = $(this).findNumber(listingbox_selector);
    cur_caption.find('strong').remove();
    cur_caption.html("<strong class=\"cgen\" data-rash-original-content=\"\" contenteditable=\"false\">Listing " + cur_number +
      ". </strong>" + cur_caption.html());
  });
  /* /END Captions */
}

/**
 * 
 * @param {*} sel => tinymce selection
 * 
 * Mainly it checks where selection starts and ends to block unallowed deletion
 * In same figure aren't blocked, unless selection start OR end inside figcaption (not both)
 */
function handleFigureDelete(sel) {

  try {
    // Get reference of start and end node
    let startNode = $(sel.getRng().startContainer)
    let startNodeParent = startNode.parents('figure[id]')

    let endNode = $(sel.getRng().endContainer)
    let endNodeParent = endNode.parents('figure[id]')

    // If at least selection start or end is inside the figure
    if (startNodeParent.length || endNodeParent.length) {

      // If selection doesn't start and end in the same figure, but one beetwen start or end is inside the figcaption, must block
      if (startNode.parents('figcaption').length != endNode.parents('figcaption').length && (startNode.parents('figcaption').length || endNode.parents('figcaption').length))
        return false

      // If the figure is not the same, must block
      // Because a selection can start in figureX and end in figureY
      if ((startNodeParent.attr('id') != endNodeParent.attr('id')))
        return false

    }

    return true
  } catch (e) {
    return false
  }
}

function handleFigureCanc(sel) {

  try {
    // Get reference of start and end node
    let startNode = $(sel.getRng().startContainer)
    let startNodeParent = startNode.parents('figure[id]')

    let endNode = $(sel.getRng().endContainer)
    let endNodeParent = endNode.parents('figure[id]')

    // If at least selection start or end is inside the figure
    if (startNodeParent.length || endNodeParent.length) {

      // If selection doesn't start and end in the same figure, but one beetwen start or end is inside the figcaption, must block
      if (startNode.parents('figcaption').length != endNode.parents('figcaption').length && (startNode.parents('figcaption').length || endNode.parents('figcaption').length))
        return false

      // If the figure is not the same, must block
      // Because a selection can start in figureX and end in figureY
      if ((startNodeParent.attr('id') != endNodeParent.attr('id')))
        return false

    }

    // Current element can be or text or p
    let paragraph = startNode.is('p') ? startNode : startNode.parents('p').first()

    // Remove table on canc at the end of the previous element
    if (sel.isCollapsed() && sel.getRng().startOffset == paragraph.text().length && paragraph.next().is('figure[id]')) {
      tinymce.activeEditor.undoManager.transact(function () {
        paragraph.next().remove()
      })
      return false
    }

    return true
  } catch (e) {
    return false
  }
}

/**
 * 
 * @param {*} sel => tinymce selection
 * 
 * Add a paragraph after the figure
 */
function handleFigureEnter(sel) {

  let selectedElement = $(sel.getNode())
  if (selectedElement.is('figcaption')) {

    tinymce.activeEditor.undoManager.transact(function () {

      //add a new paragraph after the figure
      selectedElement.parent('figure[id]').after('<p><br/></p>')

      //move caret at the start of new p
      tinymce.activeEditor.selection.setCursorLocation(selectedElement.parent('figure[id]')[0].nextSibling, 0)
    })
    return false
  } else if (selectedElement.is('th'))
    return false
  return true
}

/**
 * 
 * @param {*} sel => tinymce selection
 */
function handleFigureChange(sel) {

  tinymce.triggerSave()

  // Handle delete table, only inside the current first level section
  let selectedElementParent = $(sel.getNode()).parentsUntil(RAJE_SELECTOR).last()

  // After the table is cancelled the selection is moved to the figure (with caption)
  // If the figure has figcaption as first child, must remove

  /*
    tinymce.activeEditor.undoManager.transact(function () {

      // Remove all figures with figcaption as first child (without table)
      selectedElementParent.find('figure[id]').each(function () {
        if ($(this).children().first().is('figcaption'))
          $(this).remove()
      })

      // Remove all tables which are not child of a figure
      selectedElementParent.find('table').each(function () {
        if (!$(this).parent().is('figure[id]')) {
          $(this).remove()
        }
      })

      // Remove all figcaptions which are not child of a figure
      selectedElementParent.find('figcaption').each(function () {
        if (!$(this).parent().is('figure[id]')) {
          $(this).remove()
        }
      })
    })
  */
  // If rash-generated section is delete, re-add it
  if ($('figcaption:not(:has(strong))').length) {
    captions()
    updateIframeFromSavedContent()
  }
}