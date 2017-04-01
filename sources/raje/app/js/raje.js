/*
 *
 * rash-inline.js - Version 0.0.1
 * Copyright (c) 2016, Gianmarco Spinaci <spino9330@gmail.com>
 *
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
 * IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */

var rash_inline_selector = '#rashEditor',
  section_abstract_selector = 'section[role=\"doc-abstract\"]',
  section_bibliography_selector = 'section[role=\"doc-bibliography\"]',
  section_acknowledgement_selector = 'section[role=\"doc-acknowledgements\"]',
  section_footnotes_selector = 'section[role=\"doc_footnotes\"]';

var meta_headers_selector = 'h1.title, h1>small, strong.author_name, code.email, span.affiliation, p.keywords>ul.list-inline, p.acm_subject_categories>code';

window['bodyContent'] = ''
edit_state = false

// If there isn't any githubToken, editable starts with true to change and hide navbar
editable = false
window['settings'] = {}

jQuery.fn.extend({
  setEditable: function () {
    $(this).attr('contenteditable', true);
    $(this).attr('spellcheck', true);
    $('span.editgen').show();
    $('#editNavar').show();

    //Remove href
    $('header.page-header code.email>a').each(function () {
      $(this).removeAttr('href')
    })

    $('footer.footer').hide()

    /** hide endnote back button */
    $('section[role="doc-endnote"]').each(function () {
      $(this).find('sup.cgen').hide()
    })

    /** 
     * Check if body has been modified yet 
     * If current body and saved body are equal, edit_state is false (not modified)
     * otherwise edit_state is true
     */
    $(this).on('input', function () {
      edit_state = $(rash_inline_selector).html() != bodyContent
      setEditState()
    })

    $(this).bind('dragover drop', function (event) {
      event.preventDefault();
      return false;
    });

    /**
     * Get when call event to disable or activate toolbar elements
     */
    $('html').on('click', function () {
      refreshToolbar()
    })
    $('html').bind('keyup', function () {
      refreshToolbar()
    })

    showAuthorSettings()

  },
  setNotEditable: function () {
    $(this).attr('contenteditable', false);
    $('span.editgen').hide();
    $('#editNavar').hide();

    //Reset attr
    $('header.page-header code.email>a').each(function () {
      $(this).attr('href', 'mailto:' + $(this).text())
    })

    $('footer.footer').show()

    /** show endnote back button */
    $('section[role="doc-endnote"]').each(function () {
      $(this).find('sup.cgen').show()
    })
  },

  getNextFormulaID: function () {
    let id = 0
    $(formulabox_selector_rendered).each(function () {
      id = Math.max(id, parseInt($(this).parents('figure').attr('id').replace('formula_', '')))
    })
    return ++id
  },

  removeElement: function () {
    var toDeleteSpan = $(this);
    toDeleteSpan.replaceWith(toDeleteSpan.get(0).innerHTML);
  },

  appendChildren: function (number, childrenType) {
    while (number-- > 0) {
      $(this).append($(childrenType));
    }
  },
  hasAbstract: function () {
    return $(this).has('section[role=\"doc-abstract\"]').length;
  },
  hasAcknowledgments: function () {
    return $(this).has('section[role=\"doc-acknowledgements\"]').length;
  },
  hasBibliography: function () {
    return $(this).has('section[role=\"doc-bibliography\"]').length;
  },
  hasEndnotes: function () {
    return $(this).has('section[role=\"doc-endnotes\"]').length;
  },
  trimChar: function () {
    $(this).contents().filter(function () {
      return this.nodeType === 3 && $.trim(this.nodeValue).length;
    }).replaceWith('');
  },
  /** Remove all text outside elements
   * Because in rash text outside elements is not allowed
   */
  sanitizeFromSpecialChars: function () {
    $(this).parent().contents()
      .filter(function () {
        return this.nodeType == 3
      })
      .replaceWith('')
  }
});

window.handleInline = function (type) {
  window[type] = new rashEditor.inline(type);
  window[type].add();
  return false;
};

window.handleExternalLink = function () {
  window['externalLink'] = new rashEditor.externalLink();
  window['externalLink'].showModal();
};

window.handleCrossRef = function () {
  window['crossReference'] = new rashEditor.crossRef();
  window['crossReference'].showModal();
};

window.handleFootnote = function () {
  window['footnote'] = new rashEditor.crossRef()
  window['footnote'].addEndnote(rashEditor.insertEndnote())
}

window.handleTableBox = function () {
  var id = 'table_' + ($(this).findNumber(tablebox_selector) + 1);
  window[id] = new rashEditor.Table(id);
  window[id].add();
};

window.handleFigureBox = function () {
  var id = 'figure_' + ($(this).findNumber(figurebox_selector) + 1);
  window[id] = new rashEditor.Figure(id)
  window[id].showModal();
}

window.handleFormulaBox = function () {
  var id = 'formula_' + $(rash_inline_selector).getNextFormulaID()
  window[id] = new rashEditor.Formula(id);
  window[id].showModal();
};

window.handleListingBox = function () {
  var id = 'table_' + ($(this).findNumber(listingbox_selector) + 1);
  window[id] = new rashEditor.Listing(id);
  window[id].add();
};

$(document).ready(function () {

  /* START .rash_inline */
  var inline = $('<div id=\"rashEditor\" class=\"cgen editgen container\"></div>');

  inline.insertAfter('header.page-header.cgen');

  $('body > section').each(function () {
    $(this).detach();
    $(this).appendTo(inline);
  });
  /* END .rash_inline */

  if (checkSoftware()) {

    showNavbar();

    $(messageDealer).hide()

    $(rash_inline_selector).setEditable()

    $(rash_inline_selector).addClass('mousetrap');

    updateGithubButton()

    $('[data-toggle="tooltip"]').tooltip({
      placement: 'bottom',
      container: 'body'
    });

    rashEditor.init();

    attachHeaderEventHandler()

    initFigureReferences()

    $('footer button.dropdown-toggle').addClass('disabled')

    addHeaderZeroSpaces()

    bodyContent = $(rash_inline_selector).html()
  }
})

function attachHeaderEventHandler() {

  $(meta_headers_selector).on('click', function () {
    if (checkLogin()) {
      $(this).attr('contenteditable', 'true')
      $(this).addClass('mousetrap')
      $(this).focus()
    }
  })

  $(meta_headers_selector).on('focusout', function () {
    if (checkLogin()) {
      $(this).attr('contenteditable', 'false')
      $(this).addClass('mousetrap')
    }
  })

  showAuthorSettings()
}

function updateEditState() {

  bodyContent = $(rash_inline_selector).html()
  edit_state = false

  //send edit state to main process
  setEditState()
}

function initFigureReferences() {
  $('figure:has(table)').each(function () {

    var id = 'table_' + $(this).attr('id').split('_')[1]
    window[id] = new rashEditor.Table(id)
    window[id].addOptions()
    addTableModal()
  })
}

function executeSave() {
  executeSaveAsync()
  updateEditState()
  showMessageDealer('Document saved', 'success', 2000)
}

/**
 * Turn all references to empty <a>, then refresh references again
 */
function refreshReferences() {

  /** handle references */
  $(rash_inline_selector).find('a[href]:has(span.cgen)').each(function () {

    let originalContent = $(this).find('span.cgen').data('rash-original-content')
    let href = $(this).attr('href')

    $(this).replaceWith(`<a href="${href}">${originalContent}</a>`)
  })

  references()
}

function addHeaderZeroSpaces() {
  $('address.lead.authors').each(function () {
    let author_name = $(this).find('strong.author_name')
    let email = $(this).find('code.email > a')

    author_name.html(ZERO_SPACE + author_name.html())
    email.html(ZERO_SPACE + email.html())

    $(this).find('span.affiliation').each(function () {
      $(this).html(ZERO_SPACE + $(this).html())
    })
  })

  $('p.acm_subject_categories > code, p.keywords code').each(function () {
    $(this).html(ZERO_SPACE + $(this).html())
  })
}
caret = {

  move: function (type, count) {
    rangy.getSelection().move(type, count)
  },

  moveAfterNode: function (node) {
    var selection = window.getSelection(),
      range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  },

  checkIfInEditor: function () {
    return $(window.getSelection().anchorNode).parents(rash_inline_selector).length;
  },

  checkIfInHeader: function () {
    return $(window.getSelection().anchorNode).parents('header.page-header').length;
  },

  checkIfInToolbar: function () {
    return $(window.getSelection().anchorNode).parents('nav#editNavbar').length;
  },

  checkIfInHeading: function () {
    return $(window.getSelection().anchorNode).parents('h1,h2,h3,h4,h5,h6').length;
  },

  checkIfBorder: function () {
    var sel = rangy.getSelection(),
      node = sel.anchorNode;
    if (node.nodeType === 3) {
      if (sel.isCollapsed) {
        if (sel.anchorOffset == 0)
          return -1;
        else if (sel.anchorOffset == node.length)
          return 1;
      } else {
        var left = sel.isBackwards() ? sel.focusOffset : sel.anchorOffset;
        var right = sel.isBackwards() ? sel.anchorOffset : sel.focusOffset;

        if (left == 0 && right == node.length)
          return 0
        else if (left == 0)
          return -1;
        else if (right == node.length)
          return 1;
      }
    }
  },

  appendOrPrependZeroSpace: function () {
    var sel = rangy.getSelection(),
      element = $(sel.anchorNode.parentElement),
      border = caret.checkIfBorder();
    if (border == -1)
      element.prepend(ZERO_SPACE);
    else if (border == 1)
      element.append(ZERO_SPACE);
  },

  sanitizeElement: function (sel) {
    var element = $(sel.anchorNode).parentsUntil('section').last();
    element.sanitizeText();
  },

  /**
   * [selectNode description]
   * @method selectNode
   * @param  {[type]}   node [description]
   * @return {[type]}        [description]
   */
  selectNode: function (node) {

    var range = rangy.createRange();
    range.selectNode(node[0]);

    var sel = rangy.getSelection();

    sel.refresh();
    sel.setSingleRange(range);
  },
  /**
   * Move selection to startOffset of current node
   * @method moveToStart
   * @param  {Object} node
   */
  moveStart: function (node) {

    var range = rangy.createRange();
    range.setStart(node[0], 0);

    var sel = rangy.getSelection();
    sel.refresh();
    sel.removeAllRanges();
    sel.addRange(range);
  },

  moveEnd: function (node) {

    var range = rangy.createRange();
    range.setStart(node[0], node[0].innerHTML.length);

    var sel = rangy.getSelection();
    sel.refresh();
    sel.removeAllRanges();
    sel.addRange(range);
  },

  moveWindow: function (node) {

    if (node.parents('section').last().next().is('footer'))
      window.scrollTo(-100, document.body.scrollHeight);
  },

  moveTo: function (node, focus) {

    rangy.getSelection().collapse(node, focus);
  },

  navigateToHeaderSelect: function (to) {
    this.selectNode(to)
    this.navigate(to)
  },

  navigateToHeaderStart: function (to) {
    this.moveStart(to)
    this.navigate(to)
  },

  navigate: function (to) {
    to.attr('contenteditable', 'true')
    to.addClass('mousetrap')
    to.focus()
  },

  /**
   * 
   */
  getNextElement: function (currentElement) {
    let header = $('header.page-header')
    let firstHeader = $(rash_inline_selector + ' > section:first() > h1')

    if (currentElement.is('h1')) {
      if (!header.find('address.lead.authors').length)
        rashEditor.header.addAuthor()
      caret.navigateToHeaderStart(header.find('address.lead.authors:first() > strong.author_name'))
      this.move('character', 1)
    }

    else if (currentElement.is('strong.author_name')) {
      caret.navigateToHeaderStart(currentElement.next())
    }

    else if (currentElement.is('code.email')) {
      let address = currentElement.parents('address.lead.authors')
      if (!address.find('span.affiliation').length)
        rashEditor.header.addAffiliation()
      else
        caret.navigateToHeaderStart(address.find('span.affiliation:first()'))

      this.move('character', 1)
    }

    else if (currentElement.is('span.affiliation')) {

      let address = currentElement.parents('address.lead.authors')

      if (address.next().is('address')) {
        caret.navigateToHeaderStart(address.next().find('strong.author_name'))
        this.move('character', 1)
      }

      else if (address.next().is('p.acm_subject_categories')) {
        caret.navigateToHeaderStart(address.next().find('code:first()'))
        this.move('character', 1)
      }

      else if (address.next().is('p.keywords')) {
        caret.navigateToHeaderStart(address.next().find('ul'))
        this.move('character', 1)
      }

      else
        caret.navigateToHeaderStart(firstHeader)
    }

    else if (currentElement.is('p.acm_subject_categories')) {

      if (currentElement.next().is('p.keywords')) {
        caret.navigateToHeaderStart(currentElement.next().find('ul'))
        this.move('character', 1)
      }

      else
        caret.navigateToHeaderStart(firstHeader)
    }

    else
      caret.navigateToHeaderStart(firstHeader)
  }
};

