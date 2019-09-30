const path = require("path");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


const config = {
    entry: {
        "gson-query": "./lib/index.js"
    },
    mode: "production",
    context: __dirname,
    target: "web",
    devtool: false,
    output: {
        filename: "[name].js",
        chunkFilename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist")
    },

    resolve: {
        alias: {}
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                // exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },

    optimization: {
        minimizer: [new UglifyJsPlugin()]
    }
};

module.exports = config;
