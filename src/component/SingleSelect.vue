<template>
	<div class="single-select">
		<div id='select-input' class="select-input" ref="inputbox" :style="{ width: width + 'px' }">
			<input
				type="text"
				ref="keyword"
				@keydown.enter="enterSelect"
				@keydowm.up="upSelect"
				@keydown.down="downSelect"
				@keydown="keyDown"
				v-model="keyword"
				@focus="show()"
				@blur="hide()"
				:disabled="disabled"
				:style="{ width: (width-leftSpace) + 'px' }"
        :placeholder="prevalue"
			/>
		</div>
		<transition name="singleselect">
			<div class="select-itemwrap" v-if="isshow" ref="selectoutter">
				<section class="select-iteminner" ref="selectiteminner" :style="{ width: width + 12 + 'px' }">
					<ul class="select-options wt-scroll" ref="options">
						<li
							class="select-option-item"
							ref="optionitem"
							:class="{ select: selectIndex == index }"
							v-for="(item, index) in filterList"
							:key="index"
							@click="select(item)"
						>
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
	name: 'SingleSelect',
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
    // 输入框距离边框的距离
    leftSpace:{
      type: Number,
      default: 30
    },
		// 是否禁用
		disabled: {
			type: Boolean,
			default: () => {
				return false;
			}
		},
		// 如果在数组中找不到是否需要网络请求接口
		neednet: {
			type: Boolean,
			default: () => {
				return false;
			}
		},
		isdesc: {
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
			this.keyword = val;
		},
		keyword(val) {
			if (this.neednet) {
				this.$emit('serachbykeyword', val);
      }
      if (this.neednet && val=='不指定') {
        this.$emit('serachbykeyword', '');
      }
		}
	},
	computed: {
		exchangeItems() {
			return this.items.map(item => {
				var name = item.name;
				if (this.isdesc && item.desc) {
					name = name + '(' + item.desc + ')';
				}
				let obj = {
					name: name,
					id: item.id
        };
				return obj;
			});
		},
		filterList() {
			var keyword = this.keyword;
			// console.log('aaaa')
      var list = this.exchangeItems;
			if (keyword) {
				list = list.filter(item => {
					return item.name.indexOf(keyword) > -1;
				});
      }
      console.log(list)
      this.$forceUpdate();
			return list;
		}
	},
	data() {
		return {
			boxwidth: 0,
			isshow: false,
			keyword: '',
      selectIndex: 0,
      prevalue: '',
      plhder: ''
		};
	},
	methods: {
		downSelect() {
			if (this.selectIndex < this.filterList.length - 1) {
				this.selectIndex = this.selectIndex + 1;
				this.scroll();
				return;
			}
			this.selectIndex = 0;
		},
		upSelect() {
			if (this.selectIndex == 0) {
				return
      }
			this.selectIndex = this.selectIndex - 1;
			this.scroll();
		},
		enterSelect() {
			this.select(this.filterList[this.selectIndex]);
		},
		scroll() {
			let top = this.$refs.optionitem[this.selectIndex].offsetTop;
			this.$refs.options.scrollTo({
				top: top,
				behavior: 'smooth'
			});
		},
		show() {
			if (this.filterList.length == 0) {
				return;
      }
      this.prevalue=this.keyword;
      // this.plhder=this.keyword;
      this.keyword='';
			this.isshow = true;
		},
		hide(){
      if(!this.neednet){
        this.keyword=this.prevalue;
      }
      if(this.keyword && this.neednet){
        this.$emit('select', this.keyword);
      }
			this.isshow = false;
		},
		select(item) {
      console.log(item)
			this.$emit('select', item.id);
			this.keyword = item.name;
			this.$refs.keyword.blur();
		},
		keyDown(e) {
      // 删除的话就全部删除吧
      // console.log(e)
      this.prevalue='';
      // console.log(Boolean(this.keyword) )
      // if(!this.keyword && leftSpace!=30 && neednet==true){
      //   this.$emit('select', '');
      //   return;
      // }
      // if(!this.keyword && !this.neednet){
      //   this.$emit('select', '');
      // }

      if(this.keyword && this.neednet){
        this.$emit('select', this.keyword);

      }
		}
  },
  mounted(){
    this.keyword=this.selectname
  }
};
</script>

<style scoped="scoped">
.single-select {
	display: inline-block;
	max-width: 150px;
	position: relative;
}
.singleselect-enter-active,
.singleselect-leave-active {
	transition: all 0.2s;
	opacity: 1;
	transform: translateY(0px);
}

.singleselect-enter,
.singleselect-leave-to {
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
	line-height: 32px;
	border: 1px solid #AFABAB;
	background-image: url(../img/arrow-down.png);
	background-size: 16px;
	background-position-y: center;
	background-position-x: calc(100% - 15px);
	padding-left: 10px;
	background-color: white;
	border-radius: 4px;
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
	/* overflow: hidden;
		text-overflow:ellipsis;
		white-space:nowrap; */
	word-break: break-all;
	padding: 10px;
	cursor: pointer;
	padding-left: 20px;
	border-bottom: 1px solid rgb(238, 238, 238);
	background-color: white;
	font-size:14px;
	color:#7187A9;
}
.select-option-item:hover {
	background-color: #f9fbfd;
}
.select-option-item.select {
	background-color: #f9fbfd !important ;
}
</style>