const INLINE = {
  CODE: 'code',
  QUOTE: 'q',
};

const TABLE = {
  DATA: '<td><p><br/></p></td>',
  HEAD: '<th>heading</th>'
};

const TAB = '  '

const ZERO_SPACE = '&#8203;';
const ONE_SPACE = '&nbsp;';

const messageDealer = 'div#messageDealer';

Array.prototype.indexOfContent = function (searchTerm) {
  let index = -1;
  for (var i = 0, len = this.length; i < len; i++) {
    if (this[i].content == searchTerm) {
      index = i;
      break;
    }
  }
  return index
}

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
    let sel = rangy.getSelection()
    let string = '<br>'
    if (sel && !sel.isCollapsed)
      string = sel.toString()
    document.execCommand("insertHTML", false, `<pre>${ZERO_SPACE}<code>${string}</code></pre>`);
  },

  insertUnorderedList: function () {
    document.execCommand("insertUnorderedList");
  },

  insertOrderedList: function () {
    document.execCommand("insertOrderedList");
  },

  insertQuoteBlock: function (text) {
    let string = (text) ? text : '<br>'
    document.execCommand("insertHTML", false, `<blockquote><p>${string}</p></blockquote>`);
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
        $('p.keywords').append(`<ul class="list-inline"><li><code>${ZERO_SPACE}Type here the keyword</code></li></ul>`)

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
          newElement = $(`<br/><code data-pointer>${ZERO_SPACE}</code>`)

        selectedKeyword.after(newElement)
        attachHeaderEventHandler()

        caret.navigateToHeaderStart($('code[data-pointer]'))
        $('code[data-pointer]').removeAttr('data-pointer')
        sel.move('character', 1)

      } else {

        if ($('header').find('p.keywords').length)
          $('p.keywords').before('<p class="acm_subject_categories"><strong>ACM Subject Categories</strong></p>')
        else
          $('header').append('<p class="acm_subject_categories"><strong>ACM Subject Categories</strong></p>')

        $('p.acm_subject_categories').append(`<br/><code>${ZERO_SPACE}Type here the category</code>`)
        attachHeaderEventHandler()
      }
    },

    removeSubject: function (subject) {
      subject.prev('br').remove()
      subject.remove()

      if (!$('p.acm_subject_categories').find('code').length)
        $('p.acm_subject_categories').remove()
    },

    addAffiliation: function () {

      var sel = rangy.getSelection();
      if (sel.rangeCount && sel.isCollapsed && caret.checkIfInHeader()) {

        let selectedKeyword = $(sel.anchorNode).parentsUntil('address.lead.authors').last(),
          newElement = $(`<br/><span class="affiliation placeholder">${ZERO_SPACE}Add an additional affiliation or press ENTER to proceed.</span>`)

        selectedKeyword.after(newElement)
        attachHeaderEventHandler()

        caret.navigateToHeaderStart($('span.affiliation.placeholder'))
        sel.move('character', 1)
      }
    },

    removeAffiliation: function (affiliation) {
      affiliation.prev('br').remove()
      affiliation.remove()
    },

    insertSubTitle: function () {
      var sel = rangy.getSelection()
      if (sel.rangeCount && sel.isCollapsed && caret.checkIfInHeader()) {

        let title = $(sel.anchorNode).parents('h1')

        if (!title.find('small').length) {
          title.append(`<br/><small>${ZERO_SPACE}</small>`)
          caret.moveStart(title.find('small'))
          caret.move('character', 1)
        }
      }
    },

    addAuthor: function (author) {

      let placeholderAuthor = $(`
        <address class="lead authors">
          <strong class="author_name">${ZERO_SPACE}John Doe</strong>
          <code class="email"><a>${ZERO_SPACE}john.doe@email.com</a></code>
          <br><span class="affiliation">${ZERO_SPACE}John Doe affiliation</span>
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

        if (ref.includes('bib') || ref.includes('fn'))
          caret.moveStart($(`#${ref}`))
        else {
          let sel = rangy.getSelection()
          sel.refresh()
          caret.move('character', 1)
          caret.moveAfterNode(sel.anchorNode)
        }

      }
    }

    this.addBiblioentry = function (id) {
      this.add(`bib${id}`)
    }

    this.addEndnote = function (id) {
      this.add(`fn${id}`)
    }

    this.getAllReferenceables = function () {
      let referenceables = $(`<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true"></div>`)

      let sections = $(this.createCollapsable('Sections'))

      $(`${rash_inline_selector} section`).each(function () {
        let title = $(this).find('h1, h2, h3, h4, h5, h6').first().text()
        sections.find('#listSections').append(`<a data-type="role" data-ref="${$(this).attr('id')}" class="list-group-item">${title}</a>`)
      })
      referenceables.append(sections)

      if ($(`${rash_inline_selector} figure table`).length) {

        let tables = $(this.createCollapsable('Tables'))

        $(`${rash_inline_selector} figure:has(table)`).each(function () {
          let text = $(this).find('figcaption').text()
          tables.find('#listTables').append(`<a data-type="role" data-ref="${$(this).attr('id')}" class="list-group-item">${text}</a>`)
        })

        referenceables.append(tables)
      }

      if ($(`${rash_inline_selector} figure img`).length) {
        let figures = $(this.createCollapsable('Figures'))

        $(`${rash_inline_selector} figure:has(img)`).each(function () {
          let text = $(this).find('figcaption').text()
          figures.find('#listFigures').append(`<a data-type="role" data-ref="${$(this).attr('id')}" class="list-group-item">${text}</a>`)
        })

        referenceables.append(figures)
      }

      if ($(`${rash_inline_selector} figure span[data-mathml]`).length) {

        let formulas = $(this.createCollapsable('Formulas'))

        $(`${rash_inline_selector} figure:has(span[data-mathml])`).each(function () {
          let text = $(this).find('span.cgen').text()
          formulas.find('#listFormulas').append(`<a data-type="role" data-ref="${$(this).attr('id')}" class="list-group-item">Formula ${text}</a>`)
        })

        referenceables.append(formulas)
      }

      if ($(`${rash_inline_selector} ${listingbox_selector}`).length) {

        let formulas = $(this.createCollapsable('Listings'))

        $(`${rash_inline_selector} figure:has(pre)`).each(function () {
          let text = $(this).find('figcaption').text()
          formulas.find('#listListings').append(`<a data-type="role" data-ref="${$(this).attr('id')}" class="list-group-item">${text}</a>`)
        })

        referenceables.append(formulas)
      }

      let references = $(this.createCollapsable('References'))

      references.find('#listReferences').append(`<a data-type="addBiblioentry" class="list-group-item">+ add new bibliographic reference</a>`)

      $(`${rash_inline_selector}>section[role="doc-bibliography"] li`).each(function () {
        let position = $(this).index() + 1
        let text = $(this).find('p').text().replace('[X]', '')
        references.find('#listReferences').append(`<a data-type="biblioentry" data-ref="${$(this).attr('id')}" class="list-group-item">[${position}] ${text}</a>`)
      })

      referenceables.append(references)

      return referenceables[0].innerHTML
    }

    this.createCollapsable = function (name) {
      return `
          <div class="panel panel-default">
            <div class="panel-heading" role="tab" id="headingOne">
              <h4 class="panel-title">
                <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse${name}" aria-expanded="true" aria-controls="collapseOne">
                  ${name}
                </a>
              </h4>
            </div>
            <div id="collapse${name}" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
              <div id="list${name}" class="list-group"></div>
            </div>
          </div>`
    }
  },

  insertInline: function (element, isFormula) {
    var sel = rangy.getSelection();
    if (sel.rangeCount && caret.checkIfInEditor()) {
      /*
        Check if selection is at the parentElement start or end
        In this case add ZERO_SPACE ascii_code to allow normal contenteditable behaviour
      */

      caret.appendOrPrependZeroSpace();

      let string

      if (isFormula)
        string = `<${element} class="rash-math" data-formula data-pointer>\`\`${ZERO_SPACE}\`\`</${element}>${ZERO_SPACE}`

      else
        string = `<${element} data-pointer>${ZERO_SPACE}</${element}>${ZERO_SPACE}`

      if (sel.isCollapsed) {
        document.execCommand("insertHTML", false, string);
        caret.moveStart($(`${element}[data-pointer]`))

        caret.move('character', 1)

        if (isFormula) {
          caret.move('character', 2)
        }

        $(`${element}[data-pointer]`).removeAttr('data-pointer')
      }
      else {
        var range = sel.getRangeAt(0);
        var text = range.toString();
        document.execCommand("insertHTML", false, '<' + element + '>' + text + '</' + element + '>');
      }
    }
  },

  insertInlineFormula: function () {

    this.insertInline('span', true)

    /*
    var sel = rangy.getSelection();
    if (sel.rangeCount && sel.isCollapsed && caret.checkIfInEditor()) {
      
        Check if selection is at the parentElement start or end
        In this case add ZERO_SPACE ascii_code to allow normal contenteditable behaviour
      
      caret.appendOrPrependZeroSpace();
      document.execCommand("insertHTML", false, `<span class="rash-math" data-formula>\`\`${ZERO_SPACE}\`\`</span>`);
      caret.moveStart($('span[data-formula]'))
      caret.move('character', 2)
      //caret.sanitizeElement(sel);
      
    }
    */
  },

  renderInlineFormula: function (formula) {
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

  insertSection: function (level, isShortcut, insertedText) {
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

      insertedText = insertedText ? insertedText : '<br/>'

      console.log(text)

      // Insert new section
      document.execCommand("insertHTML", false, `<section class="pointer" id="section${id}"><h1>${insertedText}</h1></section>`);

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

  insertAbstractSection: function () {

    if (!$(rash_inline_selector).hasAbstract()) {
      var abs = `
        <section id="abs" role=\"doc-abstract\">
          <h1>Abstract</h1>
          <p><br/></p>
        </section>`;

      $(rash_inline_selector).prepend(ZERO_SPACE)
      caret.moveStart($(rash_inline_selector))
      document.execCommand("insertHTML", false, abs);
      $(section_abstract_selector).sanitizeFromSpecialChars()
      caret.moveStart($(section_abstract_selector))
    }
    else
      caret.moveStart($(section_abstract_selector + '>h1'))
  },

  insertAcknowledgementSection: function () {
    if (!$(rash_inline_selector).hasAcknowledgments()) {
      var ack = `
        <section id="ack" role=\"doc-acknowledgements\">
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
            <li id=\"bib${inserted}\" role=\"doc-biblioentry\"><p><br/></p></li>
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
    caret.moveStart($(`li#bib${inserted}`))
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

      if (!node) {
        if ($('section[role="doc-endnotes"]>section').length)
          node = $('section[role="doc-endnotes"]>section:last-child')
        else
          node = $('section[role="doc-endnotes"]>h1')
      }


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

        let paragraph = $(rangy.getSelection().anchorNode).parents('p').first()

        let string

        if (paragraph.text().length != 0) {
          string = `<p><figure id="${this.id}"><p class="rash-math">\`\`${asciiFormula}\`\`</p></figure></p>`
          rashEditor.insertParagraph(paragraph[0])
        }
        else
          string = `<figure id="${this.id}"><p class="rash-math">\`\`${asciiFormula}\`\`</p></figure>`

        // render formula
        document.execCommand("insertHTML", false, string);
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

        //get mathml 
        let mathml = $('figure#' + this.id).find('span[data-mathml]').data('mathml')
        $('figure#' + this.id).html(`<p>${mathml}</p>`)

        captions()
        formulas()
        refreshReferences()

        caret.moveAfterNode($(`figure#${this.id} > p > span.cgen`)[0])
      }
    };
  },

  Listing: function (id) {
    this.selection;
    this.id = id;

    this.add = function () {
      let sel = rangy.getSelection()
      let string = '<br>'
      if (sel && !sel.isCollapsed)
        string = sel.toString()
      document.execCommand("insertHTML", false, `<figure id="${this.id}"><pre>${ZERO_SPACE}<code>${string}</code></pre><figcaption>Caption of the <code>listing</code>.</figcaption></figure>`);
      captions()
    }
  },

  /* END boxes */
};

