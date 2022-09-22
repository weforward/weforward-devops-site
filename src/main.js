//vue框架 文档地址 https://cn.vuejs.org/menu/
import Vue from 'vue'
import App from './App.vue'
import '@/utils/element_ui_config'
import '@/style/index.less'
import store from '@/store/index'

Vue.prototype.$store = store

Vue.config.productionTip = false
new Vue({
    store,
    render: h => h(App),
}).$mount('#app');
