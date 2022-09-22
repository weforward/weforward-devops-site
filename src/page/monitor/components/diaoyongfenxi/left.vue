<template>
  <div class="left_wrap">
    <div>
      <div style="padding: 22px 15px 0 0;border-bottom: 1px solid #e3ebf6">
        <el-form :model="form" label-width="50px">
          <el-form-item label="服务">
            <el-select v-model="form.service_name" style="width:100%" filterable clearable @change="serveChange">
              <el-option v-for="(item,index) in serveOption" :value="item" :label="item" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="实例">
            <el-select v-model="form.service_no" style="width:100%" filterable clearable @change="noChange">
              <el-option v-for="(item,index) in shiliOption" :value="item.no" :label="item.no" :key="index"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div>
        <div style="padding: 10px">
          <el-input prefix-icon="el-icon-search" v-model="searchVal"></el-input>
        </div>
      </div>
    </div>
    <div class="left_bottom">
      <div v-for="(item,index) in filterInvoke" :class="{active:method_name === item.name}" :key="index"
           class="rowBC" style="cursor: pointer;padding:5px"
           @click="invokeSearch(item.name)">
        <div class="invoke_name" :title="item.name">{{ item.name }}</div>
        <el-tag>{{ item.count }}</el-tag>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
  props: {
    invoke: Array
  },
  data() {
    return {
      form: {
        service_name: '',
        service_no: '',
      },
      serveOption: [],
      shiliOption: [],
      searchVal: '',
    }
  },
  mounted() {
    this.getServeData()
  },
  computed: {
    ...mapState({
      method_name: state => state.diaoyongfenxi.method_name,
      time_type: state => state.diaoyongfenxi.time_type,
      search_time_type: state => state.diaoyongfenxi.search_time_type
    }),
    filterInvoke() {
      let data = []
      if (this.searchVal) {
        data = this.invoke.filter(item => item.name.includes(this.searchVal))
      } else {
        data = this.invoke
      }
      return data
    }
  },
  watch: {
    form: {
      handler(newVal) {
        if (!newVal.service_no || newVal.service_name) {
          this.$emit('empty')
          this.SET_PARAMS({key: 'method_name', value: ''})
        }
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations([
      'SET_PARAMS',
      'CHANGE_GTECHART',
    ]),
    getServeData() {
      this.$wf.post('devops?method=/devops/metrics/ms_name_tags').then(res => {
        this.serveOption = res
      })
    },
    serveChange(e) {
      this.form.service_no = ''
      this.shiliOption = []
      this.SET_PARAMS({key: 'service_no', value: ''})
      if (e) {
        this.$wf.post('devops?method=/devops/gateway/service_details', {name: e}).then(res => {
          this.shiliOption = res
          // 如果实例仅有一个选项直接触发noChange
          if (res && res.length === 1) {
            this.form.service_no = res[0].no
            this.noChange(res[0].no)
          }
        })
      }
      this.SET_PARAMS({key: 'service_name', value: e || ''})
    },
    noChange(e) {
      if (e) {
        this.CHANGE_GTECHART(true)
      }
      this.SET_PARAMS({key: 'service_no', value: e || ''})
    },
    invokeSearch(method_name) {
      if (!this.time_type) {
        this.SET_PARAMS({key: 'time_type', value: this.search_time_type[this.search_time_type.length - 1].value})
      }
      this.SET_PARAMS({
        key: 'method_name',
        value: (this.method_name === method_name || method_name === '--all--') ? '' : method_name
      })
      this.CHANGE_GTECHART(true)
    }
  },
}
</script>

<style lang="less" scoped>
.left_wrap {
  display: flex;
  flex-direction: column;
  height: 100%;

  .left_bottom {
    width: 100%;
    flex: 1;
    padding: 5px 0;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .invoke_name {
    font-size: 12px;
    color: #3B506C;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .active {
    background: #c8eeff;
  }

  /deep/ .el-tag {
    color: #1862c6
  }
}
</style>
