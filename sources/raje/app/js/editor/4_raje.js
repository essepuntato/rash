let strong = false
let em = false

rashEditor = {

  /* und/redo */

  undo: function () {
    document.execCommand("undo");
    refreshToolbar()
  },

  redo: function () {
    document.execCommand("redo");
    refreshToolbar()
  },
  /* END undo/redo */

  /* inlines */

  insertParagraph: function (node) {
    $(node).after(ZERO_SPACE);
    caret.moveAfterNode(node);
    document.execCommand("insertHTML", false, '<p><br/></p>');
    $(node).parentsUntil(rash_inline_selector).last().trimChar();
  },

  insertCodeBlock: function () {
    document.execCommand("insertHTML", false, '<pre><code><br/></code></pre>');
  },

  insertUnorderedList: function () {
    document.execCommand("insertUnorderedList");
  },

  insertOrderedList: function () {
    document.execCommand("insertOrderedList");
  },

  insertQuoteBlock: function () {
    document.execCommand("insertHTML", false, '<blockquote><p><br/></p></blockquote>');
  },

  insertBold: function () {
    document.execCommand("bold");
    refreshToolbar()
  },

  insertItalic: function () {
    document.execCommand("italic");
    refreshToolbar()
  },

  externalLink: function () {

    this.selection

    var sel = rangy.getSelection()
    if (sel.rangeCount) {
      this.selection = rangy.saveSelection()
    }

    this.showModal = function () {

      addExternalLinkModal()
    }

    this.addLink = function (link, title) {
      if (undefined !== this.selection) {

        rangy.restoreSelection(this.selection);
        document.execCommand('createLink', false, link);
      }
    }
  },

  header: {

    insertKeyword: function () {

      var sel = rangy.getSelection();

      if ($('header').find('p.keywords').length) {

        let selectedKeyword = $(sel.anchorNode).parentsUntil('ul.list-inline').last()

        if (caret.checkIfInHeader()) {
          selectedKeyword.after(ONE_SPACE);
          caret.moveAfterNode(selectedKeyword[0]);

          document.execCommand("insertHTML", false, `<li><code>${ZERO_SPACE}</code></li>`);

        } else {
          $('p.keywords>ul.list-inline').append(`<li><code>Keyword</code></li>`)
        }

      } else {

        $('header').append('<p class="keywords"><strong>Keywords</strong></p>')
        $('p.keywords').append('<ul class="list-inline"><li><code>Keyword</code></li></ul>')

        attachHeaderEventHandler()
      }

    },

    removeKeyword: function (keywords) {
      keywords.remove()
    },

    insertSubject: function () {

      var sel = rangy.getSelection();

      if ($('header').find('p.acm_subject_categories').length) {

        let selectedKeyword = $(sel.anchorNode).parentsUntil('p.acm_subject_categories').last(),
          newElement = $(`<br/><code>Placeholder subject</code>`)

        selectedKeyword.after(newElement)

        attachHeaderEventHandler()

      } else {

        if ($('header').find('p.keywords').length)
          $('p.keywords').before('<p class="acm_subject_categories"><strong>ACM Subject Categories</strong></p>')
        else
          $('header').append('<p class="acm_subject_categories"><strong>ACM Subject Categories</strong></p>')

        $('p.acm_subject_categories').append('<br/><code>Placeholder subject</code>')
        attachHeaderEventHandler()
      }
    },

    removeSubject: function (subject) {
      subject.before().remove()
      subject.remove()

      if (!$('p.acm_subject_categories').find('code').length)
        $('p.acm_subject_categories').remove()
    },

    addAffiliation: function () {

      var sel = rangy.getSelection();
      if (sel.rangeCount && sel.isCollapsed && caret.checkIfInHeader()) {

        let selectedKeyword = $(sel.anchorNode).parentsUntil('address.lead.authors').last(),
          newElement = $(`<br/><span class="affiliation">Placeholder affiliation</span>`)

        selectedKeyword.after(newElement)

        attachHeaderEventHandler()
      }
    },
    insertSubTitle: function () {
      var sel = rangy.getSelection()
      if (sel.rangeCount && sel.isCollapsed && caret.checkIfInHeader()) {

        let title = $(sel.anchorNode).parents('h1')

        if (!$('h1.title small').length)
          document.execCommand("insertHTML", false, `<br/><small>${ZERO_SPACE}</small>`)
      }
    },

    addAuthor: function (author) {

      let placeholderAuthor = $(`
        <address class="lead authors">
          <strong class="author_name">John Doe</strong>
          <code class="email"><a>john.doe@email.com</a></code><br>
          <span class="affiliation">John Doe affiliation</span>
        </address>`)
      let lastAuthor

      if (author)
        lastAuthor = author
      else if ($('address.lead.authors').length)
        lastAuthor = $('address.lead.authors').last()
      else
        lastAuthor = $('h1.title')

      placeholderAuthor.insertAfter(lastAuthor)
      attachHeaderEventHandler()

    },

    removeAuthor: function (author) {
      author.remove()
    },

    setReorganizeAuthors: function () {

      let sortable = $(`<ul id="sortable"> </ul>`)

      $('address.lead.authors').each(function () {

        $(this).detach()
        let listElement = $('<li class="ui-state-default"></li>')

        listElement.html($(this)[0].outerHTML)

        sortable.append(listElement)
      })

      sortable.insertAfter($('h1.title'))

      $("#sortable").sortable({ revert: true });
    },

    unsetReorganizeAuthors: function () {

      $('li.ui-state-default').each(function () {

        if (!$('header').children('address.lead.authors').length)
          $(this).find('address.lead.authors').insertAfter($('h1.title'))

        else
          $(this).find('address.lead.authors').insertAfter($('header > address.lead.authors').last())
      })

      attachHeaderEventHandler()
      $("#sortable").remove()
    }
  },

  crossRef: function () {

    this.selection

    var sel = rangy.getSelection()
    if (sel.rangeCount) {
      this.selection = rangy.saveSelection()
    }

    this.showModal = function () {
      addCrossRefModal()
    }

    this.add = function (ref) {
      if (undefined !== this.selection) {

        rangy.restoreSelection(this.selection);

        document.execCommand('insertHTML', false, `<a href="#${ref}">${ONE_SPACE}</a>`)
        references()

        /** remove back button on footnotes */
        $(`section[role="doc-endnote"]`).each(function () {
          $(this).find('sup.hidden-print.cgen').remove()
        })
      }
    }

    this.addBiblioentry = function (id) {
      this.add(`bib${id}`)
    }

    this.addEndnote = function (id) {
      this.add(`fn${id}`)
    }

    this.getAllReferenceables = function () {
      let referenceables = ''

      /** retrieve sections */
      let sections = $('<div class="list-group">')
      $(rash_inline_selector + '>section[role]').each(function () {
        sections.append(`<a data-type="role" data-ref="${$(this).attr('role')}" class="list-group-item">${$(this).find('h1:first-child').text()}</a>`)
      })
      $(rash_inline_selector + '>section:not([role])').each(function () {
        sections.append(`<a data-type="section" data-ref="${$(this).attr('id')}" class="list-group-item">${$(this).find('h1:first-child').text()}</a>`)
      })
      referenceables += '<p><b>Sections</b></p>' + sections[0].outerHTML

      /** retrieve blocks */
      let blocks = $('<div class="list-group">')
      $(rash_inline_selector + '>section figure').each(function () {
        let text
        if ($(this).find('figcaption').length)
          text = $(this).find('figcaption').text()

        else
          text = 'Formula ' + $(this).find('span.cgen').text()


        blocks.append(`<a data-type="box" data-ref="${$(this).attr('id')}" class="list-group-item">${text}</a>`)
      })
      referenceables += '<p><b>blocks</b></p>' + blocks[0].outerHTML

      /** retrieve bibliography */
      let biblio = $('<div class="list-group">')
      $(rash_inline_selector + '>section[role="doc-bibliography"] li').each(function () {
        biblio.append(`<a data-type="biblioentry" data-ref="${$(this).attr('id')}" class="list-group-item">${$(this).find('p').text()}</a>`)
      })
      biblio.append(`<a data-type="addBiblioentry" class="list-group-item">+ add new biblioentry</a>`)
      referenceables += '<p><b>Biblioentry</b></p>' + biblio[0].outerHTML

      /** retrieve endnotes */
      let endnotes = $('<div class="list-group">')
      $(rash_inline_selector + '>section[role="doc-endnotes"] section').each(function () {
        endnotes.append(`<a data-type="endnote" data-ref="${$(this).attr('id')}" class="list-group-item">${$(this).find('p').text()}</a>`)
      })
      endnotes.append(`<a data-type="addEndnote" class="list-group-item">+ add new footnote</a>`)
      referenceables += '<p><b>Footnotes</b></p>' + endnotes[0].outerHTML

      return referenceables
    }
  },

  insertInline: function (element) {
    var sel = rangy.getSelection();
    if (sel.rangeCount && caret.checkIfInEditor()) {
      /*
        Check if selection is at the parentElement start or end
        In this case add ZERO_SPACE ascii_code to allow normal contenteditable behaviour
      */

      caret.appendOrPrependZeroSpace();

      if (sel.isCollapsed) {
        document.execCommand("insertHTML", false, `<code>${ZERO_SPACE}</code>${ZERO_SPACE}`);
      }
      else {

        var range = sel.getRangeAt(0);
        var text = range.toString();
        document.execCommand("insertHTML", false, '<' + element + '>' + text + '</' + element + '>');
      }
    }
  },

  insertInlineFormula: function () {
    var sel = rangy.getSelection();
    if (sel.rangeCount && sel.isCollapsed && caret.checkIfInEditor()) {
      /*
        Check if selection is at the parentElement start or end
        In this case add ZERO_SPACE ascii_code to allow normal contenteditable behaviour
      */
      caret.appendOrPrependZeroSpace();
      document.execCommand("insertHTML", false, '<span class=\"inline_formula\"> formula </span>');
      caret.sanitizeElement(sel);
    }
  },

  renderInlineFormula: function () {
    var node = $('.inline_formula');
    caret.selectNode(node);
    var range = rangy.getSelection().getRangeAt(0);

    var text = range.toString();
    document.execCommand('delete');
    document.execCommand('insertHTML', false, '`' + text + '`');
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  },

  exitInline: function (node) {
    node.after(ZERO_SPACE);
    caret.moveAfterNode(node[0]);
    rangy.getSelection().move('character', 1);
    document.execCommand('insertText', false, ' ');
  },

  /* END inlines */

  /* cross-ref */

  insertCrossRef: function () {
    var reference = prompt('Select reference', 'abstract');
    if (reference !== null) {
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
        document.execCommand("insertHTML", false, '<a href=\"' + reference + '\"> </a>');
      else {
        //With webkit editor needs to override link text with blank space
        document.execCommand("createLink", false, reference);
        document.execCommand("insertHTML", false, ONE_SPACE);
      }
      createReference();
    }
  },

  getCrossRefList: function () {

    var references = [];

    //TODO get sections reference
    $('section').each(function () {
      references.push(
        $(this).attr('role') ?
          'section[' + $(this).attr('role') + ']' :
          'section#' + $(this).attr('id')
      );
    });

    //TODO get figures references
    $('figure').each(function (index) {

    });

    console.log(references);
  },

  /* END cross-res */

  insertSuperscript: function () {
    document.execCommand("superscript");
  },

  insertSubscript: function () {
    document.execCommand("subscript");
  },

  /* sections */

  getLastSectionId: function (ids) {

    let max = -1
    ids.forEach(function (id) {
      let integerId = parseInt(id.replace('section', ''))
      if (integerId > max) max = integerId
    })
    return max + 1
  },

  insertSection: function (level, isShortcut) {
    // Restore selection if isn't restored yet and check if the selection exists and is inside the editor
    if (typeof savedSelection != "undefined" && !savedSelection.restored) rangy.restoreSelection(savedSelection);
    if (typeof rangy.getSelection() != "undefined" && caret.checkIfInEditor()) {

      // Get all section parent of selected node, inside the editor
      var sections = $(rangy.getSelection().anchorNode).parentsUntil(rash_inline_selector, 'section'),
        text = $(rangy.getSelection().anchorNode).parent(), id = []

      $(rash_inline_selector + ' section:not([role])').each(function () {
        id.push($(this).attr('id'))
      })

      // If user doesn't wanna insert an element right above the caret
      if (level <= sections.length) {
        // Moving caret after node where is needed to be insert new section
        var selectedSection = $(sections.get(sections.length - level));
        selectedSection.after(ZERO_SPACE);
        caret.moveAfterNode(selectedSection[0]);
      }

      id = !id.length ? 1 : this.getLastSectionId(id)

      // Insert new section
      document.execCommand("insertHTML", false, '<section class="pointer" id="section' + id + '"><h1><br/></h1></section>');

      if (isShortcut) {
        caret.selectNode(text);
        text[0].parentNode.removeChild(text[0]);
      }

      // Rendering RASH things
      //containerSection();
      heading_dimensions();

      // Sanitize from special chars
      $('.pointer').sanitizeFromSpecialChars()

      // TODO please change!!1!
      caret.moveStart($('.pointer').find('h1,h2,h3,h4,h5,h6'));
      $('.pointer').removeAttr('class');
    }
  },

  insertAcknowledgementSection: function () {
    if (!$(rash_inline_selector).hasAcknowledgments()) {
      var ack = `
        <section role=\"doc-acknowledgements\">
          <h1>Acknowledgements</h1>
          <p><br/></p>
        </section>`;
      var sections = $(rash_inline_selector + '>section:not([role])');
      /** Se esiste una sezione senza ruolo */
      if (sections.last().length) {
        sections.last().after(ZERO_SPACE);
        caret.moveAfterNode(sections.last()[0]);
      }
      /** Se non esiste una sezione senza ruolo */
      else if ($(rash_inline_selector).hasAbstract()) {
        $(section_abstract_selector).after(ZERO_SPACE);
        caret.moveAfterNode($(section_abstract_selector)[0]);
      }
      document.execCommand("insertHTML", false, ack);
      $('section[role=doc-acknowledgements]').sanitizeFromSpecialChars()
    } else {
      caret.moveStart($(section_acknowledgement_selector + ' > h1'));
    }


  },

  /**
   * Insert bibliography section is not exists
   * OR
   * Insert a biblioentry after the selected entry
   */
  insertBibliography: function (node) {

    let inserted = 1

    /** is does not exists create */
    if (!$(rash_inline_selector).hasBibliography()) {
      var biblio = `
        <section id=\"bibreflist\" role=\"doc-bibliography\">
          <h1>References</h1>
          <ol>
            <li id=\"bib1\" role=\"doc-biblioentry\"><p><br/></p></li>
          </ol>
        </section>`
      var node

      /** Retrieve position to section */
      if ($(rash_inline_selector).hasAcknowledgments())
        node = $(section_acknowledgement_selector)

      else if ($(rash_inline_selector + '>section:not([role])').length)
        node = $(rash_inline_selector + '>section:not([role])').last()

      else
        node = $(section_abstract_selector)

      /** insert after node */
      node.after(ZERO_SPACE)
      caret.moveAfterNode(node[0])
      document.execCommand("insertHTML", false, biblio)
    }
    /** If section already exists, add a new entry */
    else {

      if (!node)
        node = $('section[role="doc-bibliography"] li:last-child')

      let getNextBibliography = function () {
        let max = -1
        node.parent('ol').find('li').each(function () {
          let currentCnt = parseInt($(this).attr('id').replace('bib', ''))
          max = max > currentCnt ? max : currentCnt
        })
        return max
      }

      inserted = getNextBibliography() + 1

      node.after(ZERO_SPACE)
      caret.moveAfterNode(node[0])
      document.execCommand("insertHTML", false, `<li id="bib${inserted}" role="doc-biblioentry"><p><br/></p></li>`)
    }

    $(node).sanitizeFromSpecialChars()
    return inserted
  },

  insertEndnote: function (node) {

    let inserted = 1

    if (!$(rash_inline_selector).hasEndnotes()) {
      var endnotes = `
        <section id="fnlist" role="doc-endnotes">
          <h1>Footnotes</h1>
          <section id="fn1" role="doc-endnote">
            <p>
              <br/>
            </p>
          </section>
        </section>`

      // must check after which elem
      if ($(rash_inline_selector).hasBibliography())
        node = $('section[role="doc-bibliography"]')

      else if ($(rash_inline_selector).hasAcknowledgments())
        node = $(section_acknowledgement_selector)

      else if ($(rash_inline_selector + '>section:not([role])').length)
        node = $(rash_inline_selector + '>section:not([role])').last()

      else
        node = $(section_abstract_selector)

      // insert entire section with first element
      node.after(ZERO_SPACE)
      caret.moveAfterNode(node[0])
      document.execCommand("insertHTML", false, endnotes)

    } else {

      if (!node)
        node = $('section[role="doc-endnotes"]>section:last-child')

      let getNextEndnote = function () {
        let max = -1
        node.parent('section[role="doc-endnotes"]').find('section').each(function () {
          let currentCnt = parseInt($(this).attr('id').replace('fn', ''))
          max = max > currentCnt ? max : currentCnt
        })
        return max
      }

      inserted = getNextEndnote() + 1

      node.after(ZERO_SPACE);
      caret.moveAfterNode(node[0]);
      document.execCommand("insertHTML", false, `<section id="fn${inserted}" role="doc-endnote"><p><br/></p></section>`)
    }

    $(node).sanitizeFromSpecialChars()
    return inserted
  },

  /* END sections  */

  /* boxes */

  /**
   * Extends normal table behaviour and allows customization
   * @method table
   * @param  {String} id Unique identifier of a table (as table_1, table_2)
   */
  Table: function (id) {

    this.figure = `
        <figure id=\"${id}\">
          ${tableOptions}
          <table>
            <tr> ${TABLE.HEAD} ${TABLE.HEAD} </tr>
            <tr> ${TABLE.DATA} ${TABLE.DATA} </tr>
            <tr> ${TABLE.DATA} ${TABLE.DATA} </tr>
          </table>
          <figcaption> Caption of the <code>table</code>. </figcaption>
        </figure>`;
    this.figcaption = $();
    this.rows = 2;
    this.cols = 2;
    this.head = {
      top: true,
      left: false
    };
    this.id = 'figure#' + id + '>table';

    this.addOptions = function () {
      $(this.id).before(tableOptions)
    }

    /**
     * Method used to add table to document where caret is placed
     * New table is 2x2 with top heading
     * @method add
     */
    this.add = function () {

      document.execCommand("insertHTML", false, this.figure);

      captions();
      addTableModal();
      refreshReferences()
    };
    /* Getters */
    this.hasTopHeading = function () {
      return this.head.top;
    };
    this.hasLeftHeading = function () {
      return this.head.left;
    };
    this.getRows = function () {
      return this.rows;
    };
    this.getCols = function () {
      return this.cols;
    };

    /**
     * Add or delete rows from table
     * @method AddDelRows
     * @param  {Int}   n amount of rows (to delete if negative)
     */
    this.addDelRows = function (n) {
      //Add
      if (n > 0) {
        var tmp = n;
        while (tmp-- > 0) {
          var row = $('<tr></tr>');
          if (this.head.left)
            row.append(TABLE.HEAD);
          row.appendChildren(this.cols, TABLE.DATA);
          $(this.id).append(row);
        }
      }
      //Delete
      else {
        var diff = this.rows + n;
        if (diff > 0)
          $(this.id).find('tr:not(:has(th:last-child))').slice(diff).remove();
      }
      this.rows += n;
    };

    /**
     * Add or delete columns
     * @method addCols
     * @param  {Int} n  amount of columns (to delete if negative)
     */
    this.addDelCols = function (n) {
      //Add
      if (n > 0) {
        for (var i = 1; i <= this.rows + 1; i++) {
          if (this.head.top && i === 1)
            $(this.id).find('tr:first-child').appendChildren(n, TABLE.HEAD);
          else
            $(this.id).find('tr:nth-child(' + i + ')').appendChildren(n, TABLE.DATA);
        }
      }
      //Delete
      else {
        var diff = this.cols + n - 1;
        if (diff > 0) {
          if (this.head.left)
            $(this.id).find('tr').find('td:gt(' + (diff++) + '), th:gt(' + (diff) + ')').remove();
          else
            $(this.id).find('tr').find('td:gt(' + (diff) + '), th:gt(' + (diff) + ')').remove();
        }
      }
      this.cols += n;
    };

    /* Methods to toggle headings */
    this.toggleLeftHead = function () {
      this.head.left = !this.head.left;
      if (this.head.left) {
        $(this.id).find('tr').prepend(TABLE.HEAD);
      } else {
        $(this.id).find('tr > th:first-child').remove();
      }
    };
    this.toggleTopHead = function () {
      this.head.top = !this.head.top;
      if (this.head.top) {
        var row = $('<tr></tr>');
        var nCols = this.cols + (this.head.left ? 1 : 0);
        row.appendChildren(nCols, TABLE.HEAD);
        $(this.id).prepend(row);
      } else {
        $(this.id).find('tr:first-child').remove();
      }
    };

    /**
     * Delete this table
     * @method delete
     */
    this.delete = function () {
      if (confirm('Are you sure you want to delete selected table?')) {
        $(this.id).parent().remove();
        refresh_footer();
      }
    };
  },

  Figure: function (id) {

    this.selection;
    this.id = id;

    this.showModal = function () {
      var sel = rangy.getSelection();
      if (sel.rangeCount) {
        this.selection = rangy.saveSelection();

        selectImageFileModal(this.id)
      }
    }

    this.addFigure = function (name) {

      if (undefined !== this.selection) {

        let html = `
          <figure id="${this.id}">
            <p>
              <img src="${name}" alt="${name}"/>
              <figcaption>
                ${ZERO_SPACE}Caption of the <code>figure</code>.
              </figcaption>
            </p>
          </figure>`

        rangy.restoreSelection(this.selection)
        document.execCommand("insertHTML", false, removeWhiteSpaces(html))
        refreshReferences()
      }
    }

    this.save = function (file) {

      sendWriteFigure(file)

      this.addFigure(`img/${file.name}`)
      captions()
    }

    this.saveFromUrl = function (url) {
      //let filename = sendWriteFigureFromUrl(url)

      this.addFigure(url)
      captions()
    }
  },

  Formula: function (id) {
    this.selection;
    this.id = id;

    this.showModal = function () {
      var sel = rangy.getSelection();
      if (sel.rangeCount) {
        this.selection = rangy.saveSelection();

        //addFormulaModal(this.id);
        addFormulaEditorModal(this.id)
      }
    };

    this.addBlock = function (asciiFormula) {
      this.asciiFormula = asciiFormula;
      if (undefined !== this.selection) {
        rangy.restoreSelection(this.selection);

        // render formula
        document.execCommand("insertHTML", false, "<figure id=\"" + this.id + "\"><p class=\"rash-math\">\`\`" + asciiFormula + "\`\`</p></figure>");
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

        //get mathml 
        let mathml = $('figure#' + this.id).find('span[data-mathml]').data('mathml')
        $('figure#' + this.id).html(`<p>${mathml}</p>`)

        captions()
        formulas()
        refreshReferences()
      }
    };
  }

  /* END boxes */
};
