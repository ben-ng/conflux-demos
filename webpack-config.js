var webpack = require('webpack')
  , path = require('path')
  , opts

opts = {
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['react', 'es2015'],
          cacheDirectory: path.join(__dirname, 'cache')
        }
      }
    ]
  }
}

if (process.env.NODE_ENV === 'production') {
  opts.plugins = [
    new webpack.optimize.UglifyJsPlugin({
      mangle: {
        except: ['$super', '$', 'exports', 'require']
      }
    })
  ]
}

module.exports = opts
