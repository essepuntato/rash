/**
 * RASH section plugin RAJE
 */
tinymce.PluginManager.add('raje_section', function (editor, url) {

  editor.addButton('raje_section', {
    type: 'menubutton',
    text: 'Headings',
    title: 'heading',
    icons: false,

    // Sections sub menu
    menu: [{
      text: 'Heading 1.',
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
    }]
  })

  editor.on('keyDown', function (e) {

    // Check if a deletion is called
    if (e.keyCode == 8)
      flag = true

    // instance of the selected element
    let selectedElement = $(tinymce.activeEditor.selection.getNode())

    // When press enter
    if (e.keyCode == 13) {

      // When enter is pressed inside an header, not at the end of it
      if (selectedElement.is('h1,h2,h3,h4,h5,h6') && selectedElement.text().trim().length != tinymce.activeEditor.selection.getRng().startOffset) {

        section.addWithEnter()
        return false
      }

      /*
      if (selectedElement.is('p') && selectedElement.text().trim().indexOf('#') != -1) {
        let level = Rajemce.section.getLevelFromHash(selectedElement.text().trim())

        Rajemce.section.add(level, selectedElement.text().substring(level).trim())
      }*/
    }
  })

  editor.on('NodeChange', function (e) {

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


    if (flag) {
      flag = false
      section.updateSectionStructure()
    }
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

      level = selectedElement.parentsUntil(RAJE_SELECTOR).length

      console.log(selectedElement.text())
      console.log(tinymce.activeEditor.selection.getRng().startOffset)

      // Create the section
      let newSection = this.create(selectedElement.text().trim().substring(tinymce.activeEditor.selection.getRng().startOffset), level)

      tinymce.activeEditor.undoManager.transact(function () {

        // Check what kind of section needs to be inserted
        section.manageSection(selectedElement, newSection, level)

        // Remove the selected section
        selectedElement.html(selectedElement.text().trim().substring(0, tinymce.activeEditor.selection.getRng().startOffset))

        // Update editor
        tinymce.triggerSave()
      })
    },

    /**
     * Get the last inserted id
     */
    getNextId: function () {
      let id = 1
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
      return $(`<section id="${this.getNextId()}"><h${level}>${ZERO_SPACE}${text}</h${level}></section>`)
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

        if ($(this).children().first().is('section')) {

          toRemoveSections.push($(this))
        }
      })

      // Get the list of the section without h1, those who have another section as first child
      //let toRemoveSections = ancestorSection.find('section:has(section:first-child)')

      // If there are sections to be removed
      if (toRemoveSections.length > 0) {

        // Move everything after 
        selectedElement.after(toRemoveSections[length].html())

        toRemoveSections[0].remove()

        ancestorSection.children('section').headingDimension()
        tinymce.triggerSave()
      }
    },
  }
})