rashEditor.
  /**
   * [init description]
   * @method init
   * @return {[type]} [description]
   */
  init = function () {

    // paste only text, without style
    $(document)[0].addEventListener("paste", function (e) {

      e.preventDefault();

      var text = e.clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, text);
    });

    var alphabet = [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
      'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z', 'space', ',',
      'shift+a', 'shift+b', 'shift+c', 'shift+d', 'shift+e', 'shift+f', 'shift+g',
      'shift+h', 'shift+i', 'shift+j', 'shift+k', 'shift+l', 'shift+m', 'shift+n',
      'shift+o', 'shift+p', 'shift+q', 'shift+r', 'shift+s', 'shift+t', 'shift+u',
      'shift+v', 'shift+w', 'shift+y', 'shift+z'
    ];

    Mousetrap.bind('mod+s', function (event) {
      executeSave()
      return false
    });

    Mousetrap.bind('mod+shift+s', function (event) {
      addCommitModal()
      return false
    });


    Mousetrap.bind('space', function (event) {
      var sel = rangy.getSelection()

      if (typeof window.getSelection != "undefined" && (caret.checkIfInEditor() || caret.checkIfInHeader())) {
        var node = sel.anchorNode

        var parent = {
          reference: $(node).parents('a[href]:has(span.cgen),a[href]:has(sup.cgen)').last(),
        }

        if (parent.reference.length) {
          rashEditor.exitInline(parent.reference)
          return false
        }
      }
    })

    Mousetrap.bind('backspace', function (event) {
      var sel = rangy.getSelection();
      if (typeof window.getSelection != "undefined" && (caret.checkIfInEditor() || caret.checkIfInHeader())) {
        var node = sel.anchorNode;
        var parent = {
          keywords: $(node).parents('p.keywords').last(),
          categories: $(node).parents('p.acm_subject_categories').last(),
          current_subject: $(node).parents('p.acm_subject_categories > code').last(),
          affiliation: $(node).parents('span.affiliation').last()
        }

        if (parent.keywords.length && parent.keywords.find('ul.list-inline').text() == '') {
          rashEditor.header.removeKeyword(parent.keywords)

        } else if (parent.categories.length && (parent.current_subject.text().length == 1 || sel.toString().length == parent.current_subject.text().length)) {
          rashEditor.header.removeSubject(parent.current_subject)

        } else if (parent.affiliation.length && (parent.affiliation.text().length == 1 || sel.toString().length == parent.affiliation.text().length)) {
          rashEditor.header.removeAffiliation(parent.affiliation)

        }
      }
    })

    Mousetrap.bind('enter', function (event) {
      var sel = rangy.getSelection();
      if (typeof window.getSelection != "undefined" && (caret.checkIfInEditor() || caret.checkIfInHeader())) {
        var node = sel.anchorNode;
        var parent = {

          //header
          subtitle: $(node).parents('h1.title > small').last(),
          title: $(node).parents('h1.title').last(),
          author: {
            name: $(node).parents('strong.author_name').last(),
            email: $(node).parents('code.email').last(),
            affiliation: $(node).parents('span.affiliation').last()
          },
          keywords: $(node).parents('p.keywords').last(),
          current_keyword: $(node).parents('p.keywords code').last(),
          subjects: $(node).parents('p.acm_subject_categories').last(),
          current_subject: $(node).parents('p.acm_subject_categories > code').last(),
          affiliation: $(node).parents('span.affiliation').last(),

          //cross reference
          reference: $(node).parents('a[href]:has(span.cgen),a[href]:has(sup.cgen)').last(),

          //headings
          headings: $(node).parents('h1, h2, h3, h4, h5, h6').first(),

          //inlines
          crossRef: $(node).parents('a.cgen').last(),
          code_inline: $(node).parents('code').last(),
          quote_inline: $(node).parents('q').last(),
          formula_inline: $(node).parents('.inline_formula').last(),
          ol_list: $(node).parents('ol').last(),
          ul_list: $(node).parents('ul').last(),

          //blocks
          pre: $(node).parents('pre').last(),
          blockquote: $(node).parents('blockquote').last(),
          figure: $(node).parents('figure').last(),

          //bibliography
          bibliography: $(node).parents('section[role="doc-bibliography"]').last(),
          endnote: $(node).parents('section[role="doc-endnotes"]').last(),

          //paragraph
          paragraph: $(node).parents('p, div').first(),

          //formula_inline
          formula_inline: $(node).parents('span[data-formula]')
        };

        // header
        if (parent.subtitle.length) {
          if (parent.subtitle.text().length == 1) {
            caret.getNextElement(parent.title)
            parent.subtitle.prev('br').remove()
            parent.subtitle.remove()
          }
          else
            caret.getNextElement(parent.title)
          return false

        } else if (parent.title.length) {
          //caret.getNextElement(parent.title)
          rashEditor.header.insertSubTitle()
          return false

        } else if (parent.author.name.length) {
          caret.getNextElement(parent.author.name)
          return false

        } else if (parent.author.email.length) {
          caret.getNextElement(parent.author.email)
          return false

        } else if (parent.affiliation.length) {

          if (parent.affiliation.hasClass('placeholder')) {
            caret.getNextElement(parent.affiliation)
            parent.affiliation.prev('br').remove()
            parent.affiliation.remove()
          }
          else
            rashEditor.header.addAffiliation()
          return false

        } else if (parent.subjects.length) {
          if (parent.current_subject.text().length == 1) {
            caret.getNextElement(parent.subjects)
            parent.current_subject.prev('br').remove()
            parent.current_subject.remove()
          } else
            rashEditor.header.insertSubject()

          return false
        }

        else if (parent.keywords.length) {
          if (parent.current_keyword.text().length == 1) {
            caret.getNextElement(parent.keywords)
            parent.current_keyword.remove()
          } else
            rashEditor.header.insertKeyword()

          return false

        }

        //cross reference
        else if (parent.reference.length) {
          rashEditor.exitInline(parent.reference)
        }

        //headings
        else if (parent.headings.length) {
          console.log(caret.checkIfBorder())
          if (caret.checkIfBorder() != 1)
            return false
        }

        // inlines
        else if (parent.formula_inline.length) {
          if (parent.formula_inline.find('span[data-mathml]').length)
            rashEditor.exitInline(parent.formula_inline)

          else
            rashEditor.renderInlineFormula(parent.formula_inline)

          return false

        } else if (parent.crossRef.length) {
          rashEditor.exitInline(parent.crossRef);
          return false;

        } else if (parent.code_inline.length) {
          rashEditor.exitInline(parent.code_inline);
          return false;

        } else if (parent.quote_inline.length) {
          rashEditor.exitInline(parent.quote_inline);
          return false;

        } else if (parent.formula_inline.length) {
          rashEditor.renderInlineFormula();
          return false;
        }

        // blocks
        else if (parent.pre.length) {
          document.execCommand('insertHTML', false, '\n')
          return false;

        } else if (parent.figure.length) {
          if (!parent.ul_list.length && !parent.ol_list.length) {
            rashEditor.insertParagraph(parent.figure[0]);
            return false;
          }
        }

        /** bibliography */
        else if (parent.bibliography.length) {
          rashEditor.insertBibliography($(node).parents('li').last())
          return false

        }

        /** endnotes */
        else if (parent.endnote.length) {
          rashEditor.insertParagraph(parent.paragraph[0]);
          //rashEditor.insertEndnote($(node).parents('section[role="doc-endnote"]').last())
          return false
        }

        // paragraph
        else if (parent.paragraph.length) {

          let text = parent.paragraph.text()

          //Check if a section is needed to be inserted
          if (text.substring(0, 1) == '#') {
            let deepness = 0
            let isHash = true

            while (isHash) {
              if (text.substring(0, 1) == '#') {
                text = text.substring(1, text.length).trim()
                deepness++
              }
              else
                isHash = false
            }
            if (deepness > 0) {
              rashEditor.insertSection(deepness, true, text);
              return false
            }
          }

          else if (text.substring(0, 1) == '*') {

            //delete *
            caret.moveStart(parent.paragraph)
            caret.move('character', 1)
            document.execCommand('delete')

            rashEditor.insertUnorderedList()
            return false

          } else if (text.substring(0, 2) == '1.') {

            caret.moveStart(parent.paragraph)
            caret.move('character', 2)
            document.execCommand('delete')
            document.execCommand('delete')

            rashEditor.insertOrderedList()
            return false
          }
        }
      }
      return true;
    });

    Mousetrap.bind(alphabet, function (event, sequence) {
      var sel = rangy.getSelection();
      if (typeof window.getSelection != "undefined" && (caret.checkIfInHeader())) {

        var node = sel.anchorNode;

        var parent = {
          placeholderAffiliation: $(node).parents('span.affiliation.placeholder').last()
        }

        if (parent.placeholderAffiliation.length) {

          parent.placeholderAffiliation.removeClass('placeholder')
          parent.placeholderAffiliation.text('')
        }
      }
    })

    Mousetrap.bind('shift+enter', function (event) {
      var sel = rangy.getSelection();
      if (typeof window.getSelection != "undefined" && (caret.checkIfInEditor() || caret.checkIfInHeader())) {
        var node = sel.anchorNode;
        var parent = {
          title: $(node).parents('h1.title').last(),
          pre: $(node).parents('pre').last(),
          blockquote: $(node).parents('blockquote').last(),
          headings: $(node).parents('h1, h2, h3, h4, h5, h6')
        }

        if (parent.title.length) {
          rashEditor.header.insertSubTitle()
          return false
        }

        else if (parent.pre.length) {
          rashEditor.insertParagraph(parent.pre[0])
          return false
        }

        else if (parent.blockquote.length) {
          rashEditor.insertParagraph(parent.blockquote[0])
          return false
        }

        else if (parent.headings.length) {
          return false
        }
      }
    })

    Mousetrap.bind('tab', function (event) {
      var sel = rangy.getSelection();
      if (typeof window.getSelection != "undefined" && (caret.checkIfInEditor() || caret.checkIfInHeader())) {
        var node = sel.anchorNode;
        var parent = {
          pre: $(node).parents('pre').last(),
          paragraph: $(node).parents('p, div').first()
        }

        if (parent.pre.length) {
          document.execCommand('insertHTML', false, TAB)
          return false

        } else if (parent.paragraph.length) {
          caret.selectNode(parent.paragraph)
          rashEditor.insertQuoteBlock(parent.paragraph.text())
        }
      }
    })

    //Map section and ordered list
    var sections = [
      '# # # # # # enter',
      '# # # # # enter',
      '# # # # enter',
      '# # # enter',
      '# # enter',
      '# enter'
    ];

    // New sections can be added only in a new line
    Mousetrap.bind(sections, function (event, sequence) {
      sequence = sequence.replace('enter', '').replace(/\s/g, ''),
        node = rangy.getSelection().anchorNode;

      // Check if is possible to add new section with shortcuts
      if (node.nodeType == 3 && node.textContent == sequence) {
        rashEditor.insertSection(sequence.length, true);
        return false;
      }

    });

    Mousetrap.bind('mod+shift+f', function (event) {
      rashEditor.insertInlineFormula();
      return false;
    });

    Mousetrap.bind('| enter', function (event) {
      rashEditor.insertQuoteBlock()
      return false;
    });

    Mousetrap.bind('mod+b', function (event) {
      rashEditor.insertBold();
      return false;
    });

    Mousetrap.bind('mod+i', function (event) {
      rashEditor.insertItalic();
      return false;
    });
  };
