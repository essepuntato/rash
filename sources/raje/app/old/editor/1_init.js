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