const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const appRoot = path.resolve(__dirname, "../..");

module.exports = merge(common, {
    mode: "development",
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(appRoot, "dist"),
        publicPath: "/", // important for dev server
    },
    devtool: "source-map",
    devServer: {
        static: { directory: path.join(appRoot, "dist") },
        compress: true,
        hot: true,
        open: true,
        historyApiFallback: true,
        client: { overlay: true },
    },
    cache: {
        type: "filesystem",
        compression: "gzip",
    },
});