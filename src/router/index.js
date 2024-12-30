import { compile } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [

    {
        path: '/',
        redirect: '/newMusic'
    },
    {
        path: '/newMusic',
        component: () => import('../view/HomeIndex.vue'),
        children: [
            {
                path: '',
                component: () => import('../components/newMusic/index.vue'),
            },
            // 歌手
            {
                path: 'singer_list',
                component: () => import('../components/newMusic/singer_list/index.vue')
            },
            // 歌手详情页
            {
                path: 'singer_detail',
                component: () => import('../components/newMusic/singer_list/detail.vue')
            },
            // 新碟
            {
                path: 'album',
                component: () => import('../components/newMusic/album/index.vue')
            },
            {
                path: 'albumDetail',
                component: () => import('../components/newMusic/album/detail.vue')
            },
            // 排行榜
            {
                path: 'toplist',
                component: () => import('../components/newMusic/toplist/index.vue')
            },
            // 雷达
            {
                path: 'radio',
                component: () => import('../components/newMusic/radio/index.vue')
            },
            // MV
            {
                path: 'mvList',
                component: () => import('../components/newMusic/mvList/index.vue')
            },
            // MV详情页
            {
                path: 'mvDetail',
                component: () => import('../components/newMusic/mvList/detail.vue')
            },
            // 歌单页
            {
                path: 'playList',
                component: () => import('../components/newMusic/playList.vue')
            },
            // 我的音乐
            {
                path: '/myMusic',
                component: () => import('../components/myMusic/index.vue'),
                children: [
                    {
                        path: '',
                        redirect: '/myMusic/like'
                    },
                    {//我喜欢
                        path: 'like',
                        component: () => import('../components/myMusic/like/index.vue'),
                        children: [
                            {
                                path: '',
                                redirect: '/myMusic/like/music'
                            },
                            {//歌曲
                                path: 'music',
                                component: () => import('../components/myMusic/like/song/index.vue')
                            },
                            {//歌单
                                path: 'songList',
                                component: () => import('../components/myMusic/like/songList/index.vue')
                            },
                            {//专辑
                                path: 'album',
                                component: () => import('../components/myMusic/like/album/index.vue')
                            }
                        ]
                    },
                    {//创建歌单
                        path: 'create',
                        component: () => import('../components/myMusic/create/index.vue')
                    },
                    {//关注
                        path: 'focus',
                        component: () => import('../components/myMusic/focus/index.vue')
                    },
                    {//粉丝
                        path: 'fans',
                        component: () => import('../components/myMusic/fans/index.vue')
                    }
                ]
            },
            // 搜索页
            {
                path: 'search',
                component: () => import('../components/newMusic/search/index.vue')
            }
        ]
    },
    {
        //播放列表页
        path: '/playList',
        component: () => import('../components/playList/index.vue')
    },
    {
        // 电台详情
        path: '/radioDetail',
        component: () => import('../components/newMusic/radio/detail.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router