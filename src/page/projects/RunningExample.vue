<template>
  <div>
    <div class="table_area">
      <div class="query">
        <div class="query_input">
          <input ref="keywords" type="text" v-model="keywords" class="input" @keyup.enter='queryShiliList'/>
          <el-button type="primary" size="small" class="ml-1" @click="queryShiliList">查 询</el-button>
        </div>

        <div class="query_group rowSC">
          <div class="query_select">
            运维组：
            <SingleSelect :items="groupName" @select="selectByGroup">
            </SingleSelect>
          </div>
          <el-button type="primary" size="small" class="ml-1" @click="addrunning">+ 添 加</el-button>
        </div>
      </div>
      <table class="shili_table">
        <tr class="shili_title">
          <td>项目</td>
          <td style="width:100px">容器</td>
          <td>项目描述</td>
          <td>运维组</td>
          <td style="width:60px">版本</td>
          <td style="width:60px">状态</td>
          <td style="width:120px">操作</td>
          <td style="width:150px">监控</td>
        </tr>
        <tbody v-if="!noData">


        <tr class='shili_items' v-for="(item,index) in runningList" :key='index'>
          <td>
           <span v-if="item.project">
              <!-- <span :style="item.project.type==1?'color:#4472C4;':'color: #70AD47;'">●</span> -->
              <img :title="item.id+'[双击复制]'" v-if="item.project.type==1" src="../../img/java.png" class="javamark"
                   @dblclick="copy(item.id)"/>
              <img :title="item.id+'[双击复制]'" v-if="item.project.type==2" src="../../img/html.png" class="htmlmark"
                   @dblclick="copy(item.id)"/>
              <span style="margin-left:5px;" :title="item.project.name">{{ item.project.name }}</span>
            </span>
            <span v-else>--</span>
          </td>
          <td>
            <span v-if="item.machine" :title="item.machine.name">{{ item.machine.name }}</span>
            <span v-else>--</span>
          </td>
          <td>
            <span v-if="item.project" :title="item.project.desc">{{ item.project.desc }}</span>
            <span v-else>--</span>
          </td>
          <td>
            <span :title="item.project.groups_to_show">{{ item.project.groups_to_show }}</span>

          </td>
          <td>
            <span v-if="item.isloadstate"><Loading :isshow="item.isloadstate"></Loading></span>
            <span v-else :title="item.current_version" class="versiontips">{{ item.current_version }}</span>
          </td>
          <td>
            <span v-if="item.isloadstate"><Loading :isshow="item.isloadstate"></Loading></span>
            <span v-else :title="item.state_name" :class="[0==item.state ? 'stateblue' : 'statered']">{{
                item.state_name
              }}</span>
          </td>
          <td class="caozuo_td">
            <!-- 不同管理员权限下的不同操作 -->
            <!-- 仅可见 -->
            <div v-if="!item.can_rollback && !item.can_start && !item.can_stop">
              <div style="display: inline-block;" @click="watchDetail(item)">
                <span>查看信息</span>
              </div>
            </div>

            <!-- 管理操作 -->
            <div v-else-if="item.can_upgrade && item.can_edit">
              <div v-if="item.can_upgrade" style="display: inline-block;padding-right:10%;"
                   @click="handleCaozuo('部署', 'upgrade', item)"><span>部署</span></div>
              <div v-if="item.can_edit" style="display: inline-block;" @click="editrunning(item)"><span>查看与编辑</span>
              </div>
              <div class="shenglue">
                <img src="../../img/shenglue.png" @click="clickShenglue('caozuo',item,index)">
              </div>
              <div v-if="item.isShowCaozuo" class="caozuo_items">
                <div v-if="item.can_restart && item.state == 0" class="caozuo_item"
                     @click="handleCaozuo('重启', 'restart', item)">重启
                </div>
                <div v-if="item.can_start && item.state == 3" class="caozuo_item"
                     @click="handleCaozuo('启动', 'start', item)">启动
                </div>
                <div v-if="item.can_stop && item.state == 0" class="caozuo_item"
                     @click="handleCaozuo('停止', 'stop', item)">停止
                </div>
                <div v-if="item.can_rollback" class="caozuo_item" @click="handleCaozuo('回滚', 'rollback', item)">回滚</div>
              </div>
            </div>

            <!-- 基础操作 -->
            <div v-else>
              <div v-if="item.can_restart && item.state == 0" style="display: inline-block;padding-right:10%;"
                   class="caozuo_item" @click="handleCaozuo('重启', 'restart', item)"><span>重启</span></div>
              <div v-if="item.can_start && item.state == 3" style="display: inline-block;padding-right:10%;"
                   class="caozuo_item" @click="handleCaozuo('启动', 'start', item)"><span>启动</span></div>
              <div style="display: inline-block;" @click="watchDetail(item)"><span>查看信息</span></div>
              <div class="shenglue" v-if="(item.can_stop && item.state == 0) || item.can_rollback">
                <img src="../../img/shenglue.png" @click="clickShenglue('caozuo',item,index)">
              </div>
              <div v-if="item.isShowCaozuo" class="caozuo_items">
                <div v-if="item.can_stop && item.state == 0" class="caozuo_item"
                     @click="handleCaozuo('停止', 'stop', item)">停止
                </div>
                <div v-if="item.can_rollback" class="caozuo_item" @click="handleCaozuo('回滚', 'rollback', item)">回滚</div>
              </div>
            </div>

            <div v-if="item.isShowCaozuo" class="outside" @click="clickOutside(index)"></div>
          </td>
          <td class="jiankong_td">
            <div v-if="item.project.type==1" class="jiankong_span">
              <!-- <span>报警</span> -->
              <span @click="goToExampleLog(item.app_log)">实例日志</span>
              <span style="margin-left:15%" @click="handleJiankong('optionRecord',item,index)">操作记录</span>
            </div>
            <div v-if="item.project.type==1" class="shenglue">
              <img src="../../img/shenglue.png" @click="clickShenglue('jiankong',item,index)">
            </div>
            <div v-if="item.isShowJiankong" class="caozuo_items">
              <div class="caozuo_item" @click="handleJiankong('sysLog',item,index)">System.out</div>
              <div class="caozuo_item" @click="handleJiankong('jsJm',item,index)">jstack&jmap</div>
              <!-- <div class="caozuo_item" @click="handleJiankong('Xingneng',item)">性能&指标</div> -->

            </div>
            <div v-if="item.isShowJiankong" class="outside" @click="clickOutside(index)"></div>
            <div v-if="item.project.type==2" class="jiankong_span" @click="handleJiankong('optionRecord',item,index)">
              <span>操作记录</span
              ></div>
          </td>
        </tr>
        </tbody>
        <tr v-if='noData' class="noData">
          <td colspan="8">暂无数据</td>
        </tr>
      </table>
      <div class="pagebar" v-if="!noData">
        <PagerBar :page="page" @change="searchByPage"></PagerBar>
      </div>
    </div>
    <AddRunning
        ref="addrunning"
        :obj="editRunningObj"
        :isshow="showCreate"
        @toggle="showCreate = !showCreate"
        @load="getShiliList">
    </AddRunning>
    <ReminderModel
        ref="reminderModel"
        :isshow="showReminder"
        @toggle="showReminder = !showReminder"
        @load="getShiliList"
        :handleOp="handleOp"
        :runningId="runningId"
        :version="version"
        :handelName="handelName"
    ></ReminderModel>
    <SelectVersions
        @getselect="getSelectVersion"
        :isshow="showSelectVersion"
        @toggle="showSelectVersion = !showSelectVersion"
        :versions="versionList">
    </SelectVersions>

    <SystemLog
        v-if="showSystemLog"
        :isShowSL='showSystemLog'
        :JiankongNameData='JiankongNameData'
        @tapCloser='closeSystemLog'>
    </SystemLog>
    <OptionLog v-if="showOptionLog"
               :isShowOL='showOptionLog'
               :JiankongNameData='JiankongNameData'
               @tapCloser='closeOptionLog'>
    </OptionLog>
    <JsJm
        :isshow="showJsJm"
        :id="jsjmId"
        :index="jsjmIndex"
        :state="jsState"
        @tapCloser='closeJsJm'></JsJm>
  </div>
