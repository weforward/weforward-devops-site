<template>
  <WoolShowmodal :isshow="isShowSL" @tapCloser="closeShowModel" :isshowcloser="true">
      <div class="task">
        <div class="tasktitle">
          <span style="color:red">●</span>
          <span style="color:#FFC000">●</span>
          <span style="color:#2E75B6">●</span> 
          项目：{{JiankongNameData.projectName}}&ensp;&ensp;&ensp;容器：{{JiankongNameData.MachineName}}
        </div>
        <div class="cmdscreen">
          <ul class="task-list wt-scroll" ref="taskList">
            <li v-for="(item, idx) in statusList" :key="idx">{{ item || '--' }}</li>
          </ul>
        </div>
        <PagerBar :page="sysLogPage" @change="systemChangePage"></PagerBar>
			</div>
    </WoolShowmodal>
</template>
<script>
export default {
  name: 'SystemLog',
  components:{
    PagerBar:()=>import('../PagerBar.vue'),
		WoolShowmodal: () => import('../WoolShowmodal')
  },
  props:{
    isShowSL:{
      type: Boolean,
      default: false
    },
    JiankongNameData:{
      type: Object,
      default: ()=>{}
    }
  },
  data(){
    return{
      showmodel: false,
      sysLogPage:{
        current: 1, 
        pagecount: 1, 
        totalCount: 0, 
        pagesize: 50
      },
      statusList:[]
    }
  },
  methods:{
    systemChangePage(p){
      this.sysLogPage.current=p.page;
      this.getSystemLog()
    },
    getSystemLog(){
      let parame={
        id: this.JiankongNameData.id,
        page: this.sysLogPage.current,
        pagesize: this.sysLogPage.pagesize,
      }
      this.$wf.post('devops?method=/devops/home/runningsyslogs',parame).then(res=>{
        this.statusList=res.items;
        this.sysLogPage.totalCount=res.count;
        this.sysLogPage.pagecount=res.page_count;
        // this.showmodel=true;
        console.log(res)
      }).catch(e=>{
        this.$wool.showwarn(e)
      })
    },
    closeShowModel(){
      this.statusList=[];
      this.$emit('tapCloser',this.JiankongNameData.index)
    }
      
  },
  mounted(){
     this.getSystemLog()
  }
}
</script>
<style lang="less" scoped>
.task{
	min-width: 40vw;
	max-width: 60vw;
	background-color: white;
	padding: 15px;
	/* height: 100%; */
  border-radius:4px;
  .tasktitle{
    margin-bottom: 5px;
    color:#1862C6;
    font-weight: bold;
  }
  .cmdscreen{
    // max-height: 90%;
    padding: 10px 15px;
    background-color: #322348;
    color:#cbbde2;
    .task-list {
      /* margin-left: 20px; */
      min-height: 50vh;
      max-height: 75vh;
      // overflow-y: auto;
      li {
        list-style: disc;
        font-size: 14px;
      }
    }
  }
}
.vue-pagebar{
  margin-top: 0;
}
</style>