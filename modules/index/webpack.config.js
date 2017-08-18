const path = require('path');
const root = path.join.bind(path, path.resolve(__dirname));

/**
 * Webpack Plugins
 */
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

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
        'index': './front/index.js',

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
        extensions: [ '*', '.js', '.css', '.scss' ],

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
         * Public URL base of the files.
         *
         * See: http://webpack.github.io/docs/configuration.html#output-publicpath
         */
        publicPath: '/',

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
        chunkFilename: '[id].chunk.js',
    },

    /**
     * Options affecting the normal modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#module
     */
    module: {

        rules: [

            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'babel-loader', options: { sourceMap: true } },
                ],
            },

            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader', options: { sourceMap: true } },
                    { loader: 'css-loader', options: { sourceMap: true } },
                    { loader: 'postcss-loader', options: { sourceMap: true } },
                ],
            },

            {
                test: /\.scss$/,
                use: [
                    { loader: 'style-loader', options: { sourceMap: true } },
                    { loader: 'css-loader', options: { sourceMap: true } },
                    { loader: 'postcss-loader', options: { sourceMap: true } },
                    { loader: 'sass-loader', options: { sourceMap: true } },
                ]
            },

            {
                test: /bootstrap\/dist\/js\//,
                use: [
                    'imports-loader?jQuery=jquery',
                    'imports-loader?Popper=popper.js',
                    "imports-loader?Tooltip=bootstrap/js/dist/tooltip",
                    "imports-loader?Alert=bootstrap/js/dist/alert",
                    "imports-loader?Button=bootstrap/js/dist/button",
                    "imports-loader?Carousel=bootstrap/js/dist/carousel",
                    "imports-loader?Collapse=bootstrap/js/dist/collapse",
                    "imports-loader?Dropdown=bootstrap/js/dist/dropdown",
                    "imports-loader?Modal=bootstrap/js/dist/modal",
                    "imports-loader?Popover=bootstrap/js/dist/popover",
                    "imports-loader?Scrollspy=bootstrap/js/dist/scrollspy",
                    "imports-loader?Tab=bootstrap/js/dist/tab",
                    "imports-loader?Util=bootstrap/js/dist/util",
                ]
            },

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
         * Plugin: NoEmitOnErrorsPlugin
         * Description: Skip the emitting phase whenever there are errors while compiling.
         *
         * Ensures that no assets are emitted that include errors.
         *
         * See: https://webpack.js.org/plugins/no-emit-on-errors-plugin/
         */
        new NoEmitOnErrorsPlugin(),

        /**
         * Plugin: ProvidePlugin
         * Description: Autoload modules
         *
         * Whenever the identifier is encountered as free variable in a module, its module is loaded automatically
         *
         * See: https://webpack.github.io/docs/list-of-plugins.html#provideplugin
         */
        new ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            Popper: ['popper.js', 'default'],
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

        /**
         * Plugin: UglifyJsPlugin
         * Description: Minimize all JavaScript output of chunks.
         * Loaders are switched into minimizing mode.
         *
         * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
         */
        // NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
        new UglifyJsPlugin({
            // debug
            /*
            beautify: true,
            output: {
                comments: true,
            }
            mangle: false,
            compress: {
                screw_ie8: true,
                keep_fnames: true,
                drop_debugger: false,
                dead_code: false,
                unused: false
            },
            sourceMap: true,
            */

            // prod
            beautify: false,
            output: {
                comments: false
            },
            mangle: {
                screw_ie8: true
            },
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
            sourceMap: true,
        }),

    ],

};
