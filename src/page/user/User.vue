<template>
  <div class="zhuti_area">
    <div class="query">
      关键字：<input type="text" class="keyword_input" @keydown.enter="query" v-model="keyword" placeholder="请输入关键字进行搜索">
      <div class="query_button" @click="query">查询</div>
    </div>
    <table class="table_area">
      <thead class="table_thead">
        <td class="table_td">ID</td>
        <td class="table_td">名称</td>
      </thead>
      <tbody>
        <tr v-for="(item,index) in userList" :key="index">
          <td class="table_td">{{item.id || '--'}}</td>
          <td class="table_td">{{item.name || '--'}}</td>
        </tr>
      </tbody>
    </table>
    <PagerBar v-if="userList.length!=0" :page="page" @change="searchByPage" style="margin-bottom:2%;"></PagerBar>
    <div v-if="userList.length==0" class="table_td" style="text-align:center;"><span>暂无数据</span> </div>
  </div>
</template>
<script>
export default {
  name: 'User',
  components:{
    PagerBar:()=>import('../../component/PagerBar'),
  },
  data(){
    return{
      keyword: '',
      userList: [],
      page: { 
        current: 1, 
        pagecount: 1, 
        totalCount: 0, 
        pagesize: 10,
      },
    }
  },
  methods:{
    query(){
      this.page.current=1;
      this.getUserList();
    },
    searchByPage(p){
      this.page.current=p.page;
      this.getUserList();
    },
    getUserList(){
      let parame={
        k: this.keyword,
        page: this.page.current,
        page_size: this.page.pagesize
      };
      var msgView=this.$wool.showloading('加载中...');
      this.$wf.post('devops?method=/devops/home/users',parame)
      .then(data=>{
        msgView.hide(0);
        this.userList=data.items;
        this.page.current=data.page;
        this.page.totalCount=data.count;
        this.page.pagecount=data.page_count;
        // console.log(data)
      }).catch(e=>{
        msgView.hide(0);
        this.$wool.showwarn(e);
      })
    }
  },
  mounted(){
    this.getUserList();
  }
}
</script>
<style lang="less" scoped>
.query{
  margin-left: 1%;
  padding: 12px 0;
}
.query_button{
  margin-left: 1%;
}
</style>