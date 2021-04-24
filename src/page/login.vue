<template>
  <div class="bkImg">
    <img class="bkImg1" src="../img/login.png" alt="">
    <img class="bkImg2" src="../img/bottom.gif" alt="">
    <div class="loginBox">
      <div class="user">
        <div class="icon">
          <img src="../img/zhanghao.gif" alt="">
        </div>
        <input ref="username" type="text" v-model="username">
      </div>
      <div class="word">
          <div class="icon">
            <img src="../img/mima.gif" alt="">
          </div>
          <input type="password" v-model="password" placeholder @keyup.enter='login'>
      </div>
      <div class="dlButton">
        <button @click="login">登&emsp;&emsp;&emsp;录</button>
      </div>
      <!-- 微信二维码 -->
      <!-- <div class="ewm">
        <span>微信授权二维码</span>
      </div> -->
    </div>
    <div class="title">
      <img src="../img/devops.png" alt="">
    </div>
  </div>
</template>
<script>

export default {
  data(){
    return{
      username: '',
      password: '',
      showLoading: false,
      loadingMsg: '正在载入中...'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.username.focus();//输入框默认获取焦点
    });
  },
  methods:{
    login(){
      this.$wf.login( this.username, this.password).then(()=>{
        //若跳转到首页会加载到404页，因为重定向失效
        this.$router.push({name: "微服务"});
      }).catch(e=>{
        this.$wool.showwarn(e);
      })
    }
  }
}
</script>
<style scoped lang="less">
.bkImg{
  width: 100%;
  height: 100%;
  .bkImg1{
    width: 100%;
    height: 70%;
  }
  .bkImg2{
    margin-left: 3%;
    margin-top: 3%;
    height: 20%;
  }
  .loginBox{
    width: 450px;
    height: 250px;
    // height: 300px;
    background: rgba(255,255,255,0.9);
    // opacity: 75%;
    border-radius: 15px;
    position: absolute;
    top: 15%;
    left: 55%;
    .user{
      margin-left: 10%;
      margin-top: 10%;
      width: 70%;
      height: 25%;
      // opacity: 75%;
      // background: rgba(255,255,255,0.75);
      // background-color: #F7F8F9;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      .icon{  
        width: 35px;
        height: 35px;
        img{
          margin-top: 5px;
          width: 100%;
          height: 100%;
        }
      }
      input{
        width: 80%;
        height: 45%;
        margin-left: 5%;
        margin-top: 6px;
        outline:none;
        background-color: #ffffff;
        border: 1px solid #A6A6A6;
        border-radius: 5px;
        padding-left: 10px;
        font-size: 16px;

      }
    }
    .word{
      width: 70%;
      height: 25%;
      margin-left: 10%;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      .icon{
        width: 35px;
        height: 35px;
        // margin-top: 30%;
        img{
          margin-top: 5px;
          width: 100%;
          height: 100%;
        }
      }
      input{
        width: 80%;
        height: 45%;
        margin-left: 5%;
        margin-top: 4px;
        outline:none;
        background: white;
        border: 1px solid #A6A6A6;
        border-radius: 5px;
        padding-left: 10px;
        font-size: 16px;
      }
    }
    .dlButton{
      width: 57%;
      height: 25%;
      margin-left: 22.5%;
      button{
        width: 100%;
        height: 50%;
        border-style: none;
        color: white;
        background-color: #007BFF;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
      }
      
    }
  }
  .title{
    width: 50%;
    position: absolute;
    top: 0%;
    left: 3%;
    // transform: translate(0,0);
    color: #DAE3F3;
    img{
      width: 75%;
      height: 75%;
    }
    span{
      font-size: 100px;
    }
  }
}

</style>