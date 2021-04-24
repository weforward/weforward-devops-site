<template>
  <div class="service_area">
    <div class="query">
      <div class="query_input">
        <input type="text" placeholder="请输入服务名进行搜索" v-model="page.keywords" @keyup.enter="beforeGetServiceList"/>
        <div class="query_button" style="margin-left: 5%;" @click="beforeGetServiceList">
          查询
        </div>
      </div>
    </div>
    <div class="tablearea">
      <table class="project_table">
        <tr class="project_title">
          <td width="180px">微服务</td>
          <td>资料与设置</td>
          <td></td>
        </tr>
        <tbody v-for="(item,index) in serviceList" :key='index'>
          <tr>
            <td>
              <img v-if="0==item.status" class="msicon" src="../../img/msicon/microservices.png" title="实例正常"/>
              <img v-if="9==item.status" class="msicon" src="../../img/caidanicon/baojing_sel.png" title="全实例异常"/>
              <img v-if="0<item.status&&item.status<9" class="msicon" src="../../img/msicon/microservices_m.png" title="部分实例异常"/>
              <span v-if="0==item.status" class="ms_name" title="实例正常">{{item.name}}</span>
              <span v-if="9==item.status" style="color:#d81e06" class="ms_name" title="全实例异常">{{item.name}}</span>
              <span v-if="0<item.status&&item.status<9" style="color:#FF7F00" class="ms_name" title="部分实例异常">{{item.name}}</span>
            </td>
            <!--  <td>{{item.summary}}<span class="ms_name">{{item.name}}</span></td> -->

            <td>
              <span class="settings" @click="handleRight(item)">
                <img src="../../img/msicon/quanxianshezhi.png"/>权限设置
              </span>
              <span class="settings" @click="handleTraffic(item)">
                <img src="../../img/msicon/liuliangkongzhi.png" />流量控制
              </span>
              <span class="settings" @click="goTodoc(item.name)">
                <img src="../../img/msicon/jiekouwendang.png"/>接口文档
              </span>
            </td>
            <td class="clickarea" @click="fadeOut(item)">微服务实例</td>
          </tr>
          <tr v-show="item.choose">
            <td colspan="3" class="shilibar">
              <table class="shili-table">
                <tr class="extend_title">
                  <td style="width:60px">编号</td>
                  <td style="width:350px">链接列表</td>
                  <td style="width:150px">最近心跳时间</td>
                  <td style="width:150px">运行状态</td>
                  <td style="width:100px">版本号</td>
                  <td>更多..</td>
                </tr>
                <tr class="extend_content" v-for="(item1, idx) in item.items" :key="idx">
                  <td>{{item1.no}}</td>
                  <td class="mslink">
                    <span v-if="null!=item1.domain&&null!=item1.port">http://{{item1.domain}}:{{item1.port}}/{{item1.name}}</span>
                  </td>
                  <td>{{item1.heartbeat.format("yyyy-MM-dd HH:mm") || '--'}}</td>
                  <td class="msstatus"> 
                    <span v-if="item1.inaccessible" style="color:red">禁用：</span>
                    <span v-else-if="item1.timeout||item1.unavailable||item1.overload" style="color:red">异常：</span>
                    <span v-else style="color:green">正常：</span>
                    <span v-if="item1.inaccessible">
                      <img v-if="item1.timeout" src="../../img/msicon/xintiao_no.png" title="实例心跳超时"/>
                      <img v-else src="../../img/msicon/xintiao.png" title="实例心跳正常"/>
                    </span>
                    <span v-else>
                      <img v-if="item1.timeout" src="../../img/msicon/xintiao_no.png" title="实例心跳超时"/>
                      <img v-else src="../../img/msicon/xintiao.png" title="实例心跳正常"/>
                      <img v-if="item1.unavailable" src="../../img/msicon/lianjie_no.png" title="实例不可用" />
                      <img v-else src="../../img/msicon/lianjie.png" title="实例可用"/>
                      <img v-if="item1.overload" src="../../img/msicon/guozai.png" title="实例过载" />
                      <!-- <img v-else src="../../img/msicon/guozai.png" title="实例负载正常"/> -->
                    </span>
                    
                  </td>
                  <td>{{item1.version}}</td>
                  <td class="moreinfo">
                    <!-- <span>其他</span> -->
                    <span v-show="item1.running_id" @click="goToRunning(item1.running_id)">
                      <img src="../../img/caidanicon/shili_sel.png"/>运行实例</span>
                    <span @click="goToFwts(item1)"><img src="../../img/caidanicon/tiaoshi_sel.png" title="网关已到达"/>服务调试</span>
                    <span @click="goToXnzb(item1)"><img src="../../img/caidanicon/xingneng_sel.png" title=""/>性能&指标</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <PagerBar v-if="serviceList.length!=0" :page="page" @change="searchByPage"></PagerBar>
		<RightTableInfo ref="rightinfo" @toggle="handleRight" :servicename="selectedname" :isshow="showRight"></RightTableInfo>
		<TrafficTableInfo ref="trafficinfo" 
      :isshow="showTraffic" 
      @toggle="showTraffic = false" 
      :service="selectedServiceName"
      :selectedNoList="selectedNoList"
      :selectedVersionList="selectedVersionList"></TrafficTableInfo>
      <div v-if="serviceList.length==0" class="table_td" style="text-align:center;"><span>暂无数据</span> </div>
  </div>
