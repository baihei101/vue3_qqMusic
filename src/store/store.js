import { createStore } from 'vuex'
// 总页面模块
const Home = {
    namespaced: true,
    state: () => ({
        isnewList: [{ name: '首页', path: '' },
        { name: '歌手', path: '/singer_list' },
        { name: '新碟', path: '/album' },
        { name: '排行榜', path: '/toplist' },
        { name: '雷达', path: '/radio' },
        { name: 'MV', path: '/mvList' }]
    }),
    mutations: {
    }
}
// 首页模块
const newMusicHome = {
    namespaced: true,
    state: () => ({
        mod_index: [
            { title: '为你推荐', value: 0, data: null },
            { title: '官方歌单', value: 3317, data: null },
            { title: '情歌', value: 71, data: null },
            { title: '网络歌曲', value: 3056, data: null },
            { title: '经典', value: 59, data: null },
            { title: 'KTV热歌', value: 64, data: null }
        ],
        tab_index: [
            { title: '最新', value: 0, data: null },
            { title: '内地', value: 1, data: null },
            { title: '港台', value: 2, data: null },
            { title: '欧美', value: 3, data: null },
            { title: '韩国', value: 4, data: null },
            { title: '日本', value: 5, data: null }
        ],
        album_index: [
            { title: '内地', value: 1, data: null },
            { title: '港台', value: 2, data: null },
            { title: '欧美', value: 3, data: null },
            { title: '韩国', value: 4, data: null },
            { title: '日本', value: 5, data: null },
            { title: '其他', value: 6, data: null },
        ]
    }),
    mutations: {
        uploadData(state, { index, data }) {
            //提交歌单数据
            state.mod_index[index].data = data
        },
        uploadDataSong(state, { index, data }) {
            //提交新歌首发数据
            state.tab_index[index].data = data
        },
        uploadDataAlbum(state, { index, data }) {
            //提交新碟首发数据
            state.album_index[index].data = data
        }
    },
    actions: {

    },
    getters: {

    }
}

// 歌单模块
const songlist = {
    namespaced: true,
    state: () => ({
        category: null,//歌单分类
    }),
    mutations: {
        uploadCategory(state, data) {
            state.category = data
        }
    }
}

// 歌手模块
const singer = {
    namespaced: true,
    state: () => ({
        category: null,//歌手分类
    }),
    mutations: {
        uploadCategory(state, data) {
            state.category = data
        }
    }
}

// 排行榜模块
const topList = {
    namespaced: true,
    state: () => ({
        category: null,//排行榜分类
    }),
    mutations: {
        uploadCategory(state, data) {
            state.category = data
        }
    }
}

// 雷达模块
const radio = {
    namespaced: true,
    state: () => ({
        category: null,//雷达分类
    }),
    mutations: {
        uploadCategory(state, data) {
            state.category = data
        }
    }
}

// MV模块
const mv = {
    namespaced: true,
    state: () => ({
        category: {
            area: null,
            version: null
        },//mv分类
    }),
    mutations: {
        uploadCategory(state, { area, version }) {
            state.category = {
                ...state.category,
                area,
                version
            }
        }
    }
}
// 创建主仓库
const store = createStore({
    modules: {
        Home,
        newMusicHome,
        songlist,
        singer,
        topList,
        radio,
        mv
    }
})

export default store;