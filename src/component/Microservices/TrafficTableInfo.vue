<template>
	<WoolShowmodal :isshow="isshow" @tapCloser="$emit('toggle')" :isshowcloser="true">
		<div class="trafficTable">
			<div>
				<div class="titlebar flexlayout">
					<div>
						{{ service.name }} 服务流量表
					</div>
					<div class="explain-box">
						<div class="explain-icon"></div>
						<div class="explain-context">
							规则表描述微服务实例的流量规则。
							<p>
							根据微服务实例的编号与版本号，依次按规则项的顺序匹配，无匹配规则时，相当于屏蔽某实例的流量。
							</p>
							- 负载均衡：<br/>
							&nbsp;&nbsp;采用加权轮询(WRR)的方式， 初始状态（未配置任何规则）为轮询(RR)。<br/>
							- 熔断保护：<br/>
							&nbsp;&nbsp;1.设置微服务示例的最大并发数。当并发数超过最大值，将不再将请求交给此实例。<br/>
							&nbsp;&nbsp;2.设置最大连续失败次数与达到次数后的重置时间。当实例的失败次数达到最大值，在重置时间内，将不再将请求交给此实例。<br/>
							&nbsp;&nbsp;特殊情况，当全部实例的失败次数都达到最大值，将马上重置全部实例。<br/>
							- 请求转发：<br/>
							&nbsp;&nbsp;当网关访问一个微服务实例失败时，默认不会将请求交给其他实例，若要实现类似功能，请参考微服务请求转发。
						</div>
					</div>
				</div>
				<div class="flexlayout flexlayout_middle" style="margin-top: 10px;font-size: 14px;">
					<span class="warn-note">提示：拖动可调换位置</span>
					<p style="padding-left: 10px;">是否打开拖动排序模式：</p>
					<CheckBox v-model="isAllowSort" :allowcheck="true"></CheckBox>
				</div>
			</div>
			<div class="trafficInfo">
				<table class="tableDatil">
					<thead>
						<th >
							<div class="flex">
								<div>名称</div>
								<div class="explain-box">
									<div class="explain-icon"></div>
									<div class="explain-context">无特殊意义，不重复即可</div>
								</div>
							</div>
						</th>
						<th>
							<div class="flex">
								<div>服务编号</div>
								<div class="explain-box">
									<div class="explain-icon"></div>
									<div class="explain-context">指定使用此规则的微服务实例编号</div>
								</div>
							</div>
						</th>
						<th>
							<div class="flex">
								<div>服务版本</div>
								<div class="explain-box">
									<div class="explain-icon"></div>
									<div class="explain-context">指定使用此规则的微服务实例版本号</div>
								</div>
							</div>
						</th>
						<th>
							<div class="flex">
								<div>权重</div>
								<div class="explain-box">
									<div class="explain-icon"></div>
									<div class="explain-context">有效值-100，0-100。-100表示为备用，0表示不可达（屏蔽实例），其他数表示在总流量中的占比；默认为1</div>
								</div>
							</div>
						</th>
						<th>
							<div class="flex">
								<div>最大<br/>并发数</div>
								<div class="explain-box">
									<div class="explain-icon"></div>
									<div class="explain-context">实例允许的最大并发请求数，0表示不限；默认为0</div>
								</div>
							</div>
						</th>
						<th>
							<div class="flex">
								<div>最大连续<br/>失败次数</div>
								<div class="explain-box">
									<div class="explain-icon"></div>
									<div class="explain-context">允许实例连续失败（网关无法与实例正常通信）的次数，默认为3</div>
								</div>
							</div>
						</th>
						<th>
							<div class="flex">
								<div>重置失败<br/>次数的时间（秒）</div>
								<div class="explain-box">
									<div class="explain-icon"></div>
									<div class="explain-context">实例连续失败次数累计到最大值后，超过多少时间后重置失败次数；默认为180秒</div>
								</div>
							</div>
						</th>
						<th>
							<div class="flex">
								<div>连接超时值（秒）</div>
								<div class="explain-box">
									<div class="explain-icon"></div>
									<div class="explain-context">网关连接实例的超时时间；默认为5秒</div>
								</div>
							</div>
						</th>
						<th>
							<div class="flex">
								读超时（秒）
								<div class="explain-box">
									<div class="explain-icon"></div>
									<div class="explain-context">网关等待实例响应的超时时间；默认为50秒</div>
								</div>
							</div>
						</th>
						<th>
							<div class="flex"><div>操作</div></div>
						</th>
						<th v-show="isAllowSort">
							<div class="flex">排序</div>
						</th>
					</thead>
					<WoolSortable tag="tbody" handle=".traffic-item-handle" v-model="trafficInfoItems" @change="sortIndex">
						<tr v-for="(item, indx) in trafficInfoItems" :key="indx">
							<td><input type="text" class="smallTable-input traffic" v-model="item.name" :disabled="!(selectIdx == indx)" /></td>
							<td class="selectArea" @click="changeIndex(indx)">
                <SingleSelect 
                :selectname="item.service_no|| '不指定' " 
                :disabled="!(selectIdx == indx)" 
                @select="changeSN"
                @serachbykeyword="serachbykeyword1"
                :items="servicesNoList"
                :width="80" 
                :leftSpace="10"
                :neednet='true'>
                </SingleSelect>
								<!-- <select v-model="item.service_no" :disabled="!(selectIdx == indx)">
									<option v-for="(service, i) in servicesNoList" :key="i" :value="service">{{ service || '不指定' }}</option>
								</select> --> 
								<!--  <input type="text" class="smallTable-input traffic" v-model="item.serviceNo" :disabled="true" /> -->
							</td>
							<td class="selectArea" @click="changeIndex(indx)">
                <SingleSelect 
                :selectname="item.service_version || '不指定'"
                @select="changeSV"
                @serachbykeyword="serachbykeyword2"
                :items="servicesVersionList"
                :disabled="!(selectIdx == indx)" 
                :width="80" 
                :leftSpace="10"
                :neednet='true'>
                </SingleSelect>
								<!-- <select v-model="item.service_version " :disabled="!(selectIdx == indx)">
									<option v-for="(service, i) in servicesVersionList" :key="i" :value="service">{{ service  || '不指定'}}</option>
								</select> -->
								<!-- <input type="text" class="smallTable-input traffic" v-model="item.serviceVersion" :disabled="true" /> -->
							</td>
							<td><input type="number" class="smallTable-input traffic" v-model="item.weight" :disabled="!(selectIdx == indx)" /></td>
							<td><input type="number" class="smallTable-input traffic" v-model="item.max_concurrent" :disabled="!(selectIdx == indx)" /></td>
							<td><input type="number" class="smallTable-input traffic" v-model="item.max_fails" :disabled="!(selectIdx == indx)" /></td>
							<td><input type="number" class="smallTable-input traffic" v-model="item.fail_timeout" :disabled="!(selectIdx == indx)" /></td>
							<td><input type="number" class="smallTable-input traffic" v-model="item.connect_timeout" :disabled="!(selectIdx == indx)" /></td>
							<td><input type="number" class="smallTable-input traffic" v-model="item.read_timeout" :disabled="!(selectIdx == indx)" /></td>
							<td>
								<div class="table-handle-box">
									<span class="smallTable-handle" v-if="item.new" @click="save(item, indx, 'append')">保存</span>
									<span class="smallTable-handle" v-if="item.new" @click="deleteRow(indx)">取消</span>
									<span class="smallTable-handle" v-if="!item.new" @click="showRemoveModel(item,indx)">移除</span>
									<span class="smallTable-handle" v-if="!item.new">
										<span v-if="!(isshowSave && selectIdx == indx)" @click="replace(item, indx)">编辑</span>
										<span v-if="isshowSave && selectIdx == indx" @click="save(item, indx, 'replace')">保存</span>
									</span>
									<span v-if="isshowSave && selectIdx == indx && !item.new" @click="cancelSave(indx)">取消</span>
								</div>
							</td>
							<td class="right-item-handle" v-show="isAllowSort"><img style="width:20px;margin-bottom: -5px;" src="../../assets/images/handle.png" /></td>
						</tr>
					</WoolSortable>

					<tfoot v-if="trafficInfoItems.length == 0">
						<tr><td colspan="11" class="table-warnning">暂无数据</td></tr>
					</tfoot>
				</table>
				
				<div class="addrowBar" @click="addRow">+</div>
			</div>
		</div>
		<DeleteConfirmModel :isshow="isShowRemove" @toggle="isShowRemove = false" @handle="remove"></DeleteConfirmModel>
	</WoolShowmodal>