</template>

<script>
export default {
  components:{
    PagerBar:()=>import('../../component/PagerBar'),
    RightTableInfo: () => import('../../component/Microservices/RightTableInfo'),
		TrafficTableInfo: () => import('../../component/Microservices/TrafficTableInfo'),
  },
  data(){
    return{
      page: { 
        current: 1, 
        pagecount: 1, 
        totalCount: 0, 
        pagesize: 10,
        keywords: ''
      }, //页码初始值
      serviceList:[],
      selectedname: '',
      showRight: false,
      showTraffic: false,
      selectedServiceName:{},
      selectedNoList:[],
      selectedVersionList:[]
    }
  },
  methods:{
    beforeGetServiceList(){
      this.page.current=1;
      this.getServiceList();
    },
    getServiceList(){
			var msgview = this.$wool.showloading('正在加载...');
      this.serviceList=[]
      let parame={
        name: this.page.keywords,
        page: this.page.current,
        page_size: this.page.pagesize
      }
      this.$wf.post('devops?method=/devops/gateway/service_summarys',parame).then(res=>{
        msgview.hide(0);
        if(res.items.length==0) this.$wool.showwarn('暂无数据')
        res.items.forEach(item => {
          this.serviceList = [...this.serviceList, item];
        });
        this.page.current=res.page;
        this.page.pagecount=res.page_count;
        this.page.totalCount=res.count;
      }).catch(e=>{
        msgview.hide(0);
        this.$wool.showwarn(e)
      })
    },
    fadeOut(item) {
			if (item.items) {
        //直接对data中数据添加属性，不会立即更新视图
        // item.choose=!item.choose
				this.$set(item, 'choose', !item.choose);
				return;
			}
			let msgview = this.$wool.showloading('正在加载');
			this.$wf.post('?method=/devops/gateway/service_details',{name:item.name})
				.then(data => {
					if (data.length == 0) {
						msgview.msgwarn('暂无其他微服务数据').hide();
						return;
					}
          msgview.hide(0);
          // item.items=data;
          // item.choose=!item.choose;
					this.$set(item, 'items', data);
					this.$set(item, 'choose', !item.choose);
				})
				.catch(e => {
					msgview.msgwarn(e.message).hide();
				});
    },
    searchByPage(p){
      this.page.current=p.page;
      this.getServiceList()
    },
    goToRunning(id){
      let routeData = this.$router.resolve({
        path: '/'+this.site_name+'/runningexample',
        query: {keyword: id},
      })
      window.open(routeData.href, '_blank')
    },
    handleRight(item){
      if (item) {
        this.selectedname = item.name;
      }
      this.showRight = !this.showRight;
    },
    handleTraffic(item){
      this.selectedServiceName = item;
      this.$refs.trafficinfo.resetData();
      // 查询微服务实例详情，将其传入流量控制组件中
      var msgview = this.$wool.showloading('正在加载...');
      this.$wf.post('?method=/devops/gateway/service_details',{name:item.name})
        .then(data => {
          msgview.hide(0);
          if(data.length!=0){
            this.selectedNoList=data.map( ite=>{
              return {
                name: ite.no,
                id: ite.no
              }
            })
            this.selectedVersionList=data.map(ite=>{
              return{
                name:ite.version,
                id: ite.version
              }
            })
          }
          this.showTraffic = !this.showTraffic;
        })
        .catch(e => {
          msgview.msgwarn(e.message).hide();
        });
    },
    goTodoc(name){

      window.open('/apidoc/index?name='+name)
    },
    goToFwts(item1){
      let routeData = this.$router.resolve({
        path: '/'+this.site_name+'/fuwutiaoshi',
        query: {
          sn: item1.name,
          no: item1.no
        },
      })
      window.open(routeData.href, '_blank')
    },
    goToXnzb(item1){
      let routeUrl =this.$router.resolve({
        name: '性能&指标',
        query: {
          sn: item1.name,
          no: item1.no
        }
      })
      window.open(routeUrl.href, '_blank');
    }
  },
  mounted(){
    this.getServiceList()
  }
}
</script>

