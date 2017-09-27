const fs = require('fs-extra')


module.exports = {

  /**
   * Execute the first save for the article
   * it will create the new folder or "replace" the existing one
   */
  saveAsArticle: function (path, document, callback) {

    // If the directory already exists, first remove it
    if (fs.existsSync(path))
      fs.removeSync(path)

    // In any case create the new directory
    fs.mkdir(path, (err, res) => {

      if (err) return callback(err)

      // This copies the content of each directory in this array
      global.ASSETS_DIRECTORIES.forEach(function (directoryPath) {

        // Tries to copy the folder content only if the directory exists
        if (fs.existsSync(directoryPath)) {

          // Get the name of the 
          let directoryPathName = `${path}/${directoryPath.split('/')[directoryPath.split('/').length - 1]}`

          // It tries to create the directory and copy its content
          fs.mkdir(directoryPathName, err => {
            if (err) return callback(err)

            fs.copy(directoryPath, directoryPathName, err => {
              if (err) return callback(err)
            })
          })
        }
      })

      // Create the template file
      fs.writeFile(`${path}/template.html`, document, (err, res) => {
        if (err) return callback(err)

        return callback(null, true)
      })
    })
  },

  /**
   * 
   */
  saveArticle: function (path, document, callback) {

    // Overwrite the template.html with the document
    fs.writeFile(`${path}/template.html`, document, (err, res) => {
      if (err) return callback(err)

      return callback(null, true)
    })
    
  },
  /**
   * Save the image in the temporary folder
   */
  saveImageTemp: function (image, callback) {

    // If the directory doesn't exist, create it
    if (!fs.existsSync(global.IMAGE_TEMP))
      fs.mkdirpSync(global.IMAGE_TEMP)

    // Copy (reand and write) the image into the temporary image folder
    fs.readFile(image, (err, data) => {
      if (err) return callback(err)

      // Get the image name
      let filename = image.split('/')[image.split('/').length - 1]

      fs.writeFile(`${global.IMAGE_TEMP}/${filename}`, data, err => {
        if (err) return callback(err)

        return callback(null, `img/${filename}`)
      })
    })
  },

  /**
   * Remove the temporary folder
   */
  removeImageTempFolder: function () {
    if (fs.existsSync(global.IMAGE_TEMP))
      fs.removeSync(global.IMAGE_TEMP)
  }
}