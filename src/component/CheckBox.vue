<template>
	<div class="check">
		<input type="hidden" v-model="allow" />
		<input type="checkbox" class="checke" v-model="isAllow" :disabled="!allowcheck" />
	</div>
</template>

<script>
export default {
	name: 'CheckBox',
	model: {
		prop: 'allow',
		event: 'change'
	},
	props: {
		allow: {
			type: Boolean,
			default: function() {
				return false;
			}
		},
		allowcheck: {
			type: Boolean,
			default: function() {
				return false;
			}
		}
	},
	watch: {
		allow(val) {
			this.isAllow = val;
		},
		isAllow(val) {
			this.$emit('change', val);
		}
	},
	data() {
		return {
			isAllow: true
		};
	},
	mounted() {
		this.isAllow = this.allow;
	}
};
</script>

<style scoped="scoped">
.checke {
	margin-top: 5px;
	position: relative;
	-webkit-appearance: none;
	width: 35px;
	height: 21px;
	line-height: 21px;
	background: #d3d3d3;
	border-radius: 34px;
	outline: none;
	cursor: pointer;
}

.checke:before {
	position: absolute;
	left: 0;
	content: '';
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: white;
	box-shadow: 0px 0px 5px #AFABAB;
	transition: all 0.2s linear;
}

.checke:checked {
	background: #007bff;
}

.checke:checked:before {
	left: 18px;
	transition: all 0.2s linear;
}
</style>