<style lang="less" scoped>
.service_area{
  width: 98%;
  box-shadow: 0 0.75rem 1.5rem rgba(18,38,63,.03);
  border: 1px solid rgba(0, 123, 255, 0.4);
  border-radius: 6px;
  margin: 1% auto 5% auto;
  background-color: white;
  .query{
    margin-left: 1%;
    //margin-top: 3%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-top:12px;
    padding-bottom:12px;
    .query_input{
      display: flex;
      align-items: flex-start;
      input{
        width: 80%;
        height: 32px;
        display: inline-block;
        border: 1px solid #A6A6A6;
        border-radius: 3px;
        padding-left: 10px;
      }
    
    }
  }
  .project_table{
   width: 100%;
   table-layout: fixed;
   border-top:1px solid rgba(0, 123, 255, 0.4);
   border-collapse: collapse;
    .project_title{
      color: #004085;
      background-color: #f9fbfd;
      border-bottom:1px solid rgba(0, 123, 255, 0.4);

    }
    tr{
      background-color: white;
      .shilibar{
        text-align:center;
        padding: 10px;
        padding-bottom: 20px;
      }
      td{
       white-space: nowrap;
       text-overflow: ellipsis;
       overflow: hidden;
       padding: 15px;
       font-size: 14px;
       height:28px;
      .ms_name{
        padding: 3px 5px;
        color: #363642;
        // background-color: #f7c46c;
        // border-radius: 3px;
        font-weight: bold;
      }
    .msicon{
      width:20px;
      margin-bottom: -5px;
    }
    .settings{
      margin-right: 30px;
      color:#3D83E5;
      cursor: pointer;
      img{
        width:20px;
        margin-bottom: -5px;
        margin-right: 5px;
      }
    }
    .shili-table{
      width:100%;
      border-top: 1px solid rgba(0, 123, 255, 0.4);
      tr{
        td{
          padding: 0;
          height:30px;
          border: 1px solid rgba(0, 123, 255, 0.4);
        }
        .msstatus{
          img{
            width:20px;
            margin-bottom: -5px;
            margin-right: 5px;
          }
        }
        .moreinfo{
          span{
              color:#3D83E5;
              cursor: pointer;
              margin-right: 20px;
              img{
                width:20px;
                margin-bottom: -5px;
                margin-right: 5px; 
              }
          }
        }
      }
      .extend_content{
        td{
          padding: 0 10px;
        }
        .mslink{
          text-align: left;
        }
      }
    }
      }
    .clickarea{
      background-color: #EBF8F6;
    text-align:center;
    cursor: pointer;
    // color:#7F7F7F;
    // border: 2px dotted #008974;
    }
    } 
    tbody{
      border-bottom:1px solid rgba(0,123,255,.4);
      table{
        border:1px solid rgba(0, 123, 255, 0.4);
        // white-space: nowrap;
        // text-overflow: ellipsis;
        .extend_title{
          color: #004085;
          background-color: #FFF0F0;
          border-bottom:1px solid rgba(0, 123, 255, 0.4);
        }
      }
    }
  }
}
</style>