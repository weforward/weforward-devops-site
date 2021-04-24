<template>
  <div class="loading">
    <div class="loadingInfo">
      <img v-if="showImg" width="40px" height="40px" src="../img/loading.gif">
      <p v-if="showImg" class="desc1">{{this.title}}</p>
      <p v-if="!showImg" class="desc2">{{this.title}}</p>
    </div>
    
  </div>
</template>
<script>
export default {
  data(){
    return{
      showImg: true,
    }
  },
  name: 'Loading',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  mounted(){
    if(this.title!='正在载入...'){
      this.showImg=false
      console.log(this.showImg)
    }
  }
}
</script>

<style scoped lang="less">
.loading{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  // background-color: rgba(9,9,9,0.63);
  z-index: 1;
  .loadingInfo{
    width: 150px;
    height: 150px;
    background: rgba(9,9,9,0.63);
    margin: 200px auto;
    border-radius: 10%;
    text-align: center;
    z-index: -1;
    img{
      margin-top: 40px;
    }
    .desc1{
      color: white;
    }
    .desc2{
      margin: 0 auto;
      position: relative;
      top: 45%;
      color: white;

    }
  }
}
</style>