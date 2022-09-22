<template>
  <div class="left_top_wrap">
    <div>
      <el-tag v-for="(item,index) in search_time_type" :key="index" effect="plain"
              :type="time_type === item.value ? 'primary':'info'" :class="{active:time_type === item.value}"
              class="mr-1 pointer"
              @click="changeTime(item.value)">{{ item.name }}
      </el-tag>
      <el-date-picker
          v-model="date"
          size="small"
          type="date"
          format="yyyy-MM-dd"
          placeholder="选择日期"
          :pickerOptions="pickerOptions"
          @change="dateChange"
      >
      </el-date-picker>
    </div>
    <div class="rowBS" style="position:relative;">
      <div class="col-flex-6 chart" ref="chart1"></div>
      <div class="col-flex-6 chart" ref="chart2"></div>
      <div class="none" v-show="time_invoke.length === 0 && response_time.length === 0">
<!--        <el-empty></el-empty>-->
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {mapMutations, mapState} from 'vuex'

export default {
  props: {
    search_time_type: Array,
    time_invoke: {
      type: Array,
      default: () => []
    },
    response_time: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      date: '',
      line: '',
      bar: '',
      pickerOptions: {
        disabledDate: time => {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  computed: {
    ...mapState({
      service_name: state => state.diaoyongfenxi.service_name,
      service_no: state => state.diaoyongfenxi.service_no,
      time_type: state => state.diaoyongfenxi.time_type
    }),
  },
  watch: {
    time_invoke: {
      handler(newVal, oldVal) {
        let xData = [],
            yData = []
        if (newVal.length > 0) {
          xData = newVal.map(item => item.time)
          yData = newVal.map(item => item.count)
          this.drawLine(xData, yData)
        } else {
          if (this.line) {
            this.drawLine()
          }
        }
      },
      deep: true,
    },
    response_time: {
      handler(newVal, oldVal) {
        let xData = [],
            yData = []
        if (newVal.length > 0) {
          xData = newVal.map(item => `${item.type}\n\n${item.percent}`)
          yData = newVal.map(item => item.count)
          this.drawBar(xData, yData)
        } else {
          if (this.bar) {
            this.drawBar()
          }
        }
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations([
      'SET_PARAMS',
      'CHANGE_GTECHART'
    ]),
    dateChange(e) {
      if (!this.service_name || !this.service_no) {
        this.$message.warning('请选择服务和实例')
        this.date = ''
        return
      }
      if (e) {
        this.SET_PARAMS({key: 'time_type', value: 0})
      } else {
        this.SET_PARAMS({key: 'time_type', value: this.search_time_type[0].value})
      }
      this.SET_PARAMS({key: 'method_name', value: ''})
      this.CHANGE_GTECHART(true)
    },
    changeTime(e) {
      if (!this.service_name || !this.service_no) {
        this.$message.warning('请选择服务和实例')
        this.date = ''
        return
      }
      if (e === this.time_type) return
      this.SET_PARAMS({key: 'method_name', value: ''})
      this.SET_PARAMS({key: 'time_type', value: e})
      this.date = ''
      this.CHANGE_GTECHART(true)
    },
    drawLine(xData = [], yData = []) {
      this.line = echarts.init(this.$refs.chart1)
      let option = {
        color: ['#1862c6'],
        dataZoom: {
          start: 0,
          type: "inside"
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xData,
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false, //隐藏y轴
          },
          name: '单位(次)'
        },
        series: [
          {
            data: yData,
            type: 'line',
            areaStyle: {}
          }
        ]
      }
      this.line.setOption(option)
    },
    drawBar(xData = [], yData = []) {
      this.bar = echarts.init(this.$refs.chart2)
      let option = {
        color: ['#1862c6'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        xAxis: {
          type: 'category',
          data: xData,
          axisLabel: {
            interval: 0,
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false, //隐藏y轴
          },
        },
        series: [
          {
            data: yData,
            label: {
              show: true,
              position: 'top',
              color: '#000'
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {offset: 0, color: '#5b90d6'},
                {offset: 1, color: '#1862c6'},
              ])
            },
            barMaxWidth: '30px',
            type: 'bar'
          }
        ]
      }
      this.bar.setOption(option)
    }
  },
}
</script>

<style lang="less" scoped>
.pointer {
  cursor: pointer;
}

.chart {
  height: 30vh;
}

.none {
  width: 100%;
  height: 30vh;
  background: #f9fbfd;
  position: absolute;
  top: 0;
  left: 0
}

/deep/ .active {
  border-color: #1862c6;
  color: #1862c6;
}

</style>
