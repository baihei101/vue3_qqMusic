## QQMic（vue3）
此项目为个人练手项目，采用vue3+vueRouter+vuex进行开发,无采用组件，因此css样式代码较多
后端文件:[QQMIC](https://github.com/baihei101/QQMusicApi)
基于[QQMusicApi](https://github.com/jsososo/QQMusicApi)，此后端项目仅仅进行跨域处理以及适配

### 下载vue3项目
`git clone https://github.com/baihei101/vue3_qqMusic.git`

### 初始化运行项目
`npm install`
`npm run dev`

### icon图标
icon图标采用svg形式，使用[iconfont资源](https://www.iconfont.cn/)
于assets目录下

### 页面文件
于components目录下，音乐馆/我的音乐俩大模块及下行分支文件

### 路由
采用静态路由，因SPA单页面网站刷新会404，需进行nginx添加
`location / {`
`  try_files $uri $uri/ /index.html;`
`}`
详情请参考[vueRouter官网](https://router.vuejs.org/zh/guide/essentials/history-mode.html)

### 插槽
因复用样式过多采用插槽进行样式封装，但因最开始采用props+v-bind进行父子组件方法调用造成代码臃肿
应采用provide/inject方式进行统一
于slot目录下

### vuex
采用仓库管理一些静态文本及常获取的接口数据，以此减少接口的调用
采用模块化分别管理各个模块的数据
于store目录下

### Api接口
于utils目录下
axiosjs用于创建父类实例用于子类进行调用接口，编写拦截器使用
httpUrljs用于编写请求后端接口地址
keyjs用于统一存储symbol密钥
api目录储存各个接口函数

### 视图层
于view目录下，基于此父类下的框架进行的页面展示，