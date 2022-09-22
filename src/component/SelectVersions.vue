<template>
	<WoolShowmodal :isshow="isshow" @tapCloser="$emit('toggle')" :isshowcloser="true">
		<div class="selectVersion wt-scroll">
			<div class="titlebar flexlayout">请选择版本号</div>
			<div class="radio-arr">
				<div class="radio-item" v-for="(item, index) in versionsList" :key="index">
					<label>
						<input v-model="version" type="radio" name="version" :value="item.value" />
						{{ item.name }}
					</label>
				</div>
			</div>
			<div class="btn-box right"><button class="add-btn" @click="confirm">下一步</button></div>
		</div>
	</WoolShowmodal>
</template>

<script>
export default {
	name: 'SelectVersions',
	components: {
		WoolShowmodal: () => import('./WoolShowmodal.vue')
	},
	props: {
		versions: {
			type: Array,
			default: function() {
				return [];
			}
		},
		isshow: {
			type: Boolean,
			default: function() {
				return false;
			}
		}
	},
	computed: {
		versionsList() {
			let versionsList = [];
			this.versions.forEach(item => {
				versionsList.push({
					name: item,
					value: item
				});
			});
			return versionsList;
		}
	},
	data() {
		return {
			version: ''
		};
	},
	methods: {
		confirm() {
			if (!this.version) {
				this.$wool.showwarn('请选择版本号');
				return;
			}
			this.$emit('getselect', this.version);
		}
	}
};
</script>

<style scoped="scoped">
.selectVersion {
	width: 35vw;
	/* min-width: 100px; */
	padding: 20px;
	max-height: 60vh;
	background-color: white;
	border-radius: 4px;
}
.titlebar{
	padding-bottom: 10px;
	border-bottom: 1px solid #e3ebf6;
	color: #1862c6;
	font-weight: bold;
}
.right {
	margin-left: 70%;
}
.radio-arr {
	margin: 20px 0  20px 20px;
  height: 40vh;
  overflow-y: auto;
	/* margin-bottom: 20px; */
}
.radio-item {
	/* margin-right: 25px; */
	margin-bottom: 20px;
	/* display: block; */
	/* width: 100%; */
}
</style>
