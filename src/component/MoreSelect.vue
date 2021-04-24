<template>
	<div class="more-select" ref="moreselect">
		<div class="select-input" ref="inputbox" :style="{ width: width + 'px' }" @click="show">
			<div class="select-input-text" :title="selectValue">{{ selectValue }}</div>
		</div>
		<transition name="moreselect">
			<div class="select-itemwrap" v-if="isshow" ref="selectoutter">
				<section class="select-iteminner" ref="selectiteminner" :style="{ width: width + 12 + 'px' }">
					<ul class="select-options wt-scroll">
						<li><input type="text" v-model="keyword" class="filter-input" placeholder="请输入关键字过滤" /></li>
						<li class="select-option-item" :class="{ checked: item.check }" v-for="(item, index) in list" :key="item.id" @click="select(item, index)">
							{{ item.name }}
						</li>
					</ul>
				</section>
			</div>
		</transition>
	</div>
</template>

<script>
export default {
	name: 'MoreSelect',
	model: {
		prop: 'value',
		event: 'select'
	},
	props: {
		value: {
			type: String,
			default: () => {
				return '';
			}
		},
		items: {
			type: Array,
			default: () => {
				return [];
			}
		},
		width: {
			type: Number,
			default: 200
		},
		// 是否禁用
		disabled: {
			type: Boolean,
			default: () => {
				return false;
			}
		},
		// 选中的名字
		selectname: {
			type: String,
			default: () => {
				return '';
			}
		}
	},
	watch: {
		selectname(val) {
			this.selectValue = val;
		},
		keyword(val) {
			if (val) {
				this.list = this.list.filter(item => {
					return item.name.indexOf(val) > -1;
				});
			} else {
				this.setCheckList();
			}
		},
		value(val) {
			this.setCheckList();
		}
	},
	data() {
		return {
			boxwidth: 0,
			isshow: false,
			keyword: '',
			list: [],
			selectValue: ''
		};
	},
	methods: {
		// 重新设置选中的列表
		setCheckList() {
			this.list = JSON.parse(JSON.stringify(this.items));
			var ids = this.value.split(';');
			ids.forEach(id => {
				this.list.forEach(item => {
					if (item.id == id) {
						this.$set(item, 'check', true);
					}
				});
			});
		},
		show() {
			this.setCheckList();
			if (this.disabled) {
				return;
			}
			if (this.list.length == 0) {
				return;
			}
			this.isshow = true;
		},
		hide() {
			this.isshow = false;
		},
		select(item, index) {
			this.selectValue = '';
			this.$set(item, 'check', !item.check);
			var list = this.list.filter(item => {
				return item.check;
			});
			var selectIds = '';
			for (var val of list) {
				this.selectValue = val.name + ';' + this.selectValue;
				selectIds = val.id + ';' + selectIds;
			}
			this.$emit('select', selectIds,this.selectValue);
		},
		eventToggle(e) {
			var vm = this;
			if (!vm.isshow) {
				return;
			}
			var el = vm.$refs.moreselect;
			var target = e.target;
			if (el == target || this.containsElem(el, target)) {
				return;
			}
			vm.isshow = false;
		},
		containsElem(parent, elem) {
			return parent.contains ? parent.contains(elem) : !!(parent.compareDocumentPosition(elem) & 16);
		}
	},
	destroyed() {
		document.body.removeEventListener('click', this.eventToggle);
	},
	mounted() {
    document.body.addEventListener('click', this.eventToggle);
	}
};
</script>

<style scoped="scoped">
.more-select {
	display: inline-block;
	max-width: 150px;
	position: relative;
}
.moreselect-enter-active,
.moreselect-leave-active {
	transition: all 0.2s;
	opacity: 1;
	transform: translateY(0px);
}

.moreselect-enter,
.moreselect-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}
.select-itemwrap,
.select-iteminner {
	width: 200px;
	max-height: 300px;
	background-color: white;
	position: absolute;
	z-index: 2;
}
.select-input {
	height: 32px;
	line-height: 32px;
	border: solid #a5a5a5 1px;
	background-image: url(../assets/images/iconslde_down.png);
	background-size: 16px;
	background-position-y: center;
	background-position-x: calc(100% - 10px);
	padding-left: 10px;
}
.select-input > input {
	border: none;
}
.select-input > input:disabled {
	background-color: white;
}
.select-options {
	box-shadow: 2px 2px 2px #d4d4d4, -1px 0px 1px #f1f1f1;
	max-height: 300px;
}
.select-option-item {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding: 10px;
	cursor: pointer;
	padding-left: 20px;
	border-bottom: 1px solid rgb(238, 238, 238);
	background-color: white;
	background-image: url(../assets/images/check_off.png);
	background-size: 16px;
	background-position-y: center;
	background-position-x: 10px;
	padding-left: 30px;
	font-size:14px;
}
.checked {
	background-image: url(../assets/images/check_on.png);
}
.select-input-text {
	width: 90%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size:14px;
}
.filter-input {
	width: calc(100% - 13px);
	height: 20px;
	border: none;
	padding-left: 10px;
	border: 1px solid #dedede;
	border-radius: 5px;
}
</style>
