<template>
  <div class="rlogdetail wt-scroll" ref="rlogdetail">
    <div class="rlogdetail-content" ref="rlogcontent"><pre v-html="content" class="rlogdetail-body"></pre></div>
    <div style="bottom:600px;" class="rlogdetail-btn">{{page.current}}</div>
    <div class="top rlogdetail-btn" v-show="!issearch" @click="topPage" :class="{ disabled: page.current == 1 }">最前</div>
    <div class="pre rlogdetail-btn" v-show="!issearch" @click="lastPage" :class="{ disabled: page.current == 1 }">上</div>
    <div class="next rlogdetail-btn" v-show="!issearch" @click="nextPage" :class="{ disabled: page.pageCount == page.current }">下</div>
    <div class="bottom rlogdetail-btn" v-show="!issearch" @click="bottomPage" :class="{ disabled: page.pageCount == page.current }">最后</div>
    <div class="search-keyword rlogdetail-btn" v-show="!issearch" @click="issearch = !issearch">搜索</div>
    <div class="flexlayout searchbar" v-show="issearch">
      <input class="searchbar-input flexitem_auto" @keydown.enter="pre" type="text" placeholder="输入关键字查找" v-model="keywords" />
      <div class="searchbtn lastbtn" @click="pre">上一个</div>
      <div class="searchbtn nextbtn" @click="next">下一个</div>
      <div class="hide-search" @click="issearch = !issearch">隐藏</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'rlogdetail',
  data() {
    return {
      server: this.$route.query.s,
      catalog: this.$route.query.d,
      op: '',
      keywords: '',
      detailList: [],
      page: { current: -1, pageCount: 0, totalCount: 0, pageSize: 0 },
      isNext: false,
      issearch: false,
      searchindex: -1,
      content: '',
      originContent: '',
      isFirstCheck: true // 是否第一次点击上一个
    };
  },
  methods: {
    getDetail(op) {
      let url = '?method=/devops/rlog/detail';
      let msgview = this.$wool.showloading('正在加载');
      let params = {
        server: this.server,
        directory: this.catalog,
        op: this.op,
        keywords: this.keywords,
        // page: this.page.current
      };
      if (this.page.current > 0) {
        params.page = this.page.current;
      }
      //请求数据
      this.$wf
        .post(url, params)
        //成功处理
        .then(data => {
          if (!data.content) {
            msgview.msgwarn('没有更多了').hide();
            return;
          }
          msgview.hide();
          this.page.pageCount = data.page_count;
          this.page.current = data.page;

          this.content = data.content;
          this.originContent = data.content;
          if (op) {
            this.isFirstCheck = true;
            this.performsearch(op, false);
          }
        })
        //异常处理
        .catch(e => {
          msgview.msgwarn(e.message).hide();
        });
    },
    topPage(){
      this.page.current=1;
      this.op = 'first';
      this.keywords = '';
      this.getDetail();
    },
    lastPage() {
      if (this.page.current == 1) {
        return;
      }
      this.op = 'pre';
      this.keywords = '';
      this.getDetail();
      this.$nextTick(()=>{
        this.$refs.rlogdetail.scrollTop =this.$refs.rlogdetail.scrollHeight;
      })
      
    },
    nextPage() {
      if (this.page.current == this.page.pageCount) {
        return;
      }
      this.keywords = '';
      this.op = 'next';
      this.getDetail();
      this.$refs.rlogdetail.scrollTo(0,0)
    },
    bottomPage(){
      this.page.current = this.page.pageCount;
      this.keywords = '';
      this.op = 'last';
      this.getDetail();
    },
    pre() {
      this.performsearch('pre', true);
    },
    next() {
      this.performsearch('next', true);
    },
    performsearch(op, isUser) {
      //isUser是否用户点击操作
      // this.$refs.rlogdetail.scrollTo(0,0)
      let mcontent = this.originContent;
      var idx;

      //输入的关键字trim去头尾空格
      var keyword = this.keywords.trim();
      
      if ( (!isUser && op == 'next') ) {
        this.searchindex = -1;
      }
      if (op == 'pre') {
        if (this.isFirstCheck) {
          this.searchindex = mcontent.length;
          this.isFirstCheck = false;
        } else {
          this.searchindex = this.searchindex - keyword.length;
        }
        //关键字最后出现的位置
        idx = mcontent.lastIndexOf(keyword, this.searchindex);
      } else {
        this.searchindex = this.searchindex + keyword.length;
        idx = mcontent.indexOf(keyword, this.searchindex);
      }
      if (idx != -1) {
        this.searchindex = idx;
        //将原字符串切割分成关键字之前区域、关键字区域和关键字之后区域，再拼接；
        let content =
          mcontent.substring(0, idx) +
          "<span id='serach-span' style='color: yellow;font-weight: bold;'>" +
          keyword +
          '</span>' +
          mcontent.substring(this.searchindex + keyword.length, mcontent.length);
        this.content = content;
        //需要在Dom渲染完后再操作dom
        this.$nextTick(()=>{
          let span = document.getElementById('serach-span');
          if (span && span.offsetTop) {
            this.$refs.rlogdetail.scrollTo({
              top: span.offsetTop - 500,
              behavior: 'smooth'
            });
          }
        })
        
      } else {
        if (op == 'pre') {
          this.searchindex = this.searchindex + keyword.length;
          if (!this.keywords) {
            return;
          }
          if (this.page.current == 1) {
            this.$wool.showwarn('没有更多了');
            return;
          }
          
          this.op = 'pre';
        } else {
          this.searchindex = this.searchindex - keyword.length;
          if (!this.keywords) {
            return;
          }
          if (this.page.current == this.page.pageCount) {
            this.$wool.showwarn('没有更多了');
            return;
          }
          
          this.op = 'next';
        }
        // if (isUser) {
        this.getDetail(op);
        // }
      }
    }
  },
  mounted() {
    this.getDetail();
  }
};
</script>

