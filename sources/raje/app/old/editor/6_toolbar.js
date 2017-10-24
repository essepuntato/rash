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