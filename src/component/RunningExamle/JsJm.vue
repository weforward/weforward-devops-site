<template>
  <WoolShowmodal :isshow="isshow" @tapCloser="closeShowModel" :isshowcloser="true">
    <div class="showbox" :style="{width:boxwidth,height:boxheight}">
      <div class="tab_title">
        <div :class="['tab_item',isJs ? 'choosed': '']" @click="changeTab('js')"><span>Jstack</span></div>
        <div :class="['tab_item',isJs ? '' : 'choosed']" @click="changeTab('jm')"><span>Jmap</span></div>
      </div>
      <div class="tab_content">
        <div v-if="isJs">
          <div class="table wt-scroll">
          <div class="query_button" @click="printstack()">Thread Dump</div>
            <table class="">
              <tr class="table_head">
                <td style="width: 30%">文件名</td>
                <td style="width: 20%">大小</td>
                <td style="width: 30%">日期</td>
                <td style="width: 20%">操作</td>
              </tr>
              <tr class="table_content" v-for="(item,index) in stackList" :key="index">
                <td>{{item.name}}</td>
                <td>{{item.length}}</td>
                <td>{{item.create_time}}</td>
                <td><span @click="checkstack(item.name)">查看</span>&ensp;<span @click="download(item.name)">下载</span></td>
              </tr>
            </table>
          </div>
          <PagerBar :page="page" @change="searchByPage" style="margin-right:55%;margin-bottom:2%;"></PagerBar>
          <div class="look_detail">
            <div class="tasktitle">
              <span style="color:red">●</span>
              <span style="color:#FFC000">●</span>
              <span style="color:#2E75B6">●</span> 
              文件名：{{filename}}
            </div>
            <div class="taskcontent wt-scroll" v-html="replace(stacks)">
            </div>
          </div>
        </div>
        <div v-else>
          <div class="table" style="margin:0 auto;width: 90%;">
            <div class="query_button" @click="printmap()">Heap Dump</div>
            <table class="wt-scroll" style="margin:0 auto;">
              <tr class="table_head">
                <td style="width: 30%">文件名</td>
                <td style="width: 20%">大小</td>
                <td style="width: 40%">日期</td>
                <td style="width: 30%">操作</td>
              </tr>
              <tr class="table_content" v-for="(item,index) in mapList" :key="index">
                <td>{{item.name}}</td>
                <td>{{item.length}}</td>
                <td>{{item.create_time}}</td>
                <td><span @click="downloadMap(item.name)">下载</span></td>
              </tr>
            </table>
            <PagerBar :page="pagemap" @change="searchByPage" style="margin-bottom:2%;"></PagerBar>

          </div>
        </div>
      </div>
    </div>
    <WoolShowmodal :isshow="showTask" @tapCloser="closeShowTask" :isshowcloser="true">
      <div class="task">
        <div class="tasktitle"><span style="color:red">●</span><span style="color:#FFC000">●</span><span style="color:#2E75B6">●</span> 当前状态：{{ currentStatus || '--' }}</div>
        <div class="cmdscreen wt-scroll">
          <ul class="task-list" ref="taskList">
            <li v-for="(item, idx) in statusList" :key="idx">{{ item.desc || '--' }}</li>
          </ul>
        </div>
      </div>
    </WoolShowmodal>
  </WoolShowmodal>
