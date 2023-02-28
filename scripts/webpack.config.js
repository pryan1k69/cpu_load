const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  output: {
    filename: "index.js",
    path: __dirname + "/public/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@src": path.resolve(__dirname, "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "../../static" }],
    }),
  ],
};
