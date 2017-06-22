/**
 * RASH section plugin RAJE
 */

const BIBLIOGRAPHY_SELECTOR = 'section[role=doc-bibliography]'
const BIBLIOENTRY_SELECTOR = 'li[role=doc-biblioentry]'

const ENDNOTES_SELECTOR = 'section[role=doc-endnotes]'
const ENDNOTE_SELECTOR = 'section[role=doc-endnote]'

const ABSTRACT_SELECTOR = 'section[role=doc-abstract]'
const ACKNOWLEDGEMENTS_SELECTOR = 'section[role=doc-acknowledgements]'

const SECTION_SELECTOR = 'section:not([role])'
const NON_EDITABLE_HEADER_SELECTOR = 'header.page-header.container.cgen'

tinymce.PluginManager.add('raje_section', function (editor, url) {

  let raje_section_flag = false

  editor.addButton('raje_section', {
    type: 'menubutton',
    text: 'Headings',
    title: 'heading',
    icons: false,

    // Sections sub menu
    menu: [{
        text: 'Heading 1.',
        type: 'menuitem',
        onclick: function () {
          section.add(1)
        }
      }, {
        text: 'Heading 1.1.',
        onclick: function () {
          section.add(2)
        }
      }, {
        text: 'Heading 1.1.1.',
        onclick: function () {
          section.add(3)
        }
      }, {
        text: 'Heading 1.1.1.1.',
        onclick: function () {
          section.add(4)
        }
      }, {
        text: 'Heading 1.1.1.1.1.',
        onclick: function () {
          section.add(5)
        }
      }, {
        text: 'Heading 1.1.1.1.1.1.',
        onclick: function () {
          section.add(6)
        }
      }, {
        text: 'Abstract',
        onclick: function () {

          section.addAbstract()
        }
      },
      {
        text: 'Acknowledgements',
        onclick: function () {
          section.addAcknowledgements()
        }
      },
      {
        text: 'References',
        onclick: function () {

          tinymce.triggerSave()

          // Only if bibliography section doesn't exists
          if (!$(BIBLIOGRAPHY_SELECTOR).length) {

            // TODO change here
            tinymce.activeEditor.undoManager.transact(function () {
              // Add new biblioentry
              section.addBiblioentry()

              // Update iframe
              updateIframeFromSavedContent()

              //move caret and set focus to active aditor #105
              tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select(`${BIBLIOENTRY_SELECTOR}:last-child`)[0], true)
              tinymce.activeEditor.focus()
            })
          }
        }
      }
    ]
  })

  editor.on('keyDown', function (e) {

    // instance of the selected element
    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    try {

      var keycode = e.keyCode;

      var valid =
        (keycode > 47 && keycode < 58) || // number keys
        //keycode == 32 || // spacebar & return key(s) (if you want to allow carriage returns)
        //(keycode > 64 && keycode < 91) || // letter keys
        (keycode > 95 && keycode < 112) || // numpad keys
        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
        (keycode > 218 && keycode < 223); // [\]' (in order)

      let startNode = $(tinymce.activeEditor.selection.getRng().startContainer)
      let endNode = $(tinymce.activeEditor.selection.getRng().endContainer)

      // Block editability of section[role]>h1
      if (valid && (startNode.parents('section[role]').length || endNode.parents('section[role').length) && (startNode.parents('h1').length > 0 || endNode.parents('h1').length > 0))
        return false

      // Check if a deletion is called
      if (e.keyCode == 8 || e.keyCode == 46) {

        // Block remove from header
        if (selectedElement.is('header') || (selectedElement.attr('data-mce-caret') == 'after' && selectedElement.parent().is(RAJE_SELECTOR)) || (selectedElement.attr('data-mce-caret') && selectedElement.parent().is(RAJE_SELECTOR)) == 'before')
          return false

        // If start or end is inside special section
        else if (startNode.parents('section[role]').length || endNode.parents('section[role]').length) {

          let startOffset = tinymce.activeEditor.selection.getRng().startOffset
          let startOffsetNode = 0
          let endOffset = tinymce.activeEditor.selection.getRng().endOffset
          let endOffsetNode = tinymce.activeEditor.selection.getRng().endContainer.length

          if (

            // Check if the selection contains the entire section
            startOffset == startOffsetNode && endOffset == endOffsetNode &&

            // Check if the selection starts from h1
            (startNode.parents('h1').length != endNode.parents('h1').length) && (startNode.parents('h1').length || endNode.parents('h1').length) &&

            // Check if the selection ends in the last child
            (startNode.parents('section[role]').children().length == $(tinymce.activeEditor.selection.getRng().endContainer).parentsUntil('section[role]').index() + 1)) {
            selectedElement.remove()
            tinymce.triggerSave()
            return false
          }

        } else
          raje_section_flag = true
      }

    } catch (exception) {}

    // When press enter
    if (e.keyCode == 13) {

      // When enter is pressed inside an header, not at the end of it
      if (selectedElement.is('h1,h2,h3,h4,h5,h6') && selectedElement.text().trim().length != tinymce.activeEditor.selection.getRng().startOffset) {

        section.addWithEnter()
        return false
      }

      // If selection is before/after header
      if (selectedElement.is('p')) {

        // Block enter before header
        if (selectedElement.attr('data-mce-caret') == 'before')
          return false

        // Add new section after header
        if (selectedElement.attr('data-mce-caret') == 'after') {
          section.add(1)
          return false
        }
      }

      if (selectedElement.parents('section[role=doc-bibliography]').length) {

        tinymce.triggerSave()

        let id

        // Pressing enter in h1 will add a new biblioentry and caret reposition
        if (selectedElement.is('h1')) {

          id = section.getNextBiblioentryId()
          section.addBiblioentry(id)
          updateIframeFromSavedContent()

        } else if (selectedElement.is('p') || selectedElement.is('li')) {

          id = section.getNextBiblioentryId()
          section.addBiblioentry(id, null, selectedElement.parent('li'))
        }

        moveCaret(tinymce.activeEditor.dom.get(id), true)
        return false
      }

      /*
      if (selectedElement.is('p') && selectedElement.text().trim().indexOf('#') != -1) {

        let level = section.getLevelFromHash(selectedElement.text().trim())

        console.log(selectedElement.text().substring(level).trim())

        section.add(level, selectedElement.text().substring(level).trim())
      }
      */
    }
  })

  editor.on('NodeChange', function (e) {

    // Remove every li[role=doc-biblioentry] without child p

    /*
    tinymce.triggerSave()

    let update = false
    $('li[role=doc-biblioentry]').each(function () {
      if (!$(this).children().first().is('p')) {

        $(this).remove()
        update = true
      }
    })

    if (update)
      updateIframeFromSavedContent()
    */
    /*
    $('section[role]').each(function(){
      if (!$(this).children().first().is('h1')) {
        $(this).remove()
        updateIframeFromSavedContent()
      }
    })
    */
    //let button = new tinymce.ui.Control(tinymce.activeEditor.theme.panel.find("menubutton")[1])

    /*
    for (let i = 0; i < 6; i++)
      buttonMenu[i].disabled = true
      */

    //button.showMenu()

    /*
        // Update button menu
        for (let i = 0; i < 6; i++)
          tinymce.activeEditor.theme.panel.find('toolbar *')[16].settings.menu[i].disabled = true

        // Save the reference of the selected node
        let selectedElement = tinymce.activeEditor.selection.getNode()

        // Check if the selected node is a paragraph only here can be added a new section
        if (tinymce.activeEditor.selection.getNode().nodeName == 'P') {

          // Get the deepness of the section which is the number of button to enable (+1 i.e. the 1st level subsection)
          let deepness = $(selectedElement).parents('section').length + 1

          console.log(deepness)
          for (let i = 0; i < deepness; i++) {
            tinymce.activeEditor.theme.panel.find('toolbar *')[16].settings.menu[i].text = 'helo'
            console.log(tinymce.activeEditor.theme.panel.find('toolbar *')[16].settings.menu[i])
          }

          tinymce.activeEditor.theme.panel.find('toolbar *')[16].repaint()
        }
    */
    //editor.theme.panel.find('toolbar buttongroup').repaint()


    if (raje_section_flag) {
      raje_section_flag = false
      section.updateSectionStructure()
    }
  })
})

