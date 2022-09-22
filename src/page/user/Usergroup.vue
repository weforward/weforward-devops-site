<template>
  <div class="project_area">
    <div class="query">
      <div class="query_input">
        <input type="text" v-model="page.keywords" class="input" @keyup.enter='getGroupList'/>
        <el-button type="primary" size="small" class="ml-1" @click="getGroupList">查 询</el-button>
      </div>
      <div class="query_group">
        <div class="query_select">
          运维组：<SingleSelect :items="groupName" @select="selectByGroup">
          </SingleSelect>
        </div>
        <el-button type="primary" size="small" class="ml-1" @click="showAddGroup=true">+ 添 加</el-button>
      </div>
    </div>
    <table class="project_table">
        <tr class="project_title">
          <td style="width:25%">运维组id</td>
		      <td style="width:10%">运维组名</td>
          <td style="width:25%">用户</td>
          <td style="width:25%">操作</td>
        </tr>
        <tbody v-if="!noData">
          <tr v-for="(item,index) in groupList" :key='index'>
            <td>
              <span v-if="item.id" :title="item.id">{{item.id}}</span>
              <span v-else>--</span>
            </td>
            <td>
              <span v-if="item.name" :title="item.name">{{ item.name }}</span>
              <span v-else>--</span>
            </td>
            <td>
              <span v-if="item.users.length != 0" v-for="(user, idx) in item.users" :key="idx">
                {{ user.name }}({{ user.loginname }});
              </span>
              <span v-if="item.users.length == 0">--</span>
            </td>

            <td class="caozuo_td">
              <span v-if="item.users.length != 0" style="margin-right: 10px;" @click="operateUser('remove',item)">移除用户</span>
              <span @click="operateUser('add',item)">添加用户</span>
            </td>
          </tr>
        </tbody>
        <tr v-if='noData' class="noData">
          <td colspan="4">暂无数据</td>
        </tr>
      </table>
      <PagerBar v-if="!noData" :page="page" @change="searchByPage" style="margin-bottom:2%;"></PagerBar>
		  <UserList ref="userList" :isshow="showUser" :users="selectUserList" :op="userOp" @toggle="toggleUser" :id="selectGroupId"></UserList>
      <WoolShowmodal :isshow="showAddGroup" @tapCloser="showAddGroup = false" :isshowcloser="true">
        <div class="add_group">
          <div class="titlebar flexlayout">
            <span>添加项目</span>
          </div>
          <input type="text" placeholder="请输入运维组名称" v-model="addGroupName"/>
          <div class="add_button" @click="saveGroup">保存</div>
        </div>
      </WoolShowmodal>

  </div>
</template>
<script>
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
      groupList: [],
      groupName:[],
      groupid: '',
      showCreate: false,
      showUser: false,
      selectUserList: [],
			userOp: '',
      selectGroupId: '',
      showAddGroup: false,
      addGroupName: ''
    }
  },
  methods:{
    getGroupList(){
      let parame={
        page: this.page.current,
				page_size: this.page.pagesize,
        keywords: this.page.keywords,
        groupid: this.groupid
      }
      this.$wf.post('devops?method=/devops/system/groups',parame).then(res=>{
        console.log(res)
        if(res.items.length==0){
          this.noData=true
        }else{
          this.noData=false
          this.groupList=res.items;
          this.page.current=res.page;
          this.page.pagecount=res.page_count;
          this.page.totalCount=res.count
        }
      }).catch(e=>{
        this.$wool.showwarn(e)
      })
    },
    searchByPage(p){
      this.page.current=p.page
      this.getGroupList()
    },
    getSelectGroupList(){
      this.$wf.post('devops?method=/devops/home/groups').then(res=>{
        this.groupName=res.items
      //  console.log(res)
      })
    },
    selectByGroup(id){
      this.groupid=id
      this.getGroupList()
    },
    operateUser(op,item){
      if (op == 'remove') {
				this.selectUserList = item.users;
			} else {
				this.selectUserList = [];
			}
			this.selectGroupId = item.id;
			this.userOp = op;
			this.showUser = !this.showUser;
			this.$nextTick(() => {
				this.$refs.userList.getOp(op);
			});
    },
    toggleUser() {
			this.showUser = !this.showUser;
			this.getGroupList();
		},
    saveGroup() {
			this.msgView = this.$wool.showloading('创建中');
			if (this.addGroupName == '') {
        this.msgView.hide();
        this.$wool.showwarn('请输入群组名');
				return;
			}
			let params = {
				op: 'add',
				name: this.addGroupName
			};
			let url = '?method=/devops/system/group';
			//请求数据
			this.$wf
				.post(url, params)
				//成功处理
				.then(data => {
          if (data.id) {
            this.msgView.msgsucc('创建成功').hide();
            this.getGroupList();
          }else{
            this.$wf.showwarn('创建失败')
          }
        })
				//异常处理
				.catch(e => this.$wool.showerror(e.message));
		}
  },
  mounted(){
    this.getGroupList();
    this.getSelectGroupList()
  },
  components:{
    PagerBar:()=>import('../../component/PagerBar'),
    SingleSelect:()=>import('../../component/SingleSelect'),
    UserList:()=>import('../../component/UserList'),
		WoolShowmodal: () => import('../../component/WoolShowmodal'),
  }
}
</script>

<style lang="less" scoped>
.project_area{
  width: 98%;
  box-shadow: 0 5px 10px rgba(18,38,63,.03);
  border: 1px solid rgba(0, 123, 255, 0.4);
  border-radius: 6px;
  // height: 100px;
  margin: 1% auto 5% auto;
  // border: 1px solid red;
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
    // border: 1px solid rgba(0, 123, 255, 0.4);
	 border-top:1px solid rgba(0, 123, 255, 0.4);
    border-collapse: collapse;
    .project_title{
      width: 100%;
      color: #004085;
      background-color: #F9FBFD;
    }tr{
      background-color: white;
      td{
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        padding: 15px 0;
        padding-left: 15px;
        padding-right: 15px;
        border-bottom: 1px solid rgba(0, 123, 255, 0.4);
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
.machine-info {
	padding: 20px;
	background-color: white;
	width: 500px;
	max-height: 500px;
}
.add_group{
  padding: 20px;
	background-color: white;
  width: 500px;
  min-height: 200px;
  max-height: 500px;
  display: flex;
  justify-content:center;
  align-items:center;
  .titlebar{
    width: 500px;
    position: absolute;
    top:5%;
    left: 5%;
    padding-bottom: 10px;
    border-bottom: 1px solid #e3ebf6;
    color: #1862c6;
    font-weight: bold;
  }
  .add_button{
    display: inline-block;
    width: 60px;
    height: 34px;
    line-height: 34px;
    text-align: center;
    color: white;
    margin-left: 5%;
    border-radius: 5px;
    background-color: #1862c6;
    cursor: pointer;
    font-size: 14px;
  }
  input{
    width: 40%;
    height: 32px;
    display: inline-block;
    border: 1px solid #A6A6A6;
    border-radius: 3px;
    padding-left: 2%;
    font-size: 15px;
  }
}
</style>
