// 用户类接口
import Axios from '@/utils/axios'
// 设置用户cookie
export function setCookie(data) {
    return Axios({
        headers: {
            'content-type': 'application/json'
        },
        url: '/user/setCookie',
        method: 'post',
        data
    })
}
// 获取用户cookie
export function getCookie(data) {
    return Axios({
        url: '/user/getCookie',
        method: 'post',
        data
    })
}
// 查看用户cookie
export function Cookie() {
    return Axios({
        url: '/user/cookie',
        method: 'get',

    })
}
// 刷新登陆
export function Refresh() {
    return Axios({
        url: '/user/refresh',
        method: 'get',
    })
}

// 用户主页信息
export function userDetail(data) {
    return Axios({
        url: '/user/detail',
        method: 'post',
        data
    })
}

// 获取用户收藏歌单
export function collectSongList(data) {
    return Axios({
        url: '/user/collect/songlist',
        method: 'post',
        data
    })
}

// 获取用户收藏专辑
export function collectAlbum(data) {
    return Axios({
        url: '/user/collect/album',
        method: 'post',
        data
    })
}

// 获取用户创建的歌单
export function userSongList(data) {
    return Axios({
        url: '/user/songlist',
        method: 'post',
        data
    })
}

// 获取用户关注的歌手列表
export function userFocusSingers(data) {
    return Axios({
        url: '/user/follow/singers',
        method: 'post',
        data
    })
}

// 获取用户关注的用户列表
export function userFocusUsers(data) {
    return Axios({
        url: '/user/follow/singers',
        method: 'post',
        data
    })
}

// 获取用户的粉丝列表
export function userFans(data) {
    return Axios({
        url: '/user/fans',
        method: 'post',
        data
    })
}
