<template>
  <WoolShowmodal :isshow="isshow" @tapCloser="closeShowModel" :isshowcloser="true">
    <div class="detail">
      <div class="top">
        <div class="title_content">
          <span class="tag" >{{serviceDetail.service_name}}</span>
        </div>
        <div class="detail_content">
          <span class="fr">持续时间：
            <span class="se">{{serviceDetail.duration}}</span>
          </span>
          <span class="fr">服务数：
            <span class="se">{{serviceDetail.services}}</span>
          </span>
          <span class="fr">深度：
            <span class="se">{{serviceDetail.depth}}</span>
          </span>
          <span></span>
          <span class="fr">追踪ID：
            <span class="se">{{serviceDetail.id}}</span>
          </span>
       </div>
      </div>
      <div class="left wt-scroll">
        <div class="Root_area">
          <div class="jiajian">
            <img v-if="serviceDetail.root.children.length==0" src="../../img/jian.png" alt="">
            <img v-else :src="showCd1? require('../../img/jian.png'): require('../../img/jia.png')" @click="handleJJ('root')">
          </div>
          <div class="tag_name" @click="clickRoot(serviceDetail.root)"><span>{{serviceDetail.root.service_name}}</span></div>
          <div style="width: 80%;height: 80%;">
            <div class="gateway_time"><span>{{serviceDetail.root.method}}[{{serviceDetail.root.duration_num}}ms]</span></div>
          </div>

        </div>
        <div class="Root_area children" v-if="showCd1 && (serviceDetail.root.children.length!=0)"
           v-for="(item,index) in serviceDetail.root.children" :key="index">
          <div class="jiajian ">
            <img v-if="item.children.length==0" src="../../img/jian.png" alt="">
            <img v-else :src="showCd2? require('../../img/jian.png'): require('../../img/jia.png')" @click="handleJJ('children')">
          </div>
          <div class="tag_name" style="background-color:#A31545;" @click="clickTag(item)"><span>{{item.service_name}}</span></div>
          <div style="width: 75%;height: 80%;">
            <div class="gateway_time childrens">
              <span>{{item.method}}[{{item.duration_num}}ms]</span>
            </div>
          </div>
        </div>
      </div>
      <div class="right wt-scroll">
        <div style="padding-bottom: 3%;border-bottom: 0.5px solid #E0E0E0;"><h3>{{itemData.service_name}}</h3></div>
       <!-- <div style="padding-bottom: 5%;border-bottom: 0.5px solid #E0E0E0;"><span style="color:#707071; ">gateway</span> </div> -->
        <div class="client_box">
          <span style="padding-top:10px;">进入网关</span>
          <div class="list_box">
            <div class="list_item">
              <span>开始时间</span>
              <span>{{itemData.gw_start_time || '--'}}</span>
            </div>
            <!-- <div class="list_item">
              <span>基准时间</span>
              <span>{{itemData.gw_start_relative_time|| '--'}}</span>
            </div> -->
          </div>
        </div>
        <div class="client_box">
          <span>进入服务</span>
          <div class="list_box">
            <div class="list_item">
              <span>开始时间</span>
              <span>{{itemData.ms_start_time || '--'}}</span>
            </div>
            <div class="list_item">
              <span>基准时间</span>
              <span>{{itemData.ms_start_relative_time || '--'}}</span>
            </div>
          </div>
        </div>
        <div class="client_box">
          <span>离开服务</span>
          <div class="list_box">
            <div class="list_item">
              <span>开始时间</span>
              <span>{{itemData.ms_end_time || '--'}}</span>
            </div>
            <div class="list_item">
              <span>基准时间</span>
              <span>{{itemData.ms_end_relative_time || '--'}}</span>
            </div>
          </div>
        </div>
        <div class="client_box">
          <span>离开网关</span>
          <div class="list_box">
            <div class="list_item">
              <span>开始时间</span>
              <span>{{itemData.gw_end_time || '--'}}</span>
            </div>
            <div class="list_item">
              <span>基准时间</span>
              <span>{{itemData.gw_end_relative_time || '--'}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </WoolShowmodal>
</template>
<script>
export default {
  components:{
    WoolShowmodal: () => import('../WoolShowmodal'),
  },
  props:{
    isshow:{
      type: Boolean,
      default: false
    },
    id:{
      type: String,
      default: ''
    }
  },
  watch:{
    isshow(val){ 
      console.log(this.id)
      if(val==true){
        this.getTrace()
      }
    }
  },
  data(){
    return{
      serviceDetail:{
        root:{
          children: []
        }
      },
      showCd1: false,
      showCd2: false,
      itemData:{}
    }
  },
  methods:{
    closeShowModel(){
      //恢复默认数据，将初始数据赋给data
      Object.assign(this.$data,this.$options.data());
      this.$emit('tapCloser')
    },
    getTrace(){
      this.$wf.post('devops?method=/devops/tracer/get',{id:this.id}).then(res=>{
        this.serviceDetail=res;
        this.serviceDetail.root=Object.assign(res.root,this.handleData(res.root));
        this.itemData= this.serviceDetail.root;
      }).catch(e=>{
        this.$wool.showwarn(e)
      })
    },
    handleData(data){
      if(data.gw_start_time!=null){
        data.gw_start_time=data.gw_start_time.Format();
      }
      if(data.ms_start_time!=null){
        data.ms_start_time=data.ms_start_time.Format();
      }
      if(data.gw_end_time!=null){
        data.gw_end_time=data.gw_end_time.Format();
      }
      if(data.ms_end_time!=null){
        data.ms_end_time=data.ms_end_time.Format();
      }
      return data;
    },
    handleJJ(op){
      if(op=='root'){
        this.showCd1=!this.showCd1;
        this.$nextTick(function () {
          var cdW=  document.getElementsByClassName('childrens');
          var rt=  document.getElementsByClassName('gateway_time')[0];
          var rtM=rt.innerText.replace(/[^0-9]/ig,"");
          for(let i=0; i<cdW.length;i++){
            //根据毫秒数调整宽度
            // cdW[i].style.width=((cdW[i].innerText.replace(/[^0-9]/ig,""))*100)/rtM+'%';

            // 暂时用百分百宽度
            cdW[i].style.width='100%';

          }
        })
        
      }else if(op=='children'){
        this.showCd2=!this.showCd2;
      }
    },
    clickTag(item){
      if(typeof item.gw_start_time=='string'||
      typeof item.gw_end_time=='string' ||
      typeof item.ms_start_time=='string' ||
      typeof item.ms_end_time=='string' ){
        this.itemData=item;
      }else{
        this.itemData=Object.assign(item,this.handleData(item));
      }
      
    },
    clickRoot(item){
      this.itemData=item;
    }
    
  },
  mounted(){
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
      let s=this.getSeconds();
      s=s <10 ? ("0"+s) : s
      let milliseconds = this.getMilliseconds()
      return y+'-'+mon+'-'+d+' '+h+':'+m+':'+s+'.'+milliseconds;
    }
  }
}
</script>

