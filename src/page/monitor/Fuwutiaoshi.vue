<template>
		<div class="flexlayout" style="height:100vh;">
			<div class="debug-content wt-scroll">
				<div class="input-box flexlayout">
					<div class="input-box-title">服务名：</div>
					<div class="input-box-content"><SingleSelect :items="serviceList" :selectname="serviceName" @select="choseOne" v-model="serviceName"></SingleSelect></div>
				</div>
				<div class="input-box flexlayout">
					<div class="input-box-title">服务编号：</div>
					<div class="input-box-content"><SingleSelect :items="serviceNoList" :selectname="serviceNo" v-model="serviceNo"></SingleSelect></div>
				</div>
				<div class="input-box flexlayout">
					<div class="input-box-title">脚本名(与脚本源码二选一)：</div>
					<div class="input-box-content">
            <input v-model="scriptName" style="width:180px" class="inputtext" placeholder="如:_VersionScript,_LogScript" />
            <el-button type="primary" size="small" class="ml-1" @click="quickDebug('vs')">Version</el-button>
            <el-button type="primary" size="small" class="ml-1" @click="quickDebug('ls')">Log</el-button>
          </div>
				</div>
				<div class="input-box flexlayout">
					<div class="input-box-title">脚本源码(与脚本名二选一)：</div>
					<div class="input-box-content"><textarea v-model="scriptSource" cols="45" rows="15" placeholder="格式要求:必须是WeforwardScript的实现类"></textarea></div>
				</div>
				<div class="input-box flexlayout">
					<div class="input-box-title">脚本参数：</div>
					<div class="input-box-content"><input v-model="scriptArgs" class="inputtext" style="width:330px" placeholder="a=111&b=222" /></div>
				</div>
				<div class="btn-box">
					<button class="add-btn" style="width: 400%;" @click="debug">
						<span>执 行 调 试</span>
					</button>
				</div>
			</div>
      <div class="debug-result wt-scroll">
        <div class="input-box-title" style="text-align: left;margin-top: 20px;margin-bottom: 10px;">调试结果：</div>
        <div class="input-box-content"><textarea  v-model="result" cols="60" rows="25"></textarea></div>
        <div class="warnning-msg" v-if="warnningMsg">{{warnningMsg}}</div>
      </div>
		</div>
</template>

<script>
	export default {
		name: 'debug',
		components: {
      SingleSelect: ()=> import('../../component/SingleSelect')
		},
		data() {
			return {
				serviceName: '',
				serviceNo: '',
				scriptName: '',
				scriptSource: '',
				scriptArgs: '',
				warnningMsg: '',
        result: '',
        serviceList:[],
        current: 1,
        serviceNoList:[],
			}
		},
		methods: {
			debug() {
				if (!this.serviceName) {
					this.warnningMsg = ('服务名不能为空!');
					return;
				}
				if (!this.serviceNo) {
					this.warnningMsg = ('服务编号不能为空!');
					return;
				}
				if (!this.scriptName && !this.scriptSource) {
					this.warnningMsg = ('脚本名和脚本源码不能为空!');
					return;
        }
        if (this.$route.query.sn&&this.$route.query.no) {
          this.$router.push({
            name: '服务调试',
            query: {
              sn: this.serviceName,
              no: this.serviceNo
            }
          });
        }
        this.warnningMsg = '';
        var msgView = this.$wool.showloading('加载中...');
				let params = {
					serviceName: this.serviceName,
					serviceNo: this.serviceNo,
					scriptName: this.scriptName,
					scriptSource: this.scriptSource,
					scriptArgs: this.scriptArgs
				};
				let url = 'devops?method=/devops/debug/service';
				//请求数据
				this.$wf
					.post(url, params)
					.then(data => {
            msgView.hide();
						this.result = JSON.stringify(data, null, 10);
					})
					.catch(e => {
            msgView.hide()
						this.warnningMsg = e.message;
					});
      },
      getServiceList(){
        let parame={
          page:  this.current,
          page_size: 10
        }
        this.$wf.post('devops?method=/devops/gateway/service_names',parame).then(res=>{
          if(res.pos<0){
            return;
          }else{
            res.items.forEach(item => {
              this.serviceList = [...this.serviceList, {name: item,id: item}];
            });
            this.current=this.current+1;
            this.getServiceList();
          }
        }).catch(e=>{
          this.$wool.showwarn(e)
        })
      },
      choseOne(name){
        this.serviceNoList=[];
        this.$wf.post('?method=/devops/gateway/service_details',{name})
        .then(res => {
          res.forEach(item=> {
            this.serviceNoList = [...this.serviceNoList,{name: item.no, id: item.no}]
          })
        })
        .catch(e => {
          this.$wf.showwarn(e)
        });
      },
      quickDebug(op){
        if(op=='vs'){
          this.scriptName='_VersionScript'
        }else if(op=='ls'){
          this.scriptName='_LogScript'
        }
        this.debug();
      }
    },

		mounted() {
      this.getServiceList();
      if(this.$route.query !=null){
        this.serviceName=this.$route.query.sn;
        this.serviceNo=this.$route.query.no;
      }
    }
	};
</script>

<style scoped="scoped" lang="less">
	.debug-content {
    width: 50%;
    height: 95%;
    // box-shadow: 0 0.75rem 1.5rem rgba(18,38,63,.03);
    // border: 1px solid rgba(0,123,255,.2);
    // border-radius: 8px;
    margin: 0 10px;
    margin-top: 2%;
    font-size: 14px;
	}

	.debug-result {
		overflow-x: hidden;
	}

	.input-box {
		margin: 20px 0;
	}

	.btn-box {
		margin-top: 2%;
		float: left;
		margin-left: 33%;
	}

	.input-box-title {
		width: 50%;
		text-align: right;
		margin-right: 20px;
		color: #004085;
		height:30px;
		line-height: 30px;
	}

	.input-box-content {
		width: 100%;
	}

	.warnning-msg {
		color: red;
		width:450px;
	}

	.inputtext{
		border: 1px solid #AFABAB;
		border-radius: 3px;
		padding: 3px 8px;
		// width: 35%;
		height:28px
	}
	textarea{
		border: 1px solid #AFABAB;
		border-radius: 3px;
		padding: 3px 8px;
  }
  .query_button{
    // width: ;
    display: inline-block;
    line-height: 36px;
    height: 36px;
    margin: 0 5px;
    padding: 0 3px;
  }
</style>
