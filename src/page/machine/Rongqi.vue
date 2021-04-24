<template>
  <div class="project_area">
    <div class="query">
      <div class="query_input">
        <input type="text" v-model="page.keywords" @keyup.enter='searchByKeyword'/>
        <div class="query_button" @click="searchByKeyword">
          查询
        </div>
      </div>
      <div class="query_group">
        <div class="query_select">
          运维组：<SingleSelect :items="groupName" @select="selectByGroup">
          </SingleSelect>
        </div>
        <div class="add_button" @click="addMachine">
          +添加
        </div>
      </div>
    </div>
    <table class="project_table">
        <tr class="project_title">
          <!-- <td style="width:22%">项目id</td> -->
          <td style="width:10%">容器/运维组</td>
          <!-- <td style="width:8%">运维组</td> -->
          <td style="width:84%;text-align:center;" colspan="4">所在服务器情况</td>
          <!-- <td style="width:10%">所有者</td>
          <td style="width:15%">映射</td>
          <td style="width:25%">环境变量</td>
          <td style="width:20%">属性</td> -->
          <td style="width:6%">操作</td>
        </tr>
        <tbody v-if="!noData">
          <tr v-for="(item,index) in machineList" :key='index'>
            <td class="rongqi_td">
        <img src="../../img/caidanicon/rongqi_sel.png" />
              <span class="rongqiName" v-if="item.name" :title="item.name">{{item.name}}</span>
              <span class="rongqiName" v-else>--</span>
        <br/>
        <span class="yunweizu" v-if='item.groups.length!=0' v-for="(g, idx) in item.groups" :key="idx" :title='g.name'>
          {{ g.name }}
          <br />
        </span>
        <span class="yunweizu" v-if="item.groups.length==0">--</span>
            </td>
          <!-- <td>
            
            </td> -->
            <td style="font-size: 12px;line-height: 18px;">
              <span v-if="item.showloading"><Loading :isshow="item.showloading"></Loading></span>
              <span v-else>
                <span>系统负载（{{item.cpuNum || '--'}}核CPU）：{{item.agentLoadAverage || '--'}}%<br/></span>
                <span>内存情况：已用{{item.agentMemoryUsed || '--'}}，总内存{{item.agentMemoryTotal || '--'}}<br/></span>
                <span>磁盘空间：已用{{item.agentDistUsed || '--'}}，总空间{{item.agentDistTotal || '--'}}<br/></span>
                <span>持续时间：{{item.loadtime || '--'}}<br/></span>
                <span>启动时间：{{item.starttime ? item.starttime.format('yyyy-MM-dd hh:mm:ss') : '--'}}<br/></span>

                <span v-if="item.props.length!=0">{{item.props[0].key}}:{{item.props[0].value}}</span>
                <span v-else>--</span>
              </span>
            </td>
            <td class="statphoto">
              <div class="echarts_tb">
                <span v-if="item.showloading"><Loading :isshow="item.showloading"></Loading></span>
                <div v-else>
                  <div class="echarts1" :class="item.noload ? '' : 'echarts_wh'"></div>
                  <div v-if="item.noload">--</div>
                </div>
              </div>
            </td>
            <td class="statphoto">
              <div class="echarts_tb">
                <span v-if="item.showloading"><Loading :isshow="item.showloading"></Loading></span>
                <div v-else >
                  <div class="echarts2" :class="item.nomeomory ? '' : 'echarts_wh'"></div>
                  <div v-if="item.nomeomory">--</div>
                </div>
              </div>
            </td>
            <td class="statphoto">
              <div class="echarts_tb">
                <span v-if="item.showloading"><Loading :isshow="item.showloading"></Loading></span>
                <div v-else>
                  <div class="echarts3" :class="item.nodist ? '' : 'echarts_wh'"></div>
                  <div v-if="item.nodist">--</div>
                </div>
              </div>
            </td>
            <td class="caozuo_td">
              <span v-if="item.can_edit" style="margin-right: 10px;" @click="editMachine(item)">编辑</span>
            </td>
          </tr>
        </tbody>
        <tr v-if='noData' class="noData">
          <td colspan="7">暂无数据</td>
        </tr>
      </table>
      <AddMachine ref="addmodel" :obj="editMachineObj" :isshow="showCreate" @toggle="showCreate = !showCreate" @load="getMachineList"></AddMachine>
      <PagerBar v-if="!noData" :page="page" @change="searchByPage" style="margin-bottom:2%;"></PagerBar>
      
  </div>
