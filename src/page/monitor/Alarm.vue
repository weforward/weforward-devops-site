<template>
  <div class="zhuti_area">
    <div class="query_area">
      <div :class="['query_button',{'button_sel': notSel}]" @click="handleTime('YE')">昨天</div>
      <div :class="['query_button',{'button_sel': !notSel}]" @click="handleTime('TD')">今天</div>
      时间段：<WoolPCDateTimePicker class="time_sel" v-model="begin" format="yyyy-MM-dd HH:mm" :autopickdate='false'></WoolPCDateTimePicker>至
      <WoolPCDateTimePicker class="time_sel" v-model="end" format="yyyy-MM-dd HH:mm" :autopickdate='false'></WoolPCDateTimePicker>
      <span style="margin-left: 2%;">关键字：<input type="text" class="keyword_input" @keydown.enter="query" v-model="keyword"></span> 
      <span class="refresh" @click="query" >查询</span>
    </div>
    
    <table class="table_area">
      <thead class="table_thead">
        <td class="table_td" style="width:23%">ID</td>
        <td class="table_td" style="width:15%">时间</td>
        <td class="table_td" style="width:35%">内容</td>
        <td class="table_td" style="width:27%">详情</td>
      </thead>
      <tbody>
        <tr v-for="(item,index) in alarmList" :key="index">
          <td class="table_td">{{item.id}}</td>
          <td class="table_td">{{item.time.Format()||'--'}}</td>
          <td class="table_td" :title="item.content">{{item.content}}</td>
          <td class="table_td xiangqing" :title="item.detail_url || '--'" @click="goToUrl(item)">{{item.detail_url || '--'}}</td>
        </tr>
      </tbody>
    </table>
    <PagerBar v-if="alarmList.length!=0" :page="page" @change="searchByPage"></PagerBar>
    <div v-if="alarmList.length==0" class="table_td" style="text-align:center;"><span>暂无数据</span> </div>
  </div>
</template>

<script>
export default {
  components:{
    PagerBar: ()=>import('../../component/PagerBar'),
    WoolPCDateTimePicker:()=>import('../../component/WoolPCDateTimePicker.vue'),
  },
  data(){
    return{
      alarmList:[],
      page:{
        current: 1, 
        pagecount: 1, 
        totalCount: 0, 
        pagesize: 10
      },
      begin:'',
      end:'',
      queryKsTime:'',
      queryJsTime:'',
      keyword: '',
      notSel: true
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
        this.queryKsTime=new Date(this.begin);
        this.queryJsTime=new Date(this.end);
        this.page.current=1;
        this.getAlarmList();
      }
    },
    goToUrl(item){
      if(!item.detail_url){
        return
      }else{
        window.open(item.detail_url)
      }
    },
    getAlarmList(){
      var msgview=this.$wool.showloading('加载中...')
      let parame={
        begin: this.queryKsTime,
        end: this.queryJsTime,
        keywords: this.keyword,
        page:this.page.current,
        page_size: 10
      }
      this.$wf.post('devops?method=/devops/home/alarms',parame).then(res=>{
        msgview.hide(0);
        this.page.pagecount= res.page_count;
        this.page.totalCount=res.count;
        this.alarmList=res.items;
      }).catch(e=>{
        msgview.hide(0);
        this.$wool.showwarn(e);
      })
    },
    searchByPage(p){
      this.page.current=p.page;
      this.getAlarmList();
    },
    handleTime(op){
      if(op=='YE'){
        this.notSel=false;
        var time=new Date(new Date().getTime()-24*60*60*1000);
        this.begin=time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()+' 00:00';
        this.end=time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()+' 23:59';
        this.query();
      }else if(op=='TD'){
        this.notSel=true;
        this.newTime();
        this.query();
      }
    },
    newTime(){
      //获取今天0点到现在得时间段
      var time=new Date()
      this.end=time.Format('y-M-d h:m');
      this.begin=time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()+' 00:00';
    }
  },
  
  mounted(){
    Date.prototype.Format=function(op){
      let y=this.getFullYear();
      let mon=this.getMonth()+1;
      mon=mon <10 ? ("0"+mon) : mon;
      let d=this.getDate();
      d=d <10 ? ("0"+d) : d;
      let h=this.getHours();
      h=h <10 ? ("0"+h) : h;
      let m=this.getMinutes();
      m=m <10 ? ("0"+m) : m;
      let s=this.getSeconds();
      s=s <10 ? ("0"+s) : s;
      if(!op){
        return y+'-'+mon+'-'+d+' '+h+':'+m+':'+s;
      }else{
        return y+'-'+mon+'-'+d+' '+h+':'+m;
      }
    };
    this.newTime();
    this.query();
  }
}
</script>
<style lang="less" scoped>
.query_area{
  padding: 1%;
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
.time_sel{
  // padding: 5px 0;
  text-align: center;
  border: solid 1px #DEDEDE;
  height: 26px;
}
.xiangqing{
  color: #3D83E5;
  cursor: pointer;
}
.query_button{

  margin-right: 1%;
}
.button_sel{
  background-color: white;
  color: #1862c6;
  border: 1px #1862c6 solid;
}
</style>