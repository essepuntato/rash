rashEditor.
  /**
   * [init description]
   * @method init
   * @return {[type]} [description]
   */
  init = function () {

    // paste only text, without style
    $(rash_inline_selector)[0].addEventListener("paste", function (e) {

      e.preventDefault();

      var text = e.clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, text);
    });

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
          reference: $(node).parents('a[href]:has(span.cgen),a[href]:has(sup.cgen)').last()
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
          code: $(node).parents('code').last()
        }

        if (parent.keywords.length && parent.keywords.find('ul.list-inline').text() == '') {
          rashEditor.header.removeKeyword(parent.keywords)

        } else if (parent.categories.length && (parent.code.text().length == 1 || sel.toString().length == parent.code.text().length)) {
          rashEditor.header.removeSubject(parent.code)
        }

      }
    })

    Mousetrap.bind('enter', function (event) {
      var sel = rangy.getSelection();
      if (typeof window.getSelection != "undefined" && (caret.checkIfInEditor() || caret.checkIfInHeader())) {
        var node = sel.anchorNode;
        var parent = {

          //header
          keywords: $(node).parents('p.keywords').last(),
          subjects: $(node).parents('p.acm_subject_categories').last(),
          title: $(node).parents('h1.title').last(),
          affiliation: $(node).parents('span.affiliation').last(),

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
          endnote: $(node).parents('section[role="doc-endnotes"]').last()
        };

        // header
        if (parent.title.length) {
          rashEditor.header.insertSubTitle()
          return false

        } else if (parent.affiliation.length) {
          rashEditor.header.addAffiliation()
          return false

        } else if (parent.keywords.length) {
          rashEditor.header.insertKeyword()
          return false

        } else if (parent.subjects.length) {
          rashEditor.header.insertSubject()
          return false

        }

        // inlines
        else if (parent.crossRef.length) {
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
          rashEditor.insertParagraph(parent.pre[0]);
          return false;

        } else if (parent.blockquote.length) {
          rashEditor.insertParagraph(parent.blockquote[0]);
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
          rashEditor.insertEndnote($(node).parents('section[role="doc-endnote"]').last())
          return false
        }
      }
      return true;
    });

    var alphabet = [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
      'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z', 'space', ',',
      'shift+a', 'shift+b', 'shift+c', 'shift+d', 'shift+e', 'shift+f', 'shift+g',
      'shift+h', 'shift+i', 'shift+j', 'shift+k', 'shift+l', 'shift+m', 'shift+n',
      'shift+o', 'shift+p', 'shift+q', 'shift+r', 'shift+s', 'shift+t', 'shift+u',
      'shift+v', 'shift+w', 'shift+y', 'shift+z'
    ];


    //Map section and ordered list
    var sections = [
      '# # # # # # enter',
      '# # # # # enter',
      '# # # # enter',
      '# # # enter',
      '# # enter',
      '# enter'
    ];

    var orderedListMaps = [
      '1 . enter',
      '2 . enter',
      '3 . enter',
      '4 . enter',
      '5 . enter',
      '6 . enter',
      '7 . enter',
      '8 . enter',
      '9 . enter'
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

    Mousetrap.bind('* enter', function (event) {
      rashEditor.insertUnorderedList()
      return false;
    });

    Mousetrap.bind(orderedListMaps, function (event) {
      rashEditor.insertOrderedList()
      return false;
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