<template>
  <div class="wangguan_area">
    <!-- <div class="item_title"><span>Quick Facts</span></div> -->
    <div class="selbox">
      服务名：<SingleSelect :width='150' :items="serviceNameList" @select="changeName" :selectname='serviceName'></SingleSelect>
      <span style="margin-left: 3%;">服务编号：<SingleSelect :width='150' :items="serviceNoList" @select="changeNo" :selectname='serviceNo'></SingleSelect></span>
      <span style="margin-left: 3%;">
        <WoolPCDateTimePicker class="time_sel" v-model="kaishiTime" format="yyyy-MM-dd HH:mm" :autopickdate='false'>
        </WoolPCDateTimePicker> 至
        <WoolPCDateTimePicker class="time_sel" v-model="jieshuTime" format="yyyy-MM-dd HH:mm" :autopickdate='false'>
        </WoolPCDateTimePicker>
        <div style="margin-left:1%;" class="query_button" @click="freshEcharts">查询</div>
        <div class="query_button" @click="freshEcharts">刷新</div>
      </span>
    </div>
    <div class="facts_boxs">
      <div style="margin-left: 10px;" :class="['query_button',{'is_sel':!isOnTime }] " @click="clickTime('onTime')">实时</div>
      <div style="padding-left: 10px;padding-right: 10px;" :class="['query_button',{'is_sel':!isRecentHour }]" @click="clickTime('recentHour')">近24小时</div>
      <div :class="['query_button',{'is_sel':!isRecentDay }]" @click="clickTime('recentDay')">近7天</div>
      <div class="item" style="width:180px">
        <span>启动时间</span><br>
        <span>{{startTime || '--'}}</span>
      </div>
      <div class="item" style="width:180px">
        <span>持续时间</span><br>
        <span>{{loadTime || '--'}}</span>
      </div>
      <div class="item">
        <span>内存上限</span><br>
        <span>{{neicunMax || '--'}}</span>
      </div>
      <div class="item">
        <span>已用内存</span><br>
        <span>{{usedNeicun || '--'}}</span>
      </div>
      <div class="item">
        <span>已分配内存</span><br>
        <span>{{fenpeiNeicun || '--'}}</span>
      </div>
    </div>
    <div class="item_title" style="margin-bottom: 5px;margin-top: 10px;"><span>内存</span></div>
    <div class="JVM_box" style="width: 98%;background-color: #fff;border-radius: 5px;border: #e3ebf6 1px solid;"></div>
    <div class="item_title"><span>JVM Misc</span></div>
    <div class="JVM_box">
      <div id="cpu_box"></div>
      <div id="thread_box"></div>
      <div id="GC_box"></div>
    </div>
    <div class="item_title"><span>Weforward RPC</span></div>
    <div class="JVM_box" style="height: 550px">
      <div id="RPC_pl"></div>
      <div id="RPC_error_num"></div>
      <div id="spend_time"></div>
      <div id="spendtime_max"></div>
      <div id="RPC_num"></div>
    </div>

  </div>
</template>