/** Edit navbar */
function showNavbar() {

  var editNavbar = $(`
      <nav id=\"editNavbar\" class=\"navbar navbar-default navbar-fixed-top cgen editgen\">
        <div class=\"container\">
          <div class=\"row\">
            <div class=\"navbar-left\">

              <div class=\"btn-group\" role=\"group\" aria-label=\"Undo and Redo\">

                <button id="btnUndo" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onclick=\"rashEditor.undo()\" title=\"Undo\" aria-pressed=\"false\">
                  <i class=\"fa fa-undo\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnRedo" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onclick=\"rashEditor.redo()\" title=\"Redo\" aria-pressed=\"false\">
                  <i class=\"fa fa-repeat\" aria-hidden=\"true\"></i>
                </button>

              </div>

              <div class=\"btn-group\" role=\"group\" aria-label=\"Inline elements\">

                <button id="btnStrong" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"rashEditor.insertBold()\" title=\"Strong\" aria-pressed=\"false\">
                  <i class=\"fa fa-bold\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnEm" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"rashEditor.insertItalic()\" title=\"Emphasis\">
                  <i class=\"fa fa-italic\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnInlineCode" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"rashEditor.insertInline(INLINE.CODE)\" title=\"Code\">
                  <i class=\"fa fa-code\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnInlineQuote" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"rashEditor.insertInline(INLINE.QUOTE)\" title=\"Quote\">
                  <i class=\"fa fa-quote-right\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnInlineFormula" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"rashEditor.insertInlineFormula()\" title=\"Inline formula\">
                  <b>∑</b>
                </button>

                <button id="btnSup" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"rashEditor.insertSuperscript()\" title=\"Sup\">
                  <i class=\"fa fa-superscript\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnSub" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"rashEditor.insertSubscript()\" title=\"Sub\">
                  <i class=\"fa fa-subscript\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnReference" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"handleCrossRef()\" title=\"Cross-reference\">
                  <i class=\"fa fa-link\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnFootnote" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"handleFootnote()\" title=\"Footnote\">
                    <i class="fa fa-asterisk" aria-hidden="true"></i>
                </button>

                <button id="btnLink" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"handleExternalLink()\" title=\"External link\">
                  <i class="fa fa-globe" aria-hidden="true"></i>
                </button>
              </div>

              <div class=\"btn-group\" role=\"group\" aria-label=\"Block elements\">
              
                <button id="btnBlockCode" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onclick=\"rashEditor.insertCodeBlock()\" title=\"Code block\" aria-pressed=\"false\">
                  <b>{ }</b>
                </button>

                <button id="btnBlockQuote" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onclick=\"rashEditor.insertQuoteBlock()\" title=\"Block quote\">
                  <i class=\"fa fa-quote-left\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnOrderedList" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onclick=\"rashEditor.insertOrderedList()\" title=\"Orderer list\">
                  <i class=\"fa fa-list-ol\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnUnorderedList" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onclick=\"rashEditor.insertUnorderedList()\" title=\"Unordered list\">
                  <i class=\"fa fa-list-ul\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnBoxTable" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"handleTableBox()\" title=\"Table\">
                  <i class=\"fa fa-table\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnBoxFigure" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\" 
                  onClick=\"handleFigureBox()\" title=\"Figure\">
                  <i class=\"fa fa-picture-o\" aria-hidden=\"true\"></i>
                </button>

                <button id="btnBoxFormula" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"handleFormulaBox();\" title=\"Formula\">
                  <b>&radic;</b>
                </button>

                <button id="btnBoxFormula" type=\"button\" class=\"btn btn-default navbar-btn\" data-toggle=\"tooltip\"
                  onClick=\"handleListingBox()\" title=\"Listing\">
                  <i class="fa fa-list-alt" aria-hidden="true"></i>
                </button>

              </div>

              <div class=\"btn-group\" role=\"group\" aria-label=\"Sections\" id=\"sectionDropdown\">
                  <button class=\"btn btn-default navbar-btn\" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Insert sections
                    <span class="caret"></span>
                  </button>
                  <ul class=\"dropdown-menu\" aria-labelledby=\"sectionDropdown\">
                    <li onclick=\"rashEditor.insertAbstractSection()\" id=\"addAbstract\"><a>Abstract</a></li>
                    <li onclick=\"rashEditor.insertAcknowledgementSection()\" id=\"addAbstract\"><a>Acknowledgement</a></li>
                    <!--<li onclick=\"rashEditor.insertBibliography()\" id=\"addBibliography\"><a>Bibliography</a></li>-->
                    <li role=\"separator\" class=\"divider\"></li>
                    <li class="disabled" onclick=\"if(!$(this).hasClass('disabled')) rashEditor.insertSection(1,false)\"><a>Section 1.</a></li>
                    <li class="disabled" onclick=\"if(!$(this).hasClass('disabled')) rashEditor.insertSection(2,false)\"><a>Section 1.1.</a></li>
                    <li class="disabled" onclick=\"if(!$(this).hasClass('disabled')) rashEditor.insertSection(3,false)\"><a>Section 1.1.1.</a></li>
                    <li class="disabled" onclick=\"if(!$(this).hasClass('disabled')) rashEditor.insertSection(4,false)\"><a>Section 1.1.1.1.</a></li>
                    <li class="disabled" onclick=\"if(!$(this).hasClass('disabled')) rashEditor.insertSection(5,false)\"><a>Section 1.1.1.1.1.</a></li>
                    <li class="disabled" onclick=\"if(!$(this).hasClass('disabled')) rashEditor.insertSection(6,false)\"><a>Section 1.1.1.1.1.1.</a></li>
                  </ul>
                </div>
          </div>

            <ul class="nav navbar-nav navbar-right">

              <li>
                <span id="github"></span>
              </li>
            </li>
          </div>
        </div>
      </nav>`
  )

  var messageDealer = $('<div id="messageDealer"><p class="text-primary">Hello from message dealer</p></div>')

  // add navbar and button
  $('body').prepend(editNavbar);
  $('body').append(messageDealer);

  $('#sectionDropdown').on('show.bs.dropdown', function (event) {
    savedSelection = rangy.saveSelection();
  });

  $('#sectionDropdown').on('hide.bs.dropdown', function (event) {
    rangy.restoreSelection(savedSelection);
  });
}

