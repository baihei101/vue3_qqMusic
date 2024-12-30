// 首页相关接口
import Axios from '@/utils/axios'

// 歌单推荐接口
// 1.为你推荐
export function recommend() {
    return Axios({
        url: '/recommend/playlist/u',
        method: 'post'
    })
}
// 2.按分类推荐歌单
export function playlist(id) {
    return Axios({
        url: '/recommend/playlist',
        method: 'post',
        data: {
            id: id,
            pageNo: 1,
            pageSize: 25
        }
    })
}

// 新歌推荐
export function newSongs(data) {
    return Axios({
        url: '/new/songs',
        method: 'post',
        data
    })
}

// 日推
export function daily(){
   return Axios({
    url:'/recommend/daily',
    method:'post',
   })
}