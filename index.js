var Hapi = require('hapi')
  , glob = require('glob')
  , fs = require('fs')
  , hbs = require('handlebars')
  , inert = require('inert')
  , assert = require('assert')
  , async = require('async')
  , _ = require('lodash')
  , build = require('./build')
  , loadDemos = require('./demo-index')
  , indexTemplateSource = fs.readFileSync('templates/index.hbs').toString()
  , indexTemplate = hbs.compile(indexTemplateSource)
  , demoTemplateSource = fs.readFileSync('templates/demo.hbs').toString()
  , demoTemplate = hbs.compile(demoTemplateSource)
  , server = new Hapi.Server()
  , startedAt = Date.now()
  , logWrap = function logWrap (fn, message) {
      return function (next) {
        fn(function () {
          console.log('  ' + message + ' (' + (Date.now() - startedAt) + 'ms)')

          next.apply(null, Array.prototype.slice.call(arguments))
        })
      }
    }

server.connection({ port: process.env.PORT || 8080 })

console.log('Starting server')

async.auto({
  inert: function (next) {
    server.register(inert, next)
  }
, demos: logWrap(loadDemos, 'demos globbed')
, assets: logWrap(_.bind(glob, null, 'assets/*'), 'assets globbed')
, distExists: logWrap(function (next) {
    fs.stat('dist', function (err, stats) {
      next(null, err ? false : stats.isDirectory())
    })
  }, 'checked for dist directory')
, build: ['distExists', logWrap(function (next, results) {
    // Don't rebuild in prod unless dist is missing for some reason
    if (process.env.NODE_ENV === 'production' && results.distExists) {
      next()
    }
    else {
      build(next)
    }
  }, 'built demos')]
}, function (err, results) {
  assert.ifError(err)

  // Register demo routes
  results.demos.forEach(function (demo) {
    server.route({
      method: 'GET',
      path: demo.URL,
      handler: function (request, reply) {
        reply(demoTemplate({
          demoName: demo.name
        , scriptURL: demo.scriptURL
        }))
      }
    })

    server.route({
      method: 'GET',
      path: demo.scriptURL,
      handler: function (request, reply) {
        reply.file(demo.scriptDist)
      }
    })
  })

  // Register asset routes
  results.assets.forEach(function (assetPath) {
    server.route({
      method: 'GET',
      path: '/' + assetPath,
      handler: function (request, reply) {
        reply.file(assetPath)
      }
    })
  })

  server.route({
    method: 'GET'
  , path: '/'
  , handler: function (req, resp) {
      resp(indexTemplate({
        demos: results.demos
      }))
    }
  })

  server.start(() => {
    console.log('Server running at:', server.info.uri)
  })
})