function updateDropdown() {
  if (typeof window.getSelection != "undefined" && caret.checkIfInEditor()) {
    var dropdown = $('#sectionDropdown'),
      sel = rangy.getSelection();

    var nodeList = $(rangy.getSelection().anchorNode).parentsUntil(rash_inline_selector, "section")

    if (nodeList) {

      let count = nodeList.length + 1
      dropdown.find('li').removeClass('disabled')

      for (let x = 0; x < count - 1; x++)
        if (nodeList[x].hasAttribute('role')) {
          if (nodeList[x].getAttribute('role') == 'doc-abstract')
            count = 1

          else
            count = 0
        }

      dropdown.find(`li:gt(${2 + count})`).addClass('disabled')
    }
  }
}
/** End editNavar */

function addTableModal() {

  $("#customizeTableModal").remove();
  $("body").append($(`
    <div id=\"customizeTableModal\" class=\"modal fade cgen editgen\" tabindex=\"-1\" role=\"dialog\" contenteditable=\"false\">
      <div class=\"modal-dialog modal-sm\" role=\"document\">
        <div class=\"modal-content\">

          <div class=\"modal-header\">
            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">
              <span aria-hidden=\"true\">&times;</span>
            </button>
            <h4>Customize table</h4>
          </div>

          <div class=\"modal-body\">
            <form>
              <div class=\"form-group\">
                <h4>Table size</h4>
              </div>
              <div class=\"form-group\">
                <label for=\"rows\">Rows</label>
                <input type=\"number\" class=\"form-control\" id=\"rows\" placeholder=\"Rows\">
              </div>
              <div class=\"form-group\">
                <label for=\"cols\">Columns</label>
                <input type=\"number\" class=\"form-control\" id=\"cols\" placeholder=\"Columns\">
              </div>
              <div class=\"form-group\">
                <h4>Table heading</h4>
              </div>
              <div class=\"form-group\">
                <button id=\"top\" type=\"button\" class=\"btn btn-primary\" data-toggle=\"button\" aria-pressed=\"false\" autocomplete=\"off\">Top</button>
                <button id=\"left\" type=\"button\" class=\"btn btn-primary\" data-toggle=\"button\" aria-pressed=\"false\" autocomplete=\"off\">Left</button>
              </div>
            </form>
          </div>

          <div class=\"modal-footer\">
            <button id=\"deleteTable\" type=\"button\" class=\"btn btn-danger\" data-dismiss=\"modal\">Delete table</button>
            <button id=\"customizeTable\" type=\"button\" class=\"btn btn-success\" data-dismiss=\"modal\">Customize</button>
          </div>

        </div>
      </div>
    </div>
  `).on("show.bs.modal", function (event) {

      var id = $(event.relatedTarget).parents("figure").attr("id");

      $(this).find("input#rows").val(window[id].getRows());
      $(this).find("input#cols").val(window[id].getCols());

      $(this).find("input#cols, input#rows").on('keypress', function (e) {
        if (e.key == 'e')
          e.preventDefault()
        else if (e.key == ',')
          e.preventDefault()
        else if (e.key == '.')
          e.preventDefault()
        else if (e.key == '-')
          e.preventDefault()
        else if (e.key == '+')
          e.preventDefault()
      })

      $("button").removeClass("active");
      if (window[id].hasTopHeading())
        $(this).find("button#top").addClass("active");
      if (window[id].hasLeftHeading())
        $(this).find("button#left").addClass("active");

      $("#deleteTable").on("click", function (event) {
        event.preventDefault();
        window[id].delete();
        window[id] = null;
      });

      $("#customizeTable").on("click", function (event) {
        event.preventDefault();

        let inputRows, inputColumns
        try {
          inputRows = Number($("input#rows").val())
          inputColumns = Number($("input#cols").val())

          window[id].addDelRows($("input#rows").val() - window[id].getRows());
          window[id].addDelCols($("input#cols").val() - window[id].getCols());
        }
        catch (err) {
          alert('Error, please type only numbers')
        }

      });

      $("#top").on("click", function (event) {
        window[id].toggleTopHead();
      });

      $("#left").on("click", function (event) {
        window[id].toggleLeftHead();
      });
    }));
}

/** */

function addExternalLinkModal() {
  let info = {
    'id': 'linkModal',
    'selector': '#linkModal',
    'title': 'Add external link'
  }

  let html = {
    'body': `
      <p>Type the URL </p>
      <input type="text" id="linkUrl" class="form-control" placeholder="https://raje.com"/>
    `,
    'footer': `
      <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      <button type="button" class="btn btn-success" data-dismiss="modal">Add Link</button>
    `
  }

  let events = [
    {
      'selector': 'button.btn-success',
      'trigger': 'click',
      'behaviour': function () {
        let link = $(info.selector).find('input#linkUrl').val()

        $(info.selector).modal('hide');

        window['externalLink'].addLink(link);
      }
    }
  ]

  populateModal(info, html, events)
}

/** */

function addCrossRefModal() {

  let info = {
    'id': 'crossRefModal',
    'selector': '#crossRefModal',
    'title': 'Select the element to cross-refers'
  }

  let html = {
    'body': `
      ${window['crossReference'].getAllReferenceables()}
    `,
    'footer': `
      <button type="button" class="btn" data-dismiss="modal">Close</button>
    `
  }

  let events = [
    {
      'selector': '.list-group>a[data-ref]',
      'trigger': 'click',
      'behaviour': function () {
        let ref = $(this).data('ref')
        let type = $(this).data('type')

        $(info.selector).modal('hide');
        window['crossReference'].add(ref, type);
      }
    },
    {
      'selector': '.list-group>a[data-type="addBiblioentry"]',
      'trigger': 'click',
      'behaviour': function () {
        $(info.selector).modal('hide')

        window['crossReference'].addBiblioentry(rashEditor.insertBibliography())
      }
    }
  ]

  populateModal(info, html, events)
}

/**  */