</template>
<script>
export default {
  components:{
    WoolShowmodal: () => import('../WoolShowmodal'),
    PagerBar:()=>import('../PagerBar')
  },
  props:{
    isshow:{
      type: Boolean,
      default: false
    },
    id:{
      type: String,
      default: ''
    },
    index:{
      type: Number,
      default: -1
    },
    state:{
      type: Number,
      default: -1
    }
  },
  watch:{
    // id(){
    //   this.getStack()
    // },
    isshow(val){
      this.isJs=true;
      if(val==true) this.getStack()
    }
  },
  data(){
    return{
      boxwidth:"96vw",
      boxheight:"96vh",
      isJs: true,
      stackList: [],
      page:{
        current: 1, 
        pagecount: 1, 
        totalCount: 0, 
        pagesize: 10
      },
      pagemap:{
        current: 1, 
        pagecount: 1, 
        totalCount: 0, 
        pagesize: 10
      },
      filename:'',
      stacks: '',
      mapList:[],
      maps: '',
      currentStatus: '',
      statusList: [],
      showTask: false,
    }
  },
  methods:{
    changeTab(op){
      if(op=='js'){
        this.isJs=true;
        this.boxwidth="96vw";
        this.boxheight="96vh";
      }else{
        this.isJs=false;
        this.getMapList();
        this.boxwidth="60vw";
        this.boxheight="96vh";
      }
    },
    printstack(){
      if(this.state!=0) return this.$wool.showwarn("该实例不在运行中,不能thread dump");
      this.showTask=true;
      let parame={
        id: this.id
      }
      this.$wf.post('devops?method=/devops/home/print_stack',parame).then(res=>{
        var timer=setInterval(()=>{
          this.$wf.post('devops?method=/devops/home/optask',{id:res}).then(res=>{
            this.currentStatus=res.current_status.desc;
            this.statusList=res.status;
            if(res.done){
              clearInterval(timer);
              setTimeout(()=>{
                if(this.showTask){
                  this.showTask=false;
                  this.statusList=[];
                  this.getStack();
                }else{
                  return;
                }
              },5000)
            }
          }).catch(e=>{
            clearInterval(timer);
            this.$wool.showwarn(e)
          })
        },1000)
        
      }).catch(e=>{
        this.$wool.showwarn(e)
      })
    },
    checkstack(name){
      let msgview = this.$wool.showloading('正在加载');
      let parame={
          id: this.id,
          name
        }
      this.$wf.post('devops?method=/devops/home/stack',parame).then(res=>{
        msgview.hide();
        this.filename=name;
        this.stacks=res;
      }).catch(e=>{
        this.$wool.showwarn(e)
      })
    },
    getStack(){
      let parame={
        page: this.page.current,
        page_size: this.page.pagesize,
        id: this.id
      }
      let msgview = this.$wool.showloading('正在加载');
      this.$wf.post("devops?method=/devops/home/stacks",parame).then(res=>{
        msgview.hide();
        console.log(res);
        if(res.items.length==0){
          this.page.totalCount=0;
          this.page.pagecount=1;
          this.$wool.showwarn("暂无数据");
        }else{
          this.stackList=res.items;
          this.page.totalCount=res.count;
          this.page.pagecount=res.page_count;
          for(let i=0;i<res.items.length;i++){
            //处理时间
            let date=new Date(this.stackList[i].create_time)
            let y=date.getFullYear();
            let mon=date.getMonth()+1;
            mon=mon <10 ? ("0"+mon) : mon;
            let d=date.getDate();
            d=d <10 ? ("0"+d) : d;
            let h=date.getHours();
            h=h <10 ? ("0"+h) : h;
            let m=date.getMinutes();
            m=m <10 ? ("0"+m) : m;
            let s=date.getSeconds();
            s=s <10 ? ("0"+s) : s
            this.stackList[i].create_time=y+'-'+mon+'-'+d+' '+h+':'+m+':'+s;
          }
        }
      }
      ).catch(e=>{
        msgview.hide();
        this.$wool.showwarn(e)
      })
    },
    getMapList(){
      let msgview = this.$wool.showloading('正在加载');
      this.$wf.post('devops?method=/devops/home/memory_maps',{id:this.id}).then(res=>{
        msgview.hide(0);
        if(res.items.length==0){
          this.$wool.showwarn("暂无数据")
        }else{
          this.mapList=res.items;
          this.pagemap.totalCount=res.count;
          this.pagemap.pagecount=res.page_count;
          for(let i=0;i<res.items.length;i++){
            //处理时间
            console.log(this.mapList[i].create_time)
            let date=new Date(this.mapList[i].create_time)
            let y=date.getFullYear();
            let mon=date.getMonth()+1;
            mon=mon <10 ? ("0"+mon) : mon;
            let d=date.getDate();
            d=d <10 ? ("0"+d) : d;
            let h=date.getHours();
            h=h <10 ? ("0"+h) : h;
            let m=date.getMinutes();
            m=m <10 ? ("0"+m) : m;
            let s=date.getSeconds();
            s=s <10 ? ("0"+s) : s;
            this.mapList[i].create_time=y+'-'+mon+'-'+d+' '+h+':'+m+':'+s;
            console.log(this.mapList[i].create_time)
          }
        }
        console.log(res)
      }).catch(e=>{
        msgview.hide();
        this.$wool.showwarn(e)
      })
    },
    closeShowModel(){
      //回复默认数据，将初始数据赋给data
      Object.assign(this.$data,this.$options.data());
      this.$emit('tapCloser',this.index)
    },
    searchByPage(p){
      if(this.isJs){
        this.page.current=p.page;
        this.getStack();
      }else{
        this.pagemap.current=p.page;
        this.getMapList();
      }
    },
    printmap(){
      if(this.state!=0) return this.$wool.showwarn("该实例不在运行中,不能heap dump");
      this.showTask=true;
      let msgview = this.$wool.showloading('正在加载');
      let parame={
        id: this.id
      }
      this.$wf.post("devops?method=/devops/home/print_memorymap",parame).then(res=>{
        msgview.hide(0);
        var timer=setInterval(()=>{
          this.$wf.post('devops?method=/devops/home/optask',{id:res}).then(res=>{
            this.currentStatus=res.current_status.desc;
            this.statusList=res.status;
            if(res.done){
              clearInterval(timer)
              setTimeout(()=>{
                if(this.showTask){
                  this.showTask=false;
                  this.statusList=[];
                  this.getMapList();
                }else{
                  return;
                }
              },5000)
            }
          }).catch(e=>{
            clearInterval(timer);
            this.$wool.showwarn(e)
          })
        },1000)
      }).catch(e=>{
        msgview.hide(0);
        this.$wool.showwarn(e)
      })
    },
    download(name){
      let parame={
        id: this.id,
        name 
      }
      this.$wf.post('devops?method=/devops/home/down_stack',parame).then(res=>{
        window.open(res.wf_resp.res_url)
      }).catch(e=>{
        this.$wool.showwarn(e)
      })
    },
    downloadMap(name){
      let parame={
        id: this.id,
        name 
      }
      this.$wf.post('devops?method=/devops/home/downMemoryMap',parame).then(res=>{
        window.open(res.wf_resp.res_url)
      }).catch(e=>{
        this.$wool.showwarn(e)
      })
    },
    replace:function(content){
      if(null==content||0==content.length){
        return;
      }
      return content.replace(/\n/g,"<br />");
    },
    closeShowTask(){
      this.showTask=false;
      this.statusList=[];
      if(this.isJs){
        this.getStack();
      }else{
        this.getMapList();
      }
      
    }
  },
}
</script>

