<template>
  <div class="fwpz_area">
    <div class="query">
        <div class="input_box" style="margin-left: 0;">类型：<SingleSelect
          :items="selectOption"
          @select="changeNX"
          v-model="selectValue"
          :selectname="selectOption[0].name"
        ></SingleSelect></div>
        <div class="AcGroup" style="margin-left: 7%;">访问组：
          <SingleSelect @serachbykeyword="getMerchants" 
          :selectname="serachDefalt.name" :items="merchantitems" v-model="searchMachant"></SingleSelect>
        </div>
        
        <div class="input_box">关键字：<input type="text" v-model="keyword" @keydown.enter="query"></div>
        <div class="query_button" @click="query">查询</div>
        <div class="query_button" @click="showcreate = !showcreate">
          +添加
        </div>
    </div>
    <div>
      <table class="fwpz_table">
        <tr class="fwpz_title">
          <td style="width: 23%;">access id</td>
          <td style="width: 27%;">访问组(access group)</td>
          <td style="width: 20%;">摘要</td>
          <td style="width: 10%;">是否有效</td>
          <td style="width: 20%;">access key</td>
        </tr>
        <tbody>
          <tr v-for="(item, index) in accessesList" :key="index">
            <td :title="item.id+'[双击复制]'" @dblclick="copy(item.id)">{{ item.id }}</td>
            <td>
              <p v-show="item.group" :title="item.group">{{item.group}}</p>
              <p v-show="item.group_name" style="color: #757575">{{item.group_name}}</p>
            </td>
            <td :title="item.summary">{{ item.summary || '--' }}</td>
            <td>{{ item.valid ? '是' : '否'}}</td>
            <td><span @click="seeAccesskey(item)" style="cursor: pointer;color:#3D83E5;">查看accesskey</span></td>
          </tr>
        </tbody>
        <tfoot v-if="warnningMsg">
          <tr>
            <td colspan="3" class="table-warnning">{{ warnningMsg }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <PagerBar v-if="!warnningMsg" :page="page" @change="searchByPage"></PagerBar>
    <WoolShowmodal :isshow="showcreate" @tapCloser="showcreate = !showcreate" :isshowcloser="true">
      <div class="add_fwpz">
    <div class="titlebar flexlayout">添加凭证</div>
        <div class="kind_items">
          <label class="kind_item"><span>种类(access kind)：</span> </label>
          <WoolSelect :items="cSelectOption" v-model="createOptionVal" class="kindselect">{{ cSelectOption[createOptionVal].name }}</WoolSelect>
        </div>
    <div class="visit_groups">
      <label class="visit_group"><span>访问组(access group)：</span> </label>
      <SingleSelect
        @serachbykeyword="getMerchants"
        :selectname="createMerchant.name"
        :items="merchantitems"
        v-model="createMerchant.id"
      ></SingleSelect>
    </div>
        <div class="zhuaiyao_items">
          <label class="zhuaiyao_item"><span>摘要：</span> </label>
          <textarea v-model="summary" class="summary-input zhaiyao" rows="5" style="width:550px" placeholder="请输入凭证摘要"></textarea>
        </div>
    <div class="btn-box">
      <button class="add-btn" @click="createAccess">
        <span>添  加</span>
      </button>
    </div>
      </div>
    </WoolShowmodal>
    <!--回显accesskey-->
    <WoolShowmodal :isshow="showaccesskey" @tapCloser="showaccesskey = !showaccesskey" :isshowcloser="true">
    <div class="accesskey">
      <div class="titlebar flexlayout">凭证信息</div>
      <div><span class="accesskey-item">accessId = {{ accessId }}</span><img src="../../img/copy.png" @click="copy(accessId)"/></div>
      <div><span class="accesskey-item">accesskey = {{ accesskey }}</span><img src="../../img/copy.png" @click="copy(accesskey)"/></div>
      </div>
    </WoolShowmodal>
  </div>
</template>

<script>
export default {
  name: 'devopsaccesses',
  components: {
    WoolSelect: () => import('../../component/WoolSelect.vue'),
    PagerBar: () => import('../../component/PagerBar.vue'),
    WoolShowmodal: () => import('../../component/WoolShowmodal.vue'),
    SingleSelect: () => import('../../component/SingleSelect.vue'),
  },
  data() {
    return {
      selectOption: [
        {
          name: '服务',
          id: 'H'
        },
        {
          name: '用户',
          id: 'US'
        }
      ],
      cSelectOption: [
        {
          name: '服务',
          value: 'H'
        }
      ],
      selectValue: 'H',
      searchMachant: '',
      page: { current: 1, pagecount: 1, totalCount: 0, pagesize: 10 }, //页码初始值
      warnningMsg: '',
      showcreate: false,
      createOptionVal: 0,
      createMerchant: {},
      summary: '',
      accessesList: [],
      showaccesskey: false,
      accesskey: '',
      accessId: '',
      serachDefalt: {},
      merchantitems: [],
      searchMachantCount: 0,
      keyword:'',
    };
  },
  methods: {
    changeNX(id){
      if(id){
        this.requestList();
      }
      
    },
    query(){
      this.page.current=1;
      this.requestList();
    },
    searchByPage(ev) {
      this.page.current = ev.page;
      this.requestList();
    },
    createAccess() {
      if (this.createMerchant == '') {
        this.$wool.showwarn('请选择一个商家');
        return;
      }
      if (this.summary == '') {
        this.$wool.showwarn('请输入凭证摘要');
        return;
      }
      let params = {
        op: 'create',
        kind: this.cSelectOption[this.createOptionVal].value,
        group: this.createMerchant.id,
        summary: this.summary
      };
      var msgView = this.$wool.showloading('保存中');
      let url = '?method=/devops/gateway/access';
      //请求数据
      this.$wf
        .post(url, params)
        //成功处理
        .then(data => {
          if (data.id) {
            msgView.msgsucc('创建成功').hide();
            this.showcreate = !this.showcreate;
            this.showaccesskey = true;
            this.accesskey = data.key;
            this.accessId = data.id;
            this.requestList();
          }
        })
        //异常处理
        .catch(e => {
          msgView.msgwarn(e.message).hide(0);
        });
    },
    requestList() {
      this.accessesList = [];
      this.warnningMsg = '';
      var msgView = this.$wool.showloading('加载中...');
      let url = '?method=/devops/gateway/accesses';
      let params = {
        kind: this.selectValue,
        group: this.searchMachant,
        keyword: this.keyword,
        page: this.page.current,
        page_size: this.page.pagesize
      };
      //请求数据
      this.$wf
        .post(url, params)
        //成功处理
        .then(data => {
          msgView.hide(0);
          this.accessesList = data.items;
          if (this.accessesList.length == 0) {
            this.warnningMsg = '没有更多数据,试试其他的吧';
          } else {
            this.page.totalCount = data.count;
            this.page.current = data.page;
            this.page.pagecount = data.page_count;
          }
        })
        //异常处理
        .catch(e => {
          msgView.hide(0)
          this.warnningMsg = e.message;
        });
    },
    seeAccesskey(item) {
      this.showaccesskey = true;
      this.accessId = item.id;
      this.accesskey = item.key;
    },
    searchMerchants(companyid, iscontinue) {
      let params = {
        p: 1,
        pagesize: 500,
        keywords: companyid
      };
      if(this.searchMachantCount > 2) {
        return;
      }
      //请求数据
      this.$wf
        .post('?method=/devops/gateway/merchants', params)
        //成功处理
        .then(data => {
          if (data.items.length == 0) {
            if (iscontinue) {
              this.searchMachantCount = this.searchMachantCount + 1;
              this.searchMerchants(this.searchMachant, false);
            }
          } else {
            if (data.count > 1) {
              let resultData = [];
              data.items.forEach(item => {
                if (item.id == 'CommonCompany$06d651f0-0173' || item.id == 'CommonCompany$08cf445c-062a') {
                  resultData.push(item);
                }
              });
              if (resultData.length == 0) {
                this.searchMachantCount = this.searchMachantCount + 1;
                this.searchMerchants(this.searchMachant, false);
              } else {
                this.serachDefalt = resultData[0];
                // this.serachDefalt = '';

              }
            } else {
              this.serachDefalt = data.items[0];
              // this.serachDefalt = '';
            }
            this.searchMachant = this.serachDefalt.id;
            // this.searchMachant = '';
          }
        })
        //异常处理
        .catch(e => {
          this.$wool.showwarn('搜索商家异常');
        });
    },
    // 搜索群组
    getMerchants(val) {
      this.$wf
        .post('?method=/devops/gateway/merchants', {
          page: 1,
          page_size: 100, // 默认查一百条先吧
          keywords: val
        })
        .then(data => {
          this.merchantitems = data.items.map(item =>{
            item.name = item.name ? item.name + '(' + item.id + ')' : item.id;
            return item;
          });
          
        })
        .catch(e => this.$wool.showwarn('获取商家列表失败' + e.message));
    },
    copy(text){
		this.$wool.copyText(text);
		this.$wool.showsucc("复制");
	}
  },
  watch: {
    searchMachant(val) {
      if(typeof val == 'undefined') {
        return;
      }
      this.requestList();
    }
  },
  mounted() {
    
    // this.searchMerchants(this.searchMachant, true);
    this.getMerchants();
    this.requestList();
  }
};
</script>

<style scoped="scoped" lang="less">
.fwpz_area{
 width: 98%;
 box-shadow: 0 0.75rem 1.5rem rgba(18,38,63,.03);
 border: 1px solid rgba(0, 123, 255, 0.4);
 border-radius: 6px;
 margin: 1% auto 5% auto;
 background-color: white;
 
  .fwpz_table{
  width: 100%;
  table-layout: fixed;
  border-top:1px solid rgba(0, 123, 255, 0.4);
  border-collapse: collapse;
    .fwpz_title{
     color: #004085;
     background-color: #f9fbfd;
    }tr{
      background-color: white;
      td{
       white-space: nowrap;
       text-overflow: ellipsis;
       overflow: hidden;
       padding: 15px 0;
       padding-left: 15px;
       padding-right: 15px;
       border-bottom:1px solid rgba(0, 123, 255, 0.4);
       font-size: 14px;
       height:28px;
      }
    }
    
  }
}
.apploading{
  display: inline-block;
  text-align: center;
}
.btn-box {
  margin-top: 20px;
  float: right;
  padding-right: 1%;
}
.titlebar{
    padding-bottom: 10px;
    border-bottom: 1px solid #e3ebf6;
    color: #1862c6;
    font-weight: bold;
  }
// *新建凭证弹框样式**/
.add_fwpz {
  width: 46vw;
  min-height: 45vh;
  overflow-y: auto;
  padding: 20px 20px 35px 20px;
  background-color: #fff;
  border-radius: 4px;
  
  .kind_items{
    padding-top: 15px;
    display: flex;
    align-items: flex-start;
    .kind_item{
      // width: 30%;
    margin-left: 20px;
    margin-right: 25px;
    font-size: 14px;
    color: #004085;
    height:35px;
    line-height: 35px;
      span{
        float: right;
      }
      
    }
  }
  .zhuaiyao_items{
    padding-top: 25px;
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    .zhuaiyao_item{
    margin-left: 20px;
    margin-right: 10px;
    font-size: 14px;
    color: #004085;
      span{
        float: right;
      }
    }
  .zhaiyao{
    border: 1px solid #AFABAB;
    border-radius: 3px;
    padding: 5px 8px;
  }
  }
  .visit_groups{
    padding-top: 15px;
    display: flex;
    align-items: flex-start;
    .visit_group{
    margin-left: 20px;
    font-size: 14px;
    color: #004085;
    height:35px;
    line-height: 35px;
      span{
        float: right;
      }
    }
  }
}
.kindselect {
  min-width: 120px;
  height: 32px;
  line-height: 32px;
  background-color: white;
}
.accesskey {
  width: 52vw;
  min-height: 23vh;
  overflow-y: auto;
  padding: 20px 20px 35px 20px;
  background-color: #fff;
  border-radius: 4px;
  .accesskey-item{
    margin-top: 30px;
    margin-left: 10px;
    width: 700px;
    display: block;
	float: left;
  }
  img{
	width: 30px;
	margin-top: 25px;
	float: left;
	cursor: pointer;
  }
}
.query{
  padding: 1% 0 1% 1%;
}
.AcGroup{
  display: inline;
}
.input_box{
  display: inline-block;
  margin-left: 7%;
  input{
    height: 32px;
    display: inline-block;
    border: 1px solid #AFABAB;
    border-radius: 4px;
    padding-left: 10px;
  }
}
.query_button{
  margin-left: 1%;
}

</style>
