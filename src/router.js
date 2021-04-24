//该文件用于配置路由
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
var SITE_NAME = "devops";
//页面路径
const routes = [{
		//配置的路径
		name: 'default',
    path: '/',
    redirect: '/'+SITE_NAME+'/login',
		//路径对应的组件
		// component: () => import('./page/login'),
		//元数据
		meta: {
			title: ''
		}
  },
  {
    name: '登录路由',
    path: '/'+SITE_NAME+'/login',
    component: ()=>import('./page/login.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    name: '实例日志详情',
    path: '/'+SITE_NAME+'/examplelogdetail',
    component: ()=>import('./page/projects/ExampleLogDetail.vue'),
  },
  {
    name: 'nullPath',
    path: '/'+SITE_NAME
  },
  {
    name: '首页',
    path: '/'+SITE_NAME+'/index',
    // redirect: '/'+SITE_NAME+'/microservices',
    component: ()=>import('./page/index.vue'),
    children: [{
      name: '运行实例',
      path: '/'+SITE_NAME+'/runningexample',
      component:()=>import('./page/projects/RunningExample.vue'),
      meta: {
        title: '运行实例'
      }
    },{
      name: '项目',
      path: '/'+SITE_NAME+'/project',
      component:()=>import('./page/projects/Project.vue'),
      meta: {
        title: '项目'
      }
    },{
      name: '容器',
      path: '/'+SITE_NAME+'/rongqi',
      component:()=>import('./page/machine/Rongqi.vue'),
      meta: {
        title: '容器'
      }
    },{
      name: '网关',
      path: '/'+SITE_NAME+'/wangguan',
      component:()=>import('./page/machine/Wangguan.vue'),
      meta: {
        title: '网关'
      }
    },{
      name: '用户',
      path: '/'+SITE_NAME+'/user',
      component:()=>import('./page/user/User.vue'),
      meta: {
        title: '用户'
      }
    },{
      name: '运维组',
      path: '/'+SITE_NAME+'/usergroup',
      component:()=>import('./page/user/Usergroup.vue'),
      meta: {
        title: '运维组'
      }
    }
    // ,{
    //   name: '浩宁角色管理',
    //   path: '/'+SITE_NAME+'/hnjueseguanli',
    //   component:()=>import('./page/user/Hnjueseguanli.vue'),
    //   meta: {
    //     title: '浩宁角色管理'
    //   }
    // }
	,{
      name: '报警',
      path: '/'+SITE_NAME+'/alarm',
      component:()=>import('./page/monitor/Alarm.vue'),
      meta: {
        title: '报警'
      }
    },{
      name: '日志',
      path: '/'+SITE_NAME+'/report',
      component:()=>import('./page/monitor/Report.vue'),
      meta: {
        title: '日志'
      }
    },{
      name: '性能&指标',
      path: '/'+SITE_NAME+'/xingnengzhibiao',
      component:()=>import('./page/monitor/XingNengZhiBiao.vue'),
      meta: {
        title: '性能&指标'
      }
    },{
      name: '调用追踪',
      path: '/'+SITE_NAME+'/diaoyongzhuizong',
      component:()=>import('./page/monitor/DiaoYongZhuiZong.vue'),
      meta: {
        title: '调用追踪'
      }
    },{
      name: '服务调试',
      path: '/'+SITE_NAME+'/fuwutiaoshi',
      component:()=>import('./page/monitor/Fuwutiaoshi.vue'),
      meta: {
        title: '服务调试'
      }
    },{
      name: '微服务',
      path: '/'+SITE_NAME+'/microservices',
      component:()=>import('./page/microservices/Microservices.vue'),
      meta: {
        title: '微服务'
      }
    },{
      name: '访问凭证',
      path: '/'+SITE_NAME+'/visitevidence',
      component:()=>import('./page/microservices/VisitEvidence.vue'),
      meta: {
        title: '访问凭证'
      }
    },{
      name: '实例日志',
      path: '/'+SITE_NAME+'/examplelog',
      component:()=>import('./page/projects/ExampleLog.vue'),
      meta: {
        title: '实例日志'
      }
    },
    {
      name: '无权访问',
      path: '/'+SITE_NAME+'/noright',
      component:() => import('./component/NoRight.vue'),
      meta: {
        title: '无权访问'
      }
    },
    {
      path: '/'+SITE_NAME+'*',
      name: 'notFound',
      component: () => import('./component/NotFind.vue'),
      meta: {
        title: '找不到页面'
      }
    }]
  },
  
  // 最后一项用于配置404
  {
    path: '*',
    redirect: {name: 'notFound'},
  }
];

//路由类型配置
const router = new VueRouter({
	mode: 'history',
	routes
});

//路由守护(更改页面title)
router.beforeEach((to, from, next) => {
	if (to.meta.title) {
		document.title = to.meta.title;
  }
  
	next();
});

// 解决导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
export default router;