<style scoped lang="less">
.detail{
  width: 90vw;
  height: 90vh;
  background-color: white;
  display: flex;
  flex-wrap: wrap;
  // align-content: space-between;
  align-content:flex-start;
  .top{
    width: 100%;
    height: 15%;
    box-shadow:1px 1px 1px #999;
    .title_content{
      margin-left: 2%;
      padding: 1% 2%;
      padding-left: 0;
      border-bottom: 0.5px solid #E0E0E0;
      .tag{
        font-size: 20px;
        font-weight:800;
      }
    }
    .detail_content{
      padding: 0.5% 2%;
      font-size: 14px;
    }
    
  }
  .left{
    width: 48%;
    height: 75%;
  }
  .right{
    width: 48.5%;
    height: 75%;
    background-color: #F5F5F5;
    padding: 20px;
    display: inline-block;
    .client_box{
      padding-top:3%;
      .list_box{
        background-color: white;
        border: 1px solid #E0E0E0;
        border-radius: 6px;
        box-shadow:1px 1px 1px #999;

        .list_item{
          padding: 10px 20px;
          border-bottom: 0.5px solid #E0E0E0;
          display: grid;
          grid-template-columns: 50% 50%;
         font-size: 14px;
        }
      }
    }
    
  }
}

.Root_area{
  padding: 0 8%;
  margin-top: 10%;
  display: flex;
  align-items:center;
  height: 10%;
  font-size: 14px;
  .jiajian{
    width: 20px;
    height: 20px;
    img{
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }
  .tag_name{
    text-align: center;
    height: 60%;
    background: #6D1B7B;
    padding: 0 3%;
    margin-left: 1%;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .gateway_time{
    width: 100%;
    height: 100%;
    margin-left: 2%;
    border-radius: 6px;
    padding-left: 1%;
    background-color: #86B0C2;
    display: flex;
    align-items: center;
  }
}
.children{
  margin-top: 1%;
  padding-left: 10%;
}
.childrens{
  min-width: 20%;
}
.fr{
  color:#707071;
}
.se{
  color: black;
  font-weight: 800;
  margin-right: 1%;
}
</style>