</template>

<script>
export default {
	name: 'TrafficTableInfo',
	components: {
		WoolShowmodal: () => import('../WoolShowmodal'),
		CheckBox: () => import('../CheckBox'),
		WoolSortable: () => import('../WoolSortable'),
    DeleteConfirmModel: () => import('../DeleteConfirmModel'),
    SingleSelect:()=>import('../SingleSelect')
	},
	props: {
		isshow: {
			type: Boolean
		},
		service: {
			type: Object
    },
    selectedNoList:{
      type:Array,
      default: []
    },
    selectedVersionList:{
      type: Array,
      default: []
    }
	},
	computed: {
	},
	data() {
		return {
			isAllowSort: false,
			trafficTableOp: 'append',
			trafficRuleItem: {},
			trafficInfoItems: [],
			selectIdx: -1, //需要替换的indx
			isshowSave: false, // 展示保存按钮
			selectNo: 0,
			copyTrafficInfoItem: [],
			isShowRemove: false,
      needRemoveObj: null,
      servicesNoList:[],
      servicesVersionList:[],
      currentIndex: -1
		};
	},
	methods: {
		showRemoveModel(item,index) {
			this.needRemoveObj = item;
			this.needRemoveObj.index = index;
			this.isShowRemove = true;
		},
		sortIndex(val) {
			this.trafficTableOp = 'move';
			this.$set(this.trafficRuleItem, 'from', val.oldIndex);
			this.$set(this.trafficRuleItem, 'to', val.newIndex);
			if (this.trafficInfoItems[val.oldIndex].new || this.trafficInfoItems[val.newIndex].new) {
				this.selectIdx = -1;
				this.trafficInfoItems = JSON.parse(JSON.stringify(this.copyTrafficInfoItem));
				this.$wool.showwarn('存在新的一列未保存，不支持调用排序方法', 1000);
				return;
			}
			let opName = '移动';
			this.submitFrom(opName);
		},
		resetData() {
			this.trafficRuleItem = {};
			this.selectIdx = -1;
			this.trafficTableOp = '';
		},
		deleteRow(index) {
			this.trafficInfoItems.splice(index, 1);
			this.selectIdx = -1;
		},
		addRow() {
      this.selectIdx=-1;
			let isHaveNew = false;
			this.trafficInfoItems.forEach((item, index) => {
        console.log(item)
				if (item.new) {
					isHaveNew = true;
					this.selectIdx = index;
				}
			});
			if (isHaveNew) {
				this.$wool.showwarn('已存在新的一列！');
				return;
			}
			this.$forceUpdate();
			var newValue = {
				weight: 1,
				max_fails: 3,
				fail_timeout: 180,
				max_concurrent: 0,
				connect_timeout: 5,
				read_timeout: 50,
				new: true,
				service_no: '',
				service_version: ''
			};
			this.trafficInfoItems.push(newValue);
			this.selectIdx = this.trafficInfoItems.length - 1;
		},
		remove() {
			let item = this.needRemoveObj;
			this.trafficTableOp = 'remove';
			this.$set(this.trafficRuleItem, 'remove_name', item.name);
			this.$set(this.trafficRuleItem, 'index', item.index);
			let opName = '移除';
			this.isShowRemove = false;
			this.submitFrom(opName);
		},
		replace(item, idx) {
			this.selectIdx = idx;
			this.trafficRuleItem.replace_name = item.name;
			this.$set(this.trafficRuleItem, 'index', idx);
			this.isshowSave = true;
		},
		// 保存修改内容
		save(item, idx, op) {
			this.trafficTableOp = op;
			this.$set(this.trafficRuleItem, 'no', item.service_no);
			this.$set(this.trafficRuleItem, 'version', item.service_version);
			this.$set(this.trafficRuleItem, 'name', item.name);
			this.$set(this.trafficRuleItem, 'weight', item.weight);
			this.$set(this.trafficRuleItem, 'max_fails', item.max_fails);
			this.$set(this.trafficRuleItem, 'fail_timeout', item.fail_timeout);
			this.$set(this.trafficRuleItem, 'connect_timeout', item.connect_timeout);
			this.$set(this.trafficRuleItem, 'max_concurrent', item.max_concurrent);
			this.$set(this.trafficRuleItem, 'read_timeout', item.read_timeout);
			let opName = '保存';
			this.submitFrom(opName);
		},
		cancelSave(idx) {
			this.trafficInfoItems[idx] = Object.assign({},this.copyTrafficInfoItem[idx]);
			this.selectIdx = -1;
		},
		submitFrom(opName) {
			var msgview = this.$wool.showloading(opName + '中');
			let url = '?method=/devops/gateway/traffic';
			let params = {
				op: this.trafficTableOp,
				name: this.service.name,
				item: this.trafficRuleItem
			};
			//请求数据
			this.$wf
				.post(url, params)
				//成功处理
				.then(data => {
					this.requesttrafficList();
          this.resetData();
          msgview.msgsucc(opName + '成功').hide();
          Object.assign(this.$data,this.$options.data());
				})
				//异常处理
				.catch(e => {
					msgview.msgwarn(e.message).hide();
				});
		},
		requesttrafficList() {
			this.copyTrafficInfoItem = [];
			var msgview = this.$wool.showloading('正在获取');
			this.$wf
				.post('?method=/devops/gateway/traffic', {
					name: this.service.name
				})
				//成功处理
				.then(data => {
					msgview.hide(0);
          this.trafficInfoItems = data.items || [];
          for(let i=0;i<this.trafficInfoItems.length;i++){
            if(this.trafficInfoItems[i].service_no==null){
              this.trafficInfoItems[i].service_no='';
              this.servicesNoList.push({
                name: '不指定',
                id: ''
              });
              continue;
            }
            this.servicesNoList.push({
              name: this.trafficInfoItems[i].service_no,
              id: this.trafficInfoItems[i].service_no
            });
            
          }
          for(let i=0;i<this.trafficInfoItems.length;i++){
            if(this.trafficInfoItems[i].service_version==null){
              this.trafficInfoItems[i].service_version='';
              this.servicesNoList.push({
                name: '不指定',
                id: ''
              });
              continue;
            }
            this.servicesVersionList.push({
              name: this.trafficInfoItems[i].service_version,
              id: this.trafficInfoItems[i].service_version
            })
          }
          this.servicesNoList.push({name: '不指定',id: ''});
          this.servicesVersionList.push({name: '不指定',id: ''})
          function quChong(arr){
            // 利用对象访问属性的方法，判断对象中是否存在key来去重
            var result = [];
            var obj = {};
            for(var i =0; i<arr.length; i++){
              if(!obj[arr[i].id]){
                result.push(arr[i]);
                obj[arr[i].id] = true;
              }
            }
            return result;
          }
          this.servicesNoList=quChong(this.servicesNoList)
          this.servicesVersionList=quChong(this.servicesVersionList)
					this.copyTrafficInfoItem = this.trafficInfoItems.map(item =>{
						let obj = Object.assign({},item); // 拷贝一份
						return obj;
          });
          console.log(this.servicesNoList)
          console.log(this.servicesVersionList)
				})
				//异常处理
				.catch(e => {
					msgview.hide(0);
					this.$wool.showwarn(e.message);
				});
    },
    changeSN(val){
      this.trafficInfoItems[this.currentIndex].service_no=val;
    },
    changeSV(val){
      this.trafficInfoItems[this.currentIndex].service_version=val;
    },
    changeIndex(index){
      this.currentIndex=index
    },
    serachbykeyword1(val){
      if(this.currentIndex>-1){
        this.trafficInfoItems[this.currentIndex].service_no=val;
      }
      
    },
    serachbykeyword2(val){
      if(this.currentIndex>-1){
        this.trafficInfoItems[this.currentIndex].service_version=val;
      }
      
    }
	},
	watch: {
		isshow(val) {
			if(val) {
        this.servicesNoList=this.selectedNoList;
        this.servicesVersionList=this.selectedVersionList;
				this.requesttrafficList();
			}else{
        this.servicesNoList=[];
        this.servicesVersionList=[];
      }
    },
	}
};
</script>

