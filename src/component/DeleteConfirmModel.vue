<template>
	<WoolShowmodal :isshow="isshow">
		<div class="cmd_modal modal">
			<div class="modal-title">温馨提示</div>
			<div class="modal-content">
				您确认需要移除此项？
			</div>
			<div class="handle">
				<div class="handle-confirm show-cursor" @click="$emit('handle')">确认</div>
				<div class="handle-cancel show-cursor" @click="$emit('toggle')">取消</div>
			</div>
		</div>
	</WoolShowmodal>
</template>

<script>
export default {
	name: 'DeleteConfirmModel',
	components: {
		WoolShowmodal: () => import('./WoolShowmodal.vue')
	},
	props: {
		isshow: {
			type: Boolean,
			default: function() {
				return false;
			}
		},
	}
};
</script>

<style scoped="scoped">
/*弹出框的全局样式*/
.cmd_modal {
	background-color: white;
	width: 600px;
	background: white;
	overflow-y: auto;
	overflow: auto;
	border-radius: 5px;
}
/*删除的弹出框*/
.modal {
	width: 335px !important;
	height: 180px !important;
	border-radius: none !important;
}
.modal-title {
	font-size: 18px;
	color: #666666;
	padding-top: 25px;
	padding-left: 20px;
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
.handle-confirm {
	color: #095280;
}
.show-cursor {
	cursor: pointer;
}
</style>
