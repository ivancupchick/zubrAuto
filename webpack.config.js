const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './build/index.js',
  mode: 'production',
  target: 'node',
  plugins: [
    new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ })
  ],
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'index.bundle.js'
  },
  externals: [nodeExternals()]
};
