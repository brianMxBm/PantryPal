const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "./web/static/ts/main.ts",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "web/static/dist"),
    },
    plugins: [
        new MiniCssExtractPlugin(),
        // bootstrap-select relies on it being global
        new webpack.ProvidePlugin({
            bootstrap: "bootstrap",
        }),
    ],
};