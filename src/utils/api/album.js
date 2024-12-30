// 专辑类接口
import Axios from '@/utils/axios'
// 获取专辑信息
export function getAlbum(data) {
    return Axios({
        url: '/album',
        method: 'post',
        data
    })
}

// 获取专辑内歌曲
export function getAlbumSongs(data) {
    return Axios({
        url: '/album/songs',
        method: 'post',
        data
    })
}

// 新碟推荐
export function getNewAlbum(data) {
    return Axios({
        url: '/new/album',
        method: 'post',
        data
    })
}