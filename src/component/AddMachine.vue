<template>
	<WoolShowmodal :isshow="isshow" @tapCloser="$emit('toggle')" :isshowcloser="true">
		<div class="AddMachine wt-scroll">
      <div class="titlebar flexlayout">
				<span v-if="operate == 'add'">添加容器</span>
				<span v-if="operate == 'update'">修改容器</span>
			</div>
      <div class="content">
        <label class="flexlayout input-item" style="margin-top:20px;">
          <div class="item_name">容器名称：</div>
          <input class="item_text" placeholder="请输入机器名称" ref="mName" v-model="machineName" />
        </label>
        <div class="input-item flexlayout" v-if="operate == 'add'">
          <div class="item_name">容器类型：</div>
          <!-- <label class="item_text"> -->
            <label class="radio-item">
              <input v-model="mtype" type="radio" name="type" value="docker" />
              docker
            </label>
            <label class="radio-item">
              <input v-model="mtype" type="radio" name="type" value="proxy" />
              proxy
            </label>
          <!-- </label> -->
        </div>
        <div v-show="operate == 'update'" class="input-item flexlayout input-box-bottom">
          <div class="input-box-title">所有者：</div>
          <SingleSelect :selectname="owner.name" @serachbykeyword="getUserList" :items="userList" v-model="owner.id"></SingleSelect>
        </div>
        <div :class="['input-item','flexlayout', groupList.length!=0 || 'input-box-bottom'] ">
          <div class="input-box-title">运维组：</div>
          <MoreSelect 
            v-model="groupids" 
            :items="groupitems" 
            :selectname="selectGroupNames"
            @select="selectdGroupName"></MoreSelect>
        </div>

        <div class="choosed_group" v-if="groupList.length!=0">
          <div class="choosed_group_title">
            <span v-for="(item,index) in groupList" 
              @click="handleRights(index)" 
              :key="index">
              {{item.name}}
            </span>
          </div>
          <div class="choosed_group_rights">
            <p>{{ groupList[currentIndex].name }}的权限</p>
            <div class="choosed_group_right">
              <label class="right" title="查看相关信息"><input type="radio" v-model="groupList[currentIndex].rights[0]" :disabled="operate == 'detail'" name="read" value="READ">
                <span>&ensp;仅可见</span> 
              </label>
              <label class="right" title="“仅可见”基础上，增加添加、删除实例操作"><input type="radio" v-model="groupList[currentIndex].rights[0]" :disabled="operate == 'detail'" name="operator" value="OPERATOR">
                <span>&ensp;基础操作</span> 
              </label>
              <label class="right" title="所有管理操作权限"><input type="radio" v-model="groupList[currentIndex].rights[0]" :disabled="operate == 'detail'" name="update" value="UPDATE">
                <span>&ensp;管理操作</span> 
              </label>
            </div>
          </div>
        </div>

        <div v-if="mtype == 'proxy'">
          <label class="flexlayout input-item">
            <div class="item_name">根目录：</div>
            <input class="item_text" ref="input" placeholder="请输入机器根目录" v-model="rootName" />
          </label>
        </div>
        <div>
          <label class="flexlayout input-item">
            <div class="item_name">链接：</div>
            <input class="item_text" ref="input" placeholder="请输入机器链接" v-model="machineUrl" />
          </label>
        </div>
        <div class="input-box"><label>机器映射</label></div>
        <table class="table tableDatil" v-if="editObj.binds && editObj.binds.length > 0">
          <thead>
            <th>源目录</th>
            <th>挂载目录</th>
            <th width="30px">删除</th>
          </thead>
          <tbody>
            <tr ref="bindstr" v-for="(item, index) in editObj.binds" :key="index">
              <td><input class="paramtext" style="width:200px" v-model="item.source" /></td>
              <td><input class="paramtext" v-model="item.target" /></td>
              <td class="table-handle" @click="removebinds(index)">移除</td>
            </tr>
          </tbody>
        </table>
				<div class="addrowBar" @click="addRowCount('bind')">+</div>
        <!-- <div class="input-box"><button class="add-row btn" @click="addRowCount('bind')">加一列</button></div> -->
        <div class="input-box"><label>环境变量</label></div>
        <table class="table tableDatil" v-if="editObj.envs && editObj.envs.length > 0">
          <thead>
            <th>属性名</th>
            <th>属性值</th>
            <th width="30px">操作</th>
          </thead>
          <tbody>
            <tr ref="envstr" v-for="(item, index) in editObj.envs" :key="index">
              <td><input class="paramtext" style="width:200px" v-model="item.key" /></td>
              <td><input class="paramtext" v-model="item.value" /></td>
              <td class="table-handle" @click="removeenvs(n)">移除</td>
            </tr>
          </tbody>
        </table>
				<div class="addrowBar" @click="addRowCount('envs')">+</div>
        <!-- <div class="input-box"><button class="add-row btn" @click="addRowCount('envs')">加一列</button></div> -->
		<div class="input-box"><label>项目映射示例</label></div>
		<table  class="table tableDatil">
		  <thead>
		    <th>属性名</th>
		    <th>属性示例值</th>
		    <th>说明</th>
		  </thead>
		  <tbody>
			  <tr>
				<td>/data/</td>
				<td>/data/</td>
				<td>将宿主机的/data/目录挂载到容器相关项目的/data/目录</td>
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
				<td>SERVER_ID</td>
				<td>x0001</td>
				<td>容器相关项目的服务器id</td>
			  </tr>
			  <tr>
				  <td>RLOG_URL</td>
				  <td>http://127.0.0.1:1200/log.j</td>
				  <td>远程日志的链接</td>
			  </tr>
		  </tbody>
		</table>
        <div class="btn-box">
          
          <button class="add-btn" @click="AddMachine">
            <span v-if="operate == 'add'">添加</span>
            <span v-if="operate == 'update'">修改</span>
          </button>
        </div>
        <div class="delete-btn" v-if="editObj.can_delete && operate == 'update'">
          <div class="query_button" @click="showModal=true">
            <span>删 除 容 器</span>
          </div>
        </div>
      </div>
		</div>
    <ReminderModel
      :isshow="showModal" 
      :handelName="'删除'" 
      :isDelete='true' 
      @sure="deleteMachine"
      @toggle="showModal=false"
      :deleteName="machineName">

    </ReminderModel>
	</WoolShowmodal>
