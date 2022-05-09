const { merge } = require('webpack-merge');
const common = require('./webpack.prod');


module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    devMiddleware: {
      index: true,
      mimeTypes: { phtml: 'text/html' },
      publicPath: '/build',
      serverSideRender: true,
      writeToDisk: true,
    },
  }
});
