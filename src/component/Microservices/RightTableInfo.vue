<template>
  <WoolShowmodal :isshow="isshow" @tapCloser="$emit('toggle')" :isshowcloser="true">
    <div class="rightTable">
      <div>
        <div class="titlebar flexlayout">
          <div>
            {{ servicename }} 服务权限表
          </div>
          <div class="explain-box">
            <div class="explain-icon"></div>
            <div class="explain-context">
              权限表描述微服务的访问权限规则。
              <p>规则项描述了微服务对调用方Access的访问控制，默认情况（未配置规则是）禁止所有访问。</p>
              &nbsp;&nbsp;- 规则项的名称与描述只是帮助记忆，无特殊意义；<br/>
              &nbsp;&nbsp;- 每个规则项的id、kind、group依次匹配调用方Access的id、kind、group；<br/>
              &nbsp;&nbsp;- 顺序匹配各个规则项，当匹配时，应用规则项的访问策略；<br/>
              <br/>
              &nbsp;&nbsp;!! 特殊：空规则项（未指定id、kind、group）仅匹配无调用方Access的情况
            </div>
          </div>
        </div>
        <div class="flexlayout flexlayout_middle" style="margin-top: 10px;font-size: 14px;">
          <span class="warn-note">提示：拖动可调换位置</span>
          <p style="padding-left: 10px;">是否打开拖动排序模式：</p>
          <CheckBox v-model="isAllowSort" :allowcheck="true"></CheckBox>
        </div>
      </div>
      <div class="rightInfo">
        <table class="tableDatil">
          <thead>
            <th>
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
                <div>访问id(access id)</div>
                <div class="explain-box">
                  <div class="explain-icon"></div>
                  <div class="explain-context">匹配调用方的'access id'，为空表示匹配任意'access id'</div>
                </div>
              </div>
            </th>
            <th>
              <div class="flex">
                <div>访问组(access group)</div>
                <div class="explain-box">
                  <div class="explain-icon"></div>
                  <div class="explain-context">匹配调用方的'access group'，为空表示匹配任意'access group'</div>
                </div>
              </div>
            </th>
            <th>
              <div class="flex">
                <div>描述</div>
                <div class="explain-box">
                  <div class="explain-icon"></div>
                  <div class="explain-context">规则项的说明性描述</div>
                </div>
              </div>
            </th>
            <th>
              <div class="flex">
                <div>访问类型</div>
                <div class="explain-box">
                  <div class="explain-icon"></div>
                  <div class="explain-context">匹配调用方的'access kind'，不指定表示匹配任意'access kind'</div>
                </div>
              </div>
            </th>
            <th >
              <div class="flex">
                <div>策略</div>
                <div class="explain-box">
                  <div class="explain-icon"></div>
                  <div class="explain-context">当调用方Access匹配此项时，将应用的访问策略</div>
                </div>
              </div>
            </th>
            <th>操作</th>
            <th v-show="isAllowSort"><div class="flex">排序</div></th>
          </thead>
          <WoolSortable tag="tbody" v-model="rightItems" @change="sortIndex" handle=".right-item-handle">
            <tr v-for="(item, indx) in rightItems" :key="indx">
              <td><input style="width: 100px;" type="text" class="smallTable-input" :title="item.name" v-model="item.name" :disabled="!(selectIdx == indx)" /></td>
              <td :title="item.access_id+'[双击复制]'" @dblclick="copy(item.access_id)">
                <div><input type="text" style="min-width: 200px;" class="smallTable-input" v-model="item.access_id" :disabled="!(selectIdx == indx)" /></div>
              </td>
              <td :title="item.access_group+'[双击复制]'" @dblclick="copy(item.access_group)" @click="showAssociate = !showAssociate">
                <div style="width: 250px;position: relative;">
                  <span style="color: #757575">{{ item.access_group_name }}</span>
                  <div class="flexlayout">
                    <input
                      type="text"
                      v-if="selectIdx == indx"
                      @keydown.enter="associateMerchant(item)"
                      class="smallTable-input"
                      v-model="item.access_group"
                      placeholder="回车搜索"
                      :disabled="!(selectIdx == indx)"
                      style="min-width: 200px;"
                    />
                    <div v-show="selectIdx == indx" style="padding-left: 5px;"><WoolShowLoading :isshow="isloading" color="#095280"></WoolShowLoading></div>
                  </div>
                  <div v-if="selectIdx != indx">
                    <span>{{ item.access_group }}</span>
                  </div>
                  <div class="merchants-associate wt-scroll" v-show="selectIdx == indx && showAssociate && merchantsList.length">
                    <ul>
                      <li @click="selectMerchant(item, m)" class="associate-item" v-for="(m, i) in merchantsList" :key="i">{{ m.id }}{{ m.name }}</li>
                    </ul>
                  </div>
                </div>
              </td>
              <td><input type="text" class="smallTable-input" :title="item.description" v-model="item.description" :disabled="!(selectIdx == indx)" /></td>
              <td>
                  <label class="radio" v-for="(type, idx) in accessKindTypes" :key="idx">
                    <input v-model="item.access_kind" type="radio" :name="indx" :value="type.value" :disabled="!(selectIdx == indx)" />
                    {{ type.name }}
                  </label>
              </td>
              <td>
                <!-- <CheckBox v-model="item.allow" :allowcheck="selectIdx == indx"></CheckBox> -->
                <label class="radio">
                  <input v-model="item.allow" type="radio" :name="'策略' + indx" :value="true" :disabled="!(selectIdx == indx)" />
                  允许
                </label>
                <label class="radio">
                  <input v-model="item.allow" type="radio" :name="'策略' + indx" :value="false" :disabled="!(selectIdx == indx)" />
                  拒绝
                </label>
              </td>
              <td>
                <div class="table-handle-box">
                  <span class="smallTable-handle" v-if="item.new" @click="save(item, indx, 'append')">保存</span>
                  <span class="smallTable-handle" v-if="item.new" @click="deleteRow(indx)">取消</span>
                  <span class="smallTable-handle" v-if="!item.new" @click="showRemoveModel(item, indx)">移除</span>
                  <span class="smallTable-handle" v-if="!item.new">
                    <span v-if="!(isshowSave && selectIdx == indx)" @click="replace(item, indx)">编辑</span>
                    <span v-if="isshowSave && selectIdx == indx" @click="save(item, indx, 'replace')">保存</span>
                  </span>
                  <span class="smallTable-handle" v-if="isshowSave && selectIdx == indx && !item.new" @click="cancelSave(indx)">取消</span>
                </div>
              </td>
              <td class="right-item-handle" v-show="isAllowSort"><img style="width:20px;margin-bottom: -5px;" src="../../assets/images/handle.png" /></td>
            </tr>
          </WoolSortable>

          <tfoot v-if="rightItems.length == 0">
            <tr><td colspan="8" class="table-warnning">暂无数据</td></tr>
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
  name: 'RightTableInfo',
  props: {
    isshow: {
      type: Boolean
    },
    servicename: {
      type: String
    }
  },
  components: {
    WoolShowmodal: () => import('../WoolShowmodal'),
    WoolSortable: () => import('../WoolSortable.vue'),
    CheckBox: () => import('../CheckBox.vue'),
    DeleteConfirmModel: () => import('../DeleteConfirmModel.vue'),
    WoolShowLoading: () => import('../WoolShowLoading.vue')
  },
  data() {
    return {
      isAllowSort: false,
      rightRuleItem: {},
      selectIdx: -1, //需要替换的indx
      rightTableOp: '',
      rightItems: [],
      isshowSave: false, // 展示保存按钮
      accessKindTypes: [
        {
          name: '服务',
          value: 'H'
        },
        {
          name: '用户',
          value: 'US'
        },
        {
          name: '不指定',
          value: ''
        }
      ],
      selectValue: 0,
      merchantsList: [],
      showAssociate: false,
      copyRightItems: [],
      isShowRemove: false,
      needRemoveObj: null,
      isloading: false
    };
  },

  methods: {
    showRemoveModel(item, index) {
      this.needRemoveObj = item;
      this.needRemoveObj.index = index;
      this.isShowRemove = true;
    },
    sortIndex(val) {
      this.rightTableOp = 'move';
      this.$set(this.rightRuleItem, 'from', val.oldIndex);
      this.$set(this.rightRuleItem, 'to', val.newIndex);
      if (this.rightItems[val.oldIndex].new || this.rightItems[val.newIndex].new) {
        this.selectIdx = val.newIndex;
        this.$wool.showwarn('存在新的一列未保存，不支持调用方法', 1000);
        return;
      }
      let opName = '移动';
      this.submitFrom(opName);
    },
    resetData() {
      this.rightRuleItem = {};
      this.selectIdx = -1;
      this.rightTableOp = '';
    },
    deleteRow(index) {
      this.rightItems.splice(index, 1);
      this.selectIdx = -1;
    },
    addRow() {
      let isHaveNew = false;
      this.rightItems.forEach(item => {
        if (item.new) {
          isHaveNew = true;
        }
      });
      if (isHaveNew) {
        this.$wool.showwarn('已存在新的一列！');
        return;
      }
      var newValue = {
        access_group: '',
        access_id: '',
        access_kind: '',
        description: '',
        marks: '',
        name: '',
        new: true,
        allow: true
      };
      this.rightItems.push(newValue);
      this.selectIdx = this.rightItems.length - 1;
    },
    remove() {
      let item = this.needRemoveObj;
      this.rightTableOp = 'remove';
      this.$set(this.rightRuleItem, 'remove_name', item.name);
      this.$set(this.rightRuleItem, 'index', item.index);
      this.isShowRemove = false;
      let opName = '移除';
      this.submitFrom(opName);
    },
    replace(item, idx) {
      this.selectIdx = idx;
      this.rightRuleItem.replaceName = item.name;
      this.$set(this.rightRuleItem, 'index', idx);
      this.isshowSave = true;
    },
    // 保存修改内容
    save(item, idx, op) {
      this.rightTableOp = op;
      this.$set(this.rightRuleItem, 'name', item.name);
      this.$set(this.rightRuleItem, 'access_id', item.access_id);
      this.$set(this.rightRuleItem, 'access_group', item.access_group);
      this.$set(this.rightRuleItem, 'description', item.description);
      this.$set(this.rightRuleItem, 'access_kind', item.access_kind);
      this.$set(this.rightRuleItem, 'allow', item.allow);
      let opName = '保存';
      this.submitFrom(opName);
    },
    cancelSave(idx) {
      this.rightItems[idx] = Object.assign({}, this.copyRightItems[idx]);
      this.selectIdx = -1;
    },
    submitFrom(opName) {
      var msgview = this.$wool.showloading(opName + '中');
      let url = '?method=/devops/gateway/right';
      let params = {
        op: this.rightTableOp,
        name: this.servicename,
        item: this.rightRuleItem
      };
      //请求数据
      this.$wf
        .post(url, params)
        //成功处理
        .then(data => {
          msgview.msgsucc(opName + '成功').hide(() => {
            this.requestRightList();
            this.resetData();
          });
        })
        //异常处理
        .catch(e => {
          msgview.msgwarn(e.message).hide();
        });
    },
    requestRightList() {
      this.copyRightItems = [];
      this.rightItems = [];
      var msgview = this.$wool.showloading('加载中');
      this.$wf
        .post('?method=/devops/gateway/right', {
          name: this.servicename
        })
        //成功处理
        .then(data => {
          msgview.hide(0);
          this.rightItems = data.items || [];
          this.copyRightItems = this.rightItems.map(item => {
            let obj = Object.assign({}, item);
            return obj;
          });
        })
        //异常处理
        .catch(e => {
          msgview.hide(0);
          this.$wool.showwarn(e.message);
        });
    },
    // 联想商家
    associateMerchant(item) {
      this.isloading = true;
      this.$wf
        .post('?method=/devops/gateway/merchants', {
          keywords: item.access_group
        })
        //成功处理
        .then(data => {
          this.showAssociate = true;
          this.merchantsList = data.items;
          this.isloading = false;
        })
        //异常处理
        .catch(e => {
          this.isloading = false;
          this.showAssociate = false;
          this.$wool.showwarn('联想商家出错了');
        });
    },
    selectMerchant(item, m) {
      this.$forceUpdate();
      item.access_group = m.id;
      item.access_group_name = m.name;
    },
    copy(text){
    if(null==text||0==text.length){
      return;
    }
    this.$wool.copyText(text);
    this.$wool.showsucc("复制");
  }
  },
  watch: {
    isshow(val) {
      if (val) {
        this.requestRightList();
      }
    }
  }
};
</script>

<style scoped="scoped">
.rightTable {
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
.access-kind-type {
  width: 140px;
}
.merchants-associate {
  position: absolute;
  height: 200px;
  overflow-y: auto;
  background-color: white;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
  text-align: left;
  z-index: 9999;
  min-width: 200px;
  padding: 20px;
  padding-left: 5px;
}
.merchants-associate > ul {
  list-style: none;
}
.associate-item {
  width: 200px;
  cursor: pointer;
  padding-left: 10px;
  margin-bottom: 10px;
}
.associate-item:hover {
  background-color: rgba(9, 82, 128, 0.5);
}
/* .rightInfo {
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
.right-item-handle {
  cursor: pointer;
  background-color: #ebf8f6;
  text-align: center;
}
</style>
