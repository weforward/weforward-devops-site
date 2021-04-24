<template>
  <WoolShowmodal :isshow="isShowOL" @tapCloser="closeShowModel" :isshowcloser="true">
      <div class="option">
        <div class="optiontitle"> 
          操作日志：项目&ensp;{{JiankongNameData.projectName}}&ensp;&ensp;&ensp;容器&ensp;{{JiankongNameData.MachineName}}
        </div>
        <div class="cmdscreen">
          <ul class="option-list wt-scroll" ref="optionList">
            <li v-for="(item, idx) in optionList" :key="idx">
        <div>
          <span class="logtime">{{item.time}}</span>
          <span class="logauthor">{{item.author}}</span>
          <span class="logwhat">{{item.what}}</span>
        </div>
        <div v-if="null!=item.note&&0<item.note.length">
                  <span class="lognote">{{item.note}}</span>
        </div>
            </li>
          </ul>
        </div>
        <PagerBar :page="optionLogPage" @change="optionChangePage"></PagerBar>
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
    isShowOL:{
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
      optionLogPage:{
        current: 1, 
        pagecount: 1, 
        totalCount: 0, 
        pagesize: 20
      },
      optionList:[]
    }
  },
  methods:{
    getOptionLog(){
      let parame={
        id: this.JiankongNameData.id,
        page: this.optionLogPage.current,
        pagesize: this.optionLogPage.pagesize,
      }
      this.$wf.post('devops?method=/devops/home/runningoplogs',parame).then(res=>{
        this.optionList=res.items;
        this.optionLogPage.totalCount=res.count;
        this.optionLogPage.pagecount=res.page_count;
        // this.showmodel=true;
        console.log(res)
      }).catch(e=>{
        this.$wool.showwarn(e)
      })
    },
    closeShowModel(){
      this.optionList=[];
      this.$emit('tapCloser',this.JiankongNameData.index)
    },
    optionChangePage(p){
      this.optionLogPage.current=p.page;
      this.getOptionLog()
    }
    
      
  },
  created(){
     this.getOptionLog()
  }
}
</script>
<style lang="less" scoped>
.option{
	min-width: 45vw;
	max-width: 60vw;
	background-color: white;
	padding: 15px;
	/* height: 100%; */
  border-radius:4px;
  .optiontitle{
    margin-bottom: 5px;
    color:#1862C6;
    font-weight: bold;
	height:30px;
	border-bottom: 1px solid #e3ebf6;
  }
  .cmdscreen{
    // max-height: 90%;
    padding: 10px 15px;
    // background-color: #563d7c;
    // color:#cbbde2;
    .option-list {
      /* margin-left: 20px; */
      min-height: 50vh;
      max-height: 70vh;
      // overflow-y: auto;
      li {
        list-style: disc;
        padding: 10px 0;
        font-size: 12px;
        border-bottom: 1px dashed rgba(0, 123, 255, 0.2);
        color: black;
		.logtime{
			margin-left:10px;
		}
		.logauthor{
			margin-left:30px;
		}
		.logwhat{
			margin-left:30px;
			color:#10707f;
		}
		.lognote{
			margin-left:10px;
			height:20px;
			line-height: 20px;
			color:#1862C6;
		}
      }
    }
  }
}
.vue-pagebar{
  margin-top: 0;
}
</style>