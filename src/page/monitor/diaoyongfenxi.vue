<template>
  <div class="container" v-loading="loading">
    <div class="left">
      <Left ref="left" @empty="init" :invoke="invoke"/>
    </div>
    <div class="right p-2">
      <right-top
          ref="righttop"
          style="border-bottom: 1px solid #e3ebf6"
          :search_time_type="search_time_type"
          :time_invoke="time_invoke"
          :response_time="response_time"
      />
      <right-bottom ref="rightbottom" :duration_type="duration_type" :start_time="start_time"
                    :end_time="end_time"/>
    </div>
  </div>
</template>

<script>
import Left from './components/diaoyongfenxi/left.vue'
import RightTop from './components/diaoyongfenxi/right_top.vue'
import RightBottom from './components/diaoyongfenxi/right_bottom.vue'
import moment from "moment";

import {mapMutations, mapState} from 'vuex'

export default {
  name: 'newxingnengzhibiao',
  components: {
    Left,
    RightTop,
    RightBottom
  },
  data() {
    return {
      loading: false,
      duration_type: [],
      search_time_type: [],
      invoke: [],
      time_invoke: [],
      response_time: [],
      start_time: '', //接口调用开始时间
      end_time: '', //接口调用结束时间
    }
  },
  computed: {
    ...mapState({
      service_name: state => state.diaoyongfenxi.service_name,
      service_no: state => state.diaoyongfenxi.service_no,
      method_name: state => state.diaoyongfenxi.method_name,
      getChart: state => state.diaoyongfenxi.getChart,
      time_type: state => state.diaoyongfenxi.time_type
    }),
  },
  watch: {
    getChart(newVal) {
      this.$nextTick(() => {
        if (newVal) this.getData()
      })
    },
    method_name(newVal) {
      if (newVal) {
        this.$refs.righttop.date = ''
        // this.SET_PARAMS({key: 'time_type', value: 0})
      }
    }
  },
  mounted() {
    this.getTracerConstant()
    this.init()
  },
  methods: {
    ...mapMutations([
      'SET_PARAMS',
      'CHANGE_GTECHART'
    ]),
    init() {
      this.invoke = []
      this.time_invoke = []
      this.response_time = []
      this.start_time = ''
      this.end_time = ''
      this.$refs.rightbottom.init()
    },
    getData() {
      let date = this.$refs.righttop.date
      // 若选了日期，则表格查询时间设置为整日，但不主动查询
      if (date) {
        let d = moment(date).format('YYYY-MM-DD')
        // this.$refs.rightbottom.date = [moment(d).format('YYYY-MM-DD HH:mm:ss'), moment(`${d} 23:59:59`).format('YYYY-MM-DD HH:mm:ss')]
        this.$refs.rightbottom.startTime = moment(d).format('YYYY-MM-DD HH:mm:ss')
        this.$refs.rightbottom.endTime = moment(`${d} 23:59:59`).format('YYYY-MM-DD HH:mm:ss')
      }
      this.$nextTick(() => {
        this.getApiInvokeInfo({
          service_name: this.service_name,
          service_no: this.service_no,
          date: date ? moment(date).format('YYYY-MM-DD') : ''
        })
      })
    },
    getApiInvokeInfo(data) {
      let params = JSON.parse(JSON.stringify(data))
      let url = 'devops?method=/devops/tracer/search_api_invoke_info'
      if (this.method_name) {
        url = 'devops?method=/devops/tracer/search_api_stat'
        params.start_time = this.start_time
        params.end_time = this.end_time
        params.method_name = this.method_name
        delete params.date
      } else {
        params.time_type = this.time_type
      }
      this.loading = true
      this.$wf.post(url, params).then(res => {
        let time_invoke = []
        let response_time = []
        this.start_time = ''
        this.end_time = ''
        this.$nextTick(() => {
          if (!this.method_name) {
            this.invoke = res.invoke_items || []
            this.start_time = moment(res.stat_view.start_time).format('YYYY-MM-DD HH:mm:ss')
            this.end_time = moment(res.stat_view.end_time).format('YYYY-MM-DD HH:mm:ss')
            time_invoke = res.stat_view.time_invoke_items
            response_time = res.stat_view.response_time_items
          } else {
            this.start_time = moment(res.start_time).format('YYYY-MM-DD HH:mm:ss')
            this.end_time = moment(res.end_time).format('YYYY-MM-DD HH:mm:ss')
            time_invoke = res.time_invoke_items
            response_time = res.response_time_items
          }
          if (time_invoke && time_invoke.length > 0) {
            time_invoke.forEach(item => {
              item.time = moment(item.time).format('HH:mm')
            })
          }
          this.time_invoke = time_invoke
          this.response_time = response_time
          this.loading = false
          this.CHANGE_GTECHART(false)
        })
      }).catch(() => {
        this.loading = false
        this.CHANGE_GTECHART(false)
      })
    },
    getTracerConstant() {
      this.$wf.post('devops?method=/devops/tracer/get_tracer_constant').then(res => {
        this.duration_type = res.duration_type || []
        this.search_time_type = res.search_time_type || []
        this.SET_PARAMS({key: 'search_time_type', value: res.search_time_type})
        if (res.search_time_type && res.search_time_type.length > 0) {
          this.SET_PARAMS({key: 'time_type', value: res.search_time_type[0].value})
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  .left {
    width: 20vw;
    height: 100vh;
    overflow-y: auto;
    border-right: 1px solid #e3ebf6;
  }

  .right {
    flex: 1;
    height: 100vh;
    overflow-y: auto;
    box-sizing: border-box;
  }
}
</style>
