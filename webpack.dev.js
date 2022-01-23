const {merge} = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "development",
    // bootstrap-select fucks up the bundle when eval-source-map is used.
    devtool: "source-map",
});