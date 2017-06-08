/**
 * 
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
        title: 'My dialog',
        url: 'js/rajemce/plugin/raje_formula.html',
        onClose: function () {

          // If at least formula is written
          if (tinymce.activeEditor.formula_input != null) {

            formula.add(tinymce.activeEditor.formula_input)

            // Set formula null
            tinymce.activeEditor.formula_input = null
          }
        }
      });
    }
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

        MathJax.Hub.Queue([ "Typeset", MathJax.Hub ])

        captions()

        console.log($('figure#' + id).html())

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