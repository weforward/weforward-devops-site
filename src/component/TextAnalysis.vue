<template>
	<div class="text-analysis">
		<div><textarea class="analysis-text" v-model="analysisText" rows="2"></textarea></div>
		<div>
			<button class="btn input-btn" @click="inputContent">录入</button>
			<button class="btn input-btn" @click="getProp">复制属性</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'TextAnalysis',
	data() {
		return {
			analysisText: ''
		};
	},
	methods: {
		inputContent() {
			if (!this.analysisText) {
				return;
			}
			var text = this.analysisText.replace(/[\r\n]/g, '\n'); // 首先将换行全部换成换行符
			var textList = text.split('\n'); //  使用换行符切割
			textList = textList.filter(item => {
				// 过滤掉空的 和首字为#
				return item && item.trim().length != 0 && item.charAt(0) != '#';
			});
			this.$emit('confirm', textList);
			this.analysisText = '';
		},
		getProp() {
			let value = '';
			var props = this.$parent.$parent.getProps();
			if (!props) {
				return;
			}
			props.forEach(prop => {
				value = value + prop.key + '=' + prop.value + '\n';
			});
			var issucc = this.$wool.copyText(value);
			if (issucc) {
				this.$wool.showsucc('复制成功');
			} else {
				this.$wool.showwarn('复制失败');
			}
		}
	}
};
</script>

<style scoped="scoped">
.text-analysis {
	display: flex;
	align-items: center;
	//margin-top: 20px;
}
.analysis-text {
	width: 615px;
	height:60px;
	resize: none;
	border: 1px solid #AFABAB;
	border-radius:4px;
	padding: 5px 8px;
}
.input-btn {
	margin-left: 10px;
}
</style>
