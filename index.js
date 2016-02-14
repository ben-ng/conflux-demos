var Hapi = require('hapi')
  , glob = require('glob')
  , fs = require('fs')
  , hbs = require('handlebars')
  , inert = require('inert')
  , assert = require('assert')
  , async = require('async')
  , _ = require('lodash')
  , enhanceServer = require('gaggle').enhanceServerForSocketIOChannel
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
        fn.apply(null, [function () {
          console.log('  ' + message + ' (' + (Date.now() - startedAt) + 'ms)')

          next.apply(null, Array.prototype.slice.call(arguments))
        }].concat(Array.prototype.slice.call(arguments, 1)))
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
    if (results.distExists && process.env.NODE_ENV === 'production') {
      next()
    }
    else {
      build(next)
    }
  }, 'built demos')]
}, function (err, results) {
  var closeServer
    , onQuit

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

  closeServer = enhanceServer(server.listener)

  onQuit = function onQuit () {
    server.listener.once('close', function () {
      console.log('\nServer cleanly exited')
      process.exit(0)
    })

    closeServer()
  }

  process.on('SIGINT', onQuit)
  process.on('SIGTERM', onQuit)
  process.on('SIGHUP', onQuit)

  server.start(function () {
    console.log('Server running at:' + server.info.uri + ' (' + (Date.now() - startedAt) + 'ms)')
  })
})
