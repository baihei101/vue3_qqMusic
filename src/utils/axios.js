import axios from 'axios'
import httpUrl from './httpUrl'
// 创建 Axios 实例
const server = axios.create({
    withCredentials: true,
    baseURL: httpUrl, // 设置你的 API 地址
})

// 添加响应拦截器
server.interceptors.response.use((res) => {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return res.data.result == 100 ? res.data : Promise.reject('🤕🤕🤕'+res.data.errMsg)
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject('发生了一些不可婉转的错误😢😢😢', error);
});
export default server