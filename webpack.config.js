var webpack = require('webpack');
var path = require('path');

// variables
var isProduction = process.argv.indexOf('-p') >= 0;
var sourcePath = path.join(__dirname, './src');
var outPath = path.join(__dirname, './dist');

// plugins
var HtmlWebpackPlugin = require('html-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: sourcePath,
  entry: {
    main: './client/index.tsx',
    vendor: [
      'react',
      'react-dom',
      'mobx',
      'mobx-react'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].bundle.js',
    publicPath: '/'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          name: 'vendor',
          test: 'vendor',
          enforce: true
        },
      }
    }
  },
  target: 'web',
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    // Fix webpack's default behavior to not load packages with jsnext:main module
    // (jsnext:main directs not usually distributable es6 format, but es6 sources)
    mainFields: ['module', 'browser', 'main'],
    fallback: {
      "fs": false,
      "net": false
    },
    alias: {
      'client': path.resolve(__dirname, 'src/client'),
      'common': path.resolve(__dirname, 'src/common')
    }
  },
  module: {
    rules: [
      // .ts, .tsx
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      // css 
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: !isProduction,
              importLoaders: 1,
              modules: {
                localIdentName: '[local]__[hash:base64:5]'
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-import')({ addDependencyTo: webpack }),
                  require('postcss-url')(),
                  require('postcss-browser-reporter')({ disabled: isProduction }),
                ]
              }
            }
          }
        ]
      },
      // static assets 
      { test: /\.html$/, use: 'html-loader' },
      { test: /\.png$/, use: [{ loader: 'url-loader', options: { limit: 10000 } }] },
      { test: /\.jpg$/, use: 'file-loader' },
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        context: sourcePath
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: 'assets/index.html'
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {from:'assets', to:'assets'}
      ]
    })
  ],
  devServer: {
    static: sourcePath,
    client: {
      overlay: {
        warnings: false
      }
    },
  },

};
