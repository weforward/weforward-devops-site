<template>
	<WoolShowmodal :isshow="isshow">
		<div :class="['cmd_modal','modal',!isDelete || 'deleteHeight']">
			<div class="modal-title">{{handelName}} 执行提示</div>
			<div class="modal-content">
				您确认要<span style="color:#1862c6">{{ handelName }}</span>
				<span v-if="version">版本号{{ version }}的</span>
        <span v-if="!isDelete">实例</span>
        <span v-if="deleteName">{{deleteName}}</span> 吗?
				<textarea v-if="!isDelete" rows="10" class="note-input" placeholder="请输入备注说明（选填）" v-model="note"></textarea>
			</div>
			<div class="handle">
				<button class="add-btn" @click="reqeustHandle">确  认</button>
				<button class="cancel-btn" @click="$emit('toggle')">取消</button>
			</div>
		</div>
		<WoolShowmodal :isshow="showTask" @tapCloser="closeShowTask" :isshowcloser="true">
			<div class="task">
				<div class="tasktitle"><span style="color:red">●</span><span style="color:#FFC000">●</span><span style="color:#2E75B6">●</span> 当前状态：{{ currentStatus.desc || '--' }}</div>
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
	name: 'ReminderModel',
	components: {
		WoolShowmodal: () => import('./WoolShowmodal')
	},
	props: {
		handelName: {
			type: String
		},
		handleOp: {
			type: String
		},
		isshow: {
			type: Boolean,
			default: function() {
				return false;
			}
		},
		runningId: {
			type: String
		},
		version: {
			type: String
    },
    isDelete:{
      type: Boolean,
      default: function(){
        return false
      }
    },
    deleteName:{
      type: String
    }
	},
	data() {
		return {
			note: '',
			msgView: null,
			isVersionsFail: false,
			taskTimer: null,
			showTask: false,
			taskId: '',
			currentStatus: {},
			statusList: []
		};
	},
	methods: {
		reqeustHandle() {
			// if (this.note == '') {
			// 	this.$wool.showwarn('请务必输入备注说明');
			// 	return;
      // }
      if(this.isDelete){
        this.$emit('sure');
        return;
      }
			this.msgView = this.$wool.showloading('正在' + this.handelName + '中');
			this.$nextTick(() => {
				let params = {
					op: this.handleOp,
					id: this.runningId,
					note: this.note
				};
				if (this.handleOp == 'upgrade' || this.handleOp == 'build') {
					params.version = this.version;
				}
				let url = '?method=/devops/home/running';
				//请求数据
				this.$wf
					.post(url, params)
					//成功处理
					.then(data => this.handleSucc(data))
					//异常处理
					.catch(e => this.msgView.msgwarn(e.message).hide());
			});
		},
		handleSucc(data) {
			this.taskId = data.id;
			this.taskTimer = setInterval(() => {
				this.requestTaskStatus();
			}, 1000);
			this.showTask = true;
			// 				this.$emit('toggle');
			if (!data.id) {
				this.msgView.msgwarn(this.handelName + '操作失败').hide();
				return;
			}
			this.msgView.msgsucc(this.handelName + '操作成功').hide();
			this.$emit('load');
		},
		requestTaskStatus() {
			let url = '?method=/devops/home/optask';
			let params = {
				id: this.taskId
			};
			this.$wf
				.post(url, params)
				//成功处理
				.then(data => {
					this.currentStatus = data.current_status || {};
          this.statusList = data.status;
          this.$nextTick(()=>{
            this.$refs.taskList.scrollTop = this.$refs.taskList.scrollHeight;
          })
					console.log(this.currentStatus);
					if (data.done) {
						clearInterval(this.taskTimer);
					}
				})
				//异常处理
				.catch(e => {
					this.$wool.showwarn(e.message);
				});
		},
		closeShowTask() {
			clearInterval(this.taskTimer);
			this.showTask = false;
			this.$emit('toggle');
		}
	}
};
</script>

<style scoped="scoped">
/*弹出框的全局样式*/
.cmd_modal {
	width: 600px;
	overflow-x: hidden;
	padding: 20px;
	background-color: white;
	border-radius: 4px;
}
/*删除的弹出框*/
.modal {
	width: 500px !important;
	height: 250px !important;
	border-radius: none !important;
	
}
.deleteHeight{
  height: 150px !important;
}
.modal-title {
	/* font-size: 18px;
	color: #666666;
	padding-top: 25px;
	padding-left: 20px; */
	padding-bottom: 10px;
	border-bottom: 1px solid #e3ebf6;
	color: #1862c6;
	font-weight: bold;
}
.modal-content {
	padding: 5px 50px 20px 50px;
	word-break: break-all;
	color: black;
	margin-top: 20px;
}
.handle {
	float: right;
	width: 30%;
	display: flex;
	margin-right: 30px;
	justify-content: space-around;
}
/* .handle-confirm {
	color: #095280;
}
.show-cursor {
	cursor: pointer;
} */
.note {
	width: 300px;
	background-color: white;
	padding: 10px;
}
.note-input {
	/* width: 100%;
	height: 60px;
	margin-top: 10px;
	resize: none; */
	margin-top: 10px;
	width: 100%;
	height: 60px;
	resize: none;
	border: 1px solid #AFABAB;
	border-radius:4px;
	padding: 5px 8px;
}
/* .handle-commit {
	margin-left: 30%;
	text-align: center;
	color: #2a68c9;
	margin-right: 20%;
} */
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
