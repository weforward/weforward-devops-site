<template>
	<div class="rlog">
		<div class="rlog-errmsg"></div>
		<div class="flexlayout">
			<section class="catalog wt-scroll">
				<ul>
					<li class="catalog-title ">目录</li>
					<li class="catalog-item" :class="{ 'catalog-item-checked': curMuluIndex==index }" v-for="(item,index) in muluList" :key='index'>
						<div class="flexlayout" @click="getThemeList(index,item.name)">
							<div class="catalog-name">{{item.name}}</div>
							<div class="catalog-num">{{item.num}}</div>
						</div>
						<div class="flexlayout">
							<div class="catalog-item-detail" @click="goToDetailLog(item.name)">完整日志</div>
							<div style="flex: 1;" @click="getThemeList(index,item.name)"></div>
						</div>
					</li>
				</ul>
				<div class="rlog-input-page">
					第
					<input min="1" type="number" @click="changeMuluPage" v-model="muluPage"/>
					页
				</div>
			</section>
			<section class="theme wt-scroll">
				<ul>
					<li class="theme-title">ERROR部分</li>
					<li
						class="theme-item"
						@click="getThemeContent(index,item.id)"
						:class="{ 'theme-item-checked': curThemeIndex == index }"
						v-for="(item,index) in themeList"
            :key="index"
					>
						<div class="theme-content">
							<div class="theme-time">{{item.create_time}}</div>
							<div class="theme-name">{{item.name}}</div>
						</div>
					</li>
				</ul>
				<div class="rlog-input-page">
					第
					<input min="1" max="" type="number" @click="changeThemeNum" v-model="themePage"/>
					页
				</div>
			</section>
			<section class="content wt-scroll">
				<div >
					<div class="content-title theme-content" >
						{{themeContent.subject.name}}&ensp;{{themeContent.subject.create_time}}
					</div>
					<div style="padding-left:10px"> <span style="color:red">●</span>
          <span style="color:#FFC000">●</span>
          <span style="color:#2E75B6">●</span></div>
					<pre class="content-body">
            {{themeContent.body}}</pre>
				</div>
			</section>
		</div>
	</div>
</template>

