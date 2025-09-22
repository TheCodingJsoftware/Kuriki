const path = require("path");
const fs = require("fs");
const globAll = require("glob-all");
const appRoot = path.resolve(__dirname, "../..");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

class NonBlockingCssPlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap("NonBlockingCssPlugin", (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(
                "NonBlockingCssPlugin",
                (data) => {
                    data.assetTags.styles = (data.assetTags.styles || []).map((tag) => {
                        if (
                            tag.tagName === "link" &&
                            tag.attributes &&
                            tag.attributes.rel === "stylesheet"
                        ) {
                            tag.attributes.media = "print";
                            tag.attributes.onload = "this.media='all'";
                        }
                        return tag;
                    });
                    return data;
                }
            );
        });
    }
}

const pagesDir = path.join(appRoot, "src/pages");
const entries = {};

// Collect entries
fs.readdirSync(pagesDir).forEach((folder) => {
    const folderPath = path.join(pagesDir, folder);
    const tsEntry = path.join(folderPath, `${folder}.ts`);
    const jsEntry = path.join(folderPath, `${folder}.js`);

    if (fs.existsSync(tsEntry)) {
        entries[folder] = tsEntry;
    } else if (fs.existsSync(jsEntry)) {
        entries[folder] = jsEntry;
    } else {
        console.warn(`⚠️ No entry file found for: ${folder}`);
    }
});

// Collect html templates
const htmlPlugins = Object.keys(entries)
    .map((name) => {
        const templatePath = path.join(pagesDir, name, `${name}.html`);
        if (fs.existsSync(templatePath)) {
            return new HtmlWebpackPlugin({
                template: templatePath,
                filename: `${name}.html`,
                chunks: [name, `vendors~${name}`],
            });
        }
        console.warn(`⚠️ No HTML template found for: ${templatePath}`);
        return null;
    })
    .filter(Boolean);

module.exports = {
    entry: entries,

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        alias: {
            "@api": path.resolve(appRoot, "src/api"),
            "@interfaces": path.resolve(appRoot, "src/interfaces"),
            "@components": path.resolve(appRoot, "src/components"),
            "@types": path.resolve(appRoot, "src/types"),
            "@utils": path.resolve(appRoot, "src/utils"),
            "@static": path.resolve(appRoot, "src/static"),
            "@models": path.resolve(appRoot, "src/models"),
            "@config": path.resolve(appRoot, "src/config"),
            "@state": path.resolve(appRoot, "src/state"),
        },
        fallback: {
            fs: false,
            path: false,
            buffer: false,
        },
    },

    module: {
        rules: [{
            test: /pdf\.worker(\.min)?\.m?js$/,
            type: "asset/resource",
        },
        {
            test: /\.ts$/,
            loader: "esbuild-loader",
            options: {
                loader: "ts",
                target: "es2017",
            },
        },
        {
            test: /\.js$/,
            loader: "esbuild-loader",
            options: {
                loader: "js",
                target: "es2017",
            },
        },
        {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        ],
    },

    plugins: [
        ...htmlPlugins,
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css",
        }),
        new ForkTsCheckerWebpackPlugin({
            async: true,
            typescript: {
                memoryLimit: 4096,
                configFile: path.join(appRoot, "tsconfig.json"),
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
                mode: "write-references",
            },
        }),
        new CopyWebpackPlugin({
            patterns: [{
                from: path.join(appRoot, "src/static"),
                to: path.join(appRoot, "dist/static"),
                noErrorOnMissing: true,
            },
            {
                from: path.join(appRoot, "src/manifest.json"),
                to: path.join(appRoot, "dist/manifest.json"),
            },
            {
                from: path.join(appRoot, "src/sitemap.xml"),
                to: path.join(appRoot, "dist/sitemap.xml"),
            },
            {
                from: path.join(appRoot, "src/browserconfig.xml"),
                to: path.join(appRoot, "dist/browserconfig.xml"),
            },
            {
                from: path.join(appRoot, "src/robots.txt"),
                to: path.join(appRoot, "dist/robots.txt"),
                noErrorOnMissing: true,
            },
            ],
        }),
    ],

    stats: {
        errorDetails: true,
        logging: "verbose",
    },
};