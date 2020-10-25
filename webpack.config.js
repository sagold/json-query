const path = require("path");
const TerserPlugin = require("terser-webpack-plugin"); // eslint-disable-line


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
        minimizer: [new TerserPlugin()]
    }
};

module.exports = config;
