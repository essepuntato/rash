storage = require('electron-json-storage')

const recentArticlesString = 'recentArticles'
const githubSettingsString = 'githubSettings'

module.exports = {

  recentArticles: [],
  getRecentArticles: function (callback) {
    storage.get(recentArticlesString, (err, data) => {
      if (err)
        callback(err)
      else
        callback(null, data)
    })
  },

  setRecentArticles: function (recentArticles) {
    storage.set(recentArticlesString, recentArticles, (err) => {
      if (err) throw err
    })
  },

  removeRecentArticle: function (toDeleteArticle, callback) {
    storage.get('recentArticles', (err, data) => {
      if (err)
        return callback(err)

      let found = false
      for (var i = 0; i < data.length; i++) {
        let article = data[i]
        if (article.fullPath == toDeleteArticle.fullPath && article.title == toDeleteArticle.title) {
          data.splice(i, 1)
          found = true
          break
        }
      }
      if (!found)
        return callback('Article not found')

      storage.set('recentArticles', data, (err) => {
        if (err) return callback(err)
        return callback(null)
      })
    })
  },

  getGithubSettings: function (callback) {
    storage.get(githubSettingsString, (err, data) => {
      if (err)
        callback(err)
      else
        callback(null, data)
    })
  },

  setGithubSettings: function (settings, callback) {
    storage.set(githubSettingsString, settings, (err) => {
      if (err)
        callback(err)
      else
        callback(null)
    })
  },

  removeGithubSettings: function (callback) {
    storage.remove(githubSettingsString, (err) => {
      if (err)
        callback(err)
      else
        callback(null)
    })
  },

  pushRecentArticles: function (lastArticle) {

    this.getRecentArticles((err, data) => {

      recentArticles = data

      //check if is empty
      if (recentArticles.constructor !== Array)
        recentArticles = []

      // check if last article is already inside array
      // if is true remove the article and left only the last one
      recentArticles.push(lastArticle)
      for (var i = 0; i <= recentArticles.length - 2; i++) {
        if (lastArticle.fullPath == recentArticles[i].fullPath)
          recentArticles.splice(i, 1)
      }

      // update settings
      this.setRecentArticles(recentArticles)
    })
  },

  clear: function () {
    storage.clear((err) => {
      if (err) throw err
    })
  }
}