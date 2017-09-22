const fs = require('fs-extra')

module.exports = {

  /**
   * Execute the first save for the article, it will create the new folder or "replace" the existing one
   */
  saveArticleFirstTime: function (path, document, callback) {

    // If the directory already exists, first remove it
    if (fs.existsSync(path)) {

      fs.removeSync(path)
    }

    // In any case create the new directory
    fs.mkdir(path, (err, res) => {

      if (err) return callback(err)

      // Copy the assets directory content into the new directory
      fs.copy(global.ASSETS_DIRECTORY, path, (err) => {
        if (err) return callback(err)

        fs.writeFile(`${path}/template.html`, document, (err, res) => {
          if (err) return callback(err)

          return callback(null, true)
        })
      })
    })
  }
}