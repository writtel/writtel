
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    site: ['@writtel/server/lib/admin.scss', 'draft-js/dist/Draft.css', '.']
  },
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    publicPath: '/_w/assets/',
    filename: '[name].bundle.js',
  },
  resolveLoader: {
    modules: [
      path.resolve(require.resolve('babel-loader'), '..', '..', '..'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            "presets": ["@babel/react", "@babel/env"],
          },
        },
      },
      {
        test: /\.module\.scss$/,
        loader: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[hash:8]',
              },
              localsConvention: 'camelCaseOnly',
              sourceMap: true
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        exclude: /\.module\.scss$/,
        loader: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        loader: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      new RegExp(`^${path.resolve(__dirname, '..', 'lib', 'server.js').replace(/\./g, '\\.')}$`),
      path.resolve(__dirname, '..', 'lib', 'client.js'),
    ),
    new MiniCssExtractPlugin({
      filename: '[name].bundle.css',
      chunkFilename: '[id].bundle.css',
    })
  ],
};