</template>

<script>
export default {
	name: 'AddMachine',
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
		SingleSelect: () => import('./SingleSelect.vue'),
    MoreSelect: () => import('./MoreSelect.vue'),
    ReminderModel:()=>import('./ReminderModel.vue')
	},
	data() {
		return {
			editObj: {},
			machineName: '',
			bindsCount: 1,
			envsCount: 1,
			msgView: null,
			operate: 'add', // 操作可以是创建也可以是编辑
			mId: '',
			mtype: 'proxy',
			rootName: '',
			machineUrl: '',
			owner: {},
			groupitems: [],
			groupids: '',
			selectGroupNames: '',
      userList: [],
      // 已选group列表
      groupList: [],
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
		addRowCount(nature) {
			if (nature == 'envs') {
				if (!this.editObj.envs) {
					this.editObj.envs = [];
				}
				let obj = {
					key: '',
					value: ''
				};
				this.editObj.envs.push(obj);
			}
			if (nature == 'bind') {
				if (!this.editObj.binds) {
					this.editObj.binds = [];
				}
				let obj = {
					source: '',
					target: ''
				};
				this.editObj.binds.push(obj);
			}
			this.$forceUpdate();
		},
		AddMachine() {
			if (this.machineName == '') {
				this.$refs.mName.focus();
				this.$wool.showwarn('请输入机器名');
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
				id: this.mId,
				op: this.operate,
				name: this.machineName,
				envs: envs,
				binds: binds,
				type: this.mtype,
				url: this.machineUrl,
				groups: this.groupids.split(';').filter(item => {
					return item;
        }),
        group_list:this.groupList.filter(item =>{
          return {
            id: item.id,
            rights: item.rights
          }
        })
			};
			if (this.mtype == 'proxy') {
				params.root = this.rootName;
			}
			if (this.operate == 'update') {
				params['owner'] = this.owner.id;
			}
			this.msgView = this.$wool.showloading('保存中');
			let url = '?method=/devops/home/machine';
			this.$wf
				.post(url, params)
				.then(data => this.requestSuc(data))
				.catch(e => {
					this.msgView.msgwarn(e.message).hide();
				});
    },
    deleteMachine(){
      this.showModal=false;
      var msgView=this.$wool.showloading('正在删除');
      let parame={
        id: this.editObj.id,
        op: 'delete'
      }
      this.$wf
        .post('devops?method=/devops/home/machine', parame)
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
		requestSuc(data) {
			if (data.id) {
				this.msgView.msgsucc('保存成功').hide();
				this.$emit('toggle');
				this.$emit('load');
			} else {
				this.msgView.msgwarn('保存失败').hide();
			}
		},
		// 将数据全部弄成最初状态
		clearAll() {
			this.machineName = '';
			this.owner = {};
			this.operate = 'add'; // 操作可以是创建也可以是编辑
			this.rootName = '';
			this.machineUrl = '';
			this.mId = '';
			this.groupids = '';
      this.selectGroupNames = '';
      if(this.operate == 'add'){
        this.editObj={};
      }
      this.groupList=[];
      this.currentIndex=0;
		},
		// 获取群组
		getGroupList() {
			this.$wf
				.post('?method=/devops/home/groups', {
					page: 1,
					page_size: 100, // 默认查一百条先吧
					keywords: ''
				})
				.then(data => {
					this.groupitems = data.items;
				})
				.catch(e => this.$wool.showwarn('获取群组列表失败' + e.message));
		},
		getUserList(val) {
			let params = {
				k: val,
				p: 1,
				pagesize: 50
			};
			let url = '?method=/devops/system/users';
			this.$wf
				.post(url, params)
				.then(data => {
					this.userList = data.items || [];
				})
				.catch(e => this.$wool.showwarn(e.message));
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
    handleRights(index){
      this.currentIndex=index;
    }
	},
	watch: {
		obj(val) {
			this.clearAll();
			if (JSON.stringify(val) != '{}') {
				this.operate = 'update';
				this.editObj = val;
				// 延时一下吧 可能组件还没有加载出来
				this.$nextTick(() => {
					this.owner = val.owner || {};
					val.groups.forEach(item => {
						this.groupids = this.groupids + item.id + ';';
            this.selectGroupNames = this.selectGroupNames + item.name + ';';
            this.groupList.push({
              id: item.id,
              name: item.name,
              rights: item.rights
            })
					});
				});
				this.mId = val.id;

				this.machineName = val.name;
				const capitalize = ([first, ...rest], lowerRest = false) => first.toUpperCase() + (lowerRest ? rest.join('').toLowerCase() : rest.join(''));
				var mtype = 'proxy';
				if (this.mId.indexOf(capitalize(mtype)) > -1) {
					this.mtype = 'proxy';
				} else {
					this.mtype = 'docker';
				}
				for (let item of val.props) {
					if (item.key == 'root') {
						this.rootName = item.value;
					} else if (item.key == 'url') {
						this.machineUrl = item.value;
					} else if (item.key == 'url') {
						this.machineUrl = item.value;
					}
				}
			}
		}
	},
	mounted() {
		this.getGroupList();
	}
};
</script>
<style scoped="scoped" lang='less'>
.AddMachine {
  /* width: 800px;
  min-height: 92%; */
  width: 58vw;
  min-height: 50vh;
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
.content{
  width: 95%;
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
  margin-left: 40px;
}
.input-box {
  margin: 20px 0;
  font-size: 14px;
  color: #004085;
}
.table {
  margin-top: 10px !important;
  td{
    textarea{
      width: 100%;
      border: 1px solid #d6d8d9;
    }
  }
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
.label-box {
  margin: 20px;
}
.radio-item{
  width: 80px;
  height: 30px;
  line-height: 30px;
  margin-bottom: 15px;
}
.paramtext{
  width: 400px;
  padding: 3px 5px;
  border: 1px solid #d6d8d9;
}
.input-box-title {
  width: 10%;
  font-size: 14px;
  line-height: 34px;
  color: #004085;
}
.input-box-bottom {
  padding-bottom: 20px;
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
th{
  padding: 5px 10px;
}
.choosed_group{
  margin-bottom: 20px;
}
.choosed_group_title{
  margin-left: 10%;
  padding: 10px 0;
  color: #3D83E5;
  font-size: 14px;
  cursor: pointer;
  span{
    margin-right: 10px;
  }
}
.choosed_group_rights{
  margin-left: 10%;
  border: solid 1px #E5E5E5;
  width: 50%;
  height: 70px;
  font-size: 14px;
  p{
    padding: 10px;
    color: #3D83E5;
  }
}
.choosed_group_right{
  padding-left: 10px;
  display: flex;
  .right{
    width: 30%;
    display: flex;
    align-items: center;
    cursor: pointer;
    // padding-right: 50px;
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