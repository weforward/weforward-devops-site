<template>
	<div class="wool-select" ref="woolselect" :style="{ zIndex: zIndex }">
		<section v-if="isCustomFilter" @click="tapShow" class="wool-select-customfilter"><slot name="default"></slot></section>
		<section v-else class="wool-select-placeholder" @click="onToggle"><slot name="default"></slot></section>
		<transition name="woolselectfadein" @enter="onTransShow" @leave="onTransHide">
			<div class="wool-select-itemwrap" v-show="isShowSlider" ref="woolselectoutter">
				<section class="wool-select-iteminner" ref="woolselectinner">
					<input ref="ipfilter" v-if="isfilter" class="wool-select-search" v-model.trim="keyword" type="text" placeholder="搜索" />
					<slot name="content"></slot>
					<ul class="wool-select-options wt-scroll" :style="{ maxHeight: maxListHeight }">
						<li :key="obj.index" @click="onSelectItem(obj)" class="wool-select-optionitem" v-for="obj in finalItems">{{ showText(obj) }}</li>
					</ul>
					<div v-if="keyword && finalItems.length == 0" class="wool-select-nodata">没有符合条件的选项</div>
				</section>
			</div>
		</transition>
	</div>
</template>

<script>
let instants = [];

function eventToggle(e) {
	instants.forEach(function(vm) {
		if (vm.disabled && !vm.isshow) {
			return;
		}
		if (!vm.isshow) {
			return;
		}
		var el = vm.$refs.woolselect;
		var target = e.target;
		if (el == target || containsElem(el, target)) {
			return;
		}
		vm.isshow = false;
	});
}

function containsElem(parent, elem) {
	return parent.contains ? parent.contains(elem) : !!(parent.compareDocumentPosition(elem) & 16);
}
/**
 * 下拉组件
 * @description 下拉组件
 */
