<style>
.sortable-ghost {
	opacity: 0.4;
}
</style>
<script>
if (window.navigator.userAgent.match(/Firefox/)) {
	document.body.addEventListener('drop', function(event) {
		event.preventDefault();
		event.stopPropagation();
	});
}
import singletonJsLoader from '../plugins/SingletonJsLoader.js';
export default {
	name: 'WoolSortable',
	model: {
		prop: 'items',
		change: 'change'
	},
	props: {
		//自定义标签
		tag: {
			type: String,
			default: 'div'
		},
		items: {
			type: Array,
			default() {
				return [];
			}
		},
		//触发拖动的选择器
		handle: {
			type: String,
			default: null
		},
		//过滤可拖动的选择器,支持多个，使用英文逗号隔开
		filter: {
			type: String,
			default: null
		},
		//动画时长
		duration: {
			type: Number,
			default: 150
		},
		//是否禁用
		disabled: Boolean
	},
	mounted() {
		singletonJsLoader.load(['//pmpsys.cn/r/js/sortable.min.js'], 'Sortable').then(() => this.sortable());
	},
	watch: {
		disabled(val) {
			this.sortview.option('disabled', val);
		}
	},
	methods: {
		sortable() {
			let vm = this;
			let ref = vm.$refs.ref;
			if (null != vm.sortview || !ref) {
				return;
			}
			vm.sortview = new window.Sortable(ref, {
				onUpdate: function(e) {
					if (!vm.items || !vm.items.length) {
						return;
					}
					// 修改items数据顺序
					var newIndex = e.newIndex,
						oldIndex = e.oldIndex,
						item = ref.children[newIndex],
						olditem = ref.children[oldIndex];
					// 先删除移动的节点
					ref.removeChild(item);
					// 再插入移动的节点到原有节点，还原了移动的操作
					if (newIndex > oldIndex) {
						ref.insertBefore(item, olditem);
					} else {
						ref.insertBefore(item, olditem.nextSibling);
					}
					// 更新items数组
					var _items = vm.items.splice(oldIndex, 1);
					vm.items.splice(newIndex, 0, _items[0]);
					vm.$emit('change', e);
				},
				animation: vm.duration,
				handle: vm.handle,
				filter: vm.filter,
				disabled: this.disabled
			});
		}
	},
	destroyed() {
		if (null != this.sortview) {
			this.sortview.destroy();
		}
	},
	render(createElement) {
		return createElement(
			this.tag,
			{
				ref: 'ref'
			},
			this.$slots.default
		);
	}
};
</script>
