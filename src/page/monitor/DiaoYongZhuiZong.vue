<template>
  <div class="content_area">
    <div class="query_box">
      <div class="choose_time">
        时间段：<WoolPCDateTimePicker class="time_sel" v-model="begin" format="yyyy-MM-dd HH:mm" :autopickdate='false'>
        </WoolPCDateTimePicker> 至
        <WoolPCDateTimePicker class="time_sel" v-model="end" format="yyyy-MM-dd HH:mm" :autopickdate='false'>
        </WoolPCDateTimePicker>
        <span class="refresh" @click="query" >查询</span>
      </div>
      <div class="dierhang">
        <div class="choose_method">
          追踪ID：<input type="text" v-model="idValue">
        </div>
        <div style="margin-left: 1%" class="choose_method">
          方法名：<input type="text" v-model="methodValue">
        </div>
        <div class="choose_name">
          服务名：<SingleSelect :width='100' :items="serviceNameList" @select="changeName" :selectname='serviceName'></SingleSelect>
          <span style="margin-left: 2%">服务编号：<SingleSelect :width='100' :items="serviceNoList" @select="changeNo" :selectname='serviceNo'></SingleSelect></span>
        </div>
      </div>
      
      
    </div>
    <table class="table_content">
      <thead>
        <td>服务名</td>
        <td>追踪 ID</td>
        <td>开始时间</td>
        <td>持续时间</td>
        <td>操作</td>
      </thead>
      <tbody v-for="(item,index) in ServiceList" :key="index">
        <tr>
          <td>{{item.service_name}}</td>
          <td>{{item.id}}</td>
          <td>{{item.start_time || '--'}}</td>
          <td>{{item.duration || '--'}}</td>
          <td><span style="color:#3D83E5;cursor:pointer;" @click="handleCaozuo(item)">详情</span> </td>
        </tr>
        <tr class="tag_content">
          <td  colspan="5" id="tag_td" >
            <div class="tag_name" v-for="(item1,index1) in item.children" :key="index1">
              {{item1.name}}({{item1.num}})
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <PagerBar v-if="ServiceList.length!=0" :page="page" @change="searchByPage"></PagerBar>
    <Detail
      :isshow='showDetail'
      @tapCloser='showDetail=!showDetail'
      :id='id'
    >
    </Detail>
    <div v-if="ServiceList.length==0" class="table_td" style="text-align:center;"><span>暂无数据</span> </div>
  </div>
