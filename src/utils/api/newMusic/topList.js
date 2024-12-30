// 排行榜相关接口
// 获取榜单列表
import Axios from '@/utils/axios'
export function getTopCategory(data) {
    return Axios({
        url: '/top/category',
        method: 'post',
        data
    })
}

export function getTop(data) {
    return Axios({
        url: '/top',
        method: 'post',
        data
    })
}