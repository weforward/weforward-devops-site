<template>
  <WoolShowmodal :isshow="isshow" @tapCloser="$emit('toggle')" :isshowcloser="true">
    <div class="addProject">
      <div class="titlebar flexlayout">
        <span v-if="operate == 'add'">添加项目</span>
        <span v-if="operate == 'update'">修改项目</span>
        <span v-if="operate == 'detail'">查看项目</span>

      </div>
      <div class="content wt-scroll">
        <label class="flexlayout input-item" style="margin-top:20px;">
          <div class="item_name">项目名：</div>
          <input class="item_text" :readonly="operate == 'detail'" placeholder="请输入项目名称" ref="pName" v-model="projectName" />
        </label>
        <label class="flexlayout input-item" v-if="operate == 'add'">
          <div class="item_name">项目类型：</div>
          <label class="radio-item" v-for="(item, index) in projectTypes" :key="index">
            <input v-model="projectType" :readonly="operate == 'detail'" type="radio" name="version" :value="item.value" />&nbsp;
            <!-- <img :src="item.icon" /> -->{{ item.name }}
          </label>
        </label>
        <label class="flexlayout input-item" v-if="projectType > 0">
          <div class="item_name">{{ projectType == 1 ? '服务端口' : '访问地址' }}：</div>
          <input
            class="item_text"
            :readonly="operate == 'detail'"
            :placeholder="projectType == 1 ? '请输入服务端口，请用;隔开' : '请输入访问地址，请用;隔开'"
            v-model="projectTypeValue"
          />
          <button class="recommend btn" v-if="projectType == 1 && operate != 'detail'" @click="getRecommend">推荐端口</button>
        </label>
        <label class="flexlayout input-item">
          <div class="item_name">项目描述：</div>
          <input class="item_text" :readonly="operate == 'detail'" placeholder="请输入项目描述" v-model="projectDesc" />
        </label>
        <label class="flexlayout input-item">
          <div class="item_name">规则说明：</div>
          <input class="item_text" :readonly="operate == 'detail'" placeholder="请输入项目描述" v-model="projectDesc" />
        </label>
        <div :class="['input-item','flexlayout',groupList.length!=0 || 'input-box-bottom'] ">
          <div class="input-box-title">运维组：</div>
          <MoreSelect 
            :disabled="operate == 'detail'" 
            v-model="groupids" 
            :items="groupitems" 
            :selectname="selectGroupNames"
            @select="selectdGroupName">
          </MoreSelect>
        </div>

        <div class="right_box" v-if="groupList.length!=0">
          <div class="name_box">
            <div class="edit_right" 
              @click="handleRights(item,index)" 
              v-for="(item,index) in groupList" 
              :key="index"><span>{{item.name}}</span>
            </div>
          </div>
          
          <div class="choose_right">
            <p class="right_title">{{groupList[currentIndex].name}}的权限</p>
            <div class="rights" >
              <label class="right" title="日志、dump堆栈、操作记录"><input type="radio" :disabled="operate == 'detail'" v-model="groupList[currentIndex].rights[0]" name="read" value="READ">
                <div>&ensp;仅可见</div> 
              </label>
              <label class="right" title="“仅可见”基础上，增加重启、启动、停止权限"><input type="radio" :disabled="operate == 'detail'" v-model="groupList[currentIndex].rights[0]" name="operator" value="OPERATOR">
                <div>&ensp;基础操作</div>
              </label>
              <label class="right" title="所有管理操作权限"><input type="radio" :disabled="operate == 'detail'" v-model="groupList[currentIndex].rights[0]" name="update" value="UPDATE"> 
                <div>&ensp;管理操作</div>
              </label>
            </div>
          </div>
        </div>
        <div v-show="operate == 'update'" class="input-item flexlayout input-box-bottom">
          <div class="input-box-title">所有者：</div>
          <SingleSelect :selectname="owner.name" :neednet="true" @serachbykeyword="getUserList" :items="userList" v-model="owner.id"></SingleSelect>
        </div>
        <div class="input-box" style="margin-top: 0;"><label>项目映射</label></div>
        <table class="table tableDatil" v-show="editObj.binds && editObj.binds.length > 0">
          <thead>
            <th>源目录</th>
            <th>挂载目录</th>
            <th v-if="operate != 'detail'" width="30px">删除</th>
          </thead>
          <tbody>
            <tr ref="bindstr" v-for="(item, index) in editObj.binds" :key="index">
              <td><input class="paramtext" style="width:200px" ref="bindsource" v-model="item.source" :readonly="operate == 'detail'" /></td>
              <td><input class="paramtext" ref="bindtarget" v-model="item.target" :readonly="operate == 'detail'" /></td>
              <td v-if="operate != 'detail'" class="table-handle" @click="removebinds(index)"><img class="removeparam" src="../img/dele.png"></td>
            </tr>
          </tbody>
        </table>
        <div class="addrowBar" v-if="operate != 'detail'" @click="addRowCount('bind')">+</div>

        <!-- <div class="input-box" v-if="operate != 'detail'"><button class="add-row btn" @click="addRowCount('bind')">加一列</button></div> -->
        <div class="input-box"><label>环境变量</label></div>
        <table  class="table tableDatil" v-show="editObj.envs && editObj.envs.length > 0">
          <thead>
            <th>属性名</th>
            <th>属性值</th>
            <th v-if="operate != 'detail'" width="30px">删除</th>
          </thead>
          <tbody>
            <tr ref="envstr" v-for="(item, index) in editObj.envs" :key="index">
              <td><input class="paramtext" style="width:200px" ref="envsKey" v-model="item.key" :readonly="operate == 'detail'" /></td>
              <td><input class="paramtext" ref="envsValue" v-model="item.value" :readonly="operate == 'detail'" /></td>
              <td class="table-handle" v-if="operate != 'detail'" @click="removeenvs(index)"><img class="removeparam" src="../img/dele.png"></td>
            </tr>
          </tbody>
        </table>
        <div class="addrowBar" v-if="operate != 'detail'" @click="addRowCount('envs')">+</div>
        <!-- <div class="input-box" v-if="operate != 'detail'"><button class="add-row btn" @click="addRowCount('envs')">加一列</button></div> -->
		<div class="input-box"><label>项目映射示例</label></div>
		<table  class="table tableDatil">
		  <thead>
		    <th>属性名</th>
		    <th>属性示例值</th>
		    <th>说明</th>
		  </thead>
		  <tbody>
			  <tr>
				<td>/wf/html/</td>
				<td>/home/boot/html/</td>
				<td>将宿主机的/wf/html目录挂载到项目的/home/boot/html/目录</td>
			  </tr>
		  </tbody>
		</table>
        <div class="input-box"><label>环境变量示例</label></div>
        <table  class="table tableDatil">
          <thead>
            <th>属性名</th>
            <th>属性示例值</th>
            <th>说明</th>
          </thead>
          <tbody>
			  <tr>
				<td>Xms</td>
				<td>128m</td>
				<td>指定jvm启动时分配的内存</td>
			  </tr>
			  <tr>
			  	<td>Xmx</td>
			  	<td>256m</td>
			  	<td>指定jvm运行过程中分配的最大内存</td>
			  </tr>
			  <tr>
			  	<td>Xss</td>
			  	<td>256k</td>
			  	<td>指定jvm启动的每个线程分配的内存大小</td>
			  </tr>
			  <tr>
				<td>maxDirectMemorySize</td>
				<td>64m</td>
				<td>指定jvm的DirectMemory最大值</td>
			  </tr>
			  <tr>
			  	<td>disabelG1GC</td>
			  	<td>false</td>
			  	<td>是否禁用G1GC,true为禁用,false为不禁用</td>
			  </tr>
			  <tr>
				  <td>RLOG_URL</td>
				  <td>http://127.0.0.1:1200/log.j</td>
				  <td>远程日志的链接</td>
			  </tr>
			  <tr>
				 <td>WEFORWARD_HOSTS</td>
				 <td>//weforawrd.wf</td>
				 <td>Weforward主机域名</td>
			  </tr>
			  <tr>
				  <td>WF_JAVA_OPTIONS</td>
				  <td></td>
				  <td>自定义的java程序启动参数</td>
			  </tr>
          </tbody>
        </table>
		<div class="btn-box" v-if="operate != 'detail'">
          <!-- <button v-if="editObj.can_delete" class="add-btn" @click="deleteProject">
            <span>删除</span>
          </button> -->
          <button class="add-btn" @click="addProject">
            <span v-if="operate == 'add'">添加</span>
            <span v-if="operate == 'update'">修改</span>
          </button>
        </div>
        <div class="delete-btn" v-if="editObj.can_delete && operate == 'update'" >
          <div class="query_button" @click="clickDelete">
            删 除 项 目
          </div>
        </div>
      </div>
    </div>
    <ReminderModel 
      :isshow="showModal" 
      :handelName="'删除'" 
      :isDelete='true' 
      @sure="deleteProject"
      @toggle="showModal=false"
      :deleteName="projectName">
    </ReminderModel>
  </WoolShowmodal>
