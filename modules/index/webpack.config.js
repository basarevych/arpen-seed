/**
 * @author: @AngularClass
 */
const path = require('path');
const root = path.join.bind(path, path.resolve(__dirname));

/**
 * Webpack Plugins
 */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const dist = 'public';

module.exports = {
    /**
     * Cache generated modules and chunks to improve performance for multiple incremental builds.
     * This is enabled by default in watch mode.
     * You can pass false to disable it.
     *
     * See: http://webpack.github.io/docs/configuration.html#cache
     */
    //cache: false,

    /**
     * Developer tool to enhance debugging
     *
     * See: http://webpack.github.io/docs/configuration.html#devtool
     * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
     */
    devtool: 'source-map',

    /**
     * The entry point for the bundle
     *
     * See: http://webpack.github.io/docs/configuration.html#entry
     */
    entry: {

        'twbs': 'bootstrap-loader',
        'fa':   'font-awesome-sass-loader!./fa.config.js',
        'index': [ './front/index.js', './front/styles/index.scss' ],

    },

    /**
     * Options affecting the resolving of modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve
     */
    resolve: {

        /**
         * An array of extensions that should be used to resolve modules.
         *
         * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
         */
        extensions: [ '.js', '.json', '.css', '.scss' ],

        // An array of directory names to be resolved to the current directory
        modules: [ root('front'), root('node_modules') ],

    },

    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {

        /**
         * The output directory as absolute path (required).
         *
         * See: http://webpack.github.io/docs/configuration.html#output-path
         */
        path: root(dist),

        /**
         * Specifies the name of each output file on disk.
         * IMPORTANT: You must not specify an absolute path here!
         *
         * See: http://webpack.github.io/docs/configuration.html#output-filename
         */
        filename: '[name].bundle.js',

        /**
         * The filename of the SourceMaps for the JavaScript files.
         * They are inside the output.path directory.
         *
         * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
         */
        sourceMapFilename: '[name].bundle.map',

        /**
         * The filename of non-entry chunks as relative path
         * inside the output.path directory.
         *
         * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
         */
        chunkFilename: '[id].chunk.js'

    },

    /**
     * Options affecting the normal modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#module
     */
    module: {

        rules: [

            /**
             * Sass loader (required for Bootstrap 4)
             */
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ],
            },

            {
                test: /\.scss$/,
                use: [ 'style-loader', 'css-loader', 'sass-loader' ]
            },

            /**
             * Bootstrap 4 loader
             */
            {
                test: /bootstrap\/dist\/js\/umd\//,
                use: 'imports-loader?jQuery=jquery'
            },

            /**
             * Font loaders, required for font-awesome-sass-loader and bootstrap-loader
             */
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            },

        ],

    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [

        /**
         * Plugin: CleanWebpackPlugin
         * Description: Plugin to remove/clean your build folder(s) before building
         *
         * Cleans build directory before building
         *
         * See: https://www.npmjs.com/package/clean-webpack-plugin
         */
        new CleanWebpackPlugin([ dist ], {
            root: root(),
        }),

        /**
         * Plugin: CopyWebpackPlugin
         * Description: Copy files and directories in webpack.
         *
         * Copies project static assets.
         *
         * See: https://www.npmjs.com/package/copy-webpack-plugin
         */
        new CopyWebpackPlugin([
            { from: 'assets/img', to: 'img' },
        ]),

        /**
         * Webpack plugin to optimize a JavaScript file for faster initial load
         * by wrapping eagerly-invoked functions.
         *
         * See: https://github.com/vigneshshanmugam/optimize-js-plugin
         */
        new OptimizeJsPlugin({
            sourceMap: false
        }),

        /**
         * Plugin: UglifyJsPlugin
         * Description: Minimize all JavaScript output of chunks.
         * Loaders are switched into minimizing mode.
         *
         * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
         */
        // NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
        new UglifyJsPlugin({
            // beautify: true, //debug
            // mangle: false, //debug
            // dead_code: false, //debug
            // unused: false, //debug
            // deadCode: false, //debug
            // compress: {
            //   screw_ie8: true,
            //   keep_fnames: true,
            //   drop_debugger: false,
            //   dead_code: false,
            //   unused: false
            // }, // debug
            // comments: true, //debug


            beautify: false, //prod
            output: {
                comments: false
            }, //prod
            mangle: {
                screw_ie8: true
            }, //prod
            compress: {
                screw_ie8: true,
                warnings: false,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true,
                negate_iife: false // we need this for lazy v8
            },
        }),

        /**
         * jQuery for Bootstrap
         */
        new ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            Tether: "tether",
            "window.Tether": "tether",
            Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
            Alert: "exports-loader?Alert!bootstrap/js/dist/alert",
            Button: "exports-loader?Button!bootstrap/js/dist/button",
            Carousel: "exports-loader?Carousel!bootstrap/js/dist/carousel",
            Collapse: "exports-loader?Collapse!bootstrap/js/dist/collapse",
            Dropdown: "exports-loader?Dropdown!bootstrap/js/dist/dropdown",
            Modal: "exports-loader?Modal!bootstrap/js/dist/modal",
            Popover: "exports-loader?Popover!bootstrap/js/dist/popover",
            Scrollspy: "exports-loader?Scrollspy!bootstrap/js/dist/scrollspy",
            Tab: "exports-loader?Tab!bootstrap/js/dist/tab",
            Util: "exports-loader?Util!bootstrap/js/dist/util"
        }),

    ],

};
