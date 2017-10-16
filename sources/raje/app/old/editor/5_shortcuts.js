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