</template>

<script>
export default {
  name: 'AddProject',
  props: {
    isshow: {
      type: Boolean,
      default: false
    },
    obj: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  components: {
    WoolShowmodal: () => import('./WoolShowmodal.vue'),
    MoreSelect: () => import('./MoreSelect.vue'),
    SingleSelect: () => import('./SingleSelect.vue'),
    ReminderModel:()=>import('./ReminderModel.vue')
  },
  data() {
    return {
      projectName: '',
      msgView: null,
      projectDesc: '',
      operate: 'add', // 操作可以是创建也可以是编辑
      pId: '',
      projectTypes: [
        {
          name: 'JAVA',
          value: 1,
          icon:'../img/java.png'
        },
        {
          name: 'HTML',
          value: 2,
          icon:'../img/html.png'
        }
      ],
      projectType: 0, // 默认没有类型
      projectTypeValue: '', // 可以是服务端口也可以是访问地址根据项目type而定
      owner: {},
      groupitems: [],
      userList: [],
      groupids: '',
      selectGroupNames: '',
      editObj: {},
      groupList:[],
      currentIndex: 0,
      showModal: false
    };
  },
  methods: {
    removebinds(index) {
      this.editObj.binds.splice(index, 1);
      this.$forceUpdate();
    },
    removeenvs(index) {
      this.editObj.envs.splice(index, 1);
      this.$forceUpdate();
    },
    // 获取推荐端口
    getRecommend() {
      let url = '?method=/devops/home/recommendedServerPort';
      this.$wf
        .post(url)
        .then(data => {
          this.projectTypeValue = data;
        })
        .catch(e => {
          this.$wool.showwarn('获取推荐端口失败');
        });
    },
    addRowCount(nature) {
      if (nature == 'envs') {
        if (!this.editObj.envs) {
          this.editObj.envs = [];
        }
        let envs = {
          key: '',
          value: ''
        };
        this.editObj.envs.push(envs);
      }
      if (nature == 'bind') {
        if (!this.editObj.binds) {
          this.editObj.binds = [];
        }
        let bind = {
          source: '',
          target: ''
        };
        this.editObj.binds.push(bind);
      }
      this.$forceUpdate();
    },
    addProject() {
      if (this.projectName == '') {
        this.$refs.pName.focus();
        this.$wool.showwarn('请输入项目名');
        return;
      }
      let envs = [];
      let binds = [];
      if (!this.editObj.envs) {
        this.editObj.envs = [];
      }
      if (!this.editObj.binds) {
        this.editObj.binds = [];
      }
      this.editObj.envs.forEach(env => {
        if (!env.key || !env.value) {
          return false;
        }
        envs.push(env.key + '=' + env.value);
      });
      this.editObj.binds.forEach(bind => {
        if (!bind.source || !bind.target) {
          return false;
        }
        binds.push(bind.source + ':' + bind.target);
      });
      for(let i=0;i<this.groupList.length;i++){
        if(this.groupList[i].rights.length==0){
          this.$wool.showwarn(this.groupList[i].name+'的权限不能为空！');
          return;
        }
      }
      let params = {
        id: this.pId,
        op: this.operate,
        name: this.projectName,
        envs: envs,
        binds: binds,
        desc: this.projectDesc,
        groups: this.groupids.split(';').filter(item => {
          return item;
        }),
        type: this.projectType,
        group_list: this.groupList.filter(item=>{
          return {
            id: item.id,
            rights: item.rights
          }
        })
      };
      var newtypeval = (this.projectTypeValue.toString() || '').replace(/,|，|；/g, ';');
      var typeval = newtypeval.split(';').filter(item => {
        return item;
      });
      if (this.projectType == 1) {
        // java类型
        params['serverPorts'] = typeval;
        params.serverPorts.forEach((p, index) => {
          params.serverPorts[index] = Number(p);
        });
      }
      if (this.projectType == 2) {
        // html类型
        params['accessUrls'] = typeval;
      }
      if (this.operate == 'update') {
        params['owner'] = this.owner.id;
      }
      this.msgView = this.$wool.showloading('正在保存');
      let url = '?method=/devops/home/project';
      //请求数据
      this.$wf
        .post(url, params)
        //成功处理
        .then(data => this.requestSuc(data))
        //异常处理
        .catch(e => {
          this.msgView.msgwarn(e.message).hide();
        });
    },
    requestSuc(data) {
      let msg = '保存成功';
      if (data.id) {
        this.$emit('toggle');
        this.$emit('load');
      } else {
        msg = '保存失败';
      }
      this.msgView.msgsucc(msg).hide();
    },
    // 将数据全部弄成最初状态
    clearAll() {
      this.owner = {};
      this.projectName = '';
      this.projectDesc = '';
      this.operate = 'add'; // 操作可以是创建也可以是编辑
      this.selectGroupNames = '';
      this.groupids = '';
      this.projectType = 0;
      this.projectTypeValue = '';
      this.pId = '';
      this.editObj={};
      this.groupList=[];
      this.currentIndex=0;
    },
    // 获取群组
    getGroupList() {
      this.$wf
        .post('?method=/devops/home/groups', {
          page: 1,
          page_size: 512, // 默认查一百条先吧
          keywords: ''
        })
        .then(data => {
          this.groupitems = data.items;
        })
        .catch(e => this.$wool.showwarn('获取群组列表失败' + e.message));
    },
    // 获取用户列表
    getUserList(val) {
      let params = {
        k: val,
        p: 1,
        pagesize: 50
      };
      let url = '?method=/devops/home/users';
      this.$wf
        .post(url, params)
        .then(data => {
          this.userList = data.items || [];
          this.$forceUpdate();
        })
        .catch(e => this.$wool.showwarn(e.message));
    },
    setEditValue(val) {
      this.$nextTick(()=>{
        val.groups.forEach(item => {
          this.groupids = this.groupids + item.id + ';';
          this.selectGroupNames = this.selectGroupNames + item.name + ';';
          this.groupList.push({
            id: item.id,
            name: item.name,
            rights: item.rights
          })
        });
      })
      
      this.projectName = val.name;
      this.projectDesc = val.desc;
      this.projectType = val.type;
      if (val.server_ports && val.server_ports.length > 0) {
        for (let port of val.server_ports) {
          this.projectTypeValue = this.projectTypeValue + port + ';';
        }
      }
      if (val.access_urls && val.access_urls.length > 0) {
        for (let url of val.access_urls) {
          this.projectTypeValue = this.projectTypeValue + url + ';';
        }
      }
      this.owner = val.owner;
      if(this.groupList.length!=0){
        this.handleRights(this.groupList[0],0)
      }
      
    },
    selectdGroupName(idStr,nameStr){
      // 群组权限更改方法：
        // 1、新增运维组权限为空；
        // 2、运维组不变部分，权限不变；
      var nameList=nameStr.split(';');
      nameList.pop();
      var idList=idStr.split(';');
      idList.pop()
      // console.log(nameList);
      // console.log(idList);
      let newGroupList=[]
      for(let i=0;i<idList.length;i++){
        newGroupList.push({
          name: nameList[i],
          id: idList[i],
          rights: []
        })
      }
     
      // 相同的id不更改权限
      let that=this;
      this.groupList=newGroupList.map(item1=>{
        that.groupList.map(item2=>{
          if(item1.id==item2.id){
            item1.rights=item2.rights;
          }
        })

        return item1
      })
      nameList=[];
      idList=[];
      this.currentIndex=0;
    },
    handleRights(item ,index){
      this.currentIndex=index;
    },
    deleteProject(){
      this.showModal=false;
      var msgView=this.$wool.showloading('正在删除');
      let parame={
        id: this.pId,
        op: 'delete'
      }
      this.$wf
        .post('devops?method=/devops/home/project', parame)
        //成功处理
        .then(data => {
          this.$emit('toggle');
          this.$emit('load');
          msgView.msgwarn('删除成功！').hide()
        })
        //异常处理
        .catch(e => {
          msgView.msgwarn(e.message).hide();
        });
      
    },
    clickDelete(){
      this.showModal=true;
    }
  },

  watch: {
    isshow(val) {
      if (val) {
        this.clearAll();
        if (JSON.stringify(this.obj) != '{}') {
          this.editObj = this.obj;
          this.operate = 'update';
          this.pId = this.editObj.id;
          if (this.editObj.notEdit) {
            this.operate = 'detail';
          }
          this.setEditValue(this.editObj);
          this.getUserList(this.owner.name)
        }
        //  this.selectdGroupName(0,this.selectGroupNames)
      }
    },
  },
  mounted() {
    this.getGroupList();
    
  }
};
</script>
<style scoped="scoped" lang="less">
.addProject {
  width: 58vw;
  min-height: 50vh;
  // max-height: 90vh;
  overflow-y: auto;
  padding: 20px 20px 35px 20px;
  background-color: #fff;
  border-radius: 4px;
}
.titlebar{
  padding-bottom: 10px;
  border-bottom: 1px solid #e3ebf6;
  color: #1862c6;
  font-weight: bold;
}
.input-box {
  margin-top: 20px;
  font-size: 14px;
  color: #004085;
}
.table {
  margin-top: 10px !important;
}
.btn-box {
  margin-top: 20px;
  float: right;
  padding-right: 5%;
}
.input-desc {
  width: 320px;
  margin-left: 20px;
}
.radio-item {
  width: 70px;
  height: 30px;
  line-height: 30px;
  margin-bottom: 15px;
  
}
.recommend {
  background-color: #1862c6;
  color: white;
  border: 1px solid #1862c6;
  border-radius: 3px;
  margin-left: 10px;
  margin-top: 5px;
  padding:0 5px ;
  width:70px;
}
.input-box-title {
  width: 10%;
  line-height: 34px;
  font-size: 14px;
  color: #004085;
}
.input-box-bottom {
  padding-bottom: 20px;
}
.content{
  width: 95%;
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
  margin-left: 40px;
}
.addrowBar{
  border: 2px dashed #1ba9f9;
  text-align: center;
  padding: 5px 0;
  width: 97%;
  margin: 10px auto;
  font-size: 20px;
  cursor: pointer;
  color: #1ba9f9;
}
.paramtext{
  width: 400px;
  padding: 3px 5px;
  border: 1px solid #d6d8d9;
}
.removeparam{
  width: 20px;
  padding-left: 8px;
  vertical-align: middle;
}
.removeparam:hover {
  content: url("../img/dele_hover.png");
  width: 20px;
  padding-left: 8px;
  vertical-align: middle;
}
th{
  padding: 5px 10px;
}
.right_box{
  width: 90%;
  margin-left: 10%;
  margin-bottom: 10px;
  // padding-top: 10px;
}
.name_box{
  display: flex;
}
.edit_right{
  padding: 10px 0;
  margin-right: 10px;
  color: #3D83E5;
  font-size: 14px;
  cursor: pointer;
}
.choose_right{
  width: 60%;
  height: 10%;
  border: 1px solid #E5E5E5;
  padding-left: 10px;
  font-size: 14px;
}
.right_title{
  color: #3D83E5;
}
p{
  padding: 10px 0;
}
.rights{
  margin-bottom: 10px;
  display: flex;
  .right{
    width: 30%;
    // margin-right: 50px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}
.delete-btn{
  margin-top: 85px;
  padding-top: 15px;
  border-top: solid 1px #ccc;
  text-align: center;
}
.query_button{
  width: 150px;
  height: 40px;
  line-height: 40px;
  background-color: red;
}
</style>