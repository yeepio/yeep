require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const SizePlugin = require('size-plugin');

module.exports = (env) => ({
  entry: [
    // Include an alternative client for WebpackDevServer. A client's job is to
    // connect to WebpackDevServer by a socket and get notified about changes.
    // When you save a file, the client will either apply hot updates (in case
    // of CSS changes), or refresh the page (in case of JS changes). When you
    // make a syntax error, this client will display a syntax error overlay.
    env.development && require.resolve('react-dev-utils/webpackHotDevClient'),
    // Load polyfills for IE11
    path.join(__dirname, 'polyfills.js'),
    // Finally, this is your app's code:
    path.join(__dirname, './index.js'),
    // We include the app code last so that if there is a runtime error during
    // initialization, it doesn't blow up the WebpackDevServer client, and
    // changing JS code would still trigger a refresh.
  ].filter(Boolean),

  output: {
    path: path.join(__dirname, '../dist/admin_ui'),
    filename: 'main.[chunkhash:8].js',
    chunkFilename: '[name].[chunkhash:8].js',
    // Include comments in bundles with information about the contained modules
    // when in development mode
    pathinfo: env.development,
    // Specify the public URL of the output directory when referenced in a browser
    publicPath: '/admin',
  },

  // specify build mode
  mode: env.development ? 'development' : 'production',

  // enable sourcemaps
  devtool: env.development ? 'cheap-module-source-map' : 'hidden-source-map',

  // Determine how the different types of modules within a project will be treated
  module: {
    rules: [
      // First, run the linter.
      env.development && {
        test: /\.(js|jsx)$/,
        include: path.join(__dirname, './'),
        enforce: 'pre', // !important
        use: [
          {
            loader: 'eslint-loader',
          },
        ],
      },
      // Default loader: load all assets that are not handled by other loaders
      // with the url loader.
      // Note: This list needs to be updated with every change of extensions
      // the other loaders match.
      {
        exclude: [/\.html$/, /\.ejs$/, /\.(js|jsx)$/, /\.css$/, /\.json$/, /\.svg$/],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
        exclude: [path.join(__dirname, '../node_modules')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
            },
          },
        ],
      },
      // Process CSS files.
      {
        test: /\.css$/,
        use: [
          env.development ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: './admin_ui/',
              },
            },
          },
        ],
      },
      // JSON is not enabled by default in Webpack but both Node and Browserify
      // allow it implicitly so we also enable it.
      // {
      //   test: /\.json$/,
      //   use: {
      //     loader: 'raw-loader',
      //   },
      // },
      // Process HTML
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      // "file" loader for svg
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ].filter(Boolean),
  },

  // Customize webpack build process with plugins.
  plugins: [
    // Remove previous contents from build folder
    new CleanWebpackPlugin(['dist/admin_ui'], {
      root: process.cwd(),
      verbose: true,
      dry: false,
    }),
    // Generate `index.html` file with the <script> injected
    new HtmlWebpackPlugin({
      template: 'admin_ui/public/index.ejs',
      inject: true,
      minify: {
        html5: true,
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      cache: true,
      env: env.production ? 'production' : 'development',
    }),
    // Make some environment variables available to the JS code
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    // This helps ensure the builds are consistent if source hasn't changed:
    new webpack.optimize.OccurrenceOrderPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    // new WatchMissingNodeModulesPlugin(path.resolve('../node_modules')),
    // Extract css to separate file
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'style.[contenthash:8].css',
    }),
    // Print the gzipped sizes of assets
    new SizePlugin(),
  ].filter(Boolean),

  // only display info when errors or new compilation happen
  stats: 'minimal',

  // configure the dev server
  devServer: {
    // By default WebpackDevServer serves physical files from current directory
    // in addition to all the virtual build products that it serves from memory.
    // This is confusing because those files won’t automatically be available in
    // production build folder unless we copy them. However, copying the whole
    // project directory is dangerous because we may expose sensitive files.
    // Instead, we establish a convention that only files in `public` directory
    // get served. Our build script will copy `public` into the `build` folder.
    // In `index.html`, you can get URL of `public` folder with %PUBLIC_PATH%:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
    // Note that we only recommend to use `public` folder as an escape hatch
    // for files like `favicon.ico`, `manifest.json`, and libraries that are
    // for some reason broken when imported through Webpack. If you just want to
    // use an image, put it in `src` and `import` it from JavaScript instead.
    contentBase: path.join(__dirname, './public'),
    // Enable gzip compression of generated files.
    compress: true,
    // Disable hot reloading server.
    hot: false,
    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: '/admin',
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebookincubator/create-react-app/issues/293
    watchOptions: {
      ignored: /node_modules/,
    },
    // watchContentBase: true,
    port: 9000,
    inline: true,
    open: false,
    historyApiFallback: true,
    headers: {
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
