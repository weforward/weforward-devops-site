<template>
  <div class="index">
    <div class="left_menu">
      <div class="logo_img">
        <img src="../img/weforward_logo_white.png" alt="">
      </div>
      <div class="welcomebar">

          <div class="usertitle"><span :title="userName">您好，{{userName || '请登录'}}</span></div>
          <img @click="logout" title="安全退出" src=../img/logout.png />

      </div>
      <div class="menu_items">
        <div class="menu_item" v-for="(item,index1) in menuData" :key='index1'>
          <div :class="[item.children!=undefined? 'item_title1': 'item_title2',cur==item.path? 'active': '']" @click="item.children!=undefined?'': goToPath(item.path)">
            <img v-if="item.children==undefined" :src="cur==item.path ? item.url_sel:item.url"/>{{item.name}}
          </div>
          <div v-for="(child,index2) in item.children" :key="index2" :class="['item_content',cur==child.path?'active':'']" @click="gotoPath($event,child.path)" >
            <img :src="cur==child.path ? child.url_sel : child.url"/>{{child.name}}
          </div>
        </div>
            <div class="kaiyuanbar">
              <div><a href="https://github.com/weforward" target="_blank" ><span>WF Devops 开源</span><img style="width:35px;margin-bottom: -10px;" src="../img/github.png" /></a></div>
              <!-- <div><a href="https://github.com/weforward" target="_blank" ><span>Weforward 官方</span><img style="width:30px;margin-bottom: -10px;" src="../img/webicon.png" /></a></div> -->
            </div>
          </div>
        </div>
        <div class="right_content">
          <router-view></router-view>
        </div>
      </div>
</template>
<script>
export default {
  data(){
    return{
      menuData:[
        { name: '微服务',children:[
          {name:'微服务',path:'/'+this.site_name+'/microservices',url: require('../img/caidanicon/weifuwu.png'),url_sel:require('../img/caidanicon/weifuwu_sel.png')},
          {name: '访问凭证',path:'/'+this.site_name+'/visitevidence',url: require('../img/caidanicon/pingzheng.png'),url_sel:require('../img/caidanicon/pingzheng_sel.png')}]
        },
        { name: '项目',children:[
              {name: '运行实例', path: '/'+this.site_name+'/runningexample',url: require('../img/caidanicon/shili.png'),url_sel:require('../img/caidanicon/shili_sel.png')},
              {name: '项目', path: '/'+this.site_name+'/project',url: require('../img/caidanicon/xiangmu.png'),url_sel:require('../img/caidanicon/xiangmu_sel.png')}]
            },
        { name: '服务监控',children:[
          {name:'报警',path:'/'+this.site_name+'/alarm',url: require('../img/caidanicon/baojing.png'),url_sel:require('../img/caidanicon/baojing_sel.png')},
          // {name: '日志',path:'/'+this.site_name+'/report',url: require('../img/caidanicon/rizhi.png'),url_sel:require('../img/caidanicon/rizhi_sel.png')},
          {name: '性能&指标',path: '/'+this.site_name+'/xingnengzhibiao',url: require('../img/caidanicon/xingneng.png'),url_sel:require('../img/caidanicon/xingneng_sel.png')},
            {name: '调用分析',path: '/'+this.site_name+'/diaoyongfenxi',url: require('../img/caidanicon/zhuizong.png'),url_sel:require('../img/caidanicon/zhuizong_sel.png')},
            // {name:'调用追踪',path:'/'+this.site_name+'/diaoyongzhuizong',url: require('../img/caidanicon/zhuizong.png'),url_sel:require('../img/caidanicon/zhuizong_sel.png')},
            {name:'服务调试',path:'/'+this.site_name+'/fuwutiaoshi',url: require('../img/caidanicon/tiaoshi.png'),url_sel:require('../img/caidanicon/tiaoshi_sel.png')}]
        },
        { name: '设备',children:[
          { name: '容器',path: '/'+this.site_name+'/rongqi',url: require('../img/caidanicon/rongqi.png'),url_sel:require('../img/caidanicon/rongqi_sel.png')},
          { name: '网关',path: '/'+this.site_name+'/wangguan',url: require('../img/caidanicon/wangguan.png'),url_sel:require('../img/caidanicon/wangguan_sel.png')}]
        },
        { name: '用户管理',children:[
          { name: '运维组',path: '/'+this.site_name+'/usergroup',url: require('../img/caidanicon/yunweizu.png'),url_sel:require('../img/caidanicon/yunweizu_sel.png')},
         // { name: '浩宁角色管理',path: '/'+this.site_name+'/hnjueseguanli',url: require('../img/caidanicon/jueseguanli.png'),url_sel:require('../img/caidanicon/jueseguanli_sel.png')},
          { name: '用户',path: '/'+this.site_name+'/user',url: require('../img/caidanicon/yonghu.png'),url_sel:require('../img/caidanicon/yonghu_sel.png')}
          ]
        }
      ],
      cur: '/'+this.site_name+'/microservices',
      userName: ''
    }
  },
  methods:{
    gotoPath(e,path){
      if(e.ctrlKey){
        let {href}= this.$router.resolve({
          path:path
        })
        window.open(href);
      }else{
         this.$router.push({path});
         this.cur=path;
      }
    },
    logout(){
      this.$wf.logout();
      this.$router.push({
        name: '登录路由'
      });
    }
  },
  mounted(){
    this.cur=this.$route.path;
    this.$wf
      .post('?method=/devops/_cuser')
      .then(data => (this.userName = data.name))
      .catch(e => {
        this.$wool.showwarn(e.message);
        this.$router.push({
          name: '登录路由'
        });
      });
  }
}

