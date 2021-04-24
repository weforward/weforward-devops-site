import wool from '../utils/wool.js'
const READYS = {};
const STATES = {};
/**
 * @param {Array} sourcepathes 资源路径集合
 * @param {Object} gloalName 最终要得到的全局函数名称
 */
function load(sourcepathes, gloalName) {
	//加载中
	READYS[gloalName] = 100;
	return new Promise(async function(resoved, reject) {
		if (window[gloalName]) {
			resoved(window[gloalName]);
			return;
		}
		try {
			for (let i = 0; i < sourcepathes.length; i++) {
				await wool.loadScript(sourcepathes[i]);
			}
			READYS[gloalName]=200;
			resoved(window[gloalName]);
		} catch (e) {
			READYS[gloalName]=500;
			reject(e);
		}
	});
}

function checksourceLoaded(gloalName,isdone, data) {
	while (STATES[gloalName].length > 0) {
		var holder = STATES[gloalName].shift();
		if (isdone) {
			holder.resoved(data);
		} else {
			holder.reject(data);
		}
	}
	return;
}
export default {
	/**
	 * @description  单例模式，指定一个或多个静态资源按照顺序加载,<br/>例如：加载加载高德地图后会得到一个全局Window.AMap函数SingletonJsloader.load(['https://webapi.amap.com/'],'AMap')
	 * 
	 * @param {Object} sourcepathes 资源路径集合
	 * @param {Object} gloalName 最终要得到的全局函数名称
	 */
	load: async function(sourcepathes, gloalName) {
		if (!STATES[gloalName]) {
			STATES[gloalName] = [];
			READYS[gloalName] = 0;
		}
		var promise = new Promise(function(resoved, reject) {
			STATES[gloalName].push({
				resoved,
				reject
			});
		});
		if (READYS[gloalName] == 0) {
			try {
				var Source = await load(sourcepathes, gloalName);
				checksourceLoaded(gloalName,true, Source);
			} catch (e) {
				checksourceLoaded(gloalName,false, e);
			}
		} else if (READYS[gloalName] == 200) {
			checksourceLoaded(gloalName,true, window[gloalName]);
		} else if (READYS[gloalName] == 500) {
			checksourceLoaded(gloalName,false, undefined);
		}
		return promise;
	},
}
