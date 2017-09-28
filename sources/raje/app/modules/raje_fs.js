const fs = require('fs-extra')
const RAJE_HIDDEN_FILE = '.raje'

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

        this.writeRajeHiddenFile(path, err => {
          if (err) return callback(err)

          return callback(null, 'Hooray! all changes has been saved!')
        })
      })
    })
  },

  /**
   * This method only updates the template.html file and copy/rewrite the images
   */
  saveArticle: function (path, document, callback) {

    // Overwrite the template.html with the document
    fs.writeFile(`${path}/template.html`, document, (err, res) => {
      if (err) return callback(err)

      this.writeRajeHiddenFile(path, err => {
        if (err) return callback(err)

        return callback(null, 'Hooray! all changes has been saved!')
      })

    })

  },

  /**
   * Write the hidden RAJE file, to 
   */
  writeRajeHiddenFile: function (path, callback) {

    fs.writeFile(`${path}/${RAJE_HIDDEN_FILE}`, '', (err, res) => {

      if (err) return callback(err)

      return callback(null)
    })
  },

  /**
   * 
   */
  checkRajeHiddenFile: function (path, callback) {
    fs.readdir(path, (err, fileArray) => {
      if (err) return callback(err)

      // Control if inside the root folder there is the .raje file
      let hiddenFileFound = false
      fileArray.forEach(function (file) {
        if (file == RAJE_HIDDEN_FILE)
          hiddenFileFound = true
      })

      if (hiddenFileFound)
        return callback(null)

      else
        return callback('Error, this is not a RAJE file')
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