// 歌曲类接口
import Axios from '@/utils/axios'
// 获取热搜词
// export function hot() {
//     return Axios({
//         url: '/search/hot',
//         method: 'post'
//     })
// }
// 搜索
export function search(data) {
    return Axios({
        url: '/search',
        method: 'post',
        data
    })
}
// 快速搜索
export function quick(data) {
    return Axios({
        url: '/search/quick',
        method: 'post',
        data
    })
}