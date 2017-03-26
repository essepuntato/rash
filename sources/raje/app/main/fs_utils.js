const superagent = require('superagent')
const fs = require('fs')
const request = require('request')

module.exports = {

  getRajeSettingsContent: function (dirPath) {
    let isRaje
    fs.readdirSync(dirPath).forEach((file) => {
      if (file == '.raje')
        isRaje = fs.readFileSync(`${dirPath}/${file}`, 'utf8')
    })
    return isRaje
  },

  // Writing in the article the new body 
  writeArticleLocally: function (article, articleBody) {
    fs.writeFile(article.fullPath, articleBody, (err) => {
      if (err) throw err
      return
    })
  },

  writeFigureSync: function (currentArticle, image, callback) {

    let dirPath = `${currentArticle.folderPath}/img`
    let filepath = `${dirPath}/${image.name}`

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }

    fs.createReadStream(image.path)
      .pipe(fs.createWriteStream(filepath))
      .on('close', () => {
        callback(null)
      })
  },

  writeFigureFromUrlSync: function (currentArticle, url, callback) {

    let dirPath = `${currentArticle.folderPath}/img`

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }

    superagent
      .get(url)
      .end((err, res) => {
        if (err) callback(err)

        let filepath = url.split('/')[url.split('/').length - 1]

        if (!fs.existsSync(filepath) || (fs.existsSync(filepath) && fs.writeFileSync(filepath) != res.body)) {
          fs.writeFile(filepath, res.body, (err) => {
            callback(null, filepath)
          })
        }
      })
  }
}