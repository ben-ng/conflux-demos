var glob = require('glob')
  , titlecase = require('titlecase')
  , async = require('async')
  , fs = require('fs')
  , path = require('path')
  , marked = require('marked')

module.exports = function (cb) {
  glob('demos/*', function (err, demos) {
    if (err) {
      cb(err)
      return
    }

    async.map(demos, function (globbed, next) {
      var demoId = globbed.match(/\/([^.]+)/)[1]
        , readmePath = path.join(__dirname, 'demos', demoId, 'README.md')

      fs.readFile(readmePath, {encoding: 'utf8'}, function (err, data) {
        if (err) {
          next(err)
          return
        }

        next(null, {
          id: demoId
        , name: titlecase(demoId)
        , readme: marked(data.toString())
        , URL: '/' + demoId
        , scriptSource: globbed + '/index.js'
        , scriptMap: 'dist/' + demoId + '.map.json'
        , scriptDist: 'dist/' + demoId + '.js'
        , scriptDistURL: '/dist/' + demoId + '.js'
        , scriptMapURL: '/dist/' + demoId + '.map.json'
        })
      })
    }, cb)
  })
}
