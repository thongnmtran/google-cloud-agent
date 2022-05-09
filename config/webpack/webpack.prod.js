const { resolve } = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    katalon: './src/katalon/index.js',
    firstTest: './src/tests/Web/1. My First Javascript Test Case.js',
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
    path: resolve('build'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      },
    ]
  }
};
