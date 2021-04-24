<template>
	<input :placeholder="placeholder" class="picker" @click="showPlugin" type="text" ref="picker" :value="value" :isshowclear="isshowclear" readonly />
</template>

<script>
const UEDITORPATH = '//pmpsys.cn/r/js/My97DatePicker/WdatePicker.js';
import SingletonJsLoader from '../plugins/SingletonJsLoader.js';
import '../plugins/timeutils.js';
export default {
	name: 'WoolPCDateTimePicker',
	model: {
		prop: 'value',
		event: 'change'
	},
	props: {
		value: {
			type: String
		},
		placeholder: {
			type: String
		},
		format: {
			type: String,
			default: 'yyyy-MM-dd'
		},
		//为false时 点日期的时候不自动输入,而是要通过确定才能输入,为true时 即点击日期即可返回日期值
		autopickdate: {
			type: Boolean,
			value: true
		},
		// 是否显示清空按钮
		isshowclear: {
			type: Boolean,
			value: false
		}
	},
	mounted() {
		this.loadSource();
	},
	methods: {
		async loadSource() {
			await SingletonJsLoader.load([UEDITORPATH], 'WdatePicker');
		},
		showPlugin() {
			if (window.WdatePicker) {
				let picker = this.$refs.picker;
				window.WdatePicker({
					el: picker,
					dateFmt: this.format,
					isShowClear: this.isshowclear,
					readOnly: true,
					autoPickDate: this.autopickdate,
					onpicked: () => {
						this.$emit('change', picker.value);
					},
					onclearing: () => {
						this.$emit('change', "");
					}
				});
			}
		}
	}
};
</script>

<style scoped="scoped">
.picker {
	/* border: none; */
	font-size: 14px;
  height: 30px;
}
</style>
