const fs = require('fs-extra')

module.exports = {

  /**
   * Execute the first save for the article
   * it will create the new folder or "replace" the existing one
   */
  saveArticleFirstTime: function (path, document, callback) {

    // If the directory already exists, first remove it
    if (fs.existsSync(path))
      fs.removeSync(path)

    // In any case create the new directory
    fs.mkdir(path, (err, res) => {

      if (err) return callback(err)

      // This copies the content of each directory in this array
      global.ASSETS_DIRECTORIES.forEach(function (directoryPath) {

        // Get the name of the 
        let directoryPathName = `${path}/${directoryPath.split('/')[directoryPath.split('/').length - 1]}`

        // It tries to create the directory and copy its content
        fs.mkdir(directoryPathName, err => {
          if (err) return callback(err)

          fs.copy(directoryPath, directoryPathName, err => {
            if (err) return callback(err)
          })
        })
      })

      // Create the template file
      fs.writeFile(`${path}/template.html`, document, (err, res) => {
        if (err) return callback(err)

        return callback(null, true)
      })
    })
  }
}