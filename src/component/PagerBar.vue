<style>
/**分页条样式*/
.vue-pagebar {
	justify-content: flex-end;
	margin-top: 20px;
	line-height: 20px;
	font-size: 13px;
	user-select: none;
	user-select: none;
	display: flex;
	margin-right: 5%;
  margin-bottom: 20px;
}

.vue-pagebar div {
	padding: 0 5px;
	text-align: center;
	cursor: pointer;
	color: #004085;
}

.vue-pagebar div:first-child {
	margin-left: 5px;
}

.vue-page-num {
	border-radius: 5px;
	margin-right: 5px;
	border: 1px solid #b8daff;
	background-color: white;
}

.vue-page-num.selected {
	background-color: #cce5ff;
	color: #004085;
}
.vue-page {
	border-radius: 5px;
	background-color: #cce5ff;
	color: #004085 !important;
	margin-right: 10px;
	border: 1px solid #b8daff;
}
@media screen and (max-width: 400px) {
	.vue-page-num {
		display: none;
	}
}
</style>

<template>
	<div v-if="page && page.pagecount && page.pagecount > 0" class="vue-pagebar">
		共{{ page.totalCount }}条，分{{ page.pagecount }}页
		<template v-if="page.pagecount > 1">
			<div @click="gotoPage(page.current - 1)" v-if="page.current != 1" class="vue-page-prev vue-page">上一页</div>
			<template v-for="p in page.pagecount">
				<div v-if="pageBarControl(p)" :key="p" @click="gotoPage(p)" :class="{ selected: page.current == p }" class="vue-page-num">{{ p }}</div>
			</template>
			<div @click="gotoPage(page.current + 1)" v-if="page.current != page.pagecount" class="vue-page-next vue-page">下一页</div>
		</template>
	</div>
</template>

<script>
export default {
	name: 'HyPagerBar',
	props: {
		page: Object
	},
	methods: {
		// 分页条项的展示控制
		pageBarControl: function(p) {
			var pobj = this.page;
			if (p == 1 || p == pobj.pagecount) {
				return true;
			}
			var isbefore = p > 1 && pobj.current >= p;
			var firstdetal = 10;
			if (p > 1 && p < pobj.current) {
				var edge = firstdetal - (pobj.pagecount - pobj.current);
				if (edge > 0) {
					firstdetal += edge;
				}
			}
			if (isbefore && pobj.current - p < firstdetal) {
				return true;
			}
			var isafter = p < pobj.pagecount && pobj.current <= p;
			var delta = 10;
			var _edge = 10 - pobj.current;
			if (_edge >= 0) {
				delta += _edge;
			}
			if (isafter && p - pobj.current < delta) {
				return true;
			}
			return false;
		},
		gotoPage: function(p) {
			// 页面发生变化通知
			this.$emit('change', {
				page: p
			});
		}
	}
};
</script>
