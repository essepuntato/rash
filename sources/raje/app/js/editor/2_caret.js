caret = {

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
    return $(window.getSelection().anchorNode).parents('h1,h2,h3').length;
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
    sel.addRange(range);
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
  }
};
