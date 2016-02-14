var glob = require('glob')
  , titlecase = require('titlecase')

module.exports = function (cb) {
  glob('demos/*', function (err, demos) {
    cb(err, demos != null ? demos.map(function (globbed) {
      var demoId = globbed.match(/\/([^.]+)/)[1]

      return {
        id: demoId
      , name: titlecase(demoId)
      , URL: '/' + demoId
      , scriptSource: globbed + '/index.js'
      , scriptMap: 'dist/' + demoId + '.map.json'
      , scriptDist: 'dist/' + demoId + '.js'
      , scriptDistURL: '/dist/' + demoId + '.js'
      , scriptMapURL: '/dist/' + demoId + '.map.json'
      }
    }) : null)
  })
}
