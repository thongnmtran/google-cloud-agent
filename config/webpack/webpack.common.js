const { resolve } = require('path');
const { CleanPlugin } = require('webpack');


module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    katalon: './tests/katalon/index.js',
    'My First Javascript Test Case': './tests/Web/1. My First Javascript Test Case.js',
    'Import Java Types and Classes': './tests/Web/2. Import Java Types and Classes.js',
    sessionManager: './tests/Web/0. Session Manager.js',
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
  },
  plugins: [
    new CleanPlugin()
  ]
};