<script>
// 引入 ECharts 主模块
var echarts = require('echarts');
export default{
  components:{
    SingleSelect: () => import('../../component/SingleSelect.vue'),
    WoolPCDateTimePicker:()=>import('../../component/WoolPCDateTimePicker.vue')
  },
  data(){
    return{
      serviceNameList: [],
      serviceName: '',
      serviceNoList: [],
      serviceNo: '',
      startTime: '',
      loadTime: '',
      neicunMax: '',
      usedNeicun: '',
      fenpeiNeicun: '',
      timerList:[],
      kaishiTime: '',
      jieshuTime: '',
      queryKsTime:'',
      queryJsTime: '',
      isOnTime: false,
      isRecentHour: false,
      isRecentDay: false
    }
  },
  watch:{
  },
  methods:{
    freshEcharts(){
      if(!this.serviceName && !this.serviceNo){
        this.$wool.showwarn("请选择服务编号和服务名！")
        return;
      }
      if(!this.kaishiTime && !this.jieshuTime){
        return;
      }else{
        this.isOnTime=false;
        this.isRecentHour=false;
        this.isRecentDay=false;
        if(new Date(this.kaishiTime)>=new Date(this.jieshuTime)){
          this.$wool.showwarn("时间选择错误！")
        }else if(new Date(this.jieshuTime)-new Date(this.kaishiTime)<=60000){
          this.$wool.showwarn("时间间隔必须大于1分钟")
        }else{
          this.queryKsTime=new Date(this.kaishiTime);
          this.queryJsTime=new Date(this.jieshuTime);
          this.drawEcharts();
        }
      }
    },
    clickTime(op){
      if( this.serviceName && this.serviceNo){
        this.kaishiTime='';
        this.jieshuTime='';
        this.queryJsTime=new Date();
        if(op=='onTime'){
          this.isOnTime=true;
          this.isRecentHour=false;
          this.isRecentDay=false;
          this.queryKsTime=new Date(this.queryJsTime.getTime()-(30*60*1000));
        }else if(op=='recentHour'){
          this.isOnTime=false;
          this.isRecentHour=true;
          this.isRecentDay=false;
          this.queryKsTime=new Date(this.queryJsTime.getTime()-(24*60*60*1000));
          this.kaishiTime=this.queryKsTime.Format('y-M-d h:m');
          this.jieshuTime=this.queryJsTime.Format('y-M-d h:m');
        }else if(op=='recentDay'){
          this.isOnTime=false;
          this.isRecentHour=false;
          this.isRecentDay=true;
          this.queryKsTime=new Date(this.queryJsTime.getTime()-(7*24*60*60*1000));
          this.kaishiTime=this.queryKsTime.Format('y-M-d h:m');
          this.jieshuTime=this.queryJsTime.Format('y-M-d h:m');
        }
        this.drawEcharts();

      }else{
        return;
      }
      
    },
    changeName(sn){
      this.serviceName=sn;
      this.serviceNoList=[];
      this.$wf.post("devops?method=/devops/gateway/service_details",{name:sn}).then(res=>{
        res.forEach(item=> {
          this.serviceNoList = [...this.serviceNoList,{name: item.no, id: item.no}]
          this.changeNo(this.serviceNoList[0].id);
        })
      })
    },
    async changeNo(sno){
      this.serviceNo=sno;
      let parame={
        name: this.serviceName,
        no: this.serviceNo
      }
      var msgview=this.$wool.showloading('加载中......')
      
      try{
        let time= await this.$wf.post("devops?method=/devops/metrics/ms_start_time",parame);
        if(time){
          var date=new Date(time);
          this.startTime=date.Format();
        }
        this.loadTime= await this.$wf.post("devops?method=/devops/metrics/ms_up_time",parame);
        this.neicunMax= await this.$wf.post("devops?method=/devops/metrics/ms_memory_max",parame);
        this.usedNeicun=await this.$wf.post("devops?method=/devops/metrics/ms_memory_used",parame);
        this.fenpeiNeicun=await this.$wf.post("devops?method=/devops/metrics/ms_memory_alloc",parame);
        msgview.hide(0);
      }catch(e){
        msgview.hide(0);
        this.$wool.showwarn(e)
      }
      
      this.isOnTime=true;
      this.isRecentHour=false;
      this.isRecentDay=false;
      this.drawEcharts();
    },
    getServiceList(){
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
        this.$wool.showwarn(e)
      })
    },


    //第一个双折线图表
    async drawMemory(){
      let that=this;
      var xData=[];
      var series1=[];
      var series2=[];

      //先取30分钟的数据
      // let end=new Date()
      // let begin=new Date(end.getTime()-(30*60*1000));
      var myChart=echarts.init(document.getElementsByClassName('JVM_box')[0])
      let parame={
        end:this.queryJsTime,
        begin:this.queryKsTime,
        name: this.serviceName,
        no: this.serviceNo
      }
      let fenpei=await this.$wf.post("devops?method=/devops/metrics/ms_memory_alloc_range",parame)
      let used=await this.$wf.post("devops?method=/devops/metrics/ms_memory_used_range",parame)
      // console.log(fenpei)
      
      handleData(fenpei,"s1")
      handleData(used,"s2")


      //处理数据
      function handleData(data,ser){
        if(!data) return;
        xData=[];
        if(ser=='s1') series1=[];
        if(ser=='s2') series2=[];
        var zjSeries=[];
        //若为近七天数据，显示日期
        if(that.queryJsTime-that.queryKsTime>(3*24*60*60*1000) && that.queryJsTime-that.queryKsTime<(7*24*60*60*1000)){
          roundData("MM-dd hh")
        }else if(that.queryJsTime-that.queryKsTime>=(7*24*60*60*1000)){
          roundData("YYYY-MM-DD hh:mm")
        }else{
          roundData("hh:mm")
        }
        function roundData(dataNeixing){
          var M= 1024*1024
          for(let i=0;i<data.length;i++){
            xData.push(data[i].time.format(dataNeixing));
            zjSeries.push(Math.floor(data[i].value/M * 100) / 100)
          }
          if(ser=='s1'){
            series1=zjSeries;
          }else{
            series2=zjSeries;
          }
        }

        
      }

      
      async function newData() {
        let newend=new Date()
        let newbegin=new Date(newend.getTime()-(30*60*1000));
        let parame={
          end: newend,
          begin: newbegin,
          name: that.serviceName,
          no: that.serviceNo
        }
        let newfenpei=await that.$wf.post("devops?method=/devops/metrics/ms_memory_alloc_range",parame)
        let newused=await that.$wf.post("devops?method=/devops/metrics/ms_memory_used_range",parame)
        handleData(newfenpei,"s1");
        handleData(newused,"s2");
      }


      let option = {
          title: {
            text: '内存',
            x: 'center',
            textStyle:{
              fontSize: 15
            }
          },
          tooltip: {
              trigger: 'axis',   //移动至点显示数值
              axisPointer: {
                  animation: false
              }
          },
          xAxis: {
              type: 'category',
              splitLine: {
                  show: false
              },
              data: xData,
            boundaryGap: false,

          },
          yAxis: {
              type: 'value',
              boundaryGap: [0, '100%'],
              splitLine: {
                  show: false
              },
              axisLabel: {
                formatter:'{value}M'
              },
          },
          series: [
            {
              name: '已用内存',
              type: 'line',
              showSymbol: false,
              hoverAnimation: false,
              areaStyle:{},
              data: series2
          },{
              name: '已分配内存',
              type: 'line',
              showSymbol: false,
              hoverAnimation: false,
              areaStyle:{},
              data: series1
          }
          ],
          grid:{
            x: 60,
            y: 40,
            x2: 25,
            y2: 50
          },
          color: ['#E062AE','#3398DB']//['#E062AE','#FF7F00']//
      };

      //避免刚进入定时器延缓造成的图表为空
      myChart.setOption(option)

      if(!this.kaishiTime){
        //刷新图表
        var t= setInterval(function () {
          newData()
          option.xAxis.data=xData
          option.series[1].data=series1
          option.series[0].data=series2
          myChart.setOption(option)
           
        }, 10000);
      }
      //向定时器列表添加定时器，退出时销毁
      this.timerList.push(t)
    },

    //后面7个单折线图表
    async drawJvm(op){
      var xData=[];
      var yData=[];
      let that=this;

      //取前30分钟数据，一秒等于一千毫秒,1分钟等于1*60*1000
      // let end=new Date()
      // let begin=new Date(end.getTime()-(30*60*1000));

      let parame={
        end: this.queryJsTime,
        begin: this.queryKsTime,
        name: this.serviceName,
        no: this.serviceNo
      }

      //初始数据
      if(op=='cpu_box'){
        let cpu= await this.$wf.post("devops?method=/devops/metrics/ms_cpu_usage_rate_range",parame)
        handleData(cpu)
        var myChart1=echarts.init(document.getElementById('cpu_box'))
      }else if(op=='thread_box'){
        var myChart2=echarts.init(document.getElementById('thread_box'))
        let thread= await this.$wf.post("devops?method=/devops/metrics/ms_thread_count_range",parame)
        handleData(thread)
      }else if(op=='GC_box'){
        var myChart3=echarts.init(document.getElementById('GC_box'))
        let GC= await this.$wf.post("devops?method=/devops/metrics/ms_gc_full_count_range",parame)
        handleData(GC)
      }else if(op=='RPC_pl'){
        var myChart4=echarts.init(document.getElementById('RPC_pl'))
        let RPC_pl= await this.$wf.post("devops?method=/devops/metrics/gw_ms_rpc_request_count_range",parame)
        handleData(RPC_pl)
      }else if(op=='RPC_error_num'){
        var myChart5=echarts.init(document.getElementById('RPC_error_num'))
        let RPC_error_num= await this.$wf.post("devops?method=/devops/metrics/gw_ms_rpc_request_count_error_range",parame)
        handleData(RPC_error_num)
      }else if(op=='spend_time'){
        var myChart6=echarts.init(document.getElementById('spend_time'))
        let spend_time= await this.$wf.post("devops?method=/devops/metrics/ms_rpc_request_totalimel_range",parame)
        handleData(spend_time)
      }else if(op=='spendtime_max'){
        var myChart7=echarts.init(document.getElementById('spendtime_max'))
        let spendtime_max= await this.$wf.post("devops?method=/devops/metrics/ms_rpc_request_maxl_range",parame)
        handleData(spendtime_max)
      }else if(op=='RPC_num'){
        var myChart8=echarts.init(document.getElementById('RPC_num'))
        let RPC_num= await this.$wf.post("devops?method=/devops/metrics/gw_ms_rpc_current_request_range",parame)
        handleData(RPC_num)
      }
     
      //处理数据
      function handleData(data){
        if(!data) return
        xData=[];
        yData=[];
        //若为近七天数据，显示日期
        if(that.queryJsTime-that.queryKsTime>(3*24*60*60*1000) && that.queryJsTime-that.queryKsTime<(7*24*60*60*1000)){
          roundData("MM-dd hh")
        }else if(that.queryJsTime-that.queryKsTime>=(7*24*60*60*1000)){
          roundData("YYYY-MM-DD hh:mm")
        }else{
          roundData("hh:mm")
        }
        function roundData(dataNeixing){
          for(let i=0;i<data.length;i++){
            xData.push(data[i].time.format(dataNeixing)) 
            yData.push(data[i].value)
          }
        }
      }

      //刷新数据
      async function newData(){
        let newend=new Date()
        let newbegin=new Date(newend.getTime()-(30*60*1000));
        let parame={
          end:newend,
          begin:newbegin,
          name: that.serviceName,
          no: that.serviceNo
        }
       
        if(myChart1){
          let cpu= await that.$wf.post("devops?method=/devops/metrics/ms_cpu_usage_rate_range",parame)
          
          handleData(cpu)
        }else if(myChart2){
          let thread= await that.$wf.post("devops?method=/devops/metrics/ms_thread_count_range",parame)
          
          handleData(thread)
        }else if(myChart3){
          let GC= await that.$wf.post("devops?method=/devops/metrics/ms_gc_full_count_range",parame)
          
          handleData(GC)
        }else if(myChart4){
          let RPC_pl= await that.$wf.post("devops?method=/devops/metrics/ms_rpc_request_count_range",parame)
          
          handleData(RPC_pl)
        }else if(myChart5){
          let RPC_error_num= await that.$wf.post("devops?method=/devops/metrics/ms_rpc_request_count_error_range",parame)
          
          handleData(RPC_error_num)
        }else if(myChart6){
          let spend_time= await that.$wf.post("devops?method=/devops/metrics/ms_rpc_request_totalimel_range",parame)
         
          handleData(spend_time)
        }else if(myChart7){
          let spendtime_max= await that.$wf.post("devops?method=/devops/metrics/ms_rpc_request_maxl_range",parame)
          
          handleData(spendtime_max)
        }else if(myChart8){
          let RPC_num= await that.$wf.post("devops?method=/devops/metrics/ms_rpc_current_request_range",parame)
          
          handleData(RPC_num)
        }
      }
     
      let option = {
          title: {
              text: '动态数据 + 时间坐标轴',
              x: 'center',
              textStyle:{
                fontSize: 15
              }
          },
          tooltip: {
              trigger: 'axis',
              axisPointer: {
                  animation: false
              }
          },
          xAxis: {
              type: 'category',
              splitLine: {
                  show: false
              },
              data: xData,
            boundaryGap: false,

          },
          yAxis: {
              type: 'value',
              boundaryGap: [0, '100%'],
              splitLine: {
                  show: false
              }
          },
          series: [{
              name: '',
              type: 'line',
              showSymbol: false,
              hoverAnimation: false,
              areaStyle:{},
              data: yData
          }],
          grid:{
            x: 50,
            y: 40,
            x2: 25,
            y2: 50
          },
          color: ['#3398DB']
      };

      
      if(myChart1){
        option.title.text='CPU使用率'
        option.series[0].name='CPU使用率'
        option.yAxis.axisLabel={
          formatter:'{value}%'
        }
      }else if(myChart2){
        option.title.text='线程数';
      }else if(myChart3){
        option.title.text='GC次数',
        option.series[0].name='GC次数'
      }else if(myChart4){
        option.title.text='RPC次数',
        option.series[0].name='次数'
      }else if(myChart5){
        option.title.text='错误次数',
        option.series[0].name='错误次数'
      }else if(myChart6){
        option.title.text='耗时',
        option.series[0].name='耗时'
      }else if(myChart7){
        option.title.text='分钟内最大耗时',
        option.series[0].name='分钟内最大耗时'
        option.yAxis.axisLabel={
          formatter:'{value}ms'
        }
      }else if(myChart8){
        option.title.text='并发数',
        option.series[0].name='并发数'
      }

      function setfun(my){
        my.setOption(option)
      }

      //避免刚进入定时器延缓造成的图表为空
      if(myChart1) setfun(myChart1)
      if(myChart2) setfun(myChart2)
      if(myChart3) setfun(myChart3)
      if(myChart4) setfun(myChart4)
      if(myChart5) setfun(myChart5)
      if(myChart6) setfun(myChart6)
      if(myChart7) setfun(myChart7)
      if(myChart8) setfun(myChart8)

      // 实时开始时间为空，其他则不为空
      if(!this.kaishiTime){
        var timer = setInterval(function () {
          newData();
          option.xAxis.data=xData;
          option.series[0].data=yData
          if(myChart1) setfun(myChart1);
          else if(myChart2) setfun(myChart2);
          else if(myChart3) setfun(myChart3)
          else if(myChart4) setfun(myChart4)
          else if(myChart5) setfun(myChart5)
          else if(myChart6) setfun(myChart6)
          else if(myChart7) setfun(myChart7)
          else if(myChart8) setfun(myChart8)
          
        }, 10000);
        //向定时器列表添加定时器，退出时销毁
        this.timerList.push(timer)
      }
      
    },


    drawEcharts(){
      //调用之前先清除定时器
      console.log(this.timerList);
      for(let i=0;i<this.timerList.length;i++){
        clearInterval(this.timerList[i])
      }
      this.drawMemory();
      this.drawJvm('cpu_box');
      this.drawJvm('thread_box');
      this.drawJvm('GC_box');
      this.drawJvm('RPC_pl');
      this.drawJvm('RPC_error_num');
      this.drawJvm('spend_time');
      this.drawJvm('spendtime_max');
      this.drawJvm('RPC_num');
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
    }
    this.queryJsTime=new Date();
    this.queryKsTime=new Date(this.queryJsTime.getTime()-(30*60*1000));
    if(this.$route.query.sn){
      this.serviceName=this.$route.query.sn;
      console.log(this.serviceName)
      this.changeNo(this.$route.query.no)

    }else if(this.$route.query){
      this.getServiceList();
    }
    
  },
  destroyed(){
    //清除定时器
    console.log(this.timerList)
    for(let i=0;i<this.timerList.length;i++){
      clearInterval(this.timerList[i])
    }
  }
}
</script>

