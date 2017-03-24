const { ipcRenderer } = require('electron')

$(document).ready(function () {

  /** Create new article */
  $('#btnCreateArticle').on('click', function () {

    attachNewArticleModal()
  })

  /** Open article */
  $('#btnOpenArticle').on('click', function () {

    ipcRenderer.send('selectDirectory')
  })

  $('#btnCloneArticle').on('click', function () {

    //ipcRenderer.send('cloneDirectory')
  })

  //get and show recent files
  let recents = ipcRenderer.sendSync('getRecentArticles')
  if (recents) {
    $('div#recents').html(`<div id="recentArticles" class="list-group"></div>`)

    for (var i = recents.length - 1; i >= 0; i--) {
      let article = recents[i]
      $('div#recentArticles').append(`
        <div class="media" data-article='${JSON.stringify(article)}'>
          <button type="button" class="close" aria-label="Close"><span aria-hidden="true">×</span></button>
          <div class="media-body">
            <h4 class="media-heading">${article.title}</h4>
            <p>${article.folderPath}</p>
          </div>
        </div>
      `)
    }

    $('div.media[data-article]').on('click', function () {
      let article = $(this).data('article')
      ipcRenderer.send('openSelectedArticle', article)
    })

    $('div.media[data-article]>button.close').on('click', function () {
      let article = $(this).parents('div.media[data-article]').data('article')

      if (ipcRenderer.sendSync('removeSelectedArticle', article))
        $(this).parents('div.media[data-article]').remove()

      return false
    })
  }
})

function attachNewArticleModal() {
  let info = {
    'id': 'newArticleModal',
    'selector': '#newArticleModal',
    'title': 'Setting up'
  }

  let html = {
    'body': `
      <form class="form-horizontal">

        <div class="form-group">
          <label class="col-sm-2 control-label">Select the folder where the article will be saved</label>
          <div class="col-sm-10">
            <div class="input-group">
              <input id="txtPath" type="text" class="form-control">
              <span class="input-group-btn">
                <button id="btnShowFolderSelector" class="btn btn-default" type="button">Select folder</button>
              </span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="col-sm-2 control-label">Insert the name of the File</label>
          <div class="col-sm-10">
            <input id="txtTitle" type="text" class="form-control"/>
          </div>
        </div>

      </form>
    `,
    'footer': `
      <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      <button type="button" class="btn btn-success">Create article</button>
    `
  }

  let events = [
    {
      'selector': 'button.btn-success',
      'trigger': 'click',
      'behaviour': function () {

        let settings = {
          'path': $('#txtPath').val(),
          'title': $('#txtTitle').val()
        }

        if ((typeof settings.path !== 'undefinied' && settings.path != '') && (typeof settings.title !== 'undefinied' && settings.title != '')) {
          let res = ipcRenderer.sendSync('createArticle', settings)
          if (res) alert(res)
        }
      }
    },
    //btnShowFolderSelector
    {
      'selector': 'button#btnShowFolderSelector',
      'trigger': 'click',
      'behaviour': function () {
        $('#txtPath').val(ipcRenderer.sendSync('selectDirectorySync'))
      }
    }
  ]

  populateModal(info, html, events)
}

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
    `<div id="${info.id}" class="modal fade modal-sm" tabindex="-1" role="dialog">
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