<style scoped="scoped">
.rlogdetail {
  background-color: #322348;
  color: #cbbde2;
  
  height: 100vh;
  font-size: 14px;
  /* padding-bottom: 100px; */
}
.rlogdetail-content {
  margin-bottom: 50px;
  padding-bottom: 60px;
  -webkit-transition: color 0.5s;
  transition: color 0.5s;
  padding: 0 8px;
  /* width: 100vw; */
}
.rlogdetail-body {
  /* width: 80%; */
  /* padding: 10px 16px; */
  white-space: pre-wrap !important; /* css3.0 */
  white-space: -moz-pre-wrap; /* Firefox */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word; /* Internet Explorer 5.5+ */
  /* overflow: hidden; */
}
.rlogdetail-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  text-align: center;
  line-height: 45px;
  font-size: 12px;
  background-color: #563d7c;
  color: #ffe484;
  cursor: pointer;
  position: fixed;
  right: 10px;
}
.rlogdetail-btn.disabled {
  background-color: #cbbde2;
  color: #676767;
}
.top{
  bottom: 310px;
}
.pre {
  bottom: 240px;
}
.next {
  bottom: 170px;
}
.bottom{
  bottom: 100px;
}
.search-keyword {
  bottom: 30px;
}
.searchbar-input {
  /* width: 200px; */
  text-indent: 5px;
  font-size: 12px;
  height: 41px;
  background-color: transparent;
  color: white;
  border: 1px solid #214156;
  box-sizing: border-box;
  border-radius: 3px 0 0 3px;
  outline: none;
}
.searchbar {
  font-size: 12px;
  float: right;
  /* display: inline-block; */
  width: 30%;
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: #021827;
  padding: 5px;
  margin-left: 68%;
  /* box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none; */
}
.searchbtn {
  width: 60px;
  text-align: center;
  line-height: 40px;
  color: yellow;
  margin-left: 3px;
  box-sizing: border-box;
  background-color: rgba(33, 65, 86, 0.84);
  cursor: pointer;
}
.hide-search {
  width: 50px;
  text-align: center;
  line-height: 40px;
  color: yellow;
  margin-left: 3px;
  box-sizing: border-box;
  background-color: rgba(33, 65, 86, 0.84);
  cursor: pointer;
}
.rlogdetail-content > section > span {
  color: red !important;
}
</style>