<style lang='less' scoped>
.wangguan_area{
  width: 98%;
 /* box-shadow: 0 0.75rem 1.5rem rgba(18,38,63,.03);
  border: 1px solid rgba(0, 123, 255, 0.4);
  border-radius: 6px; */
  margin: 1% auto 5% auto;
  /* background-color: white; */
  .facts_boxs{
    text-align: center;
    display: flex;
    align-items: center;
    // justify-content: center;
    .item{
      text-align: center;
      margin: 1% 0 10px 10px;
      padding:10px 0;
      background-color: #fff;
      border: 1px solid rgb(227, 235, 246);
      border-radius: 5px;
      width:150px;
      span:first-child{
        color:#004085;
      }
      span{
        color:#E062AE;
      }
    }
   
  } 
  .selbox{
    margin-left: 1%;
    margin-top: 10px;
    // width:280px;
  }
  .item_title{
    font-weight: bold;
    color:#004085;
    margin-top: 20px;
  }
  .JVM_box{
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: 250px;
    /* background-color: #fff;
    border-radius: 5px; */
    padding-top: 5px;
    #cpu_box{
      width: 50%;
      height: 100%;
      // margin-left: 1%;
      background-color: #fff;
      border-radius: 5px;
      padding-top: 5px;
      border: #e3ebf6 1px solid;
    }
    #thread_box{
      width: 23%;
      height: 100%;
      margin-left: 1%;
      border: #e3ebf6 1px solid;
      background-color: #fff;
      border-radius: 5px;
      padding-top: 5px;
    }
    #GC_box{
      width: 23%;
      height: 100%;
      margin-left: 1%;
      background-color: #fff;
      border-radius: 5px;
      padding-top: 5px;
      border: #e3ebf6 1px solid;
    }
    #RPC_pl{
      width: 32%;
      height: 49%;
      background-color: #fff;
      border-radius: 5px;
      padding-top: 5px;
      border: #e3ebf6 1px solid;
    }
    #RPC_error_num{
      width: 32%;
      height: 49%;
      margin-left: 1%;

      background-color: #fff;
      border-radius: 5px;
      padding-top: 5px;
      border: #e3ebf6 1px solid;
    }
    #spend_time{
      width: 32%;
      height: 49%;
      margin-left: 1%;
      background-color: #fff;
      border-radius: 5px;
      padding-top: 5px;
      border: #e3ebf6 1px solid;
    }
    #spendtime_max{
      width: 48.5%;
      height: 49%;
      margin-top: 1%;
      background-color: #fff;
      border-radius: 5px;
      padding-top: 5px;
      border: #e3ebf6 1px solid;
    }
    #RPC_num{
      width: 48.5%;
      height: 49%;
      margin-left: 1%;
      margin-top: 1%;
      background-color: #fff;
      border-radius: 5px;
      padding-top: 5px;
      border: #e3ebf6 1px solid;
    }
    
  }
}
.time_sel {
  padding:2px 15px;
  text-align: center;
  // background-color: #d1ecf1;
  border: solid 1px #DEDEDE;
  height: 26px;
}
.query_button{
  margin-right: 1%;
}
.is_sel{
  background-color: white;
  color: #1862c6;
  border: 1px #1862c6 solid;
}
</style>
