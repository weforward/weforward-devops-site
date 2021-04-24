<template>
  <div class="project_area">
    <div class="query">
      <div class="query_input">
        <input ref="keywords" type="text" v-model="page.keywords" @keyup.enter='getProjectList'/>
        <div class="query_button" @click="getProjectList">
          查询
        </div>
      </div>
      <div class="query_group">
        <div class="query_select">
          运维组：<SingleSelect :items="groupName" @select="selectByGroup">
          </SingleSelect>
        </div>
        <div class="add_button" @click="addProject">
          +添加
        </div>
      </div>
    </div>
    <table class="project_table">
      <tr class="project_title">
        <!-- <td style="width:22%">项目id</td> -->
        <td style="width:15%">项目</td>
        <td style="width:20%">描述</td>
        <td style="width:15%">运维组</td>
        <td style="width:13%">所有者</td>
        <td style="width:17%">操作</td>
      </tr>
        <tbody v-if="!noData">
          <tr v-for="(item,index) in projectList" :key='index'>
            <td>
              <span style="margin-left: 1%;" v-if="item.name" :title="item.name">
                <img v-if="item.type==1" src="../../img/java.png" class="javamark"></img>
                <img v-if="item.type==2" src="../../img/html.png" class="htmlmark"></img>
                <span style="margin-left:5px;">{{item.name}}</span> 
              </span>
              <span v-else>--</span>
            </td>
          <!-- <td>
              <span v-if="item.name" :title="item.name">{{item.name}}</span>
              <span v-else>--</span>
            </td> -->
            <td>
            <span v-if="item.desc" :title="item.desc" class="desc">{{item.desc}}</span>
            <span v-else>--</span>
          </td>
          <td>
            <span v-if="item.groups_to_show" :title="item.groups_to_show" class="groups">{{item.groups_to_show}}</span>
            <span v-else>--</span>
          </td>
          <td>
            <span v-if="item.owner" :title="item.owner.name" class="groups">{{item.owner.name}}</span>
            <span></span>
          </td>
          <td class="caozuo_td">
            <span v-if="item.can_edit" style="margin-right: 10px;" @click="editProject(item)">编辑</span>
            <span @click="watchDetails(item)">查看详情</span>
          </td>
        </tr>
      </tbody>
      <tr v-if='noData' class="noData">
        <td colspan="5">暂无数据</td>
      </tr>
    </table>
    <AddProject ref="addmodel" :obj="editProjectObj" :isshow="showCreate" @toggle="showCreate = !showCreate" @load="getProjectList"></AddProject>
    <PagerBar v-if="!noData" :page="page" @change="searchByPage" style="margin-bottom:2%;"></PagerBar>
  </div>
</template>
<script>
import AddProjectVue from '../../component/AddProject.vue'
export default {
  data(){
    return{
			page: { 
        current: 1, 
        pagecount: 1, 
        totalCount: 0, 
        pagesize: 10,
        keywords: ''
      }, //页码初始值
      noData: false,
      projectList: [],
      groupName:[],
      groupid: '',
      editProjectObj: {},
      showCreate: false
    }
  },
  methods:{
    getProjectList(){
      let parame={
        page: this.page.current,
				page_size: this.page.pagesize,
        keywords: this.page.keywords,
        groupid: this.groupid
      }
      var msgView=this.$wool.showloading('加载中...');
      this.$wf.post('devops?method=/devops/home/projects',parame).then(res=>{
        // console.log(res)
        msgView.hide(0);
        if(res.items.length==0){
          this.noData=true;
        }else{
          this.noData=false;
          this.projectList=res.items;
          this.page.current=res.page;
          this.page.pagecount=res.page_count;
          this.page.totalCount=res.count;
        }
      }).catch(e=>{
        msgView.hide(0);
        this.$wool.showwarn(e);
      })
    },
    searchByPage(p){
      this.page.current=p.page
      this.getProjectList()
    },
    getGroupList(){
      this.$wf.post('devops?method=/devops/home/groups').then(res=>{
        this.groupName=res.items
      //  console.log(res) 
      })
    },
    selectByGroup(id){
      this.groupid=id
      this.getProjectList()
    },
    addProject(){
      this.editProjectObj={};
      this.showCreate=!this.showCreate
    },
    editProject(item){
      this.editProjectObj=item;
      this.editProjectObj['notEdit']=false;
      this.showCreate=!this.showCreate
    },
    watchDetails(item){
      this.editProjectObj=item;
      this.editProjectObj['notEdit']=true;
      this.showCreate=!this.showCreate
    }
  },
  mounted(){
    this.getProjectList();
    this.getGroupList();
    this.$nextTick(() => {
      this.$refs.keywords.focus();//输入框默认获取焦点
    });
  },
  components:{
    PagerBar:()=>import('../../component/PagerBar'),
    SingleSelect:()=>import('../../component/SingleSelect'),
    AddProject:()=>import('../../component/AddProject')
  }
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
      background-color: white;
      td{
       white-space: nowrap;
       text-overflow: ellipsis;
       overflow: hidden;
       padding: 15px 0;
       padding-left: 15px;
       padding-right: 15px;
       border-bottom:1px solid rgba(0, 123, 255, 0.4);
       font-size: 14px;
       height:28px;
      }
      .caozuo_td{
        span{
          color: #3D83E5;
          cursor: pointer;
        }
        
      }
    }
    
  }
  .noData{
    text-align: center;
  }
}
.javamark{
	width:10%;
	margin-bottom: -4px;
}
.htmlmark{
	width:10%;
	margin-bottom: -6px;
}
.desc{
	color:#7F7F7F;
}
.groups{
	color:#595959;
}
</style>