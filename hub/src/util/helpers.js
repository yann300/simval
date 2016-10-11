module.exports = {
  readFile: function (filename, callback) {
    var fs = require('fs')
    try {
      console.log('reading ' + filename)
      if (callback) {
        fs.readFile(filename, 'utf8', callback)
      } else {
        return fs.readFileSync(filename, 'utf8')
      }
    } catch (e) {
      console.log(e)
      if (callback) {
        callback(e)
      } else {
        return e
      }
    }
  }
}
