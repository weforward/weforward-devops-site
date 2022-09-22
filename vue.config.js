const path = require("path");
const isProduction = process.env.NODE_ENV === 'production';
function resolve(dir) {
	return path.join(__dirname, dir)
}
module.exports = {
	publicPath: process.env.VUE_APP_WF_PUBLICPATH,
	outputDir: 'dist',
	assetsDir: 'static',
	lintOnSave: false, //是否开启eslint
	devServer: {
		//前端页面的访问端口
		port: process.env.VUE_APP_WF_HOST_PORT,
	},
	configureWebpack: config => {
		if (isProduction) {
			const Builder = require('weforward-builder-vue2')
			config.plugins.push(new Builder())
		}
		Object.assign(config.resolve, {
			alias: {
				'~': resolve('./'),
				'@': resolve('src')
			}
		})
	},
	filenameHashing: true,
	productionSourceMap: false
}
