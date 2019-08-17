const webpack = require('webpack')
const {resolve} = require('path')

module.exports = {
  entry: {
    'html-ast-transform': resolve(__dirname, 'src', 'index.ts'),
    'html-ast-transform.min': resolve(__dirname, 'src', 'index.ts')
  },
  output: {
    path: resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'HtmlAstTransform',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [{
      test: /\.ts$/,
      include: resolve(__dirname, 'src'),
      use: [
        {
          loader: 'babel-loader',
          query: {
            presets: [['es2015', {modules: false}]]
          }
        },
        'ts-loader'
      ]
    }]
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  externals: {
    parse5: {
      commonjs: 'parse5',
      commonjs2: 'parse5',
      amd: 'parse5',
      root: 'parse5'
    }
  },
  devtool: 'source-map',
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js/,
      compress: true,
      sourceMap: true
    })
  ]
}