function addFormulaEditorModal(id) {

  let info = {
    'id': 'formulaEditorModal',
    'selector': `#formulaEditorModal`,
    'title': 'Formula editor'
  }

  let html = {
    'body': `
      <input id="sender" type="hidden" value="${id}"/>
      <div class="container-fluid">
        <div class="row">
          <div class="form-group text-center">
            <p id="formula_output" class="rash-math">\`\`\`\`</p>
          </div>
        </div>
        <div class="row">
          <textarea class="form-control" id="formula_input" columns="3" autofocus></textarea>
        </div>
        <div class="row">
          <div class="btn-group btn-group-justified" role="group" aria-label="Math formulas editor">
            <div class="btn-group" role="">
              <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Operations <span class="caret"></span>
              </button>
              <ul class="dropdown-menu">
                <li><a class="rash-math" data-code=\"+\">       \`\`  +     \`\`</a></li>
                <li><a class="rash-math" data-code=\"-\">       \`\`  -     \`\`</a></li>
                <li><a class="rash-math" data-code=\"*\">       \`\`  *     \`\`</a></li>
                <li><a class="rash-math" data-code=\"**\">      \`\`  **    \`\`</a></li>
                <li><a class="rash-math" data-code=\"***\">     \`\`  ***   \`\`</a></li>
                <li><a class="rash-math" data-code=\"//\">      \`\`  //    \`\`</a></li>
                <li><a class="rash-math" data-code=\"\\\\\">    \`\`  \\\\  \`\`</a></li>
                <li><a class="rash-math" data-code=\"xx\">      \`\`  xx    \`\`</a></li>
                <li><a class="rash-math" data-code=\"-:\">      \`\`  -:    \`\`</a></li>
                <li><a class="rash-math" data-code=\"@\">       \`\`  @     \`\`</a></li>
                <li><a class="rash-math" data-code=\"o+\">      \`\`  o+    \`\`</a></li>
                <li><a class="rash-math" data-code=\"o.\">      \`\`  o.    \`\`</a></li>
                <li><a class="rash-math" data-code=\"sum\">     \`\`  sum   \`\`</a></li>
                <li><a class="rash-math" data-code=\"prod\">    \`\`  prod  \`\`</a></li>
                <li><a class="rash-math" data-code=\"^^\">      \`\`  ^^    \`\`</a></li>
                <li><a class="rash-math" data-code=\"^^^\">     \`\`  ^^^   \`\`</a></li>
                <li><a class="rash-math" data-code=\"vv\">      \`\`  vv    \`\`</a></li>
                <li><a class="rash-math" data-code=\"vvv\">     \`\`  vvv   \`\`</a></li>
                <li><a class="rash-math" data-code=\"nn\">      \`\`  nn    \`\`</a></li>
                <li><a class="rash-math" data-code=\"nnn\">     \`\`  nnn   \`\`</a></li>
                <li><a class="rash-math" data-code=\"uu\">      \`\`  uu    \`\`</a></li>
                <li><a class="rash-math" data-code=\"uuu\">     \`\`  uuu   \`\`</a></li>
              </ul>
            </div>
            <div class=\"btn-group\" role=\"\">
              <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">
                Misc <span class=\"caret\"></span>
              </button>
              <ul class=\"dropdown-menu\">
                <li><a class="rash-math" data-code=\"int\">     \`\`  int     \`\`</a></li>
                <li><a class="rash-math" data-code=\"oint\">    \`\`  oint    \`\`</a></li>
                <li><a class="rash-math" data-code=\"del\">     \`\`  del     \`\`</a></li>
                <li><a class="rash-math" data-code=\"grad\">    \`\`  grad    \`\`</a></li>
                <li><a class="rash-math" data-code=\"+-\">      \`\`  +-      \`\`</a></li>
                <li><a class="rash-math" data-code=\"O/\">      \`\`  O/      \`\`</a></li>
                <li><a class="rash-math" data-code=\"oo\">      \`\`  oo      \`\`</a></li>
                <li><a class="rash-math" data-code=\"aleph\">   \`\`  aleph   \`\`</a></li>
                <li><a class="rash-math" data-code=\"/_\">      \`\`  /_      \`\`</a></li>
                <li><a class="rash-math" data-code=\":.\">      \`\`  :.      \`\`</a></li>
                <li><a class="rash-math" data-code=\"|...|\">   \`\`  |...|   \`\`</a></li>
                <li><a class="rash-math" data-code=\"|cdots|\"> \`\`  |cdots| \`\`</a></li>
                <li><a class="rash-math" data-code=\"vdots\">   \`\`  vdots   \`\`</a></li>
                <li><a class="rash-math" data-code=\"ddots\">   \`\`  ddots   \`\`</a></li>
                <li><a class="rash-math" data-code=\"|__\">     \`\`  |__     \`\`</a></li>
                <li><a class="rash-math" data-code=\"__|\">     \`\`  __|     \`\`</a></li>
                <li><a class="rash-math" data-code=\"|~\">      \`\`  |~      \`\`</a></li>
                <li><a class="rash-math" data-code=\"~|\">      \`\`  ~|      \`\`</a></li>
                <li><a class="rash-math" data-code=\"CC\">      \`\`  CC      \`\`</a></li>
                <li><a class="rash-math" data-code=\"NN\">      \`\`  NN      \`\`</a></li>
                <li><a class="rash-math" data-code=\"RR\">      \`\`  RR      \`\`</a></li>
                <li><a class="rash-math" data-code=\"ZZ\">      \`\`  ZZ      \`\`</a></li>
              </ul>
            </div>
            <div class=\"btn-group\" role=\"\">
              <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">
                Relations <span class=\"caret\"></span>
              </button>
              <ul class=\"dropdown-menu\">
                <li><a class="rash-math" data-code=\"=\">       \`\`  =     \`\`</a></li>
                <li><a class="rash-math" data-code=\"!=\">      \`\`  !=    \`\`</a></li>
                <li><a class="rash-math" data-code=\"<\">       \`\`  <     \`\`</a></li>
                <li><a class="rash-math" data-code=\">\">       \`\`  >     \`\`</a></li>
                <li><a class="rash-math" data-code=\"<=\">      \`\`  <=    \`\`</a></li>
                <li><a class="rash-math" data-code=\">=\">      \`\`  >=    \`\`</a></li>
                <li><a class="rash-math" data-code=\"-<\">      \`\`  -<    \`\`</a></li>
                <li><a class="rash-math" data-code=\">-\">      \`\`  >-    \`\`</a></li>
                <li><a class="rash-math" data-code=\"in\">      \`\`  in    \`\`</a></li>
                <li><a class="rash-math" data-code=\"!in\">     \`\`  !in   \`\`</a></li>
                <li><a class="rash-math" data-code=\"sub\">     \`\`  sub   \`\`</a></li>
                <li><a class="rash-math" data-code=\"sup\">     \`\`  sup   \`\`</a></li>
                <li><a class="rash-math" data-code=\"sube\">    \`\`  sube  \`\`</a></li>
                <li><a class="rash-math" data-code=\"supe\">    \`\`  supe  \`\`</a></li>
                <li><a class="rash-math" data-code=\"-=\">      \`\`  -=    \`\`</a></li>
                <li><a class="rash-math" data-code=\"~=\">      \`\`  ~=    \`\`</a></li>
                <li><a class="rash-math" data-code=\"~~\">      \`\`  ~~    \`\`</a></li>
                <li><a class="rash-math" data-code=\"prop\">    \`\`  prop  \`\`</a></li>
              </ul>
            </div>

            <div class=\"btn-group\" role=\"\">
              <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">
                Symbols <span class=\"caret\"></span>
              </button>
              <ul class=\"dropdown-menu\">
                <li><a class="rash-math" data-code=\"and\">     \`\`  and   \`\`</a></li>
                <li><a class="rash-math" data-code=\"or\">      \`\`  or    \`\`</a></li>
                <li><a class="rash-math" data-code=\"not\">     \`\`  not   \`\`</a></li>
                <li><a class="rash-math" data-code=\"=>\">      \`\`  =>    \`\`</a></li>
                <li><a class="rash-math" data-code=\"if\">      \`\`  if    \`\`</a></li>
                <li><a class="rash-math" data-code=\"iff\">     \`\`  iff   \`\`</a></li>
                <li><a class="rash-math" data-code=\"AA\">      \`\`  AA    \`\`</a></li>
                <li><a class="rash-math" data-code=\"EE\">      \`\`  EE    \`\`</a></li>
                <li><a class="rash-math" data-code=\"_|_\">     \`\`  _|_   \`\`</a></li>
                <li><a class="rash-math" data-code=\"TT\">      \`\`  TT    \`\`</a></li>
                <li><a class="rash-math" data-code=\"|--\">     \`\`  |--   \`\`</a></li>
                <li><a class="rash-math" data-code=\"|==\">     \`\`  |==   \`\`</a></li>
              </ul>
            </div>

            <div class=\"btn-group\" role=\"\">
              <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">
                Formulas <span class=\"caret\"></span>
              </button>
              <ul class=\"dropdown-menu\">
                <li><a class="rash-math" data-code=\"|X|\">           \`\`  |X|           \`\`</a></li>
                <li><a class="rash-math" data-code=\"X!\">            \`\`  X!            \`\`</a></li>
                <li><a class="rash-math" data-code=\"sqrt(x)\">       \`\`  sqrt(x)       \`\`</a></li>
                <li><a class="rash-math" data-code=\"x^y\">           \`\`  x^y           \`\`</a></li>
                <li><a class="rash-math" data-code=\"epsilon^x\">     \`\`  epsilon^x     \`\`</a></li>
                <li><a class="rash-math" data-code=\"ln(x)\">         \`\`  ln(x)         \`\`</a></li>
                <li><a class="rash-math" data-code=\"exp(x)\">        \`\`  exp(x)        \`\`</a></li>
                <li><a class="rash-math" data-code=\"log(x)\">        \`\`  log(x)        \`\`</a></li>
                <li role="separator" class="divider"></li>
                <li><a class="rash-math" data-code=\"sin(x)\">        \`\`  sin(x)        \`\`</a></li>
                <li><a class="rash-math" data-code=\"cos(x)\">        \`\`  cos(x)        \`\`</a></li>
                <li><a class="rash-math" data-code=\"tan(x)\">        \`\`  tan(x)        \`\`</a></li>
                <li><a class="rash-math" data-code=\"cot(x)\">        \`\`  cot(x)        \`\`</a></li>
                <li><a class="rash-math" data-code=\"sinh(x)\">       \`\`  sinh(x)       \`\`</a></li>
                <li><a class="rash-math" data-code=\"cosh(x)\">       \`\`  cosh(x)       \`\`</a></li>
                <li><a class="rash-math" data-code=\"tanh(x)\">       \`\`  tanh(x)       \`\`</a></li>
                <li><a class="rash-math" data-code=\"coth(x)\">       \`\`  coth(x)       \`\`</a></li>
                <li role="separator" class="divider"></li>
                <li><a class="rash-math" data-code=\"lim_(x->oo)\">   \`\`  lim_(x->oo)   \`\`</a></li>
                <li><a class="rash-math" data-code=\"sum_(x=0)^n\">   \`\`  sum_(x=0)^n   \`\`</a></li>
                <li><a class="rash-math" data-code=\"((a,b),(c,d))\"> \`\`  ((a,b),(c,d)) \`\`</a></li>
                <li><a class="rash-math" data-code=\"[[a,b],[c,d]]\"> \`\`  [[a,b],[c,d]] \`\`</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `,
    'footer': `
      <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      <button type="button" class="btn btn-success">Add formula</button>
    `
  }

  let events = [
    {
      'selector': `#formula_input`,
      'trigger': 'input propertychange paste',
      'behaviour': function () {
        MathJax.Hub.Queue([
          'Text',
          MathJax.Hub.getAllJax($('#formula_output')[0])[0],
          $('#formula_input').val()
        ])
      }
    },
    {
      'selector': `li>a[data-code]`,
      'trigger': 'click',
      'behaviour': function () {

        let code = $(this).data('code')
        let text = $('#formula_input').val()

        $('#formula_input').val(text + ` ${code} `)
        MathJax.Hub.Queue([
          'Text',
          MathJax.Hub.getAllJax($('#formula_output')[0])[0],
          $('#formula_input').val()
        ])
      }
    },
    {
      'selector': `.btn-success`,
      'trigger': 'click',
      'behaviour': function () {

        let id = $('#sender').val()
        let formula = $('#formula_input').val()

        $(info.selector).modal('hide')

        window[id].addBlock(formula)
      }
    }
  ]

  opt = function () {

    MathJax.Hub.processSectionDelay = 0;
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }

  populateModal(info, html, events, opt)
}

/** */

function addTableSettingsModal() {
  let info = {
    'id': 'customizeTableModal',
    'selector': '#customizeTableModal',
    'title': 'Customize table'
  }

  let html = {
    'body': `
      <form>
        <div class=\"form-group\">
          <h4>Table size</h4>
        </div>

        <div class=\"form-group\">
          <label for=\"rows\">Rows</label>
          <input type=\"number\" class=\"form-control\" id=\"rows\" placeholder=\"Rows\">
        </div>

        <div class=\"form-group\">
          <label for=\"cols\">Columns</label>
          <input type=\"number\" class=\"form-control\" id=\"cols\" placeholder=\"Columns\">
        </div>

        <div class=\"form-group\">
          <h4>Table heading</h4>
        </div>
        <div class=\"form-group\">
          <button id=\"top\" type=\"button\" class=\"btn btn-primary\" data-toggle=\"button\" aria-pressed=\"false\" autocomplete=\"off\">Top</button>
          <button id=\"left\" type=\"button\" class=\"btn btn-primary\" data-toggle=\"button\" aria-pressed=\"false\" autocomplete=\"off\">Left</button>
        </div>
      </form> `,
    'footer': `
      <button id=\"deleteTable\" type=\"button\" class=\"btn btn-danger\" data-dismiss=\"modal\">Delete table</button>
      <button id=\"customizeTable\" type=\"button\" class=\"btn btn-success\" data-dismiss=\"modal\">Customize</button>`
  }

  let events = [
    {
      'selector': '#customizeTableModal',
      'trigger': 'show.bs.modal',
      'behaviour': function (event) {

        var id = $(event.relatedTarget).parents("figure").attr("id");

        $(this).find("input#rows").val(window[id].getRows());
        $(this).find("input#cols").val(window[id].getCols());

        $("button").removeClass("active");
        if (window[id].hasTopHeading())
          $(this).find("button#top").addClass("active");
        if (window[id].hasLeftHeading())
          $(this).find("button#left").addClass("active");

        $("#deleteTable").on("click", function (event) {
          event.preventDefault();
          window[id].delete();
          window[id] = null;
        });

        $("#customizeTable").on("click", function (event) {
          event.preventDefault();
          window[id].addDelRows($("input#rows").val() - window[id].getRows());
          window[id].addDelCols($("input#cols").val() - window[id].getCols());
        });

        $("#top").on("click", function (event) {
          window[id].toggleTopHead();
        });

        $("#left").on("click", function (event) {
          window[id].toggleLeftHead();
        });
      }
    }
  ]

  populateModal(info, html, events)
}