<style scoped="scoped">
.trafficTable {
	width: 85vw;
	background-color: white;
	height: 60vh;
	overflow-y: auto;
	border-radius: 4px;
	padding: 20px;
}
.titlebar{
	padding-bottom: 10px;
	border-bottom: 1px solid #e3ebf6;
	color: #1862c6;
	font-weight: bold;
}
.tableDatil th {
	padding: 0 10px;
	font-weight: 500;
	height:45px;
	font-size: 14px;
}
.tableDatil td {
	font-size: 12px;
}
.smallTable-input {
	text-align: left;
	max-width: 130px;
}
.addrowBar{
	border: 2px dashed #1ba9f9;
	text-align: center;
	padding: 5px 0;
	width: 97%;
	margin: 30px auto;
	font-size: 20px;
	cursor: pointer;
	color: #1ba9f9;
}
.warn-note {
	color: red;
	padding-left: 10px;
}
.traffic {
	width: 80px;
}
/* .trafficInfo {
	/* padding: 30px; */
/* } */ 
.explain-icon {
	width: 20px;
	height: 20px;
	background-size: 14px;
	background-image: url(../../assets/images/explain.png);
	background-position: center;
	margin-left: 10px;
	cursor: pointer;
	position: relative;
}
.explain-context {
	position: absolute;
	max-width: 400px;
	padding: 10px;
	background-color: black;
	opacity: 0.9;
	color: white;
	border-radius: 3px;
	margin-top: -21px;
	margin-left: 33px;
	display: none;
	z-index: 999;
	padding: 10px;
	font-size: 14px;
	font-weight: 500;
}
.explain-box {
	display: inline-block;
}
.explain-box:hover .explain-context {
	display: block;
}
.flex {
	display: flex;
	align-items: center;
}
.traffic-item-handle {
	cursor: pointer;
}
.right-item-handle {
	cursor: pointer;
	background-color: #ebf8f6;
	text-align: center;
}
</style>
<style scoped>
.single-select /deep/ #select-input{
  padding-left: 0;
  line-height: 0;
  background-position-x: calc(100% - 15px);
}

</style>