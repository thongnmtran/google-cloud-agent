const { resolve } = require('path');
const { CleanPlugin } = require('webpack');


module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    // katalon: './tests/katalon/index.js',
    'My First Javascript Test Case': './Scripts/My First Javascript Test Case/Script1652936119726.groovy',
    'Import Java Types and Classes': './Scripts/Import Java Types and Classes/Script1652935930685.groovy',
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
        test: /\.(js|jsx|ts|tsx|groovy)$/,
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