</template>
<script>
export default {
  components:{
    PagerBar: ()=>import('../../component/PagerBar'),
    SingleSelect: () => import('../../component/SingleSelect.vue'),
    WoolPCDateTimePicker:()=>import('../../component/WoolPCDateTimePicker.vue'),
    Detail:()=>import('../../component/DiaoYongZZ/Detail'),
  },
  data(){
    return{
      ServiceList: [],
      begin: '',
      end: '',
      queryKsTime: '',
      queryJsTime: '',
      serviceNameList:[],
      serviceNoList:[],
      serviceName:'',
      serviceNo:'',
      methodValue: '',
      page:{
        current: 1, 
        pagecount: 1, 
        totalCount: 0, 
        pagesize: 10
      },
      showDetail: false,
      id:'',
      idValue:''
    }
  },
  methods:{
    query(){
      if(!this.begin && !this.end){
        this.$wool.showwarn("时间为必要查询条件！")
        return
      }
      if(new Date(this.begin)>=new Date(this.end)){
        this.$wool.showwarn("时间选择错误！")
      }else if(new Date(this.end)-new Date(this.begin)<=10000){
        this.$wool.showwarn("时间间隔必须大于1秒")
      }else{
        // console.log(this.begin)
        // console.log(new Date(this.end))
        this.queryKsTime=new Date(this.begin);
        this.queryJsTime=new Date(this.end);
        this.page.current=1;
        this.getServiceList();
      }
    },
    handleCaozuo(item){
      this.id=item.id;
      this.showDetail=true;
    },
    searchByPage(p){
      this.page.current=p.page;
      this.getServiceList();
    },
    changeName(sn){
      this.serviceName=sn;
      this.serviceNoList=[];
      this.$wf.post("devops?method=/devops/gateway/service_details",{name:sn}).then(res=>{
        res.forEach(item=> {
          this.serviceNoList = [...this.serviceNoList,{name: item.no, id: item.no}]
        })
      })
    },
    changeNo(sno){
      this.serviceNo=sno;
    },
    getServiceList(){
      var msgview=this.$wool.showloading('加载中...')
      let parame={
        begin: this.queryKsTime,
        end: this.queryJsTime,
        method: this.methodValue,
        page: this.page.current,
        page_size: this.page.pagesize,
        service_name: this.serviceName,
        service_no: this.serviceNo,
        id: this.idValue
      }
      this.$wf.post('devops?method=/devops/tracer/search',parame).then(res=>{
        msgview.hide(0);
        this.page.pagecount= res.page_count;
        this.page.totalCount=res.count;
        this.ServiceList=res.items;
        for(let i=0;i<this.ServiceList.length;i++){
          let date=this.ServiceList[i].start_time;
          if(date){
            var y=date.getFullYear();
            var mon=date.getMonth()+1;
            mon=mon <10 ? ("0"+mon) : mon;
            var d=date.getDate();
            d=d <10 ? ("0"+d) : d;
            var h=date.getHours();
            h=h <10 ? ("0"+h) : h;
            var m=date.getMinutes();
            m=m <10 ? ("0"+m) : m;
            var s=date.getSeconds();
            s=s <10 ? ("0"+s) : s;
            this.ServiceList[i].start_time=y+'-'+mon+'-'+d+' '+h+':'+m+':'+s;
          }
          
        }
      }).catch(e=>{
        msgview.hide(0);
        this.$wool.showwarn(e)
      })
    },
    getNameList(){
      var msgview=this.$wool.showloading('加载中...')
      this.$wf.post("devops?method=/devops/metrics/ms_name_tags").then(res=>{

        this.serviceNameList=res.map((item,index)=>{
          return {
            name: item,
            id: item
          }
        })
        msgview.hide(0);
      }).catch(e=>{
        msgview.hide(0);
      })
    },
  },
  mounted(){
    this.getNameList();
    Date.prototype.Format=function(){
      let y=this.getFullYear();
      let mon=this.getMonth()+1;
      mon=mon <10 ? ("0"+mon) : mon;
      let d=this.getDate();
      d=d <10 ? ("0"+d) : d;
      let h=this.getHours();
      h=h <10 ? ("0"+h) : h;
      let m=this.getMinutes();
      m=m <10 ? ("0"+m) : m;
      return y+'-'+mon+'-'+d+' '+h+':'+m;
    }
    //获取前五分钟时间段
    var time=new Date()
    this.end=time.Format();
    this.begin=new Date((time.getTime()-60000)).Format();
    this.query();
  }
}
</script>

<style lang="less" scoped>
.content_area{
  width: 98%;
  box-shadow: 0 0.75rem 1.5rem rgba(18,38,63,.03);
  border: 1px solid rgba(0, 123, 255, 0.4);
  border-radius: 6px;
  margin: 1% auto 5% auto;
  background-color: white;
  .table_content{
    width: 100%;
    table-layout: fixed;
    //border: 1px solid #edf2f9;
    border-top:1px solid rgba(0, 123, 255, 0.4);
    border-collapse: collapse;
    thead{
      color: #004085;
      background-color: #f9fbfd;
      border-bottom:1px solid rgba(0, 123, 255, 0.4);
    }
    td{
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      padding: 15px 0;
      padding-left: 15px;
      padding-right: 15px;
      // border-bottom:1px solid rgba(0, 123, 255, 0.4);
      font-size: 14px;
      height:28px;
    }
  }
  .query_box{
    padding: 1%;
    // display: flex;
    // align-items: center;
    font-size: 14px;
    .choose_time{
      display: inline-block;
      width: 100%;
    }
    .dierhang{
      display: flex;
      align-items: center;
      padding: 1% 0;
      .choose_method{
        display: inline-block;
        input{
          width: 150px;
          height: 32px;
          display: inline-block;
          border: 1px solid #AFABAB;
          border-radius: 4px;
          padding-left: 10px;
        }
      }
      .choose_name{
        width: 50%;
        margin-left: 1%;
        // display: inline-block;
      }
    }
    
  }
}
.tag_content{
  border-bottom:1px solid rgba(0, 123, 255, 0.4);
  #tag_td{
    padding: 0;
    padding-bottom: 5px;
  }
  .tag_name{
    display: inline-block;
    text-align: center;
    background: crimson;
    padding: 5px;
    margin-left: 1%;
    color: white;
    border-radius: 5px;
    cursor: pointer;
  }
}

.time_sel {
  text-align: center;
  border: solid 1px #DEDEDE;
  height: 26px;
}
.refresh{
  display: inline-block;
  text-align: center;
  width: 60px;
  height: 34px;
  line-height: 34px;
  color: white;
  border-radius: 5px;
  background-color: #1862c6;
  cursor: pointer;
  font-size: 14px;
  margin-left: 1%;
}
</style>