section = {

  /**
   * Function called when a new section needs to be attached, with buttons
   */
  add: function (level, text) {

    // Select current node
    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    // Create the section
    let newSection = this.create(text ? text : selectedElement.html().trim(), level)

    tinymce.activeEditor.undoManager.transact(function () {

      // Check what kind of section needs to be inserted
      section.manageSection(selectedElement, newSection, level ? level : selectedElement.parentsUntil(RAJE_SELECTOR).length)

      // Remove the selected section
      selectedElement.remove()

      moveCaret(newSection[0], true)
      tinymce.activeEditor.focus()

      // Update editor content
      tinymce.triggerSave()
    })
  },

  /**
   * Function called when a new section needs to be attached, with buttons
   */
  addWithEnter: function () {

    // Select current node
    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    // If the section isn't special
    if (!selectedElement.parent().attr('role')) {

      level = selectedElement.parentsUntil(RAJE_SELECTOR).length

      // Create the section
      let newSection = this.create(selectedElement.text().trim().substring(tinymce.activeEditor.selection.getRng().startOffset), level)

      tinymce.activeEditor.undoManager.transact(function () {

        // Check what kind of section needs to be inserted
        section.manageSection(selectedElement, newSection, level)

        // Remove the selected section
        selectedElement.html(selectedElement.text().trim().substring(0, tinymce.activeEditor.selection.getRng().startOffset))

        moveCaret(newSection[0], true)

        // Update editor
        tinymce.triggerSave()
      })
    } else
      notify('Error, headers of special sections (abstract, acknowledments) cannot be splitted', 'error', 4000)
  },

  /**
   * Get the last inserted id
   */
  getNextId: function () {
    let id = 0
    $('section[id]').each(function () {
      if ($(this).attr('id').indexOf('section') > -1) {
        let currId = parseInt($(this).attr('id').replace('section', ''))
        id = id > currId ? id : currId
      }
    })
    return `section${id+1}`
  },

  /**
   * Retrieve and then remove every successive elements 
   */
  getSuccessiveElements: function (element, deepness) {

    let successiveElements = $('<div></div>')

    while (deepness >= 0) {

      if (element.nextAll(':not(.footer)')) {

        // If the deepness is 0, only paragraph are saved (not sections)
        if (deepness == 0) {
          successiveElements.append(element.nextAll('p'))
          element.nextAll().remove('p')
        } else {
          successiveElements.append(element.nextAll())
          element.nextAll().remove()
        }
      }

      element = element.parent('section')
      deepness--
    }

    return $(successiveElements.html())
  },

  /**
   * 
   */
  getLevelFromHash: function (text) {

    let level = 0
    text = text.substring(0, text.length >= 6 ? 6 : text.length)

    while (text.length > 0) {

      if (text.substring(text.length - 1) == '#')
        level++

        text = text.substring(0, text.length - 1)
    }

    return level
  },

  /**
   * Return JQeury object that represent the section
   */
  create: function (text, level) {
    // Create the section 
    // Version2 removed ${ZERO_SPACE} from text
    return $(`<section id="${this.getNextId()}"><h${level}>${text}</h${level}></section>`)
  },

  /**
   * Check what kind of section needs to be added, and preceed
   */
  manageSection: function (selectedElement, newSection, level) {

    let deepness = $(selectedElement).parentsUntil(RAJE_SELECTOR).length - level + 1

    if (deepness >= 0) {

      // Get direct parent and ancestor reference
      let successiveElements = this.getSuccessiveElements(selectedElement, deepness)

      if (successiveElements.length)
        newSection.append(successiveElements)

      // CASE: sub section
      if (deepness == 0)
        selectedElement.after(newSection)

      // CASE: sibling section
      else if (deepness == 1)
        selectedElement.parent('section').after(newSection)

      // CASE: ancestor section at any uplevel
      else
        $(selectedElement.parents('section')[deepness - 1]).after(newSection)

      newSection.headingDimension()
    }
  },

  /**
   * Refresh editor and save the transaction inside the Undo buffer
   */
  commit: function () {

    // Refresh tinymce content and set the heading dimension
    tinymce.triggerSave()

    // Add the change to the undo manager
    tinymce.activeEditor.undoManager.add()
  },

  /**
   * 
   */
  upgrade: function () {

    // Get the references of selected and parent section
    let selectedSection = $(tinymce.activeEditor.selection.getNode()).parent('section')
    let parentSection = selectedSection.parent('section')

    // If there is a parent section upgrade is allowed
    if (parentSection.length) {

      // Everything in here, is an atomic undo level
      tinymce.activeEditor.undoManager.transact(function () {

        // Save the section and detach
        let bodySection = $(selectedSection[0].outerHTML)
        selectedSection.detach()

        // Update dimension and move the section out
        parentSection.after(bodySection)

        // Refresh tinymce content and set the heading dimension
        bodySection.headingDimension()
        tinymce.triggerSave()
      })
    }
  },

  /**
   * 
   */
  downgrade: function () {

    // Get the references of selected and sibling section
    let selectedSection = $(tinymce.activeEditor.selection.getNode()).parent('section')
    let siblingSection = selectedSection.prev('section')

    // If there is a previous sibling section downgrade is allowed
    if (siblingSection.length) {

      // Everything in here, is an atomic undo level
      tinymce.activeEditor.undoManager.transact(function () {

        // Save the section and detach
        let bodySection = $(selectedSection[0].outerHTML)
        selectedSection.detach()

        // Update dimension and move the section out
        siblingSection.append(bodySection)

        // Refresh tinymce content and set the heading dimension
        bodySection.headingDimension()
        tinymce.triggerSave()
      })
    }
  },

  /**
   * 
   * After any delete, the editor must update the unvalidated elements
   */
  updateSectionStructure: function () {

    // Save selected element and ancestor section references
    let selectedElement = $(tinymce.activeEditor.selection.getNode())
    let ancestorSection = selectedElement.parents(RAJE_SELECTOR)

    // TODO update algorithm #issue96

    let toRemoveSections = []

    ancestorSection.find('section').each(function () {

      // Check if the current section doesn't have heading as first child
      if (!$(this).children().first().is(':header')) {

        toRemoveSections.push($(this))
      }
    })

    // Get the list of the section without h1, those who have another section as first child
    //let toRemoveSections = ancestorSection.find('section:has(section:first-child)')

    // If there are sections to be removed
    if (toRemoveSections.length > 0) {

      // Move everything after 
      selectedElement.after(toRemoveSections[toRemoveSections.length - 1].html())

      toRemoveSections[0].remove()

      ancestorSection.children('section').headingDimension()
      tinymce.triggerSave()
    }
  },
  /**
   * 
   */
  addAbstract: function () {

    if (!$(ABSTRACT_SELECTOR).length) {

      tinymce.activeEditor.undoManager.transact(function () {

        // This section can only be placed after non editable header
        $(NON_EDITABLE_HEADER_SELECTOR).after(`<section id="doc-abstract" role="doc-abstract"><h1>Abstract</h1><p><br/></p></section>`)

        updateIframeFromSavedContent()

        //move caret and set focus to active aditor #105
        tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select(`${ABSTRACT_SELECTOR} > p`)[0])
        tinymce.activeEditor.focus()
      })
    }

  },

  /**
   * 
   */
  addAcknowledgements: function () {

    if (!$(ACKNOWLEDGEMENTS_SELECTOR).length) {

      let ack = $(`<section id="doc-acknowledgements" role="doc-acknowledgements"><h1>Acknowledgements</h1><p><br/></p></section>`)

      tinymce.activeEditor.undoManager.transact(function () {

        // Insert this section after last non special section 
        // OR after abstract section 
        // OR after non editable header
        if ($(SECTION_SELECTOR).length)
          $(SECTION_SELECTOR).last().after(ack)

        else if ($(ABSTRACT_SELECTOR).length)
          $(ABSTRACT_SELECTOR).after(ack)

        else
          $(NON_EDITABLE_HEADER_SELECTOR).after(ack)

        updateIframeFromSavedContent()

        //move caret and set focus to active aditor #105
        tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select(`${ACKNOWLEDGEMENTS_SELECTOR} > p`)[0], true)
        tinymce.activeEditor.focus()
      })
    }
  },

  /**
   * This method is the main one. It's called because all times the intent is to add a new biblioentry (single reference)
   * Then it checks if is necessary to add the entire <section> or only the missing <ul>
   */
  addBiblioentry: function (id, text, listItem) {

    // Add bibliography section if not exists
    if (!$(BIBLIOGRAPHY_SELECTOR).length) {

      let bibliography = $(`<section id="doc-bibliography" role="doc-bibliography"><h1>References</h1><ul></ul></section>`)

      // This section is added after acknowledgements section
      // OR after last non special section
      // OR after abstract section
      // OR after non editable header 
      if ($(ACKNOWLEDGEMENTS_SELECTOR).length)
        $(ACKNOWLEDGEMENTS_SELECTOR).after(bibliography)

      else if ($(SECTION_SELECTOR).length)
        $(SECTION_SELECTOR).last().after(bibliography)

      else if ($(ABSTRACT_SELECTOR).length)
        $(ABSTRACT_SELECTOR).after(bibliography)

      else
        $(NON_EDITABLE_HEADER_SELECTOR).after(bibliography)

    }

    // Add ul in bibliography section if not exists
    if (!$(BIBLIOGRAPHY_SELECTOR).find('ul').length)
      $(BIBLIOGRAPHY_SELECTOR).append('<ul></ul>')

    // IF id and text aren't passed as parameters, these can be retrieved or init from here
    id = (id) ? id : section.getSuccessiveElementId(BIBLIOENTRY_SELECTOR, 'biblioentry_')
    text = text ? text : '<br/>'

    let newItem = $(`<li role="doc-biblioentry" id="${id}"><p>${text}</p></li>`)

    // Append new li to ul at last position
    // OR insert the new li right after the current one
    if (!listItem)
      $(`${BIBLIOGRAPHY_SELECTOR} ul`).append(newItem)

    else
      listItem.after(newItem)
  },

  /**
   * 
   */
  addEndnote: function (id) {

    // Add the section if it not exists
    if (!$(ENDNOTE_SELECTOR).length) {

      let endnotes = $(`<section id="doc-endnotes" role="doc-endnotes"><h1>Footnotes</h1></section>`)

      // Insert this section after bibliography section
      // OR after acknowledgements section
      // OR after non special section selector
      // OR after abstract section
      // OR after non editable header 
      if ($(BIBLIOGRAPHY_SELECTOR).length)
        $(BIBLIOGRAPHY_SELECTOR).after(endnotes)

      else if ($(ACKNOWLEDGEMENTS_SELECTOR).length)
        $(ACKNOWLEDGEMENTS_SELECTOR).after(endnotes)

      else if ($(SECTION_SELECTOR).length)
        $(SECTION_SELECTOR).last().after(endnotes)

      else if ($(ABSTRACT_SELECTOR).length)
        $(ABSTRACT_SELECTOR).after(endnotes)

      else
        $(NON_EDITABLE_HEADER_SELECTOR).after(endnotes)
    }

    // Create and append the new endnote
    let endnote = $(`<section role="doc-endnote" id="${id}"><p><br/></p></section>`)
    $(ENDNOTES_SELECTOR).append(endnote)
  },

  /**
   * 
   */
  getSuccessiveElementId: function (elementSelector, SUFFIX) {

    let lastId = 0

    $(elementSelector).each(function () {
      let currentId = parseInt($(this).attr('id').replace(SUFFIX, ''))
      lastId = currentId > lastId ? currentId : lastId
    })

    return `${SUFFIX}${lastId+1}`
  }
}