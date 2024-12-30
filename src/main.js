import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 引入VueRouter
import router from './router'
// 引入仓库
import store from './store/store'
// 引入图标库
import '../src/assets/iconMusic/iconfont'

createApp(App)
    .use(store)
    .use(router)
    .mount('#app')
