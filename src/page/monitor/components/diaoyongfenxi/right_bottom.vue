<template>
  <div class="pt-2">
    <div class="rowSS filter_wrap">
      <div class="rowSC mr-2">
        <span class="font_14" style="white-space: nowrap">时间：</span>
        <el-date-picker
            v-model="date"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="mini"
        >
        </el-date-picker>
      </div>
      <div class="rowSC mr-2">
        <span class="font_14 flex-1" style="white-space: nowrap">追踪ID：</span>
        <el-input size="mini" v-model="id" type="text" placeholder="请输入"></el-input>
      </div>
      <div class="rowSC mr-2">
        <span class="font_14" style="white-space: nowrap">耗时：</span>
        <el-select v-model="time" filterable size="mini"
        >
          <el-option :value="0" label="请选择"></el-option>
          <el-option v-for="(item,index) in durationType" :key="index" :value="item.value"
                     :label="item.name"></el-option>
        </el-select>
      </div>
      <el-button type="primary" size="mini" :loading="loading" @click="getData">查 询
      </el-button>
    </div>
    <el-table
        :data="tableData"
        class="mt-2"
        :header-cell-style="{
          background: 'rgb(240, 242, 245)',
          'text-align': 'left'
        }"
        :height="tableHeight"
        :default-expand-all="false"
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-tag type="danger" v-for="(item,index) in scope.row.children" class="ml-1 mb-1" :key="index">
            {{ item.name + '(' + item.num + ')' + '.' + scope.row.method }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
          v-for="(item,index) in field"
          :key="index"
          :prop="item.key"
          :label="item.label"
          :width="item.width ? item.width : ''"
      >
        <template slot-scope="scope">
          <span>
            <template v-if="item.handle">
              {{ item.handle(scope.row[item.key]) }}
            </template>
            <template v-else>
              {{ scope.row[item.key] }}
            </template>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60px">
        <template slot-scope="scope">
          <el-button type="text" @click="checkDetails(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="mt-2 text-right pager">
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageIndex"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper, slot"
          :total="totalRowsAmount"
      >
      </el-pagination>
    </div>
    <Detail ref="detail"/>
  </div>
</template>

<script>
import moment from "moment";
import Detail from './detail.vue'
import {mapMutations, mapState} from "vuex";

export default {
  components: {Detail},
  props: {
    duration_type: {
      type: Array,
      default: () => []
    },
    start_time: [String, Number, Date],
    end_time: [String, Number, Date]
  },
  mounted() {
    let lrt = document.getElementsByClassName('left_top_wrap')[0].clientHeight
    let filter = document.getElementsByClassName('filter_wrap')[0].clientHeight
    let thead = document.getElementsByClassName('el-table__header-wrapper')[0].clientHeight
    let pager = document.getElementsByClassName('pager')[0].clientHeight
    this.tableHeight = window.innerHeight - lrt - filter - thead - pager - 105 + 'px'
  },
  data() {
    let date = Date.parse(new Date())
    return {
      tableHeight: null,
      loading: false,
      date: [moment(date - 60).format('YYYY-MM-DD HH:mm:ss'), moment(date).format('YYYY-MM-DD HH:mm:ss')],
      id: '',
      time: 0,
      tableData: [],
      totalRowsAmount: 0,
      pageSizes: [10, 20, 30, 40, 50],
      pageSize: 10,
      pageIndex: 1,
      field: [{
        label: '方法名',
        key: 'method',
      }, {
        label: '追踪ID',
        key: 'id',
      }, {
        label: '开始时间',
        key: 'start_time',
        handle: res => {
          return moment(res).format('YYYY-MM-DD HH:mm:ss')
        }
      }, {
        label: '持续时间',
        key: 'duration',
      }]
    }
  },
  computed: {
    ...mapState({
      service_name: state => state.diaoyongfenxi.service_name,
      service_no: state => state.diaoyongfenxi.service_no,
      method_name: state => state.diaoyongfenxi.method_name,
    }),
    durationType() {
      return this.duration_type.reverse()
    }
  },
  watch: {
    start_time(newVal) {
      this.date = [this.start_time, this.end_time]
      this.tableData = []
    },
    service_no(newVal) {
      if (!newVal) {
        this.init()
      }
    },
    date(newVal) {
      if (!newVal) {
        let date = Date.parse(new Date())
        this.date = [moment(date - 60).format('YYYY-MM-DD HH:mm:ss'), moment(date).format('YYYY-MM-DD HH:mm:ss')]
      }
    },
  },
  methods: {
    ...mapMutations(['CHANGE_GETTABLE']),
    init() {
      let date = Date.parse(new Date())
      this.pageIndex = 1
      this.tableData = []
      this.id = ''
      this.date = [moment(date - 60).format('YYYY-MM-DD HH:mm:ss'), moment(date).format('YYYY-MM-DD HH:mm:ss')]
      this.time = 0
    },
    getData() {
      if (!this.service_name && !this.service_no) {
        this.$message.warning('请选择服务和实例')
        return
      }
      this.loading = true
      let data = {
        duration_type: this.time,
        page: this.pageIndex,
        page_size: this.pageSize,
        begin: new Date(this.date[0]),
        end: new Date(this.date[1]),
        method: this.method_name || '',
        service_name: this.service_name,
        service_no: this.service_no,
        id: this.id
      }
      this.$wf.post('devops?method=/devops/tracer/search', data).then(res => {
        this.tableData = res.items || []
        this.totalRowsAmount = res.count
        this.loading = false
        this.CHANGE_GETTABLE(false)
      }).catch(() => {
        this.loading = false
        this.CHANGE_GETTABLE(false)
      })
    },
    handleSizeChange(e) {
      this.pageSize = e
      this.getData()
    },
    handleCurrentChange(e) {
      this.pageIndex = e
      this.getData()
    },
    checkDetails(e) {
      this.$refs.detail.init(e.id)
    }
  }
}
</script>

<style lang="less">
.el-tree-node__content{
  margin-bottom: 10px;
  height: auto;
}
</style>