<script>
export default {
	name: 'examplelog',
	data() {
		return {
      muluList:[],
      muluDirectory: '',
      curMuluIndex: 0,
      muluPage: 1,
      prePage1: 1,
      themeList: [],
      curThemeIndex: 0,
      themePage: 1,
      prePage: 1,
      themeContent: {
        body: '',
        subject:{
          create_time: '',
          name: ''
        }
      }
		};
	},
	watch: {
		muluPage(val){
      this.themeList=[]
      Object.keys(this.themeContent).forEach(key=>{this.themeContent[key]=''})
			// this.selectContent = {};
			this.getMuluList();
    },
    // themePage(newval,val){

    //   // if(newval>val){
    //   //   this.themePage=this.themePage-1;

    //   // }else if(newval<val){
    //   //   this.themePage=this.themePage+1;
    //   // }
    //     // console.log(newval)
    //     // console.log(val)
      
    //   this.getThemeList(this.curMuluIndex,this.muluDirectory);
    // },
    muluList(){
      if(this.muluList.length!=0) this.getThemeList(0,this.muluList[0].name);
    },
    themeList(){
      if(this.themeList.length!=0) this.getThemeContent(0,this.themeList[0].id)
    }
	},
	methods: {
    changeThemeNum(){
      if(this.themePage>this.prePage){
        if(this.prePage==1){
          this.themePage=1;
          this.themePage=this.prePage
        }else{
          this.themePage=this.prePage-1;
          this.prePage=this.themePage;
        }
      }else{
        this.themePage=this.prePage+1;
        this.prePage=this.themePage;
      }
      this.getThemeList(this.curMuluIndex,this.muluDirectory);
    },
    changeMuluPage(){
      if(this.muluPage>this.prePage1){
        if(this.prePage1==1){
          this.muluPage1=1;
          this.muluPage=this.prePage1;
        }else{
          this.muluPage=this.prePage1-1;
          this.prePage1=this.themePage1;
        }
      }else{
        this.muluPage=this.prePage1+1;
        this.prePage1=this.muluPage;
      }
      this.themeList=[]
      Object.keys(this.themeContent).forEach(key=>{this.themeContent[key]=''})
			// this.selectContent = {};
			this.getMuluList();
    },
    getMuluList(){
      let msgview = this.$wool.showloading('正在加载目录');
      let parame={
        page: this.muluPage,
        server: this.$route.query.app_log
      }
      this.$wf.post('devops?method=/devops/rlog/directorys',parame).then(res=>{
        msgview.hide(0);
        // console.log(res)
        this.muluList=res.items
      })
      .catch(e=>{
        msgview.hide(0);
        this.$wool.showwarn(e)
      })
    },
    getThemeList(index,directory){
      this.curMuluIndex=index;
      this.curThemeIndex=0;
      Object.keys(this.themeContent).forEach(key=>{this.themeContent[key]=''})
      this.muluDirectory=directory;
      let msgview = this.$wool.showloading('正在加载主题');
      let parame={
        page: this.themePage,
        directory,
        server: this.$route.query.app_log
      }
      this.$wf.post('devops?method=/devops/rlog/subjects',parame)
				.then(res => {
          msgview.hide(0);
          console.log(res);
          this.themeList = res.items;
          for(let i=0;i<this.themeList.length;i++){
            var date=new Date(this.themeList[i].create_time)
            var h=date.getHours();
            h=h <10 ? ("0"+h) : h;
            var m=date.getMinutes();
            m=m <10 ? ("0"+m) : m;
            var s=date.getSeconds();
            s=s <10 ? ("0"+s) : s
            this.themeList[i].create_time=h+':'+m+':'+s;
          }
				})
				.catch(e => {
					msgview.hide(0);
					this.$wool.showwarn('获取' + this.$route.query.app_log + '主题失败', e.message);
				});
    },
    getThemeContent(index,id){
      this.curThemeIndex=index;
      let msgview = this.$wool.showloading('正在加载...');
      let parame={
        directory: this.muluDirectory,
        server: this.$route.query.app_log,
        subject: id
      }
      this.$wf.post('devops?method=/devops/rlog/content',parame).then(res=>{
        msgview.hide(0);
        this.themeContent=res;
        var date = new Date(res.subject.create_time);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        minute = minute < 10 ? ('0' + minute) : minute;
        var s = date.getSeconds();
        s = s < 10 ? ('0' + s) : s;
        this.themeContent.subject.create_time = y + '-' + m + '-' + d+' '+h+':'+minute+':'+s;
      }).catch(e=>{
        msgview.hide(0);
        this.$wool.showwarn(e)
      })
    },
    goToDetailLog(name){
      let url='/'+this.site_name+'/examplelogdetail?s=' + this.$route.query.app_log + '&d=' + name;
      window.open(url);
    }
	},
	created() {
		
	},
	mounted() {
    this.getMuluList();
    document.addEventListener('keydown',(e)=>{
      // 阻止滚动
      // e.preventDefault()
      // 向上38
      if(e.keyCode==38){
        // 焦点在右侧
        if(this.themeList.length==0){
        }else if(this.curThemeIndex!=-1){
          if(this.curThemeIndex>0){
            this.curThemeIndex--;
            this.getThemeContent(this.curThemeIndex,this.themeList[this.curThemeIndex].id)
          }
        }
        //焦点在左侧
        if(this.curThemeIndex==-1 || this.themeList.length==0){
          if(this.curMuluIndex>0){
            this.curMuluIndex--;
            this.getThemeList(this.curMuluIndex,this.muluList[this.curMuluIndex].name)
          }
        }
      }
      // 向下40
      else if(e.keyCode==40){
        // 焦点在右侧
        if(this.themeList.length==0){
        }else if(this.curThemeIndex!=-1){
          if(this.curThemeIndex<this.themeList.length-1){
            this.curThemeIndex++;
            this.getThemeContent(this.curThemeIndex,this.themeList[this.curThemeIndex].id);
            // document.getElementsByClassName('catalog')[0].removeEventListener('keydown',function(e){
            //   e.preventDefault();
            // })
          }
        }
        // 焦点在左侧
        if(this.curThemeIndex==-1 || this.themeList.length==0){
          if(this.curMuluIndex<this.muluList.length-1){
            this.curMuluIndex++;
            this.getThemeList(this.curMuluIndex,this.muluList[this.curMuluIndex].name)
          }
        }
      }
      // 向左37
      else if(e.keyCode==37){
        this.curThemeIndex=-1
      }
      // 向右39
      else if(e.keyCode==39){
        this.curThemeIndex=0
      }
    })
    
  },
  beforeDestroy() {
    
  },
  
};
</script>