/** */

function selectImageFileModal(id) {
  let info = {
    'id': 'selectImageModal',
    'selector': '#selectImageModal',
    'title': 'Select image file'
  }

  let html = {
    'body': `
      <div class="container-fluid">
        <div class="row">
          <div class="form-group">
            <label for="inputFile">Select file</label>
            <p><input class="form-control" type="file" id="inputFile" accept="image/*"></p>
          </div>
          <div class="form-group">
            <label for="inputUrl">Type url</label>
            <input type="text" class="form-control" id="inputUrl" placeholder="https://rash.com/img/rash.png">
          </div>
          <p class="help-block">Select a local image <b>or</b> type a url image.</p>
        </div>
      </div>
    `,
    'footer': `
      <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      <button type="button" class="btn btn-success">Add image</button>
    `
  }

  let events = [
    {
      'selector': 'button.btn-success',
      'trigger': 'click',
      'behaviour': function () {

        file = $('#inputFile')[0].files[0]
        $(info.selector).modal('hide')

        if ($('#inputFile').val())
          window[id].save(file)

        else if ($('#inputUrl').val()) {
          window[id].saveFromUrl($('#inputUrl').val())
        }
      }
    }
  ]

  populateModal(info, html, events)

}

/** */

function addCommitModal() {

  let info = {
    'id': 'commitModal',
    'selector': '#commitModal',
    'title': 'Insert comment'
  }

  let html = {
    'body': `
      <p>Insert comment commit</p>
      <textarea class="form-control" type="text" id="commitMessage"></textarea>
    `,
    'footer': `
      <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      <button type="button" class="btn btn-success" data-dismiss="modal">Commit</button>
    `
  }

  let events = [
    {
      'selector': 'button.btn-success',
      'trigger': 'click',
      'behaviour': function () {
        let comment = $(info.selector).find('#commitMessage').val()
        executePush(comment)
      }
    }
  ]

  populateModal(info, html, events)
}

/**
 * 
 * Functions used to create modal programmatically
 * 
 */

function populateModal(info, html, events, opt) {

  createModal(info, html)

  if (events) {
    events.forEach(function (event) {
      $(info.selector).find(event.selector).on(event.trigger, event.behaviour)
    })
  }

  if (opt) {
    opt()
  }

  $(info.selector).modal("show")
}

function createModal(info, html) {

  $(info.selector).remove()

  $('body').append($(
    `<div id="${info.id}" class="modal fade" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">${info.title}</h4>
          </div>
          <div class="modal-body">${html.body}</div>
          <div class="modal-footer">${html.footer}</div>
        </div>
      </div>
    </div>`))
}

var tableOptions = `
  <span data-toggle=\"modal\" data-toggle=\"modal\" data-target=\"#customizeTableModal\"
    class=\"tableOptions cgen editgen\" contenteditable=\"false\">
    <button id=\"dLabel\" type=\"button\" class=\"btn btn-default\" aria-haspopup=\"true\" aria-expanded=\"false\">
      <i class=\"fa fa-cog\" aria-hidden=\"true\"></i>
    </button>
  </span>`
  ;

function showMessageDealer(text, style, delay) {

  $(messageDealer).html(`<p class="text-${style ? style : 'primary'}">${text}</p>`)

  if (delay)
    setTimeout(hideMessageDealer, delay);

  $(messageDealer).show()
}

let loadingMessageDealerIntervalID

function fancyLoadingMessageDealer() {

  let text = $(messageDealer).text()

  loadingMessageDealerIntervalID = window.setInterval(function () {

    let currentText = $(messageDealer).text().replace(text, '')

    if (currentText.length >= 6) {
      $(messageDealer).text(text)

    } else {
      currentText += '.'
      $(messageDealer).text(text + currentText)
    }
  }, 500);
}

function hideMessageDealer() {
  $(messageDealer).hide()

  if (loadingMessageDealerIntervalID)
    window.clearInterval(loadingMessageDealerIntervalID)
}

function updateGithubButton() {
  if (settings && settings.avatar && checkSoftware()) {
    $('span#github').html(`
        <div class=\"btn-group\" role=\"group\" aria-label=\"Sections\">
          <button class=\"btn btn-default navbar-btn\" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <img class="avatar" src="${settings.avatar}" alt="Github profile picture"/> <span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <li class="dropdown-header">Signed as <b>${settings.login}</b></li>
            <li><a onclick="addCommitModal()">Push</a></li>
            <li role="separator" class="divider"></li>
            <li><a onclick="githubLogout()">Logout</a></li>
          </ul>
        </div>`)

  } else {

    $('span#github').html(`
      <button onclick=\"githubLogin()\" id="btnGithub" type=\"button\" class=\"btn btn-default navbar-btn\" 
      data-toggle=\"tooltip\" title=\"Login with github\">
        <i class=\"fa fa-github\" aria-hidden=\"true\"></i>
      </button>`)
  }
}

function refreshToolbar() {

  let sel = rangy.getSelection()
  if (typeof window.getSelection != "undefined") {

    //enable/disable clickable add section buttons in dropdown
    updateDropdown()

    $('#editNavbar button').removeAttr('disabled')
    $('#sectionDropdown > button').removeClass('disabled')

    // activate/deactivate strong button
    strong = $(sel.anchorNode).parents('strong, b').length > 0
    setButtonWithVar('#btnStrong', strong)

    // activate/deactivate em button
    em = $(sel.anchorNode).parents('em, i').length > 0
    setButtonWithVar('#btnEm', em)

    // activate/deactivate code button
    code = $(sel.anchorNode).parents('code').length > 0 && !$(sel.anchorNode).parents('pre').length
    setButtonWithVar('#btnInlineCode', code)

    // activate/deactivate quote button
    q = $(sel.anchorNode).parents('q').length > 0
    setButtonWithVar('#btnInlineQuote', q)

    ol = $(sel.anchorNode).parents('ol').length
    setButtonWithVar('#btnOrderedList', ol)

    ul = $(sel.anchorNode).parents('ul').length
    setButtonWithVar('#btnUnorderedList', ul)

    let figure = $(sel.anchorNode).parents('figure').length
    disableButtonWithVar('#btnBoxTable, #btnBoxFormula, #btnBoxFigure', figure)

    if (caret.checkIfInHeading()) {
      $('nav#editNavbar div[aria-label="Inline elements"] button, nav#editNavbar div[aria-label="Block elements"] button').attr('disabled', true)
      $('#btnStrong, #btnEm, #btnInlineCode').removeAttr('disabled')
    }

    if ($(sel.anchorNode).parents('section[role="doc-bibliography"]').length) {
      $('nav#editNavbar button').attr('disabled', true)
      $('#btnLink').removeAttr('disabled')
    }

    if (caret.checkIfInHeader()) {
      $('#editNavbar button').attr('disabled', true)
      $('#sectionDropdown > button').addClass('disabled')
    }

    //disableButtonWithVar('#btnStrong, #btnEm, #btnInlineCode', caret.checkIfInHeading())

  }
}

function setButtonWithVar(id, variable) {
  if (variable)
    $(id).addClass('active')
  else
    $(id).removeClass('active')
}

function disableButtonWithVar(id, variable) {
  if (variable)
    $(id).attr('disabled', true)
  else
    $(id).removeAttr('disabled')
}

function showAuthorSettings() {
  $('address.lead.authors').each(function () {

    if (!$(this).find('span.authorSettings').length)
      $(this).prepend(`<span class=\"btn-group btn-group-sm authorSettings\" role=\"group\" aria-label=\"Undo and Redo\">

        <button type=\"button\" class=\"btn btn-default navbar-btn\"
          onclick="rashEditor.header.removeAuthor($(this).parents('address.lead.authors'))" aria-pressed=\"false\">
          <i class="fa fa-trash-o" aria-hidden="true"></i>
        </button>

        <!--
        <button id="btnToggleReorganize" type=\"button\" class=\"btn btn-default navbar-btn\" 
          onclick="rashEditor.header.handleReorganizeAuthors()" aria-pressed=\"false\">
          <i class="fa fa-arrows-alt" aria-hidden="true"></i>
        </button>
        -->

        <button type=\"button\" class=\"btn btn-default navbar-btn\"
          onclick="rashEditor.header.addAuthor($(this).parents('address.lead.authors'))" aria-pressed=\"false\">
          <i class="fa fa-plus" aria-hidden="true"></i>
        </button>

      </span>`)
  })
}

function updateTitle(title) {
  $('h1.title').text(title)
}
function execDerash() {

  rashFile = $('<html></html>')

  rashFile.attr('xmlns', 'http://www.w3.org/1999/xhtml')

  rashFile.append(derashHeader())
  rashFile.append(derashBody())

  let beautifiedRash = '<!DOCTYPE html>\n' + new XMLSerializer().serializeToString(beautifyRash(rashFile)[0])
  return beautifiedRash
}

function derashHeader() {

  let head = $('<head></head>')

  /** meta */

  head.append('<meta charset="UTF-8">')
  head.append('<meta name="viewport" content="width=device-width, initial-scale=1" />')

  /** End meta */

  /** import */

  head.append("<script>window.$ = window.jQuery = require('./js/jquery.min.js');</script>")

  if (!$('head').find('script[src="js/jquery.min.js"]').length)
    head.append('<script src="js/jquery.min.js"></script>')

  $('link[rel=stylesheet]').each(function () {
    head.append(`<link rel="stylesheet" href="${$(this).attr('href')}" />`)
  })

  $('head > script[src]').each(function () {
    head.append(`<script src="${$(this).attr('src')}"></script>`)
  })

  /** End import */


  /* .title */

  let title = $('header h1.title').text()

  if ($('header h1.title > small').length > 0) {

    let subtitle = $('header h1.title > small').text()
    title = title.replace(subtitle, '')
    title += ` -- ${subtitle}`
  }

  head.append(`<title>${title}</title>`)

  /* /End .title */

  /* authors */

  let affiliations = []

  $('header address.lead.authors').each(function () {

    let email = $(this).find('code.email').text()

    head.append(`<meta about="mailto:${email}" typeof="schema:Person" property="schema:name" name="dc.creator" content="${$(this).find('strong.author_name').text()}" />`)
    head.append(`<meta about="mailto:${email}" property="schema:email" content="${email}" />`)

    $(this).find('span.affiliation').each(function (index) {

      console.log($(this).text())
      console.log(affiliations.indexOfContent($(this).text()))

      if (affiliations.indexOfContent($(this).text()) > -1) {
        let pos = affiliations.indexOfContent($(this).text())
        index = parseInt(affiliations[pos].index.replace('affiliation', ''))

      } else {
        index = affiliations.length + 1
      }

      //create new affiliation
      let affiliation = {
        'index': `affiliation${index}`,
        'content': $(this).text()
      }

      head.append(`<link about="mailto:${email}" property="schema:affiliation" href="${affiliation.index}" />`)

      //Insert the new affiliation
      affiliations.push(affiliation)

      //Lookup if an affiliation is equal as the last inserted 
      //If is true, pop the last inserted affiliation
      for (var i = 0; i < affiliations.length - 1; i++) {
        if (affiliations[i].index == affiliation.index)
          affiliations.pop()
      }
    })
  })

  for (var i = 0; i < affiliations.length; i++) {
    head.append(`<meta about="${affiliations[i].index}" typeof="schema:Organization" property="schema:name" content="${affiliations[i].content}"/>`)
  }

  /* /End authors */

  /** keywords */

  $('p.keywords li>code').each(function () {
    head.append(`<meta property="prism:keyword" content="${$(this).text()}" />`)
  })

  /** End keywords */

  /** acm subject categories */

  $('p.acm_subject_categories>code').each(function () {
    let content = collapseWhiteSpaces($(this).text())
    head.append(`<meta name="dcterms.subject" content="${content}" />`)
  })

  /** End acm subject categories */

  return head
}

