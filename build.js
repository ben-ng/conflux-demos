var webpack = require('webpack')
  , webpackConfig = require('./webpack-config')
  , async = require('async')
  , _ = require('lodash')
  , path = require('path')
  , rimraf = require('rimraf')
  , loadDemos = require('./demo-index')

module.exports = function build (cb) {
  loadDemos(function (err, demos) {
    if (err) {
      cb(err)
      return
    }

    async.series([
      async.apply(rimraf, path.join(__dirname, 'dist'))
    , async.apply(async.forEachOfSeries, demos, function (demo, idx, next) {
        var demoConfig = _.defaults({
            context: path.join(__dirname, 'demos')
          , entry: path.join(__dirname, demo.scriptSource)
          , output: {
              path: path.join(__dirname, 'dist')
            , filename: demo.id + '.js'
            }}, webpackConfig)
          , compiler = webpack(demoConfig)

        compiler.run(next)
      })
    ], cb)
  })
}
