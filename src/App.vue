<template>
	<!-- 业务页面展示 -->
	<RouterView></RouterView>
</template>

<script>
import Vue from 'vue';
//路由配置
import router from './router.js';
import cookie from './utils/cookie.js'
import './plugins/timeutils.js';
//微服务数据请求插件
//使用文档参考https://www.npmjs.com/package/weforward-protocol
import wf from 'weforward-protocol';
wf.updateGlobalConfig('loginUrl', 'devops?method=/devops/auth/login');
wf.updateGlobalConfig('logoutUrl', 'devops?method=/devops/auth/logout');
wf.updateGlobalConfig('refreshAccessUrl', 'devops?method=/devops/auth/refresh_access');
//设置请求数据默认的服务名
wf.setBaseService('devops');

wf.updateGlobalConfig('resDataAttrNameStyle', 0);

//请求数据前的事件x
wf.addEventListener('beforerequest', ()=>{
  //TODO 展示登录视图
  if(!cookie.get('_WF_ACCESSEXPIRE')){
    router.push({name:'登录路由'})
  }
});
//无访问权限监听
wf.addEventListener('visitforbidden', ()=>{
  //TODO 展示无访问全新视图
  router.push({name: '无权访问'})
});

Vue.prototype.$wf = wf;
Vue.prototype.site_name = "devops";

import wool from './utils/wool'
import msgView from './plugins/WoolMsgview'
window.$wool = wool.extend(wool, msgView);
Vue.prototype.$wool = window.$wool;
router.beforeEach((to, from, next) =>{
  if(to.name=='nullPath'){
    if(!cookie.get('_WF_ACCESSEXPIRE')) {
      next({name: 'default'})
    }else{
      next({name: '微服务'})
    }
  }
  if(from.name=="notFound"){
    document.title = "Weforward 云原生"
  }
  next()
})
// router.afterEach((to)=>{
//   if(!wf.getAccessId() && to.name!='登录路由'){
//     router.push({name:'登录路由'})
//   }
// })
export default {
	name: 'App',
  router: router,
  mounted(){

    //刷新access
    function refreshAccess() {
      const access_id = cookie.get('_WF_ACCESSID');
      const access_key = cookie.get('_WF_ACCESSKEY');
      let url = 'devops?method=/devops/auth/refresh_access';
      wf.noAccessPost(url, {
        access_id: access_id,
        access_key: access_key,
      }).then(data => {
        //刷新成功
        onlogined(data);
      }).catch(e => {
        //刷新失败，删掉过期时间
        cookie.remove('_WF_ACCESSEXPIRE', '/');
        cookie.remove('_WF_ACCESSID', '/');
        cookie.remove('_WF_ACCESSKEY', '/');
        cookie.remove('omni-ssss', '/');
        router.push({name:'登录路由'});
        clearInterval(timer);
      });
    }
    function onlogined(data) {
      cookie.set('_WF_ACCESSID', data.accessId, 0, '/');
      cookie.set('_WF_ACCESSKEY', data.accessKey, 0, '/');
      cookie.set('_WF_ACCESSEXPIRE', data.accessExpire, 0, '/');
      if (data.sessionId) {
        cookie.set('omni-ssss', data.sessionId, 0, '/');
      }
    }
    //定时器，检查检查是否需要更新access
    //过期时间_WF_ACCESSEXPIRE与实际过期时间不统一，
    //   实际过期时间较早，先设置定时请求，统一后再使用有效期小于5分钟时刷新
    var timer= setInterval(function() {
      let expire = cookie.get('_WF_ACCESSEXPIRE');
      if (!expire) {
        return;
      }

      // if (Number(expire) - Date.now() <  5 * 60 * 1000) {
        //当有效期小于5分钟时刷新
      refreshAccess();
      // }
    }, 1* 60* 1000);
  }
};
</script>
<style lang="less">
@import url('./assets/css/app.css');
@import url('./assets/css/table.css');
html{
  width: 100%;
  height: 100%;
  // filter:grayscale(1);
}
body{
  width: 100%;
  max-width: 2000px;
  min-width: 1345px;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
