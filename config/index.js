var path = require('path');
var merge = require('lodash').merge;

let conf = {};
try {
    conf = require('./' + (process.env.NODE_ENV || 'test') + '.conf');
} catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
        throw e;
    }
};

module.exports = merge(conf, {
    build: {
        env: require('./prod.env'),
        index: path.resolve(__dirname, '../dist/index.html'),
        assetsRoot: path.resolve(__dirname, '../dist'),
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        productionSourceMap: true,
        productionGzip: true,
        productionGzipExtensions: ['js', 'css'],
        bundleAnalyzerReport: process.env.npm_config_report
    },
    dev: {
        env: require('./dev.env'),
        port: 8080,
        autoOpenBrowser: false,
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        proxyTable: {},
        cssSourceMap: false
    }
});
