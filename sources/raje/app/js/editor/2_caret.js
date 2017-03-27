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
