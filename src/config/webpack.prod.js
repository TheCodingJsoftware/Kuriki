const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const CompressionPlugin = require("compression-webpack-plugin");
const { EsbuildPlugin } = require("esbuild-loader");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const globAll = require("glob-all");
const appRoot = path.resolve(__dirname, "../..");

module.exports = merge(common, {
    mode: "production",
    output: {
        filename: "[name].[contenthash].js",
        path: path.resolve(appRoot, "dist"),
        publicPath: "/", // Firebase hosting serves from root
        clean: true,
    },
    devtool: false,
    optimization: {
        minimize: true,
        minimizer: [
            new EsbuildPlugin({
                target: "ES2020",
                css: true,
            }),
        ],
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendorsPerPage: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module, chunks) {
                        return `vendors~${chunks[0].name}`;
                    },
                    chunks: "async",
                    enforce: true,
                    reuseExistingChunk: false,
                },
            },
        },
    },
    plugins: [
        new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
        new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            test: /\.(js|css|html|svg)$/,
            compressionOptions: { level: 11 },
            threshold: 10240,
            minRatio: 0.8,
        }),
        new PurgeCSSPlugin({
            paths: globAll.sync([
                path.join(appRoot, "src/**/*.{ts,tsx,js,jsx,html}"),
                path.join(appRoot, "src/pages/**/*.html"),
            ]),
            safelist: { standard: [/^html/, /^body/, /^#/, /^\.*/] },
        }),
    ],
});