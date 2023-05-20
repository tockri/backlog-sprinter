const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const ESLintPlugin = require("eslint-webpack-plugin")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const GenerateManifestJsonPlugin = require("./dev/GenerateManifestJsonPlugin")

const srcDir = path.join(__dirname, "src")
const dstDir = process.env.DST_DIR || path.join(__dirname, "dist")

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: {
    board: path.join(srcDir, "content/board.tsx"),
    project: path.join(srcDir, "content/project.tsx"),
    background: path.join(srcDir, "background/worker.ts"),
    options: path.join(srcDir, "options/options.tsx"),
    storeToken: path.join(srcDir, "content/storeToken.ts")
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
      },
      {
        test: /\.css/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { url: false }
          }
        ]
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ["@svgr/webpack"]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    plugins: [new TsconfigPathsPlugin({})]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: ".", to: ".", context: "public" }]
    }),
    new ESLintPlugin({
      extensions: ["ts", "tsx"]
    }),
    new GenerateManifestJsonPlugin(
      "manifest.json",
      path.join(__dirname, "dev/manifest_template.json"),
      path.join(__dirname, "backlog-sprinter-secret/manifest_key.json")
    )
  ],
  devtool: process.env.NODE_ENV === "development" ? "#inline-source-map" : false,
  watchOptions: {
    ignored: /node_modules/
  }
}
