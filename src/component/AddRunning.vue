<style scoped="scoped">
.addRunning {
	width: 63vw;
	min-height: 38vh;
	overflow-y: auto;
	padding: 20px;
	background-color: white;
	border-radius: 4px;
}
.titlebar{
	padding-bottom: 10px;
	border-bottom: 1px solid #e3ebf6;
	color: #1862c6;
	font-weight: bold;
}
.editcontent{
	width: 100%;
	max-height: 556px;
	min-height: 40%;
	overflow-y: auto;
	background-color: white;
}
.luru{
	margin: 5px 0;
}
.input-box {
	margin-top: 20px;
}
.btn-box {
	margin-top: 20px;
	float: right;
	padding-right: 1%;
}
.prop-scope {
	width: 50px;
	text-align: center;
}
.input-box-title {
	width: 8%;
	line-height: 34px;
	font-size: 14px;
	margin-left: 20px;
	color:#004085;
}
.tableDatil{
  overflow: auto;
}
.paramtext{
	width: 400px;
	padding: 3px 5px;
	border: 1px solid #d6d8d9;
}
.removeparam{
	width: 20px;
	vertical-align: middle;
}
.removeparam:hover {
	content: url("../img/dele_hover.png");
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
<template>
	<WoolShowmodal :isshow="isshow" @tapCloser="$emit('toggle')" :isshowcloser="true">
		<div class="addRunning ">
			<div class="titlebar flexlayout">
				<span v-if="operate == 'add'">添加实例</span>
				<span v-if="operate == 'update'">修改实例</span>
        <span v-if="operate == 'detail'">查看实例</span>
				
			</div>
			<div class="editcontent wt-scroll">
				<div class="input-box flexlayout">
					<div class="input-box-title">项目：</div>
					<SingleSelect :disabled="operate == 'detail'" :selectname="selectProject.name" :width=300 :items="projectList" :isdesc="true" v-model="selectProject.id"></SingleSelect>
					<div class="input-box-title" style="margin-left: 200px;">容器：</div>
					<SingleSelect :disabled="operate == 'detail'" :selectname="selectMachine.name" :items="machineList" v-model="selectMachine.id"></SingleSelect>
				</div>
				<div v-if="operate != 'detail'" class="input-box" style="display: flex;">
					<label class="input-box-title">添加属性：</label>
					<TextAnalysis class="luru" @confirm="getInputProps"></TextAnalysis>
					<!-- <button class="delete-row btn" @click="deleteRowCount('bind')">减一列</button> -->
				</div>
				<!-- <table class="tableDatil table" v-if="editObj.props && editObj.props.length > 0"> -->
				<table class="tableDatil table">

					<thead>
						<th width="30px">项数</th>
						<th>属性名</th>
						<th>属性值</th>
						<th>范围</th>
						<th width="30px">删除</th>
					</thead>
					<tbody>
						<tr ref="propstr" v-for="(item, index) in editObj.props" :key="index">
							<td>{{ index + 1 }}</td>
							<td><input class="paramtext" :readonly="operate == 'detail'" style="width:230px" type="text" v-model="item.key" /></td>
							<td><input class="paramtext" :readonly="operate == 'detail'" type="text" v-model="item.value" /></td>
							<td>
								<select class="prop-scope" :disabled="operate == 'detail'" v-model="item.scope">
									<option v-for="(scope, i) in propsScopes" :key="i" :value="scope.value">{{ scope.name }}</option>
								</select>
							</td>
							<td class="table-handle" style="align-content: center;">
                <img v-if="operate != 'detail'" @click="removeprops(index)" class="removeparam" src="../img/dele.png">
              </td>
						</tr>
					</tbody>
				</table>
				<div v-if="operate != 'detail'" class="addrowBar" @click="addRowCount('bind')">+</div>
				<!-- <div class="input-box"><button class="add-row btn" @click="addRowCount('bind')">加一列</button></div> -->
				<div v-if="operate != 'detail'" class="btn-box">
          <!-- <button v-if="editObj.can_delete" class="add-btn" @click="deleteRunning">
						<span>删  除</span>
					</button> -->
					<button class="add-btn" @click="addRunning">
						<span v-if="operate == 'add'">添  加</span>
						<span v-if="operate == 'update'">修  改</span>
					</button>
				</div>
        <div v-if="editObj.can_delete && operate == 'update'" class="delete-btn">
          <div class="query_button" @click="showModal=true">
            删 除 实 例
          </div>
        </div>
			</div>
		</div>
    <ReminderModel       
      :isshow="showModal" 
      :handelName="'删除'" 
      :isDelete='true' 
      @sure="deleteRunning"
      @toggle="showModal=false"
      :deleteName="selectProject.name">

    </ReminderModel>
	</WoolShowmodal>
</template>

<script>
export default {
	name: 'AddRunning',
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
		WoolShowmodal: () => import('./WoolShowmodal'),
		TextAnalysis: () => import('./TextAnalysis.vue'),
    SingleSelect: () => import('./SingleSelect.vue'),
    ReminderModel: ()=>import('./ReminderModel.vue')
	},
	data() {
		return {
			msgView: null,
			operate: 'add', // 是否展示除属性外的操作，编辑状态不进行选
			propsScopes: [
				{
					name: '项目',
					value: 1
				},
				{
					name: '实例',
					value: 0
				}
			],
			projectList: [],
			selectProject: {},
			machineList: [],
			selectMachine: '',
      editObj: {},
      showModal: false
		};
	},
	methods: {
		removeprops(index) {
			this.editObj.props.splice(index, 1);
			this.$forceUpdate();
		},
		clearAll() {
			this.operate = 'add';
			this.selectProject = {};
      this.selectMachine = {};
      this.editObj={}
		},
		addRowCount() {
			if (!this.editObj.props) {
				this.editObj.props = [];
			}
			let obj = {
				key: '',
				value: '',
				scope: 1
			};
			this.editObj.props.push(obj);
			this.$forceUpdate();
		},
		// 获取录入的实例
		getInputProps(value) {
			var msg = this.$wool.showloading('正在录入..');
			// 延迟一秒
			setTimeout(() => {
				value.forEach((item, index) => {
					var dhIdx = item.indexOf('=');
					let obj = {
						key: item.substring(0, dhIdx),
						value: item.substring(dhIdx + 1, item.length),
						scope: 1
					};
					if (!this.editObj.props) {
						this.editObj.props = [];
					}
					this.editObj.props.push(obj);
					this.$forceUpdate();
				});
				msg.hide(0);
			}, 1000);
		},
		getProps() {
			return this.editObj.props;
		},
		addRunning() {
			if (this.operate == 'add') {
				if (this.selectProject.id == '') {
					this.$wool.showwarn('请选择项目');
					return;
				}
				if (this.selectMachine.id == '') {
					this.$wool.showwarn('请选择机器');
					return;
				}
			}
			let params = {
				op: this.operate,
				m: this.selectMachine.id,
				p: this.selectProject.id,
				props: this.getProps()
			};
			if (this.operate == 'update') {
				params.id = this.editObj.id;
			}
			var msg = '保存中';
			this.msgView = this.$wool.showloading(msg);
			let url = '?method=/devops/home/running';
			this.$wf
				.post(url, params)
				.then(data => this.requestSuc(data))
				.catch(e => this.msgView.msgwarn(e.message).hide());
    },
    deleteRunning(){
      // console.log(this.editObj);
      // return;
      this.showModal=false;
      var msgView=this.$wool.showloading('正在删除');
      let parame={
        id: this.editObj.id,
        op: 'delete'
      }
      this.$wf
        .post('devops?method=/devops/home/running', parame)
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
			}
		},
		getProjectlist() {
			this.$wf
				.post('?method=/devops/home/projects', {
					page: 1,
					page_size: 512, // 默认查一百条先吧
					keywords: ''
				})
				.then(data => {
					this.projectList = data.items;
					if (!this.selectProject.id) {
						this.getMachines();
					}
				})
				.catch(e => this.$wool.showwarn('获取项目列表失败' + e.message));
		},
		getMachines() {
			this.$wf
				.post('?method=/devops/home/machines', {
					page: 1,
					page_size: 512, // 默认查一百条先吧
					keywords: '',
					project: this.selectProject.id
				})
				.then(data => {
					this.machineList = data.items;
				})
				.catch(e => this.$wool.showwarn('获取机器列表失败' + e.message));
    },
    judgeTable(){
      console.log(this.obj)
      console.log(this.obj=={})
      // if(this.obj!={}){
      //   this.editObj={}
      // }
    }
	},
	watch: {
		'selectProject.id': function(val) {
			this.getMachines();
		},
		obj(val) {
			this.clearAll();
			if (JSON.stringify(val) != '{}') {
				this.editObj = val;
				this.operate = 'update';
				this.selectProject = val.p;
        this.selectMachine = val.m;
        if (this.editObj.notEdit) {
          this.operate = 'detail';
        }
				// 特殊处理一下不返回value的情况吧
				val.props.forEach(item => {
					if (!item.value) {
						this.$set(item, 'value', '');
					}
				});
			}
		}
	},
	mounted() {
    this.getProjectlist();
    this.judgeTable();
	}
};
</script>
