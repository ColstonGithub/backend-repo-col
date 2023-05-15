const path = require('path');

module.exports = {
  entry: './index.js',
  target: 'node',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      // ... other rules ...
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'ignore-loader',
      },
    ],
  },
  externals: {
    'mongodb-client-encryption': 'commonjs2 mongodb-client-encryption'
  }
};
