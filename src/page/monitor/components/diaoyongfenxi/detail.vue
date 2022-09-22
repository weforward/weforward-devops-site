<template>
  <div>
    <el-dialog
        :title="serviceDetail.service_name"
        :visible.sync="show"
        width="80%"
        :before-close="handleClose"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :append-to-body="true"
    >
      <div class="wrap columnSS">
        <!--        接口调用信息-->
        <div class="rowSC pb-3" style="border-bottom: 1px solid #e3ebf6;width:100%">
          <div class="rowSC mr-2">
            <span class="key">持续时间：</span>
            <span class="value">{{ serviceDetail.duration }}</span>
          </div>
          <div class="rowSC mr-2">
            <span class="key">服务数：</span>
            <span class="value">{{ serviceDetail.services }}</span>
          </div>
          <div class="rowSC mr-2">
            <span class="key">深度：</span>
            <span class="value">{{ serviceDetail.depth }}</span>
          </div>
          <div class="rowSC mr-2">
            <span class="key">追踪ID：</span>
            <span class="value">{{ serviceDetail.id }}</span>
          </div>
        </div>
        <div class="rowSS bottom">
          <div class="left col-flex-5 py-2">
            <div class="tree_wrap">
              <el-tree
                  :data="serviceDetail.root"
                  :props="defaultProps"
              >
              <span slot-scope="{node,data}">
                <el-tag type="danger" size="mini" @click="clickNode(data)">{{ data.service_name }}</el-tag>
                <el-tag class="ml-1">{{ data.method }}[{{ data.duration_num }}ms]</el-tag>
              </span>
              </el-tree>
            </div>
          </div>
          <div class="right col-flex-7 p-2">
            <div class="service_name pb-2 mb-2">
              {{ itemData.service_name }}
            </div>
            <div>
              <div class="mb-1">进入网关</div>
              <ul>
                <li class="rowSS p-1 li">
                  <div class="col-flex-6">开始时间</div>
                  <div class="col-flex-6">{{ changeDate(itemData.gw_start_time) || '--' }}</div>
                </li>
              </ul>
            </div>
            <div>
              <div class="mt-2 mb-1">进入服务</div>
              <ul>
                <li class="rowSS p-1 li">
                  <div class="col-flex-6">开始时间</div>
                  <div class="col-flex-6">{{ changeDate(itemData.ms_start_time) || '--' }}</div>
                </li>
                <li class="rowSS p-1 li">
                  <div class="col-flex-6">基准时间</div>
                  <div class="col-flex-6">{{ itemData.ms_start_relative_time || '--' }}</div>
                </li>
              </ul>
            </div>
            <div>
              <div class="mt-2 mb-1">离开服务</div>
              <ul>
                <li class="rowSS p-1 li">
                  <div class="col-flex-6">开始时间</div>
                  <div class="col-flex-6">{{ changeDate(itemData.ms_end_time) || '--' }}</div>
                </li>
                <li class="rowSS p-1 li">
                  <div class="col-flex-6">基准时间</div>
                  <div class="col-flex-6">{{ itemData.ms_end_relative_time || '--' }}</div>
                </li>
              </ul>
            </div>
            <div>
              <div class="mt-2 mb-1">离开网关</div>
              <ul>
                <li class="rowSS p-1 li">
                  <div class="col-flex-6">开始时间</div>
                  <div class="col-flex-6">{{ changeDate(itemData.gw_end_time) || '--' }}</div>
                </li>
                <li class="rowSS p-1 li">
                  <div class="col-flex-6">基准时间</div>
                  <div class="col-flex-6">{{ itemData.gw_end_relative_time || '--' }}</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";

export default {
  data() {
    return {
      id: '',
      show: false,
      serviceDetail: {
        root: []
      },
      itemData: {},
      defaultProps: {
        children: 'children',
        label: 'service_name'
      }
    }
  },
  methods: {
    init(id) {
      this.show = true
      this.id = id;
      this.serviceDetail = {root: []}
      this.itemData = {}
      this.$nextTick(() => {
        this.getData()
      })
    },
    getData() {
      this.$wf.post('devops?method=/devops/tracer/get', {id: this.id}).then(res => {
        let d = res;
        d.root = d.root ? [d.root] : []
        this.serviceDetail = d
        if (d.root && d.root.length > 0) {
          this.itemData = d.root[0]
        }
      })
    },
    clickNode(e) {
      this.itemData = e
    },
    handleClose() {
      this.show = false
    },
    changeDate(v) {
      return (v && v !== '--') ? moment(v).format('YYYY-MM-DD HH:mm:ss.SSS') : ''
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-dialog {
  margin-top: 5vh !important;
}

.wrap {
  height: 75vh;

  .bottom {
    width: 100%;
    flex: 1;

    .left {
      height: 68vh;
      box-sizing: border-box;
      overflow: hidden;
      border-right: 1px solid #e3ebf6;

      .tree_wrap {
        height: 100%;
        overflow-y: auto;
      }
    }

    .right {
      height: 100%;
      box-sizing: border-box;
      overflow-y: auto;

      .service_name {
        font-size: 20px;
        font-weight: bold;
        border-bottom: 1px solid #e3ebf6;
      }

      ul {
        background: #ededed;
        border-radius: 5px;
      }
    }
  }
}
</style>
