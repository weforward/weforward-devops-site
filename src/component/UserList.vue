<template>
	<WoolShowmodal :isshow="isshow" @tapCloser="$emit('toggle')" :isshowcloser="true">
		<div class="user-list">
			<div class="input-box">
				<div class="titlebar flexlayout">
          <span>请选择用户</span>
        </div>
				<div v-if="op == 'add'">
					<input placeholder="请根据关键字进行搜索" class="search-input userSearch" v-model="keywords" />
					<span v-if="userList.length == pagesize">
						<span class="userPage">上一页</span>
						<span class="userPage">下一页</span>
					</span>
				</div>
				<section class="label-list">
					<div class="label-box" v-for="(item, index) in userList" :key="index">
						<label class="radio">
							<input v-model="user" type="radio" name="type" :value="item" />
							{{ item.name }} ({{ item.loginname }})
						</label>
					</div>
					<div v-if="userList.length == 0" class="nodata">暂无数据</div>
				</section>
			</div>
			<div class="handle-btn">
				<button class="add-btn" v-if="op == 'add'" @click="addUser">添加并继续</button>
				<button class="add-btn" v-if="op == 'remove'" @click="removeUser">移除并继续</button>
			</div>
		</div>
	</WoolShowmodal>
</template>

<script>
export default {
	name: 'UserList',
	props: {
		isshow: {
			type: Boolean
		},
		op: {
			type: String,
			default: function() {
				return 'add';
			}
		},
		id: {
			type: String
		},
		users: {
			type: Array
		}
	},
	data() {
		return {
			user: '',
			userList: [],
			keywords: '',
			page: 1,
			pagesize: 50
		};
	},
	components: {
		WoolShowmodal: () => import('./WoolShowmodal.vue')
	},
	watch: {
		keywords() {
			this.requestList();
		}
	},
	methods: {
		getOp(op) {
			if (op == 'remove') {
				this.$forceUpdate();
				this.userList = this.users;
			} else {
				this.requestList();
			}
		},
		requestList() {
			this.userList = [];
			let params = {
				k: this.keywords,
				p: this.page,
				pagesize: this.pagesize
			};
			let url = '?method=/devops/system/users';
			//请求数据
			this.$wf
				.post(url, params)
				//成功处理
				.then(data => (this.userList = data.items || []))
				//异常处理
				.catch(e => this.$wool.showwarn(e.message));
		},
		addUser() {
			let params = {
				op: 'adduser',
				uid: this.user.id,
				id: this.id
			};
			this.requestUser(params, '添加');
		},
		removeUser() {
			let params = {
				op: 'removeuser',
				uid: this.user.id,
				id: this.id
			};
			this.requestUser(params, '移除');
		},
		requestUser(params, msg) {
			var msgview = this.$wool.showloading(msg + '中');
			let url = '?method=/devops/system/group';
			this.$wf
				.post(url, params)
				//成功处理
				.then(data => msgview.msgsucc(msg + '成功').hide())
				//异常处理
				.catch(e => msgview.msgwarn(e.message).hide());
		}
	}
};
</script>

<style scoped="scoped">
.user-list {
	padding: 20px;
	width: 500px;
	height: auto;
	background-color: white;
}
.radio {
	cursor: pointer;
}
.label-box {
	padding-top: 10px;
}
.handle-btn {
	margin-top: 15px;
	margin-left: 70%;
}
.userSearch {
	width: 70%;
	height: 34px !important;
	border-radius: 5px;
	margin-top: 15px;
	border-color: #a9a9a9;
}
.userPage {
	color: #2a68c9;
	cursor: pointer;
	padding: 5px;
}
.label-list {
	min-height: 300px;
	max-height: 500px;
	overflow-y: auto;
}
.nodata {
	padding: 10px;
}
.titlebar{
	padding-bottom: 10px;
	border-bottom: 1px solid #e3ebf6;
	color: #1862c6;
	font-weight: bold;
}
</style>
