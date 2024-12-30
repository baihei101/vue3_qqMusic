// 电台相关接口
// 获取电台分类
import Axios from '@/utils/axios'
export function getradioCategory() {
    return Axios({
        url: '/radio/category',
        method: 'get'
    })
}

export function getradioMic(data) {
    return Axios({
        url: '/radio',
        method: 'post',
        data
    })
}