<style scoped lang="less">
.showbox{
  // width: 96vw;
  // height: 96vh;
  // padding: 20px;
  background-color: gray;
  .tab_title{
    width: 100%;
    height: 50px;
    display: flex;
    .tab_item{
      display: inline-block;
      width: 10%;
      background-color: gray;
      text-align: center;
      color: white;
      cursor: pointer;
      border-radius: 5px 5px 0 0;
      span{
        position: relative;
        top: 30%;
        // transform: translateY(-50%);
      }
    }
    .choosed{
      background-color: white;
      color: black;
    }
  }
  .tab_content{
    width: 100%;
    height: 94%;
    background-color: white;
    border-top: 0;
    .query_button{
      width: 100px;
      height: 40px;
      line-height: 40px;
      // margin-left: 1%;
      text-align: center;
      color: white;
      border-radius: 5px;
      background-color: #1862c6;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 15px;
    }
    .table{
      width: 45%;
      margin-left: 1%;
      padding-top: 1%;
      height: 75vh;
      table{
        width: 98%;
        table-layout: fixed;
        border:1px solid rgba(0, 123, 255, 0.4);
        border-collapse: collapse;
        border-radius: 6px;
        overflow:auto;
        .table_head{   
          color: #004085;
          background-color: #f9fbfd;
          border-bottom:1px solid rgba(0, 123, 255, 0.4);
          td{
            padding: 15px;
            font-size: 14px;
          }
          
        }
        .table_content{
          td{
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            padding: 13px;
            border-bottom:1px solid rgba(0, 123, 255, 0.4);
            font-size: 14px;
            height:26px;
          }
          span{
            cursor: pointer;
            color: #3D83E5;
          }
        }
      }
      
    }
    .look_detail{
      // width: 35%;
      // height: 80%;
      // border: yellowgreen 1px solid;
      // position: absolute;
      // right: 3%;
      // top: 15%;
    width: 53%;
    height: 90%;
    // border: yellowgreen 1px solid;
    position: absolute;
    right: 1%;
    top: 8%;
    .tasktitle{
      margin-bottom: 6px;
    }
      .taskcontent{
      width: 98%;
      height: 90%;
      background-color: #322348;
      color: #cbbde2;
      font-size: 10px;
      padding: 10px;
      }
    }
  }
}
.task {
  min-width: 600px;
  max-width: 900px;
  background-color: white;
  padding: 20px;
  /* height: 100%; */
  border-radius:4px;
}
.tasktitle{
  margin-bottom: 5px;
  color:#1862C6;
  font-weight: bold;
}
.task-list {
  /* margin-left: 20px; */
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}
.task-list li {
  list-style: disc;
  font-size: 14px;
}
.cmdscreen{
  padding: 10px 15px;
  background-color: #563d7c;
  color:#cbbde2;
}

</style>