import webpack from 'webpack';
import cssnano from 'cssnano';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import config from '../config';
import path from 'path';
import _debug from 'debug';
/* global __dirname */

const debug = _debug('app:webpack:config');
const paths = config.utils_paths;
const {__DEV__, __PROD__, __TEST__} = config.globals;

debug('Create configuration.')
const webpackConfig = {
  name: 'client',
  target: 'web',
  devtool: config.compiler_devtool,
  resolve: {
    modules: [
      paths.client(),
      'node_modules',
    ],
	// alias: {'metadata-ui': 'path to metadata-react-ui/src'},
    extensions: ['.js', '.jsx', '.json'],
    symlinks: false,
  },
  module: {},
  node: {
    fs: "empty"
  },
  externals: [
    {
      './cptable': 'var cptable'
    }
  ],
}
// ------------------------------------
// Entry Points
// ------------------------------------
const APP_ENTRY_PATHS = [
  paths.client('main.js')
]

webpackConfig.entry = {
  app: __DEV__
    ? APP_ENTRY_PATHS.concat(`webpack-hot-middleware/client?path=${config.compiler_public_path}__webpack_hmr&timeout=20000&reload=true`)
    : APP_ENTRY_PATHS,
  vendor: config.compiler_vendor
}

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackConfig.output = {
  filename: `[name].[${config.compiler_hash_type}].js`,
  path: paths.dist(),
  publicPath: config.compiler_public_path
}

// ------------------------------------
// Plugins
// ------------------------------------
webpackConfig.plugins = [
  new webpack.DefinePlugin(config.globals),
  new HtmlWebpackPlugin({
    template: paths.client('index.html'),
    hash: false,
    favicon: paths.client('static/favicon.ico'),
    filename: 'index.html',
    inject: 'body',
    minify: {
      collapseWhitespace: true
    }
  })
]

if (__DEV__) {
  debug('Enable plugins for live development (HMR, NoErrors).')
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )
} else if (__PROD__) {
  debug('Enable plugins for production (OccurenceOrder, Dedupe & UglifyJS).')
  webpackConfig.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
    // new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     unused: true,
    //     dead_code: true,
    //     warnings: false
    //   }
    // })
  )
}

// Don't split bundles during testing, since we only want import one bundle
if (!__TEST__) {
  webpackConfig.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor']
    })
  )
}

// ------------------------------------
// Pre-Loaders
// ------------------------------------
/*
[ NOTE ]
We no longer use eslint-loader due to it severely impacting build
times for larger projects. `npm run lint` still exists to aid in
deploy processes (such as with CI), and it's recommended that you
use a linting plugin for your IDE in place of this loader.

If you do wish to continue using the loader, you can uncomment
the code below and run `npm i --save-dev eslint-loader`. This code
will be removed in a future release.

webpackConfig.module.preLoaders = [{
  test: /\.(js|jsx)$/,
  loader: 'eslint',
  exclude: /node_modules/
}]

webpackConfig.eslint = {
  configFile: paths.base('.eslintrc'),
  emitWarning: __DEV__
}
*/

// ------------------------------------
// Loaders (Rules)
// ------------------------------------
// JavaScript / JSON
webpackConfig.module.rules = [{
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: [
    { loader: 'babel-loader', options: {
      cacheDirectory: true,
      presets: ['es2016', 'react', 'stage-0'],
      plugins: ['transform-runtime', 'transform-es2015-modules-commonjs']
    }}
  ]
}]

// ------------------------------------
// Style Loaders
// ------------------------------------
// We use cssnano with the postcss loader, so we tell
// css-loader not to duplicate minimization.
const BASE_CSS_LOADER = 'css-loader?sourceMap&-minimize'

// Add any packge names here whose styles need to be treated as CSS modules.
// These paths will be combined into a single regex.
const PATHS_TO_TREAT_AS_CSS_MODULES = [
  // 'react-toolbox', (example)
]

// If config has CSS modules enabled, treat this project's styles as CSS modules.
if (config.compiler_css_modules) {
  PATHS_TO_TREAT_AS_CSS_MODULES.push(
    paths.client().replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&') // eslint-disable-line
  )
}

const isUsingCSSModules = !!PATHS_TO_TREAT_AS_CSS_MODULES.length
const cssModulesRegex = new RegExp(`(${PATHS_TO_TREAT_AS_CSS_MODULES.join('|')})`)

// Loaders for styles that need to be treated as CSS modules.
if (isUsingCSSModules) {
  const cssModulesLoader = [
    BASE_CSS_LOADER,
    'modules',
    'importLoaders=1',
    'localIdentName=[name]__[local]___[hash:base64:5]'
  ].join('&')

  webpackConfig.module.rules.push({
    test: /\.scss$/,
    include: cssModulesRegex,
    use: [
      'style-loader',
      cssModulesLoader,
      { loader: 'postcss-loader', options: { plugins: () => [
        cssnano({
          autoprefixer: {
            add: true,
            remove: true,
            browsers: ['last 2 versions']
          },
          discardComments: {
            removeAll: true
          },
          discardUnused: false,
          mergeIdents: false,
          reduceIdents: false,
          safe: true,
          sourcemap: true
        })
      ] } },
      { loader: 'sass-loader?sourceMap', options: {includePaths: paths.client('styles')}}
    ]

  })

  webpackConfig.module.rules.push({
    test: /\.css$/,
    include: cssModulesRegex,
    use: [
      'style-loader',
      cssModulesLoader,
      'postcss-loader'
    ]
  })
}

// Loaders for files that should not be treated as CSS modules.
const excludeCSSModules = isUsingCSSModules ? cssModulesRegex : false
webpackConfig.module.rules.push({
  test: /\.scss$/,
  exclude: excludeCSSModules,
  use: [
    'style-loader',
    BASE_CSS_LOADER,
    'postcss-loader',
    'sass-loader?sourceMap'
  ]
})
webpackConfig.module.rules.push({
  test: /\.css$/,
  exclude: excludeCSSModules,
  use: [
    'style-loader',
    BASE_CSS_LOADER,
    'postcss-loader'
  ]
})

// File loaders
/* eslint-disable */
webpackConfig.module.rules.push(
  { test: /\.woff(\?.*)?$/,  loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff' },
  { test: /\.woff2(\?.*)?$/, loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2' },
  { test: /\.otf(\?.*)?$/,   loader: 'file?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype' },
  { test: /\.ttf(\?.*)?$/,   loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream' },
  { test: /\.eot(\?.*)?$/,   loader: 'file?prefix=fonts/&name=[path][name].[ext]' },
  { test: /\.svg(\?.*)?$/,   loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml' },
  { test: /\.(png|jpg)$/,    loader: 'url?limit=8192' }
)
/* eslint-enable */

// ------------------------------------
// Finalize Configuration
// ------------------------------------
// when we don't know the public path (we know it only when HMR is enabled [in development]) we
// need to use the extractTextPlugin to fix this issue:
// http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
if (!__DEV__) {
  debug('Apply ExtractTextPlugin to CSS loaders.')
  // webpackConfig.module.loaders.filter((loader) =>
  //   loader.loaders && loader.loaders.find((name) => /css/.test(name.split('?')[0]))
  // ).forEach((loader) => {
  //   const [first, ...rest] = loader.loaders
  //   loader.loader = ExtractTextPlugin.extract(first, rest.join('!'))
  //   Reflect.deleteProperty(loader, 'loaders')
  // })

  webpackConfig.plugins.push(
    new ExtractTextPlugin({
    	filename: '[name].[contenthash].css',
	    disable: false,
	    allChunks: true
    })
  )
}

export default webpackConfig
