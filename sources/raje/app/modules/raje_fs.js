const fs = require('fs-extra')
const cheerio = require('cheerio')

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
      fs.writeFile(`${path}/${global.TEMPLATE}`, document, (err, res) => {
        if (err) return callback(err)

        this.writeRajeHiddenFile(path, err => {
          if (err) return callback(err)

          return callback(null, 'Hooray! all changes has been saved!')
        })
      })
    })
  },

  /**
   * This method only updates the index.html file and copy/rewrite the images
   */
  saveArticle: function (path, document, callback) {

    // Overwrite the index.html with the document
    fs.writeFile(`${path}/${global.TEMPLATE}`, document, err => {
      if (err) return callback(err)

      // Copy/rewrite all images
      this.copyAssetImages(err => {
        if (err) return callback(err)

        // Write .raje file
        this.writeRajeHiddenFile(path, err => {
          if (err) return callback(err)

          return callback(null, 'Hooray! all changes has been saved!')
        })
      })
    })
  },

  /**
   * Copy all temporary images
   */
  copyAssetImages: function (callback) {

    let destinationFolderImage = `${global.savePath}/img`

    if (fs.existsSync(global.IMAGE_TEMP)) {

      // If the destination folder image doesn't exists
      if (!fs.existsSync(destinationFolderImage))
        fs.mkdirpSync(destinationFolderImage)

      fs.readdir(global.IMAGE_TEMP, (err, images) => {
        if (err) return callback(err)

        images.forEach(function (image) {

          fs.createReadStream(`${global.IMAGE_TEMP}/${image}`).pipe(fs.createWriteStream(`${destinationFolderImage}/${image}`))
        })

        return callback(null)
      })
    }
    return callback(null)
  },

  /**
   * Write the hidden RAJE file, to 
   */
  writeRajeHiddenFile: function (path, callback) {

    // Check if the hidden .raje file exists
    this.checkRajeHiddenFile(path, (err) => {

      // If there is an error, the file doesn't exist
      if (err)

        // Write the hidden .raje file
        return fs.writeFile(`${path}/${RAJE_HIDDEN_FILE}`, '', (err, res) => {

          if (err) return callback(err)

          return callback(null)
        })

      return callback(null)
    })


  },

  /**
   * Search inside the folder if there is a .raje file
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
        return callback('Error, this is not a hidden .raje file')
    })
  },

  /**
   * Save the image in the temporary folder OR in the assets folder
   */
  saveImageTemp: function (image, callback) {

    // The folder where images have to be stored
    let destinationPath = (global.isWrapper) ? global.IMAGE_TEMP : `${global.savePath}/img`

    // If the directory doesn't exist, create it
    if (!fs.existsSync(destinationPath))
      fs.mkdirpSync(destinationPath)

    // Copy (read and write) the image into the temporary image folder
    fs.readFile(image, (err, data) => {
      if (err) return callback(err)

      // Get the image name
      let filename = image.split('/')[image.split('/').length - 1]
      let destinationFilename = `${destinationPath}/${filename}`

      fs.writeFile(destinationFilename, data, err => {
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
  },

  /**
   * 
   */
  addRajemceInArticle: function (path, callback) {

    path = path.replace('file://', '')

    fs.readFile(path, 'utf8', (err, data) => {
      if (err) return callback(err)

      const $ = cheerio.load(data, {
        normalizeWhitespace: true
      })

      $('script[src="js/jquery.min.js"]')
        .after(`<script src="js/rajemce/init_rajemce.js" data-rash-original-content=""/>`)

      fs.writeFile(path, $.html())

      return callback(null)
    })
  },

  removeRajemceInArticle: function (path, callback) {

    path = path.replace('file://', '')

    fs.readFile(path, 'utf8', (err, data) => {
      if (err) return callback(err)

      const $ = cheerio.load(data, {
        normalizeWhitespace: true
      })

      $('script[src="js/rajemce/init_rajemce.js"]').remove()

      fs.writeFile(path, $.html())

      return callback(null)
    })
  }
}