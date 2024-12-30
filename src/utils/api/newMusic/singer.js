// 歌手相关接口
// 获取歌手分类
import Axios from '@/utils/axios'
export function singerlist() {
    return Axios({
        url: '/singer/category',
        method: 'get',
    })
}
// 根据分类获取歌手
export function singertypelist(data) {
    return Axios({
        url: '/singer/list',
        method: 'post',
        data
    })
}
// 获取歌手介绍
export function singerdesc(data) {
    return Axios({
        url: '/singer/desc',
        method: 'post',
        data
    })
}
// 获取热门歌曲
export function singersongs(data) {
    return Axios({
        url: '/singer/songs',
        method: 'post',
        data
    })
}
// 获取歌手专辑
export function singerablum(data) {
    return Axios({
        url: '/singer/album',
        method: 'post',
        data
    })
}
// 获取MV
export function getMV(data) {
    return Axios({
        url: '/singer/mv',
        method: 'post',
        data
    })
}
// 获取相似歌手
export function singersim(data) {
    return Axios({
        url: '/singer/sim',
        method: 'post',
        data
    })
}
