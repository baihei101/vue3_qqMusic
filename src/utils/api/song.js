// 歌曲类接口
import Axios from '@/utils/axios'
// 获取单首歌曲信息
export function song(data) {
    return Axios({
        url: '/song',
        method: 'post',
        data
    })
}

// 获取歌曲歌词
export function getSongText(data) {
    return Axios({
        url: '/lyric',
        method: 'post',
        data
    })
}
// 获取歌曲播放连接
export function getSongUrl(data) {
    return Axios({
        url: '/song/urls',
        method: 'post',
        data
    })
}