function derashBody() {

  let body = $('<body></body>')

  /**  sections */

  $(rash_inline_selector + '>section').each(function () {

    let section = $('<section></section>')

    if ($(this).has('[role]')) {
      section.attr('role', $(this).attr('role'))
    }

    if ($(this).has('[id]'))
      section.attr('id', $(this).attr('id'))

    section.find('pre').each(function () {
      $(this).data('content', $(this).html())
    })

    section.html(removeWhiteSpaces($(this).html()))

    body.append(section)
  })

  // Formula block
  body.find('span[data-mathml]').each(function () {
    let mathml = $(this).data('mathml')
    $(this).parents('figure').html(`<p>${mathml}</p>`)
  })

  // Formula inline
  body.find('span[data-formula]:has(span[data-mathml])').each(function () {
    let mathml = $(this).find('span[data-mathml]').data('mathml')
    $(this).html(`<span class="rash-math">${mathml}</span>`)
  })

  body.find('tbody').each(function () { })

  /** End sections */

  /** Replace b with strong */
  body.find('b').each(function () {
    $(this).replaceWith(`<strong>${$(this).html()}</strong>`)
  })

  /** replace i with em */
  body.find('i').each(function () {
    $(this).replaceWith(`<em>${$(this).html()}</em>`)
  })

  /** replace reference  */
  body.find('a').each(function () {
    if ($(this).has('[style]')) {
      $(this).removeAttr('style')
    }
  })

  /** remove stored selection */
  body.find('span[id^=selectionBoundary]').each(function () {
    $(this).remove()
  })

  body.find('span[style]').each(function () {
    $(this).replaceWith($(this).html())
  })

  /** Add paragraph inside li without p */
  body.find('section:not([role]) li:not(p)').each(function () {
    $(this).replaceWith(`<li><p>${$(this).html()}</p></li>`)
  })

  body.find('h2, h3, h4, h5, h6').each(function () {
    $(this).replaceWith(`<h1>${$(this).html()}</h1>`)
  })

  body.find('section > div').each(function () {
    if ($(this).text() != undefined)
      $(this).replaceWith(`<p>${$(this).html()}</p>`)
  })

  /** Handle cgen */

  body.find('strong.cgen').each(function () {
    let originalContent = $(this).data('rash-original-content')
    $(this).replaceWith(originalContent)
  })

  body.find('figcaption>span.cgen').each(function () {
    $(this).replaceWith($(this).html())
  })

  /** handle references */
  body.find('a[href]:has(span.cgen)').each(function () {

    let originalContent = $(this).find('span.cgen').data('rash-original-content')
    let href = $(this).attr('href')

    $(this).replaceWith(`<a href="${href}">${originalContent}</a>`)
  })

  body.find('li').each(function () {
    $(this).html(`<p>${$(this).html()}</p>`)
  })
  /** handle footnote reference */

  body.find('a[href]:has(sup.cgen)').each(function () {
    let originalContent = $(this).find('sup.fn.cgen').data('rash-original-content')
    let href = $(this).attr('href')
    $(this).replaceWith(`<a href="${href}">${originalContent}</a>`)
  })

  body.find('section[role="doc-endnotes"]>section:not([role])').each(function () {
    $(this).remove()
  })

  body.find('section[role="doc-bibliography"] li>span').each(function () {
    $(this).remove()
  })

  body.find('a[name][title]').each(function () {
    $(this).remove()
  })

  /** replace &nbsp; with blank */

  body.find('*').each(function () {

    $(this).html($(this).html().replace(ONE_SPACE, ' '))

    if ($(this).html() == '')
      $(this).remove()
  })

  body.find('.tableOptions').each(function () {
    $(this).remove()
  })

  body.find('p,span').each(function () {
    let text = removeWhiteSpaces($(this).html())
    if (text == '')
      $(this).remove()
  })

  /** End notes */

  body.find('section[role="doc-endnotes"]>h1').remove()

  body.find('section[role="doc-endnotes"]>section').each(function () {
    $(this).find('sup.hidden-print.cgen').remove()
  })

  return body
}

function beautifyRash(article) {

  let headElements = 'script,title,link,meta',
    blocks = 'figcaption, h1, p, pre, th',
    containers = 'blockquote, figure, html, li, ol, section, table, td, tr, ul'

  article.find(blocks + ',' + headElements).each(function () {
    let count = $(this).parents('*').length
    let html = addTabs(count, $(this)[0].outerHTML) + '\n'

    $(this).replaceWith(html)
  })

  article.find('li').each(function () {
    handleContainer($(this))
  })

  article.find('ol,ul').each(function () {
    handleContainer($(this))
  })

  article.find('blockquote').each(function () {
    handleContainer($(this))
  })

  article.find('td').each(function () {
    handleContainer($(this))
  })

  article.find('tr').each(function () {
    handleContainer($(this))
  })

  article.find('tbody').each(function () {
    handleContainer($(this))
  })
  article.find('table').each(function () {
    handleContainer($(this))
  })

  article.find('figure').each(function () {
    handleContainer($(this))
  })

  handleSections(article)

  article.find('body,head').prepend('\n')
  article.find('body').append('\n')

  article.find('body,head').before('\n')
  article.find('body').after('\n')

  return article

}

function handleSections(article) {

  let selector = 'section>section>section>section>section>section',
    deepness = selector.split('>')

  while (deepness.length > 0) {
    article.find(selector).each(function () {
      handleContainer($(this))
    })
    deepness.pop()
    selector = deepness.join('>')
  }
}

/**  */

function handleContainer(container) {
  container.prepend('\n')
  container.replaceWith(addTabsToContainers(container.parents().length, container[0].outerHTML) + '\n')
}

function addTabs(count, element) {

  let tabs = ''
  do {
    tabs += TAB
    count--
  } while (count > 0)
  return tabs + element
}

function addTabsToContainers(count, element) {

  let tabs = ''
  do {
    tabs += TAB
    count--
  } while (count > 0)
  return indentClosingTag(tabs, tabs + element)
}

function collapseWhiteSpaces(string) {
  return string.replace(/\s\s+/g, ' ')
}

function removeWhiteSpaces(string) {
  return string.replace(/\s\s+/g, '')
}

function indentClosingTag(tabs, string) {
  let array = string.split('</')
  if (array.length >= 2) {
    array[array.length - 2] += tabs
    return array.join('</')
  }
}

const { ipcRenderer, webFrame } = require('electron'),
  fs = require('fs')

/** Receive settings info (3) */
ipcRenderer.on('githubSettings', (event, args) => {

  window['settings'] = args
  updateGithubButton()
  console.log(settings)
})

ipcRenderer.on('addNewAuthor', (event, arg) => {

  rashEditor.header.addAuthor()
})

ipcRenderer.on('setRemoveAuthors', (event, arg) => {

  rashEditor.header.setRemoveAuthors()
})

ipcRenderer.on('unsetRemoveAuthors', (event, arg) => {

  rashEditor.header.unsetRemoveAuthors()
})

ipcRenderer.on('setReorganizeAuthors', (event, arg) => {

  rashEditor.header.setReorganizeAuthors()
})

ipcRenderer.on('unsetReorganizeAuthors', (event, arg) => {

  rashEditor.header.unsetReorganizeAuthors()
})

ipcRenderer.on('insertKeyword', (event) => {
  rashEditor.header.insertKeyword()
})

ipcRenderer.on('insertSubject', (event) => {
  rashEditor.header.insertSubject()
})

ipcRenderer.on('setPreviewMode', (event) => {

  $(rash_inline_selector).setNotEditable()
})

ipcRenderer.on('setEditorMode', (event) => {

  $(rash_inline_selector).setEditable()
})

ipcRenderer.on('doSavefromMain', (event, arg) => {

  if (arg)
    executeSaveSync()

  else
    executeSave()

})

ipcRenderer.on('updateMessageDealer', (event, arg) => {
  hideMessageDealer()
  showMessageDealer(arg.text, arg.style, arg.delay)
})

ipcRenderer.on('updateTitle', (event, title) => {
  updateTitle(title)
})

/** check if is connected */
function checkLogin() {
  return typeof window['settings'] !== 'undefined'
}

function checkSoftware() {
  return ipcRenderer.sendSync('isSoftware')
}
/** Do login */
function githubLogin() {
  ipcRenderer.send('doGithubOAuth')
}

/** Do logout */
function githubLogout() {
  ipcRenderer.send('githubLogout')
  window['settings'] = null
  updateGithubButton()
}

function executeSaveAsync() {
  ipcRenderer.send('doSave', execDerash())
}

function executeSaveSync() {

  //set edit_state and body content
  updateEditState()

  ipcRenderer.sendSync('githubSettings', execDerash())
  ipcRenderer.send('closeWindow')
}

function executePush(comment) {
  ipcRenderer.send('doPush', { 'comment': comment, 'article': execDerash() })
  showMessageDealer('Syncing repo', 'primary')
  fancyLoadingMessageDealer()
}

function sendWriteFigure(file) {
  ipcRenderer.sendSync('writeFigureSync', { 'name': file.name, 'path': file.path })
}

function sendWriteFigureFromUrl(url) {
  return ipcRenderer.sendSync('writeFigureFromUrlSync', { 'url': url })
}

function setEditState() {
  ipcRenderer.send('setEditState', edit_state)
}


window['settings'] = ipcRenderer.sendSync('getGithubSettingsSync')
console.log(settings)