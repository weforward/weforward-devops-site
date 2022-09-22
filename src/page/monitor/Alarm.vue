<template>
  <div class="zhuti_area">
    <div class="query_area">
      <div :class="['query_button',{'button_sel': notSel}]" @click="handleTime('YE')">昨天</div>
      <div :class="['query_button',{'button_sel': !notSel}]" @click="handleTime('TD')">今天</div>
      时间段：
      <el-date-picker
          v-model="dateTime"
          type="datetimerange"
          format="yyyy-MM-dd HH:mm"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          :pickerOptions="pickerOptions"
      >
      </el-date-picker>
      <span style="margin-left: 2%;">关键字：<input type="text" class="keyword_input input" @keydown.enter="query"
                                                v-model="keyword"></span>
      <el-button type="primary" size="small" class="ml-1" @click="query">查 询</el-button>
    </div>

    <table class="table_area">
      <thead class="table_thead">
      <td class="table_td" style="width:23%">ID</td>
      <td class="table_td" style="width:15%">时间</td>
      <td class="table_td" style="width:35%">内容</td>
      <td class="table_td" style="width:27%">详情</td>
      </thead>
      <tbody>
      <tr v-for="(item,index) in alarmList" :key="index">
        <td class="table_td">{{ item.id }}</td>
        <td class="table_td">{{ item.time.Format() || '--' }}</td>
        <td class="table_td" :title="item.content">{{ item.content }}</td>
        <td class="table_td xiangqing" :title="item.detail_url || '--'" @click="goToUrl(item)">
          {{ item.detail_url || '--' }}
        </td>
      </tr>
      </tbody>
    </table>
    <PagerBar v-if="alarmList.length!=0" :page="page" @change="searchByPage"></PagerBar>
    <div v-if="alarmList.length==0" class="table_td" style="text-align:center;"><span>暂无数据</span></div>
  </div>
</template>

<script>
export default {
  components: {
    PagerBar: () => import('../../component/PagerBar'),
  },
  data() {
    return {
      alarmList: [],
      page: {
        current: 1,
        pagecount: 1,
        totalCount: 0,
        pagesize: 10
      },
      dateTime: null,
      queryKsTime: '',
      queryJsTime: '',
      keyword: '',
      notSel: true,
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  methods: {
    query() {
      if (!this.dateTime) {
        this.$wool.showwarn("时间为必要查询条件！")
        return
      }
      if (new Date(this.dateTime[0]) >= new Date(this.dateTime[1])) {
        this.$wool.showwarn("时间选择错误！")
      } else if (new Date(this.dateTime[1]) - new Date(this.dateTime[0]) <= 10000) {
        this.$wool.showwarn("时间间隔必须大于1秒")
      } else {
        this.queryKsTime = new Date(this.dateTime[0]);
        this.queryJsTime = new Date(this.dateTime[1]);
        this.page.current = 1;
        this.getAlarmList();
      }
    },
    goToUrl(item) {
      if (!item.detail_url) {
        return
      } else {
        window.open(item.detail_url)
      }
    },
    getAlarmList() {
      var msgview = this.$wool.showloading('加载中...')
      let parame = {
        begin: this.queryKsTime,
        end: this.queryJsTime,
        keywords: this.keyword,
        page: this.page.current,
        page_size: 10
      }
      this.$wf.post('devops?method=/devops/home/alarms', parame).then(res => {
        msgview.hide(0);
        this.page.pagecount = res.page_count;
        this.page.totalCount = res.count;
        this.alarmList = res.items;
      }).catch(e => {
        msgview.hide(0);
        this.$wool.showwarn(e);
      })
    },
    searchByPage(p) {
      this.page.current = p.page;
      this.getAlarmList();
    },
    handleTime(op) {
      if (op == 'YE') {
        this.notSel = false;
        var time = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        this.dateTime = [time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' 00:00', time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' 23:59'];
        this.query();
      } else if (op == 'TD') {
        this.notSel = true;
        this.newTime();
        this.query();
      }
    },
    newTime() {
      //获取今天0点到现在得时间段
      var time = new Date()
      this.dateTime = [time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' 00:00', time.Format('y-M-d h:m')];
    }
  },

  mounted() {
    Date.prototype.Format = function (op) {
      let y = this.getFullYear();
      let mon = this.getMonth() + 1;
      mon = mon < 10 ? ("0" + mon) : mon;
      let d = this.getDate();
      d = d < 10 ? ("0" + d) : d;
      let h = this.getHours();
      h = h < 10 ? ("0" + h) : h;
      let m = this.getMinutes();
      m = m < 10 ? ("0" + m) : m;
      let s = this.getSeconds();
      s = s < 10 ? ("0" + s) : s;
      if (!op) {
        return y + '-' + mon + '-' + d + ' ' + h + ':' + m + ':' + s;
      } else {
        return y + '-' + mon + '-' + d + ' ' + h + ':' + m;
      }
    };
    this.newTime();
    this.query();
  }
}
</script>
<style lang="less" scoped>
.query_area {
  padding: 1%;
}

.refresh {
  display: inline-block;
  text-align: center;
  width: 60px;
  height: 34px;
  line-height: 34px;
  color: white;
  border-radius: 5px;
  background-color: #1862c6;
  cursor: pointer;
  font-size: 14px;
  margin-left: 1%;
}

.time_sel {
  // padding: 5px 0;
  text-align: center;
  border: solid 1px #DEDEDE;
  height: 26px;
}

.xiangqing {
  color: #3D83E5;
  cursor: pointer;
}

.query_button {

  margin-right: 1%;
}

.button_sel {
  background-color: white;
  color: #1862c6;
  border: 1px #1862c6 solid;
}
</style>