</script>
<style lang="less" scoped>
.index{
  // height: 100%;
  width: 100%;
  display: flex;
  align-items: flex-start;
  overflow-x: visible;
  .left_menu{
    width: 15%;
    height: 100%;
    display: inline-block;
    border-right: 1px solid #e3ebf6;
    //overflow-y: auto;
    //overflow: scroll;
    .logo_img{
      width: 100%;
      margin-top: 10px;
      margin-left: 20px;
      // border-bottom: 1px solid #f1f1f1;
      img{
        width: 80%;
        //margin: 0 auto;
      }
    }
    .menu_items{
      //margin-top: 20px;
      margin-right: 40px;
      width: 100%;
      font-size: 15px;
      .menu_item{
        margin-right: 20px;
        border-bottom: 1px solid #e3ebf6;
        margin-left: 20px;
        .item_title1{
          margin: 10px 0;
          color: #95AAC9;
        }
        .item_title2{
          margin: 10px 0;
          cursor: pointer;
          color: #6E84A3;
        }
        .item_title2:hover{
          color: #3B506C;
        }
        .item_content{
          padding-top: 5px;
          padding-bottom: 15px;
          padding-left: 15px;
          color: #7187A9;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
        }
        .item_content:hover{
          color: #3B506C;
        }
        img{
          width: 18px;
          margin-top: 2px;
          margin-right: 10px;
        }
        .active{
          color: #3B506C;
        }
      }
    }
  }
  .right_content{
    width: 85%;
    height: 100%;
    min-height: 720px;
    display: inline-block;
    background-color: #F9FBFD;
    overflow-y: visible;
    overflow-x: visible;
  }
}
.welcomebar{
  padding: 0 20px;
  .usertitle{
    width: 84%;
    height: 25px;
    display: inline-block;
    font-size: 14px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    span{
      //前提是父元素为display: inline-block;
      vertical-align:middle;
    }
    // overflow: hidden;
    // white-space: nowrap;
  }
  img{
    width:25px;
    float: right;
    cursor: pointer;
  }
}
.kaiyuanbar{
	padding: 10px 20px;
	a{
		display: block;
		height:50px;
		line-height: 50px;
		// border-bottom: 1px solid #e3ebf6;
		text-align: center;
		margin-bottom: 10px;
		span{
			float: left;
			color:#3D83E5;
			margin-right: 10px;
		}
	}
}
</style>
