const path              = require('path');
const webpack           = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin    = require('uglifyjs-webpack-plugin');
const                 _ = require('lodash');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var PRODUCTION  = process.env.NODE_ENV === 'production';
console.log(`FLAVOR ${process.env.FLAVOR}`);
let suffix      = process.env.FLAVOR == 'dev' ? '.dev' : '';
let envFilePath = `.env${suffix}`;
console.log(`envFilePath ${envFilePath}`);

var dotenvConfig = require('dotenv').config(
    {path: envFilePath}
).parsed;

console.log(dotenvConfig);

var plugins = [
    new ExtractTextPlugin({ filename: 'css/[name].css' }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: '__common__.js',
        //chunks: ["main", "utils"],
        deepChildren: true
    }),
    // https://github.com/jantimon/html-webpack-plugin
    new HtmlWebpackPlugin(
        {
            title: 'PSQ Exercises',
            template: './src/index.ejs'
        }
    ),
    new CopyWebpackPlugin([
            {from: './src/img', to: 'img'}
        ],
        {copyUnmodified: false}
    ),
    new CopyWebpackPlugin([
            {from: './src/manifest.json', to: 'manifest.json'}
        ],
        {copyUnmodified: true}
    ),
    new webpack.DefinePlugin({
        'process.env': _(process.env)
            .pick(_.keys(dotenvConfig))
            .mapValues((v) => (JSON.stringify(v)))
        .value()
})
];

var productionPlugins = [
    new UglifyJSPlugin(),
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    })
];

var devPlugins = [];

function styleLoader(loaders) {
    if (PRODUCTION)
        return ExtractTextPlugin.extract({ fallback: 'style-loader', use: loaders });
    return [ 'style-loader', ...loaders ];
}

/**
 *
 * @returns {object}
 */
function postCSSLoader() {
    return {
        loader: "postcss-loader",
        options: {
            plugins: function () {
                return [require("autoprefixer")];
            }
        }
    }
}

module.exports = {
    entry: {
        'index': './src/index.js',
    },
    devtool: "source-map",
    devServer: {
        contentBase: './dist',
        historyApiFallback: true
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
            {
                test: /\.css$/,
                exclude: /\.module\.css$/,
                use: styleLoader(['css-loader', postCSSLoader()])
            },
            {
                test: /\.less/,
                exclude: /\.module\.less/,
                use: styleLoader(['css-loader', postCSSLoader(), 'less-loader'])
            },
            {
                test: /\.scss/,
                exclude: /\.module\.scss/,
                use: styleLoader(['css-loader', postCSSLoader(), 'sass-loader'])
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: "url-loader?limit=10000&minetype=application/font-woff&name=fonts/[name].[ext]"
            },
            {
                test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: "file-loader?name=fonts/[name].[ext]"
            },
            {
                test: /\.jpg|\.png|\.gif$/,
                use: "file-loader?name=images/[name].[ext]"
            },
            {
                test: /\.svg/,
                use: "file-loader?name=svg/[name].[ext]!svgo-loader"
            },
            {
                test: /\.json/,
                use: "json-loader"
            }
        ]
    },
    plugins: PRODUCTION
        ? plugins.concat(productionPlugins)
        : plugins.concat(devPlugins),
};