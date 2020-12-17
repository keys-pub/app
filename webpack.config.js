const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const DefinePlugin = require('webpack').DefinePlugin
const CopyPlugin = require('copy-webpack-plugin')
const NoEmitOnErrorsPlugin = require('webpack').NoEmitOnErrorsPlugin

const DEVELOPMENT = 'development'
const PRODUCTION = 'production'

let port = process.env.DEV_PORT
if (!port) {
  port = '2003'
}

function createRenderConfig(isDev) {
  return {
    context: path.join(__dirname, 'src'),

    target: 'electron-renderer',

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },

    mode: isDev ? DEVELOPMENT : PRODUCTION,

    devtool: isDev ? 'source-map' : 'none',

    entry: {
      polyfill: '@babel/polyfill',
      render: './renderer/renderer.tsx',
    },

    output: {
      path: path.join(__dirname, isDev ? 'build' : 'dist'),
      filename: isDev ? '[name].js' : '[name].[hash].js',
    },

    externals: {
      fs: "require('fs')",
      os: "require('os')",
      electron: "require('electron')",
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-typescript', '@babel/preset-react', '@babel/preset-env'],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-optional-chaining',
              ],
            },
          },
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        },
        // WOFF Font
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/font-woff',
            },
          },
        },
        // WOFF2 Font
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/font-woff',
            },
          },
        },
        // TTF Font
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/octet-stream',
            },
          },
        },
      ],
    },

    plugins: [
      new HtmlPlugin({
        filename: 'index.html',
        template: 'index.html',
        cache: true,
      }),
      new NoEmitOnErrorsPlugin(),
    ],

    devServer: isDev
      ? {
          contentBase: path.join(__dirname, 'build'),
          compress: true,
          hot: true,
          port: port,
        }
      : undefined,
  }
}

function createMainConfig(isDev) {
  return {
    context: path.join(__dirname, 'src'),

    target: 'electron-main',

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },

    mode: isDev ? DEVELOPMENT : PRODUCTION,

    devtool: isDev ? 'source-map' : 'none',

    node: {
      __dirname: false,
    },

    entry: {
      main: './main/main.ts',
    },

    output: {
      filename: '[name].js',
      path: path.join(__dirname, isDev ? 'build' : 'dist'),
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-typescript', '@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-optional-chaining'],
            },
          },
        },
      ],
    },

    plugins: [
      new DefinePlugin({
        ENVIRONMENT: JSON.stringify(isDev ? DEVELOPMENT : PRODUCTION),
      }),
      new CopyPlugin({
        patterns: [
          {
            from: 'icon.png',
            to: 'icon.png',
          },
        ],
      }),
    ],
  }
}

module.exports = function (env) {
  const isDev = env.NODE_ENV == DEVELOPMENT
  const target = env.target

  const configFactory = target == 'main' ? createMainConfig : createRenderConfig
  const config = configFactory(isDev)

  console.log(
    '\n##\n## BUILDING BUNDLE FOR: ' +
      target +
      '\n## CONFIGURATION: ' +
      (isDev ? DEVELOPMENT : PRODUCTION) +
      '\n##\n'
  )

  return config
}
