// 歌单相关接口
import Axios from '@/utils/axios'
export function songlist(data) {
    return Axios({
        url: '/songlist',
        method: 'post',
        data
    })
}

// 获取歌单分类
export function category() {
    return Axios({
        url: '/songlist/category',
        method: 'get',
    })
}

// 获取评论
export function comment(data) {
    return Axios({
        url: '/comment',
        method: 'post',
        data
    })
}