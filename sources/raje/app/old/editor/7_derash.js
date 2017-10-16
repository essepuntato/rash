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