</template>
<script>
// 引入 ECharts 主模块
var echarts = require('echarts/lib/echarts');
// 引入折线图
require('echarts/lib/chart/line');
// 引入提示框和标题组件
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');

export default {
  components:{
    Loading: ()=>import('../../component/loading'),
    PagerBar:()=>import('../../component/PagerBar'),
    SingleSelect:()=>import('../../component/SingleSelect'),
    AddMachine:()=>import('../../component/AddMachine'),
  },
  data(){
    return{
      page: { 
        current: 1, 
        pagecount: 1, 
        totalCount: 0, 
        pagesize: 6,
        keywords: ''
      }, //页码初始值
      noData: false,
      machineList: [],
      groupName:[],
      groupid: '',
      editMachineObj: {},
      showCreate: false,
    }
  },
  methods:{
    getMachineList(){
      let msgview=  this.$wool.showloading("正在加载...")
      let parame={
        page: this.page.current,
        page_size: this.page.pagesize,
        keywords: this.page.keywords,
        groupid: this.groupid
      }
      this.$wf.post('devops?method=/devops/home/machines',parame).then(res=>{
        msgview.hide(0);
        console.log(res)
        if(res.items.length==0){
          this.noData=true
        }else{
          this.noData=false;
          this.page.current=res.page;
          this.page.pagecount=res.page_count;
          this.page.totalCount=res.count
          this.machineList=res.items;
          this.editData()
        }
      }).catch(e=>{
        msgview.hide(0)
        this.$wool.showwarn(e)
      })
    },
    async editData(){
      for(let i=0;i<this.machineList.length;i++){
        this.machineList[i].showloading=true;
        // this.machineList[i].noload=true
        // this.machineList[i].nomeomory=true
        // this.machineList[i].nodist=true
        
      }
      for(let i=0;i<this.machineList.length;i++){
        if(this.machineList[i].name){
          this.machineList[i].showloading=false;
          let currentName=this.machineList[i].name;
          //获取系统负载
          let agentLoadAverage=await this.$wf.post('devops?method=/devops/metrics/agentLoadAverage',{name:currentName})
          this.machineList[i].agentLoadAverage=agentLoadAverage;
          //获取CPU数
          let cpuNum=await this.$wf.post('devops?method=/devops/metrics/agent_cpu_num',{name:currentName})
          this.machineList[i].cpuNum=cpuNum;
          //获取已用内存
          let agentMemoryUsed=await this.$wf.post('devops?method=/devops/metrics/agentMemoryUsed',{name:currentName})
          this.machineList[i].agentMemoryUsed=agentMemoryUsed;
          //获取总内存
          let agentMemoryTotal=await this.$wf.post('devops?method=/devops/metrics/agentMemoryTotal',{name:currentName})
          this.machineList[i].agentMemoryTotal=agentMemoryTotal;
          //获取空间范围
          let path=await this.$wf.post('devops?method=/devops/metrics/agent_path_tags');
          path=path.toString();
          //获取已用空间
          let agentDistUsed=await this.$wf.post('devops?method=/devops/metrics/agentDistUsed',{name:currentName,path:path})
          this.machineList[i].agentDistUsed=agentDistUsed;
          //获取总空间
          let agentDistTotal=await this.$wf.post('devops?method=/devops/metrics/agentDistTotal',{name:currentName,path:path})
          this.machineList[i].agentDistTotal=agentDistTotal;
          //获取持续时间
          let loadTime=await this.$wf.post('devops?method=/devops/metrics/agentUpTime',{name:currentName})
          this.machineList[i].loadtime=loadTime;
          //获取开始时间
          let startTime=await this.$wf.post('devops?method=/devops/metrics/agentStartTime',{name:currentName})
          this.machineList[i].starttime=startTime;
          
          // console.log(this.machineList[i].starttime) 
          

          //一秒等于一千毫秒,1分钟等于1*60*1000
          let end=new Date(Date.now()-(3*60*1000));
          let begin=new Date(end.getTime()-(12*60*60*1000));
          let parame={
            end,
            begin,
            name:currentName,
            interval:15
          }
          
          //获取负载范围
          let loadAverage=await this.$wf.post('devops?method=/devops/metrics/agentLoadAverageRange',parame);
          // 获取负载最大值范围
          let loadMaxAverage=await this.$wf.post('devops?method=/devops/metrics/agentLoadAverageMaxRange',parame);
          if(loadAverage){
            this.machineList[i].showloading=false;
            this.drawCharts(loadAverage,loadMaxAverage,'load',i)
          }else{
            this.machineList[i].noload=true
          } 

          //获取已用内存范围
          let memoryUsable=await this.$wf.post('devops?method=/devops/metrics/agentMemoryUsedRange',parame);
          // 获取总内存范围
          let memoryAllUsable=await this.$wf.post('devops?method=/devops/metrics/agentMemoryTotalRange',parame);
          if(memoryUsable){
            this.machineList[i].showloading=false;
            this.drawCharts(memoryUsable,memoryAllUsable,'memory',i);
          }else{
            this.machineList[i].nomeomory=true
          } 
          //获取磁盘已用空间范围
          let distTotal=await this.$wf.post('devops?method=/devops/metrics/agentDistUsedRange',{...parame,path});
          // 获取磁盘总空间范围
          let distTotalFW=await this.$wf.post('devops?method=/devops/metrics/agentDistTotalRange',{...parame,path});
          if(distTotal){
            this.machineList[i].showloading=false;
            this.drawCharts(distTotal,distTotalFW,'dist',i);
          }else{
            this.machineList[i].nodist=true;
          }

          this.machineList[i].showloading=false;
          this.$forceUpdate();

        }else{
          this.machineList[i].showloading=false;
          this.machineList[i].noload=true;
          this.machineList[i].nomeomory=true;
          this.machineList[i].nodist=true;
        }
        
      }
    },
    drawCharts(data1,data2,op,index){
      if(op=='load'){
        //判断有没有数据，默认有
        this.machineList[index].noload=false;
        this.$forceUpdate();
        // let dom1=document.getElementsByClassName('echarts1')
        // console.log(dom1[index])
        // console.log(index)
        // var arr = [].slice.call( dom1 );
        // console.log(arr[index])
        var myChart=echarts.init(document.getElementsByClassName('echarts1')[index]);
      }else if(op=='memory'){
        //判断有没有数据，默认有
        this.machineList[index].nomeomory=false;
        this.$forceUpdate();
        // var arr = document.getElementsByClassName('echarts2')
        // var arr = Array.prototype.slice.call(document.getElementsByClassName('echarts2'))
        // console.log(arr[index])
        var myChart=echarts.init(document.getElementsByClassName('echarts2')[index]);
      }else if(op=='dist'){
        //判断有没有数据，默认有
        this.machineList[index].nodist=false;
        this.$forceUpdate();
        // var arr = document.getElementsByClassName('echarts3')

        // var arr = Array.prototype.slice.call(document.getElementsByClassName('echarts3'))
        // console.log(arr)
        var myChart=echarts.init(document.getElementsByClassName('echarts3')[index]);
      }
      let xData= data1.map(item=>{
        let h=item.time.getHours();
        h=h <10 ? ("0"+h) : h;
        let m=item.time.getMinutes();
        m=m <10 ? ("0"+m) : m;
        return h+':'+m;
      })
      let yData1= data1.map(item=>{
        return item.format_value.replace('G','')
      })
       let yData2= data2.map(item=>{
        return item.format_value.replace('G','')
      })
      var option = {
        //设置canvas内部表格的内距
        grid:{
          x: 35,
          y: 25,
          x2: 25,
          y2: 50
        },
        title:{
          text: '',
          x: 'center',
          // textAlign: 'left',
          textStyle:{
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'axis'   //移动至点显示数值
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            // data: ['Mon', 'Tue', 'Wed', 'Thu','Fri','Sat','Sun']
            data: xData,
            splitNumber: 1
        },
        yAxis: {
            type: 'value',
            axisLabel: {
              formatter:'{value}G',
              show: true,
              textStyle: {
                // color: '#c3dbff',  //更改坐标轴文字颜色
                fontSize : 10      //更改坐标轴文字大小
              }
            },
           
        },
        series: [{
            data: yData1,
            type: 'line',
            areaStyle: {
                // color: '#FFD700'
            },
            itemStyle:{
              normal:{
                // 拐点边框颜色
                borderColor:'#3398DB',
              }
            },
            lineCategoryGap: "0%"
        },{
            data: yData2,
            type: 'line',
            areaStyle: {
                // color: '#FF9F7F'
            },
            itemStyle:{
              normal:{
                // 拐点边框颜色
                borderColor:'#3398DB',
              }
            },
            lineCategoryGap: "0%"
        }],
        // color: ['#00EE00', '#FF9F7F','#FFD700','#E062AE']
        color: ['#E062AE','#3398DB']
      };
      if(op=='load'){
        option.title.text='系统负载';
        option.yAxis.axisLabel.formatter='{value}%'
        option.series[0].name='系统负载';
        option.series[1].name='最高系统负载'
      }else if(op=='memory'){
        option.title.text='已用内存';
        option.series[0].name='可用内存';
        option.series[1].name='总内存';
      }else if(op=='dist'){
        option.title.text='磁盘已用空间';
        option.series[0].name='已用空间';
        option.series[1].name='总空间'
      }
      myChart.setOption(option);
    },
    searchByPage(p){
      this.page.current=p.page
      this.machineList=[]
      this.getMachineList()
    },
    searchByKeyword(){
      this.page.current=1;
      this.getMachineList();
    },
    getGroupList(){
      this.$wf.post('devops?method=/devops/home/groups').then(res=>{
        this.groupName=res.items
      //  console.log(res) 
      })
    },
    selectByGroup(id){
      this.groupid=id
      this.getMachineList()
    },
    addMachine(){
      this.editMachineObj={};
      this.showCreate=!this.showCreate
    },
    editMachine(item){
      // this.$forceUpdate();
      this.editMachineObj=item;
      this.showCreate=!this.showCreate
    }
  },
  mounted(){
    this.getMachineList();
    this.getGroupList();
    // console.log(echarts)
  },
  
}
</script>

<style lang="less" scoped>
.project_area{
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
      .query_button{
        width: 60px;
        height: 34px;
        line-height: 34px;
        margin-left: 10px;
        text-align: center;
        color: white;
        border-radius: 5px;
        background-color: #1862c6;
        cursor: pointer;
        font-size: 14px;
      }
    }
    
    .query_group{
      width: 80%;
      margin-left: 20px;
      margin-right: 20px;
      .query_select{
        display: inline-block;
      }
      .add_button{
        display: inline-block;
        width: 60px;
        height: 34px;
        line-height: 34px;
        text-align: center;
        color: white;
        margin-left: 8.5%;
        border-radius: 5px;
        background-color: #1862c6;
        cursor: pointer;
        font-size: 14px;
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
    }tr{
      width: 100%;
      background-color: white;
      td{
      padding: 10px;
      border-bottom: 1px solid rgba(0, 123, 255, 0.4);
      font-size: 14px;
      height: 28px;
      }
    .rongqi_td{
      img{
      width:16px;
      margin:0 2px -4px 0; 
      }
    .rongqiName{
      font-weight: bold;
    }
    .yunweizu{
      margin-left: 18px;
    }
    }
      .caozuo_td{
        span{
          color: #3D83E5;
          cursor: pointer;
        }
      }
    .statphoto{
      padding: 10px 0;
      div{
        margin-bottom: -20px;
      }
    }
    }
    
      td{
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    
    
  }
  .noData{
    text-align: center;
  }
}
.machine-info {
  padding: 20px;
  background-color: white;
  width: 500px;
  max-height: 500px;
}

.echarts_tb{
  // border: springgreen 1px solid;
  text-align: center;
}
.echarts_wh{
  width: 250px;
  height: 150px;
}
</style>
