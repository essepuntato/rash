const storage = require('electron-json-storage')
const datetime = require('node-datetime')

global.RECENT_ARTICLE_STORAGE = "RECENT_ARTICLE_STORAGE"

module.exports = {

  /**
   * 
   */
  recentArticles: [],

  /**
   * 
   */
  createRecentArticleEntry: function (path, title) {
    var dt = datetime.create()

    return {
      path: `${path}/${global.TEMPLATE}`,
      title: title,
      date: `Created on ${dt.format('d/m/y')} at ${dt.format('H:M')}`
    }
  },

  /**
   * 
   */
  pushRecentArticleEntry: function (newArticle) {

    this.getRecentArticles((err, data) => {
      if (err) return callback(err)

      // Update recentArticles
      this.recentArticles = data

      // Push the new article and check if is already created
      // In this case remove the new article
      this.recentArticles.push(newArticle)
      for (var i = 0; i <= newArticle.length - 2; i++) {
        if (newArticle.path == recentArticles[i].path)
          recentArticles.splice(i, 1)
      }

      this.updateRecentArticles(this.recentArticles)
    })
  },

  /**
   * 
   */
  popRecentArticleEntry: function (path) {

  },

  /**
   * Update the recentArticles Array
   */
  updateRecentArticles: function (recentArticles) {
    storage.set(global.RECENT_ARTICLE_STORAGE, recentArticles, err => {
      if (err) throw callback(err)
    })
  },

  /**
   * 
   */
  getRecentArticles: function (callback) {

    storage.get(global.RECENT_ARTICLE_STORAGE, (err, data) => {
      if (err) return callback(err)

      this.recentArticles = data

      if (this.recentArticles.constructor !== Array)
        this.recentArticles = []

      return callback(null, this.recentArticles)
    })
  },

  /**
   * 
   */
  clearAll: function () {
    storage.clear(err => {
      if (err) return console.log(err)
    })
  }
}