export default {
	name: 'WoolSelect',
	model: {
		prop: 'value',
		event: 'select'
	},
	props: {
		//是否下标类型,下标或者列表项
		isindexmode: {
			type: Boolean,
			default: true
		},
		//列表最大高度
		maxListHeight: {
			type: String,
			default: '250px'
		},
		//选中的值或下标，具体类型由isindexmode决定
		value: [String, Number, Object, Boolean],
		//当数据里列表的项为object类型时，需要制定一个显示的key，默认读取name属性
		namekey: {
			type: String,
			default: ''
		},
		//当数据里列表的项为object类型时，指定绑定对象中的值所在key,默认为整个对象
		valuekey: {
			type: String,
			default: ''
		},
		nameformat: {
			type: Function
		},
		//数据列表
		items: {
			type: Array
		},
		//是否开启内部筛选，isCustomFilter为true时，将忽略该属性
		isfilter: {
			type: Boolean,
			default: false
		},
		//自定义搜索
		isCustomFilter: {
			type: Boolean,
			default: false
		},
		//是否禁用
		disabled: {
			type: Boolean,
			value: false
		}
	},
	data: function() {
		return {
			isshow: false,
			keyword: '',
			zIndex: 1
		};
	},
	computed: {
		isShowSlider() {
			return this.isshow && (!this.isCustomFilter || (this.isCustomFilter && this.finalItems.length > 0));
		},
		wrapitems: function() {
			var wrapitems = [];
			this.items.forEach((item, index) => {
				wrapitems.push({
					index: index,
					item: item
				});
			});
			return wrapitems;
		},
		filterItems: function() {
			var key = this.keyword;
			if (!key) {
				return this.wrapitems;
			}
			return this.wrapitems.filter(obj => {
				var item = obj.item;
				if (typeof item == 'string') {
					return !!item.match(key);
				} else if (typeof item == 'object') {
					return !!item[this.namekey || 'name'].match(key);
				}
				return false;
			});
		},
		finalItems: function() {
			if (this.isCustomFilter) {
				//自定义搜索
				return this.wrapitems;
			} else {
				//内部
				return this.filterItems;
			}
		}
	},
	watch: {
		finalItems: function() {
			if (this.isshow) {
				this.$nextTick(this.onTransShow);
			}
		},
		isshow: function(val) {
			if (val) {
				this.zIndex = 99;
			} else {
				this.zIndex = 1;
			}
		}
	},
	methods: {
		tapShow() {
			if (!this.disabled) {
				this.isshow = true;
			}
		},
		onTransShow: function() {
			// var inner = this.$refs.woolselectinner;
			// var outter = this.$refs.woolselectoutter;
			// outter.style.height = inner.offsetHeight + 'px';
		},
		onTransHide: function() {
			// var outter = this.$refs.woolselectoutter;
			// outter.style.height = '0';
		},
		showText: function(obj) {
			var item = obj.item;
			if (this.nameformat) {
				return this.nameformat(item);
			}
			if (typeof item == 'object') {
				if (this.namekey) {
					return item[this.namekey];
				} else {
					return item.name || item;
				}
			}
			return item;
		},
		onToggle: function() {
			if (this.isshow) {
				this.isshow = false;
			} else {
				if (this.disabled) {
					return;
				}
				this.onReadyShow();
			}
		},
		hide: function() {
			this.isshow = false;
		},
		onReadyShow: function() {
			this.isshow = true;
			if (this.isfilter) {
				var vm = this;
				this.$nextTick(function() {
					vm.$refs.ipfilter.focus();
				});
			}
		},
		onReadyHide: function() {
			this.isshow = false;
		},
		onSelectItem: function(obj) {
			var index = obj.index;
			var item = obj.item;
			this.isshow = false;
			if (this.isindexmode) {
				this.$emit('select', index);
			} else {
				if (typeof item == 'object' && this.valuekey) {
					this.$emit('select', item[this.valuekey]);
				} else {
					this.$emit('select', item);
				}
			}
		}
	},
	mounted: function() {
		if (instants.length == 0) {
			document.addEventListener('click', eventToggle);
		}
		instants.push(this);
	},
	destroyed: function() {
		instants.splice(instants.indexOf(this), 1);
		if (instants.length == 0) {
			document.removeEventListener('click', eventToggle);
		}
	}
};
</script>

<style>
.woolselectfadein-enter-active,
.woolselectfadein-leave-active {
	transition: all 0.2s;
	opacity: 1;
	transform: translateY(0px);
}

.woolselectfadein-enter,
.woolselectfadein-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}

.wool-select {
	position: relative;
	font-size: 14px;
	-webkit-user-select: none;
	user-select: none;
	cursor: pointer;
	z-index: 1;
}
.wool-select-placeholder{
	border: 1px solid #AFABAB;
	border-radius: 3px;
}
.wool-select-placeholder.filter {
	text-indent: 10px;
}

.wool-select-itemwrap,
.wool-select-iteminner {
	width: 100%;
	text-indent: 0;
}

.wool-select-itemwrap {
	top: calc(100% + 1px);
	width: 100%;
	left: 0;
	background-color: white;
	box-sizing: border-box;
	box-shadow: 2px 2px 2px #d4d4d4, -1px 0px 1px #f1f1f1;
	position: absolute;
}

.wool-select-customfilter {
	cursor: text;
	height: inherit;
}

.wool-select-options {
	max-height: 300px;
	text-indent: 10px;
}

.wool-select-options.wt-scroll::-webkit-scrollbar {
	width: 7px;
	height: 0px;
}

.wool-select-optionitem {
	line-height: 40px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.wool-select-nodata {
	color: #aaa;
	padding: 10px;
	line-height: 1.2;
}

input.wool-select-search {
	border: none;
	width: 100%;
	height: 40px;
	font-size: 14px;
	color: black;
	text-indent: 10px;
	outline: none;
	border-bottom: 1px solid #f3f3f3;
}

.wool-select-optionitem:hover {
	background-color: #f1f1f1;
}
</style>