<style lang="less" scoped>
// .rlog{
//   width: 98%;
//   box-shadow: 0 0.75rem 1.5rem rgba(18,38,63,.03);
//   border: 1px solid rgba(0,123,255,.2);
//   border-radius: 8px;
//   margin: 1% auto 5% auto;
//   background-color: white;
// }
.rlog-input-page {
  text-align: right;
  padding-right: 10px;
}
.rlog-errmsg {
  width: 100vw;
  text-align: center;
}

.rlog-input-page > input {
  width: 30px;
}

.catalog {
  width: 160px;
  border-right: 1px solid #cbbde2;
  height: calc(100vh);
}

.theme {
  width: 220px;
  // background-color: #e2e2e2;
  border-right: 1px solid #cbbde2;
  background-color: #ebe8fd;
  /* flex: 1; */
  height: calc(100vh);
}

.content {
  flex: 1;
  height: calc(100vh);
  background-color: #cbbde2;
  font-size: 12px;
  color: #353535;
  word-break: break-all;
}

.catalog-title,
.theme-title {
  padding: 6px 15px;
  background-color: white;
  color:#1862C6;
  border-bottom: 1px solid #e3ebf6;
}
.catalog-item {
  padding: 4px 10px;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  text-overflow: ellipsis;
  border-bottom: 1px solid #ebe8fd;
}

.catalog-name {
  width: 100%;
  font-size: 14px;
}

.catalog-num {
  background-color: #c2c2c2;
  border-radius: 2px;
  color: #ffffff;
  padding: 1px 2px;
  width: 60px;
  text-align: right;
  font-size: 14px;
}


.catalog-item.catalog-item-checked {
  background-color: #563d7c;
  color:#fff;
  .catalog-item-detail {
    color: #cbbde2;
  }
  .catalog-num{
    background-color: #cbbde2;
    color: #563d7c;
  }
}

.catalog-item-detail {
  width: 40%;
  text-align: left;
  font-size: 12px;
  color: #3D83E5;
  text-decoration: underline;
  cursor: pointer;
}

.theme-content {
  background-image: url(../../img/icon_subject.png);
  background-position: 14px center;
  background-repeat: no-repeat;
  background-size: 14px;
  padding: 8px 10px 8px 14px;
  text-indent: 20px;
  border-bottom: 1px solid #cbbde2;
  font-size: 14px;
}

.theme-item {
  cursor: pointer;
}

.theme-item.theme-item-checked {
  background-color: #563d7c;
  color: white;
}

.theme-name {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.content-title{
  padding: 6px 15px;
  background-color: white;
  color:#1862C6;
  border-bottom: 1px solid #e3ebf6;
  font-size:16px;
}
.content-body {
  margin: 0 4px;
      padding: 10px 16px;
      background-color: #322348;
      border-radius: 5px;
      border: 1px solid #e2e2e2;
      font-size: 12px;
      white-space: pre-wrap;
      white-space: -moz-pre-wrap;
      white-space: -pre-wrap;
      white-space: -o-pre-wrap;
      word-wrap: break-word;
      color: #cbbde2;
      min-height: 600px;
}
</style>
