const fs = require('fs')
const ncp = require('ncp').ncp

module.exports = {

  /**
   * Execute the save for the article, it will create the new folder or update the existing one
   */
  saveArticleFirstTime: function (path, document, callback) {

    // Check if the directory already exists (note that the OS already ask if users want to replace the directory)
    fs.exists(path, (err, res) => {

      if (err) return callback(err)

      // Create the new directory
      fs.mkdir(path, (err, res) => {

        if (err) return callback(err)

        return callback(null, 'Directory created')
      })
    })
  },

  /**
   * 
   */
  copyDefaultAssets: function () {

    
  }
}