</template>

<script>
export default {
  components: {
    Loading: () => import('../../component/loading'),
    PagerBar: () => import('../../component/PagerBar'),
    SingleSelect: () => import('../../component/SingleSelect'),
    AddRunning: () => import('../../component/AddRunning'),
    ReminderModel: () => import('../../component/ReminderModel'),
    SelectVersions: () => import('../../component/SelectVersions'),
    SystemLog: () => import('../../component/RunningExamle/SystemLog'),
    OptionLog: () => import('../../component/RunningExamle/OptionLog'),
    JsJm: () => import('../../component/RunningExamle/JsJm')
  },
  data() {
    return {
      page: {
        current: 1,
        pagecount: 1,
        totalCount: 0,
        pagesize: 10
      },
      keywords: '',
      runningList: [],
      groupName: [],
      selectname: '',
      showCreate: false,
      editRunningObj: {},
      showReminder: false,
      handleOp: '',
      handelName: '',
      runningId: '',
      version: '',
      versionList: [],
      showSelectVersion: false,
      noData: false,
      //实例日志数据
      showTask: false,
      JiankongNameData: {
        MachineName: '',
        projectName: '',
        id: '',
        index: -1
      },
      showSystemLog: false,
      // 操作日志数据
      showOptionLog: false,
      //Jstack&Jmap
      showJsJm: false,
      jsjmId: '',
      jsjmIndex: -1,
      jsState: -1,
    }
  },
  methods: {
    getShiliList() {
      let msgview = this.$wool.showloading('正在加载...');
      let parame = {
        page: this.page.current,
        page_size: this.page.pagesize,
        keywords: this.keywords,
        groupid: this.groupid
      }
      let url = 'devops?method=/devops/home/runnings'
      this.$wf.post(url, parame).then(res => {
        console.log(res)
        msgview.hide(0);
        if (res.count == 0) {
          this.$wool.showwarn("暂无数据")
          this.noData = true
        } else {
          this.editResult(res)
          this.noData = false
        }
      }).catch(e => {
        this.noData = true;
        msgview.hide(0);
        this.$wool.showwarn(e)
      })
    },
    queryShiliList() {
      this.page.current = 1;
      if (this.$route.query.keyword) {
        this.$router.push({
          name: '运行实例',
          query: {
            keyword: this.keywords,
          }
        });
      }
      this.getShiliList();
    },
    getGroupList() {
      this.$wf.post('devops?method=/devops/home/groups').then(res => {
        this.groupName = res.items
      }).catch(e => {
        // alert(e)
        // this.$wool.showwarn(e)
      })
    },
    async editResult(data) {
      this.runningList = data.items;
      this.page.totalCount = data.count;
      this.page.pagecount = data.page_count;
      for (let i = 0; i < this.runningList.length; i++) {
        this.runningList[i].isloadstate = true;
        let id = this.runningList[i].id;
        let res = await this.$wf.post('devops?method=/devops/home/running', {id})
        this.runningList[i].isloadstate = false;
        this.runningList[i].state_name = res.state_name;
        this.runningList[i].state = res.state;
        this.runningList[i].current_version = res.current_version;
        this.runningList[i].isShowCaozuo = false;
        this.runningList[i].isShowJiankong = false;
        this.$forceUpdate();
      }
    },
    searchByPage(p) {
      this.page.current = p.page
      this.getShiliList()
    },
    clickOutside(index) {
      // alert('触发了outside')
      this.runningList[index].isShowCaozuo = false;
      this.runningList[index].isShowJiankong = false;
      this.$forceUpdate();
    },
    clickShenglue(neixing, item, index) {
      if (neixing == 'caozuo') {
        for (let i = 0; i < this.runningList.length; i++) {
          if (i == index) {
            this.runningList[index].isShowCaozuo = !this.runningList[index].isShowCaozuo
          } else {
            this.runningList[i].isShowCaozuo = false
          }
        }
        this.$forceUpdate();
      } else if (neixing == 'jiankong') {
        for (let i = 0; i < this.runningList.length; i++) {
          if (i == index) {
            this.runningList[index].isShowJiankong = !this.runningList[index].isShowJiankong
          } else {
            this.runningList[i].isShowJiankong = false
          }
        }
        this.$forceUpdate();
      }
    },
    selectByGroup(id) {
      this.groupid = id;
      this.page.current = 1;
      this.getShiliList()
    },
    addrunning() {
      this.editRunningObj = {};
      this.$forceUpdate();
      this.showCreate = !this.showCreate
    },
    editrunning(item) {
      this.editRunningObj = item;
      this.showCreate = !this.showCreate
    },
    watchDetail(item) {
      this.editRunningObj = item;
      this.editRunningObj['notEdit'] = true;
      this.showCreate = !this.showCreate
    },
    handleCaozuo(op, opName, item) {
      this.runningId = item.id;
      this.handelName = op;
      this.handleOp = opName;
      if (this.handleOp == 'upgrade') {
        this.requestVersions('get_versions');
      } else {
        this.showReminder = !this.showReminder;
      }
    },
    requestVersions(op) {
      let params = {
        op: op,
        id: this.runningId
      };
      let url = '?method=/devops/home/running';
      var msgview = this.$wool.showloading('正在加载版本');
      //请求数据
      this.$wf
          .post(url, params)
          //成功处理
          .then(data => {
            msgview.hide(0);
            this.version = '';
            this.versionList = data.versions;
            if (this.versionList.length == 0) {
              this.$wool.showwarn('无可用版本');
              return;
            }
            if (this.versionList.length <= 1) {
              this.showReminder = !this.showReminder;
              this.version = this.versionList[0];
            } else {
              this.$nextTick(() => {
                this.showSelectVersion = !this.showSelectVersion;
              });
            }
          })
          //异常处理
          .catch(e => msgview.msgwarn(e.message).hide());
    },
    getSelectVersion(val) {
      this.version = val;
      this.showSelectVersion = !this.showSelectVersion;
      this.$nextTick(() => {
        this.showReminder = !this.showReminder;
      });
    },
    handleJiankong(op, item, index) {
      if (op == 'sysLog') {
        this.JiankongNameData.MachineName = item.machine.name;
        this.JiankongNameData.projectName = item.project.name;
        this.JiankongNameData.id = item.id;
        this.JiankongNameData.index = index;
        this.showSystemLog = !this.showSystemLog;
      } else if (op == 'jsJm') {
        this.showJsJm = !this.showJsJm;
        this.jsjmId = item.id;
        this.jsjmIndex = index;
        this.jsState = item.state;

      } else if (op == 'Xingneng') {
        // let routeUrl =this.$router.resolve({
        //   name: '性能&指标',
        //   query: {

        //   }
        // })
        // window.open(routeUrl.href, '_blank');
        // this.$wool.showwarn("努力开发中...敬请期待！")
      } else if (op == 'optionRecord') {
        this.JiankongNameData.MachineName = item.machine.name;
        this.JiankongNameData.projectName = item.project.name;
        this.JiankongNameData.id = item.id;
        this.JiankongNameData.index = index;
        this.showOptionLog = !this.showOptionLog;
      }
    },
    closeSystemLog(index) {
      console.log(index)
      this.showSystemLog = !this.showSystemLog;
      this.runningList[index].isShowJiankong = false;
    },
    closeOptionLog(index) {
      console.log(index)
      this.showOptionLog = !this.showOptionLog;
      this.runningList[index].isShowJiankong = false;
    },
    closeJsJm(index) {
      this.showJsJm = !this.showJsJm;
      this.runningList[index].isShowJiankong = false;
    },
    goToExampleLog(app_log) {
      let url = '/' + this.site_name + '/examplelog?app_log=' + app_log
      window.open(url);
    },
    copy(text) {
      this.$wool.copyText(text);
      this.$wool.showsucc("复制ID");
    }
  },
  watch: {},

  mounted() {
    if (this.$route.query.keyword) {
      this.keywords = this.$route.query.keyword;
    }
    this.getShiliList();
    this.getGroupList();
    this.$nextTick(() => {
      this.$refs.keywords.focus();//输入框默认获取焦点
    });


  },

}
</script>

