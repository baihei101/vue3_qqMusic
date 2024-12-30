// MV相关接口
import Axios from '@/utils/axios'
export function mvCategory() {
    return Axios({
        url: '/mv/category',
        method: 'get'
    })
}

// mv列表
export function getmvList(data) {
    return Axios({
        url: '/mv/list',
        method: 'post',
        data
    })
}

// 获取mv信息
export function getmvMsg(data) {
    return Axios({
        url: '/mv',
        method: 'post',
        data
    })
}

// 获取mv播放链接
export function getmvUrl(data) {
    return Axios({
        url: '/mv/url',
        method: 'post',
        data
    })
}