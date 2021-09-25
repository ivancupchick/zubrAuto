const path = require('path');
const webpack = require('webpack');

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
  }
};