<style lang="less" scoped>
.query {
  margin-left: 1%;
  //margin-top: 3%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-top: 12px;
  padding-bottom: 12px;

  .query_input {
    display: flex;
    align-items: flex-start;

    input {
      width: 80%;
      height: 32px;
      display: inline-block;
      border: 1px solid #AFABAB;
      border-radius: 4px;
      padding-left: 10px;
    }

    .query_button {
      width: 60px;
      height: 34px;
      line-height: 34px;
      margin-left: 10px;
      text-align: center;
      color: white;
      border-radius: 5px;
      background-color: #1862c6;
      cursor: pointer;
      font-size: 14px;
    }
  }

  .query_group {
    margin-left: 20px;
    margin-right: 20px;

    .query_select {
      display: inline-block;
    }
  }
}

.table_area {
  width: 98%;
  box-shadow: 0 0.75rem 1.5rem rgba(18, 38, 63, .03);
  border: 1px solid rgba(0, 123, 255, 0.4);
  border-radius: 6px;
  // height: 100px;
  margin: 1% auto 5% auto;
  // border: 1px solid red;
  background-color: white;

  .shili_table {
    width: 100%;
    table-layout: fixed;
    //border: 1px solid #edf2f9;
    border-top: 1px solid rgba(0, 123, 255, 0.4);
    border-collapse: collapse;

    .shili_title {
      color: #004085;
      background-color: #f9fbfd;
    }

    .shili_items {
      .versiontips {
        background-color: rgba(0, 162, 138, 0.08);
        color: #008974;
        width: 40px;
        padding: 5px 8px;
        border-radius: 4px;
        margin-left: -8px;
        display: block;
        text-align: center;
      }

      .statered {
        color: #da3458;
      }

      .stateblue {
        color: #00B0F0;
      }

      .caozuo_td {
        // display: flex;
        // align-items: center;
        padding-right: 0;
        z-index: -1;
        color: #3D83E5;

        span {
          color: #3D83E5;
          cursor: pointer;
        }

        .shenglue {
          display: inline-block;
          width: 15px;
          height: 15px;
          // margin-top: 10px;
          margin-left: 10px;

          img {
            width: 100%;
            cursor: pointer;
          }
        }

      }

      .caozuo_items {
        width: 10%;
        border: 2px solid #7FBDFF;
        border-radius: 4px;
        background-color: #F9FBFD;
        position: absolute;
        margin-left: -10px;
        margin-top: 5px;
        // margin-top: 9%;
        z-index: 99;

        .caozuo_item {
          padding: 5% 0;
          padding-left: 10%;
          cursor: pointer;
          color: #3D83E5;
        }

        .caozuo_item:hover {
          background-color: #edf2f9;
        }

      }

      .outside {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        // border: 1px solid red;
        z-index: 2;
      }

      .jiankong_td {
        padding-right: 0;

        .jiankong_span {
          display: inline-block;
          color: #3D83E5;

          span {
            cursor: pointer;
          }

        }

        .shenglue {
          display: inline-block;
          margin-left: 20px;

          img {
            width: 15px;
            height: 15px;
            cursor: pointer;
          }
        }
      }

    }

    td {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      padding: 15px 0;
      padding-left: 15px;
      padding-right: 15px;
      border-bottom: 1px solid rgba(0, 123, 255, 0.4);
      font-size: 14px;
      height: 28px;
    }
  }

  .pagebar {
    height: 40px;
  }

  .noData {
    width: 100%;
    height: 10%;
    text-align: center;
    padding: 10px 0;
  }
}

.javamark {
  width: 15%;
  margin-bottom: -4px;
}

.htmlmark {
  width: 15%;
  margin-bottom: -6px;
}
</style>
