const path = require('path');

module.exports = {
  entry: './build/index.js',
  mode: 'production',
  target: 'node',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'server.bundle.js'
  }
};
