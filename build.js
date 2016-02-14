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
            context: path.join(__dirname, 'demos', demo.id)
          , entry: './index.js'
          , output: {
              path: path.join(__dirname, 'dist')
            , filename: demo.id + '.js'
            , sourceMapFilename: demo.id + '.map.json'
            , pathinfo: process.env.NODE_ENV !== 'production'
            }}, webpackConfig)
          , compiler = webpack(demoConfig)

        compiler.run(next)
      })
    ], cb)
  })
}
