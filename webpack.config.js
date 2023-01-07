const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const PrettierPlugin = require("prettier-webpack-plugin")
const ESLintPlugin = require('eslint-webpack-plugin')

const srcDir = path.join(__dirname, "src")
const dstDir = process.env.DST_DIR || path.join(__dirname, "dist")

module.exports = {
  mode: process.env.NODE_ENV ? "productions" : "development",
  entry: {
    board: path.join(srcDir, "content/board.tsx"),
    project: path.join(srcDir, "content/project.tsx"),
    background: path.join(srcDir, "background/index.ts")
  },
  output: {
    path: dstDir,
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: ".", to: ".", context: "public" }]
    }),
    new PrettierPlugin(),
    new ESLintPlugin({
      extensions: ["ts", "tsx"]
    })
  ],
  devtool: "inline-source-map",
  watchOptions: {
    ignored: /node_modules/
  }
}
