<script setup>
    import { ref, reactive, onMounted, onUpdated, provide, toRaw } from 'vue'
    import {
        setCookie, getCookie, Cookie, userDetail, Refresh
    } from '@/utils/api/user'
    import { song } from '@/utils/api/song'
    import { search, quick } from '@/utils/api/search'
    import { useStore } from 'vuex'
    import { useRoute, useRouter } from 'vue-router'
    import { setMicKey } from '@/utils/key'
    // 提供全局方法
    provide(setMicKey, setMic);

    const store = useStore()
    const state = store.state.Home
    const userMsg = reactive({
        headpic: '',
        name: ''
    })
    const isnewList = state.isnewList//路由信息
    const isLogin = ref(false)//是否登陆
    const MyMsg = ref(false)//是否已登录
    const isnew = ref(false)
    const newMusic = ref()

    const searchText = ref('')//搜索信息
    const quickData = reactive({
        song: null,
        singer: null,
        mv: null,
        album: null
    })//快捷搜索数据
    const searchTime = ref(null) //节流器
    const isQuick = ref(false)//是否展示快捷搜索列表

    const CookieMsg = ref('')//用户Cookie
    const QQId = ref('')//qq号
    const route = useRoute()
    const router = useRouter()

    onMounted(() => {
        // 获取当前Cookie
        Cookie().then(res => {
            if (res.data.uin == '') {
                // 未登录
                MyMsg.value = true
            } else {
                // 已登录
                QQId.value = res.data.uin
                getDetail()
            }
        })
        isNew()
    });

    onUpdated(() => {
        isNew()
    });

    function isNew() {
        isnew.value = route.path.includes('newMusic')
    }

    // 进行登陆
    function toLogin() {
        //   进行校验Cookie和qq
        (CookieMsg.value == '' || QQId.value == '') ? alert("Cookie或QQ号为空") : setCookie({ data: CookieMsg.value }).then(res => {//设置Cookie
            getCookie({ id: QQId.value }).then(res => {//获取Cookie
                getDetail()//获取个人信息
            })
        })
    }

    // 获取个人信息
    function getDetail() {
        userDetail({ id: QQId.value }).then(res => {
            if (res.result == 100) {//设置成功
                // 存在本地
                isLogin.value = false
                MyMsg.value = false
                userMsg.headpic = res.data.creator.headpic
                userMsg.name = res.data.creator.nick
                localStorage.setItem('userMsg', JSON.stringify(res.data))
                localStorage.setItem('QQId', JSON.stringify(QQId.value))
                CookieMsg.value = ''
                QQId.value = ''
            } else if (res.result == 301) {
                isLogin.value = true
                MyMsg.value = false
                alert(res.errMsg)
                alert(res.info);
            }
        })
    }

    // 快速搜索
    function quickSearch() {
        // 进行搜索防抖
        if (searchTime.value) {
            clearTimeout(searchTime.value)
        }
        searchTime.value = setTimeout(() => {
            quick({ key: searchText.value }).then(res => {

                if (res.result === 100) {
                    isQuick.value = true
                    quickData.song = res.data.song.itemlist
                    quickData.singer = res.data.singer.itemlist
                    quickData.mv = res.data.mv.itemlist
                    quickData.album = res.data.album.itemlist
                    console.log(quickData);

                } else if (res.result === 500) {
                    isQuick.value = false
                }
            })
        }, 1000)
    }

    // 跳转搜索页
    function toSearch() {
        router.push({ path: '/newMusic/search', query: { search: searchText.value } })
    }

    // 跳转到歌手页
    function toSinger(name, mid) {
        router.push({ path: '/newMusic/singer_detail', query: { name, mid } })
    }

    // 跳转MV详情页
    function toMV(id) {
        router.push({ path: '/newMusic/mvDetail', query: { id } })
    }

    // 跳转到专辑页
    function toAlbum(id) {
        router.push({ path: '/newMusic/albumDetail', query: { id } })
    }

    // 去QQMic
    function toQQMic() {
        window.open('https://y.qq.com/')
    }

    // 保存单曲并进行跳转播放
    function setMic(Mic) {
        let songList = localStorage.getItem('songList')//获取歌曲列表
        if (songList) {
            const setArr = []
            const set = new Set()
            songList = JSON.parse(songList)
            songList.unshift(toRaw(Mic))//将单曲存入歌曲列表,将Proxy类型取出target值
            songList.forEach(song => {//去重操作，将重复的歌曲去除
                const song_JSON = JSON.stringify(song)
                if (!set.has(song_JSON)) {
                    set.add(song_JSON);
                    setArr.push(song);
                }
            })
            localStorage.setItem('songList', JSON.stringify(setArr))//存储歌曲
        } else {//若无歌曲列表
            const arr = []
            arr.push(toRaw(Mic))
            localStorage.setItem('songList', JSON.stringify(arr))//存储歌曲
        }
        router.push({ path: '/playList' })
    }

    // 获取歌曲详情
    function searchMic(Mic) {
        song({ songmid: Mic.mid }).then(res => {
            setMic(res.data.track_info)
        })
    }
</script>

<template>
    <!-- 主界面 -->
    <div id="home" @click="isQuick=false">
        <!-- 登陆模块 -->
        <div id="login" v-show="isLogin">
            <!-- 蒙版 -->
            <div class="loginBG" @click="isLogin=false" />
            <!-- 功能层 -->
            <div class="loginBox">
                <div class="box">
                    <p class="title">请输入Cookie以登陆</p>
                    <textarea v-model="CookieMsg" placeholder="Cookie请在QQ音乐官网登陆获取" />
                    <div class="inputBtn">
                        <input type="text" v-model="QQId" placeholder="请输入qq号">
                        <div class="toLogin" @click="toLogin">
                            登陆
                        </div>
                    </div>
                </div>
                <div class="bg">
                    <svg @click="toQQMic" height="790" node-id="1" sillyvg="true" template-height="790"
                        template-width="608" version="1.1" viewBox="0 0 608 790" width="608"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <defs node-id="126">
                            <mask height="42.294434" id="mask-2" maskUnits="userSpaceOnUse" node-id="21"
                                width="63.18222" x="317.1861" y="723.7848">
                                <path
                                    d="M 315.40 536.40 L 323.60 749.60 L 330.00 752.30 L 335.90 754.20 L 341.40 755.50 L 346.50 756.20 L 351.40 756.30 L 355.90 756.00 L 360.30 755.10 L 364.40 753.80 L 368.40 751.90 L 372.20 749.60 L 378.50 535.00 L 315.40 536.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="131" stroke="none"
                                    target-height="221.29999" target-width="63.100006" target-x="315.4"
                                    target-y="535" />
                            </mask>
                            <mask height="11.195557" id="mask1" maskUnits="userSpaceOnUse" node-id="135"
                                width="77.57022" x="308.34683" y="541.01135">
                                <path
                                    d="M 315.40 536.40 L 323.60 749.60 L 330.00 752.30 L 335.90 754.20 L 341.40 755.50 L 346.50 756.20 L 351.40 756.30 L 355.90 756.00 L 360.30 755.10 L 364.40 753.80 L 368.40 751.90 L 372.20 749.60 L 378.50 535.00 L 315.40 536.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="139" stroke="none"
                                    target-height="221.29999" target-width="63.100006" target-x="315.4"
                                    target-y="535" />
                            </mask>
                            <mask height="41.645508" id="mask-4" maskUnits="userSpaceOnUse" node-id="27"
                                width="67.836365" x="478.16443" y="721.68726">
                                <path
                                    d="M 468.00 540.30 L 491.30 761.60 L 498.20 764.50 L 504.40 766.60 L 510.10 767.90 L 515.10 768.60 L 519.70 768.70 L 523.80 768.20 L 527.60 767.30 L 531.10 765.90 L 534.30 764.00 L 537.30 761.60 L 540.10 758.60 L 533.00 533.30 L 468.00 540.30 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="146" stroke="none"
                                    target-height="235.40002" target-width="72.099976" target-x="468"
                                    target-y="533.3" />
                            </mask>
                            <mask height="17.561646" id="mask2" maskUnits="userSpaceOnUse" node-id="150"
                                width="79.905945" x="460.11566" y="533.58777">
                                <path
                                    d="M 468.00 540.30 L 491.30 761.60 L 498.20 764.50 L 504.40 766.60 L 510.10 767.90 L 515.10 768.60 L 519.70 768.70 L 523.80 768.20 L 527.60 767.30 L 531.10 765.90 L 534.30 764.00 L 537.30 761.60 L 540.10 758.60 L 533.00 533.30 L 468.00 540.30 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="154" stroke="none"
                                    target-height="235.40002" target-width="72.099976" target-x="468"
                                    target-y="533.3" />
                            </mask>
                            <mask height="38.579803" id="mask-6" maskUnits="userSpaceOnUse" node-id="33"
                                width="38.52942" x="339.86505" y="395.18344">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="161" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="38.579773" id="mask3" maskUnits="userSpaceOnUse" node-id="165"
                                width="38.52939" x="390.61615" y="516.0046">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="169" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="38.579803" id="mask4" maskUnits="userSpaceOnUse" node-id="173"
                                width="38.52942" x="295.84625" y="470.89108">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="177" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="38.579803" id="mask5" maskUnits="userSpaceOnUse" node-id="181"
                                width="38.52939" x="359.54407" y="450.14926">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="185" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="38.579773" id="mask6" maskUnits="userSpaceOnUse" node-id="189"
                                width="38.52939" x="387.50894" y="351.6256">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="193" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="38.579803" id="mask7" maskUnits="userSpaceOnUse" node-id="197"
                                width="38.52942" x="434.63495" y="461.55725">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="201" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="38.579773" id="mask8" maskUnits="userSpaceOnUse" node-id="205"
                                width="38.52942" x="495.22552" y="491.11438">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="209" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="38.579803" id="mask9" maskUnits="userSpaceOnUse" node-id="213"
                                width="38.52942" x="507.65436" y="406.07288">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="217" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="38.579803" id="mask10" maskUnits="userSpaceOnUse" node-id="221"
                                width="38.52939" x="441.8851" y="406.07288">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="225" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="38.579773" id="mask11" maskUnits="userSpaceOnUse" node-id="229"
                                width="38.52942" x="471.92145" y="353.6998">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="233" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="39.06671" id="mask12" maskUnits="userSpaceOnUse" node-id="237"
                                width="42.043396" x="490.02795" y="362.85233">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="241" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="50.181335" id="mask13" maskUnits="userSpaceOnUse" node-id="245"
                                width="40.829468" x="305.9223" y="368.22217">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="249" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="202.37686" id="mask14" maskUnits="userSpaceOnUse" node-id="253"
                                width="44.782654" x="489.7685" y="349.32382">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="257" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="199.42023" id="mask15" maskUnits="userSpaceOnUse" node-id="261"
                                width="17.063263" x="327.1973" y="356.34827">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="265" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="22.977264" id="mask16" maskUnits="userSpaceOnUse" node-id="269"
                                width="260.8723" x="287.67505" y="361.26102">
                                <path
                                    d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="273" stroke="none"
                                    target-height="189.69998" target-width="257.30002" target-x="299.1"
                                    target-y="355.4" />
                            </mask>
                            <mask height="54.728714" id="mask-8" maskUnits="userSpaceOnUse" node-id="53"
                                width="37.958023" x="216.22913" y="132.61284">
                                <path
                                    d="M 230.20 186.40 L 60.10 92.30 L 57.00 91.40 L 52.70 90.90 L 49.30 90.20 L 45.60 89.00 L 40.80 86.80 L 37.70 85.00 L 34.40 82.60 L 29.30 78.30 L 8.90 71.10 L 7.40 69.30 L 6.70 67.60 L 6.40 66.00 L 6.70 64.50 L 7.40 62.90 L 8.50 61.70 L 9.90 60.70 L 11.50 60.00 L 13.40 59.80 L 15.80 60.10 L 21.30 61.70 L 31.00 65.20 L 1.60 39.90 L 0.80 37.90 L 0.60 36.20 L 0.80 34.70 L 1.60 33.30 L 2.90 32.00 L 4.40 31.10 L 6.00 30.70 L 7.80 30.90 L 9.90 31.70 L 12.40 33.20 L 36.90 54.00 L 26.10 43.40 L 26.20 41.90 L 26.80 40.50 L 27.90 39.30 L 29.70 38.40 L 31.60 38.00 L 33.90 38.60 L 46.70 49.80 L 36.10 39.30 L 36.00 37.80 L 36.40 36.60 L 37.10 35.60 L 39.60 34.10 L 42.30 34.10 L 43.80 34.70 L 53.10 43.40 L 45.10 34.70 L 45.40 33.00 L 46.30 31.70 L 47.60 30.90 L 49.20 30.50 L 50.80 30.50 L 52.40 30.90 L 61.00 39.40 L 67.40 46.50 L 72.10 52.40 L 75.30 57.20 L 77.30 61.20 L 78.50 62.20 L 97.00 70.00 L 255.70 139.20 L 230.20 186.40 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="280" stroke="none" target-height="155.9"
                                    target-width="255.09999" target-x="0.6" target-y="30.5" />
                            </mask>
                            <mask height="3.3475037" id="mask-10" maskUnits="userSpaceOnUse" node-id="59"
                                width="24.59488" x="381.9481" y="107.594">
                                <path
                                    d="M 404.30 107.60 L 405.50 129.10 L 405.70 130.30 L 406.40 131.20 L 407.50 131.90 L 409.50 132.50 L 419.20 133.00 L 427.40 134.00 L 435.10 135.40 L 440.50 136.90 L 440.90 137.40 L 440.90 138.10 L 440.10 139.40 L 438.30 141.30 L 435.10 143.90 L 426.90 149.40 L 422.00 152.00 L 416.80 154.40 L 411.40 156.50 L 406.20 157.90 L 399.50 158.80 L 396.50 158.70 L 392.50 157.90 L 388.50 156.50 L 384.80 154.70 L 381.10 152.20 L 377.50 149.00 L 374.00 145.20 L 370.60 140.50 L 367.20 135.00 L 375.90 133.80 L 380.80 133.60 L 383.10 133.10 L 384.10 132.40 L 384.40 131.70 L 384.40 107.60 L 404.30 107.60 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="287" stroke="none"
                                    target-height="51.200005" target-width="73.69998" target-x="367.2"
                                    target-y="107.6" />
                            </mask>
                            <mask height="203.12039" id="mask-12" maskUnits="userSpaceOnUse" node-id="71"
                                width="25.754211" x="361.46558" y="114.74051">
                                <path
                                    d="M 306.80 375.10 L 313.70 240.60 L 218.00 191.80 L 258.30 125.60 L 293.40 139.70 L 301.00 141.60 L 307.90 142.70 L 314.10 143.30 L 319.60 143.40 L 324.60 143.10 L 329.20 142.40 L 333.20 141.20 L 342.10 137.60 L 347.70 135.90 L 353.80 134.50 L 360.40 133.60 L 367.70 133.20 L 375.70 133.20 L 384.70 370.00 L 306.80 375.10 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="294" stroke="none" target-height="249.5"
                                    target-width="166.70001" target-x="218" target-y="125.6" />
                            </mask>
                            <mask height="149.68004" id="mask17" maskUnits="userSpaceOnUse" node-id="298"
                                width="85.06941" x="239.42961" y="193.77583">
                                <path
                                    d="M 306.80 375.10 L 313.70 240.60 L 218.00 191.80 L 258.30 125.60 L 293.40 139.70 L 301.00 141.60 L 307.90 142.70 L 314.10 143.30 L 319.60 143.40 L 324.60 143.10 L 329.20 142.40 L 333.20 141.20 L 342.10 137.60 L 347.70 135.90 L 353.80 134.50 L 360.40 133.60 L 367.70 133.20 L 375.70 133.20 L 384.70 370.00 L 306.80 375.10 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="302" stroke="none" target-height="249.5"
                                    target-width="166.70001" target-x="218" target-y="125.6" />
                            </mask>
                            <mask height="203.15329" id="mask-14" maskUnits="userSpaceOnUse" node-id="77"
                                width="25.754578" x="414.64487" y="114.42572">
                                <path
                                    d="M 423.20 133.50 L 435.00 134.40 L 446.40 135.90 L 457.40 137.80 L 468.10 140.30 L 478.40 143.20 L 488.40 146.60 L 498.20 150.60 L 507.60 155.00 L 516.80 159.80 L 525.80 165.20 L 534.50 171.10 L 543.00 177.50 L 551.30 184.40 L 559.30 191.90 L 567.10 200.00 L 516.60 263.50 L 482.90 217.80 L 525.70 364.80 L 415.10 369.40 L 423.20 133.50 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="309" stroke="none" target-height="235.9"
                                    target-width="151.99997" target-x="415.1" target-y="133.5" />
                            </mask>
                            <mask height="12.225525" id="mask-16" maskUnits="userSpaceOnUse" node-id="86"
                                width="128.3122" x="323.1666" y="336.55792">
                                <path
                                    d="M 362.80 299.20 L 415.00 299.20 L 418.50 299.50 L 421.90 300.20 L 425.10 301.30 L 428.10 302.80 L 430.80 304.70 L 433.30 306.90 L 435.50 309.40 L 437.40 312.10 L 438.90 315.10 L 440.00 318.30 L 440.70 321.70 L 441.00 333.90 L 440.70 337.40 L 440.00 340.80 L 438.90 344.00 L 437.40 347.00 L 435.50 349.70 L 433.30 352.20 L 430.80 354.40 L 428.10 356.30 L 425.10 357.80 L 421.90 358.90 L 418.50 359.60 L 415.00 359.90 L 362.80 359.90 L 359.20 359.60 L 355.90 358.90 L 352.70 357.80 L 349.70 356.30 L 346.90 354.40 L 344.40 352.20 L 342.20 349.70 L 340.40 347.00 L 338.80 344.00 L 337.70 340.80 L 337.00 337.40 L 336.80 325.20 L 337.00 321.70 L 337.70 318.30 L 338.80 315.10 L 340.40 312.10 L 342.20 309.40 L 344.40 306.90 L 346.90 304.70 L 349.70 302.80 L 352.70 301.30 L 355.90 300.20 L 359.20 299.50 L 362.80 299.20 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="316" stroke="none"
                                    target-height="60.69998" target-width="104.20001" target-x="336.8"
                                    target-y="299.2" />
                            </mask>
                            <mask height="1.2000122" id="mask18" maskUnits="userSpaceOnUse" node-id="320"
                                width="125.000946" x="326.3744" y="316.81918">
                                <path
                                    d="M 362.80 299.20 L 415.00 299.20 L 418.50 299.50 L 421.90 300.20 L 425.10 301.30 L 428.10 302.80 L 430.80 304.70 L 433.30 306.90 L 435.50 309.40 L 437.40 312.10 L 438.90 315.10 L 440.00 318.30 L 440.70 321.70 L 441.00 333.90 L 440.70 337.40 L 440.00 340.80 L 438.90 344.00 L 437.40 347.00 L 435.50 349.70 L 433.30 352.20 L 430.80 354.40 L 428.10 356.30 L 425.10 357.80 L 421.90 358.90 L 418.50 359.60 L 415.00 359.90 L 362.80 359.90 L 359.20 359.60 L 355.90 358.90 L 352.70 357.80 L 349.70 356.30 L 346.90 354.40 L 344.40 352.20 L 342.20 349.70 L 340.40 347.00 L 338.80 344.00 L 337.70 340.80 L 337.00 337.40 L 336.80 325.20 L 337.00 321.70 L 337.70 318.30 L 338.80 315.10 L 340.40 312.10 L 342.20 309.40 L 344.40 306.90 L 346.90 304.70 L 349.70 302.80 L 352.70 301.30 L 355.90 300.20 L 359.20 299.50 L 362.80 299.20 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="324" stroke="none"
                                    target-height="60.69998" target-width="104.20001" target-x="336.8"
                                    target-y="299.2" />
                            </mask>
                            <mask height="58.333313" id="mask-18" maskUnits="userSpaceOnUse" node-id="96"
                                width="41.570313" x="522.2947" y="201.52545">
                                <path
                                    d="M 526.60 250.20 L 545.30 265.40 L 548.50 269.50 L 550.90 273.20 L 552.40 276.60 L 553.30 279.80 L 553.60 282.90 L 552.80 288.00 L 550.50 292.60 L 548.90 294.60 L 544.90 298.00 L 539.80 300.60 L 445.10 336.70 L 441.50 337.90 L 438.50 338.60 L 436.00 338.70 L 434.00 338.40 L 432.30 337.70 L 430.80 336.70 L 426.80 332.40 L 422.20 326.80 L 418.10 321.30 L 414.80 316.30 L 413.80 315.60 L 412.60 315.20 L 411.00 315.30 L 408.90 315.90 L 407.50 317.20 L 406.70 318.70 L 406.40 320.40 L 406.70 322.60 L 407.70 325.20 L 414.50 336.40 L 415.80 339.50 L 416.40 342.30 L 416.30 344.10 L 415.70 345.80 L 414.60 347.50 L 413.10 348.90 L 408.50 352.00 L 402.70 354.30 L 399.20 355.10 L 395.60 355.50 L 391.80 355.50 L 387.70 354.90 L 383.60 353.90 L 379.30 352.10 L 368.30 345.50 L 366.50 344.70 L 364.90 344.40 L 363.50 344.60 L 362.30 345.20 L 361.30 346.20 L 360.80 347.40 L 360.70 348.80 L 361.70 351.10 L 386.00 365.90 L 360.50 350.70 L 358.20 350.50 L 356.70 351.00 L 355.60 351.80 L 355.00 353.20 L 354.80 354.80 L 355.00 356.20 L 356.60 358.70 L 360.90 361.70 L 370.10 366.30 L 380.50 370.20 L 386.80 372.10 L 393.40 373.60 L 405.50 375.00 L 415.60 374.80 L 422.80 373.80 L 434.60 371.40 L 452.70 367.00 L 479.30 359.90 L 516.50 349.30 L 566.80 334.30 L 574.20 330.10 L 580.60 325.90 L 586.20 321.60 L 591.00 317.20 L 595.00 312.70 L 598.50 308.10 L 601.30 303.50 L 603.50 298.70 L 605.20 293.70 L 606.30 288.60 L 607.00 282.60 L 607.10 276.70 L 606.50 270.90 L 605.40 265.20 L 603.60 259.60 L 601.10 253.90 L 598.00 248.30 L 594.10 242.60 L 589.40 236.80 L 559.20 208.90 L 526.60 250.20 Z"
                                    fill="#ffffff" fill-rule="evenodd" node-id="331" stroke="none" target-height="166.1"
                                    target-width="252.29999" target-x="354.8" target-y="208.9" />
                            </mask>
                        </defs>
                        <g node-id="515">
                            <g node-id="516">
                                <g node-id="517">
                                    <g node-id="518">
                                        <g node-id="533">
                                            <path
                                                d="M 315.40 536.40 L 323.60 749.60 L 330.00 752.30 L 335.90 754.20 L 341.40 755.50 L 346.50 756.20 L 351.40 756.30 L 355.90 756.00 L 360.30 755.10 L 364.40 753.80 L 368.40 751.90 L 372.20 749.60 L 378.50 535.00 L 315.40 536.40 Z"
                                                fill="#ffc7ca" fill-rule="evenodd" group-id="1,2,3,4,19" node-id="342"
                                                stroke="none" target-height="221.29999" target-width="63.100006"
                                                target-x="315.4" target-y="535" />
                                        </g>
                                        <g node-id="534">
                                            <path
                                                d="M 323.50 751.60 L 322.50 727.30 L 375.10 727.30 L 374.10 755.80 L 361.90 762.60 L 338.00 761.10 Z"
                                                fill="#fdf7da" fill-rule="evenodd" group-id="1,2,3,4,20" id="路径-347"
                                                node-id="24" stroke="none" target-height="35.299988"
                                                target-width="52.600006" target-x="322.5" target-y="727.3" />
                                        </g>
                                        <path d="M 315.10 544.40 L 379.10 551.30 L 379.50 543.50 L 314.80 541.90 Z"
                                            fill="#000000" fill-rule="evenodd" group-id="1,2,3,4,21" id="路径-280"
                                            node-id="25" stroke="none" target-height="9.399963" target-width="64.70001"
                                            target-x="314.8" target-y="541.9" />
                                    </g>
                                    <g node-id="519">
                                        <g node-id="536">
                                            <path
                                                d="M 468.00 540.30 L 491.30 761.60 L 498.20 764.50 L 504.40 766.60 L 510.10 767.90 L 515.10 768.60 L 519.70 768.70 L 523.80 768.20 L 527.60 767.30 L 531.10 765.90 L 534.30 764.00 L 537.30 761.60 L 540.10 758.60 L 533.00 533.30 L 468.00 540.30 Z"
                                                fill="#ffc7ca" fill-rule="evenodd" group-id="1,2,3,5,22" node-id="356"
                                                stroke="none" target-height="235.40002" target-width="72.099976"
                                                target-x="468" target-y="533.3" />
                                        </g>
                                        <g node-id="537">
                                            <path
                                                d="M 486.90 752.50 L 483.80 725.50 L 539.50 725.20 L 540.30 752.50 L 526.00 759.90 L 501.70 758.50 Z"
                                                fill="#fdf7da" fill-rule="evenodd" group-id="1,2,3,5,23" id="路径-347"
                                                node-id="30" stroke="none" target-height="34.700012" target-width="56.5"
                                                target-x="483.8" target-y="725.2" />
                                        </g>
                                        <path d="M 468.00 549.70 L 533.40 536.80 L 533.40 535.10 L 466.80 541.70 Z"
                                            fill="#000000" fill-rule="evenodd" group-id="1,2,3,5,24" id="路径-279"
                                            node-id="31" stroke="none" target-height="14.600037" target-width="66.60004"
                                            target-x="466.8" target-y="535.1" />
                                    </g>
                                    <g node-id="520">
                                        <g node-id="539">
                                            <path
                                                d="M 312.90 364.90 L 299.10 542.40 L 417.80 545.10 L 417.80 393.70 L 433.90 545.10 L 556.40 532.20 L 518.80 355.40 Z"
                                                fill="#ffffff" fill-rule="evenodd" group-id="1,2,3,6,25" node-id="370"
                                                stroke="none" target-height="189.69998" target-width="257.30002"
                                                target-x="299.1" target-y="355.4" />
                                        </g>
                                        <g node-id="540">
                                            <path
                                                d="M 359.10 398.40 L 362.10 398.70 L 364.70 399.40 L 367.20 400.60 L 369.50 402.20 L 371.40 404.10 L 373.00 406.40 L 374.20 408.90 L 374.90 411.50 L 375.20 414.50 L 374.90 417.40 L 374.20 420.10 L 373.00 422.60 L 371.40 424.80 L 369.50 426.80 L 367.20 428.40 L 364.70 429.50 L 362.10 430.30 L 359.10 430.50 L 356.20 430.30 L 353.50 429.50 L 351.00 428.40 L 348.80 426.80 L 346.90 424.80 L 345.30 422.60 L 344.10 420.10 L 343.30 417.40 L 343.10 414.50 L 343.30 411.50 L 344.10 408.90 L 345.30 406.40 L 346.90 404.10 L 348.80 402.20 L 351.00 400.60 L 353.50 399.40 L 356.20 398.70 L 359.10 398.40 Z M 359.10 402.90 L 355.10 403.60 L 353.30 404.50 L 350.30 407.00 L 348.30 410.40 L 347.60 414.50 L 348.30 418.50 L 350.30 421.90 L 353.30 424.50 L 357.00 425.80 L 361.20 425.80 L 363.20 425.30 L 366.60 423.30 L 369.10 420.30 L 370.00 418.50 L 370.70 414.50 L 370.00 410.40 L 368.00 407.00 L 365.00 404.50 L 363.20 403.60 L 359.10 402.90 Z"
                                                fill="#e7f4ff" fill-rule="nonzero" group-id="1,2,3,6,26" id="椭圆形"
                                                node-id="36" stroke="none" target-height="32.100006"
                                                target-width="32.100006" target-x="343.1" target-y="398.4" />
                                        </g>
                                        <g node-id="541">
                                            <path
                                                d="M 409.90 519.20 L 412.80 519.50 L 415.50 520.20 L 418.00 521.40 L 420.20 523.00 L 422.10 524.90 L 423.70 527.20 L 424.90 529.70 L 425.70 532.40 L 425.90 535.30 L 425.70 538.20 L 424.90 540.90 L 423.70 543.40 L 422.10 545.70 L 420.20 547.60 L 418.00 549.20 L 415.50 550.40 L 412.80 551.10 L 409.90 551.40 L 407.00 551.10 L 404.30 550.40 L 401.80 549.20 L 399.50 547.60 L 397.60 545.70 L 396.00 543.40 L 394.80 540.90 L 394.10 538.20 L 393.80 535.30 L 394.10 532.40 L 394.80 529.70 L 396.00 527.20 L 397.60 524.90 L 399.50 523.00 L 401.80 521.40 L 404.30 520.20 L 407.00 519.50 L 409.90 519.20 Z M 409.90 523.70 L 405.80 524.40 L 404.10 525.30 L 401.10 527.80 L 399.10 531.20 L 398.30 535.30 L 399.10 539.30 L 401.10 542.80 L 404.10 545.30 L 407.80 546.70 L 412.00 546.70 L 413.90 546.10 L 417.30 544.10 L 419.90 541.10 L 420.70 539.30 L 421.40 535.30 L 420.70 531.20 L 418.70 527.80 L 415.70 525.30 L 413.90 524.40 L 409.90 523.70 Z"
                                                fill="#e7f4ff" fill-rule="nonzero" group-id="1,2,3,6,27" id="椭圆形"
                                                node-id="37" stroke="none" target-height="32.200012"
                                                target-width="32.100006" target-x="393.8" target-y="519.2" />
                                        </g>
                                        <g node-id="542">
                                            <path
                                                d="M 315.10 474.10 L 318.00 474.40 L 320.70 475.10 L 323.20 476.30 L 325.50 477.90 L 327.40 479.80 L 329.00 482.10 L 330.20 484.60 L 330.90 487.20 L 331.20 490.20 L 330.90 493.10 L 330.20 495.80 L 329.00 498.30 L 327.40 500.60 L 325.50 502.50 L 323.20 504.10 L 320.70 505.20 L 318.00 506.00 L 315.10 506.30 L 312.20 506.00 L 309.50 505.20 L 307.00 504.10 L 304.80 502.50 L 302.80 500.60 L 301.20 498.30 L 300.10 495.80 L 299.30 493.10 L 299.10 490.20 L 299.30 487.20 L 300.10 484.60 L 301.20 482.10 L 302.80 479.80 L 304.80 477.90 L 307.00 476.30 L 309.50 475.10 L 312.20 474.40 L 315.10 474.10 Z M 315.10 478.60 L 311.10 479.30 L 309.30 480.20 L 306.30 482.70 L 304.30 486.10 L 303.60 490.20 L 304.30 494.20 L 306.30 497.60 L 309.30 500.20 L 311.10 501.00 L 315.10 501.80 L 319.10 501.00 L 320.90 500.20 L 323.90 497.60 L 325.90 494.20 L 326.70 490.20 L 325.90 486.10 L 323.90 482.70 L 320.90 480.20 L 319.10 479.30 L 315.10 478.60 Z"
                                                fill="#e7f4ff" fill-rule="nonzero" group-id="1,2,3,6,28" id="椭圆形"
                                                node-id="38" stroke="none" target-height="32.19998"
                                                target-width="32.100006" target-x="299.1" target-y="474.1" />
                                        </g>
                                        <g node-id="543">
                                            <path
                                                d="M 378.80 453.40 L 381.70 453.60 L 384.40 454.40 L 386.90 455.60 L 389.20 457.20 L 391.10 459.10 L 392.70 461.30 L 393.90 463.80 L 394.60 466.50 L 394.90 469.40 L 394.60 472.40 L 393.90 475.10 L 392.70 477.60 L 391.10 479.80 L 389.20 481.70 L 386.90 483.30 L 384.40 484.50 L 381.70 485.20 L 378.80 485.50 L 375.90 485.20 L 373.20 484.50 L 370.70 483.30 L 368.50 481.70 L 366.50 479.80 L 364.90 477.60 L 363.80 475.10 L 363.00 472.40 L 362.80 469.40 L 363.00 466.50 L 363.80 463.80 L 364.90 461.30 L 366.50 459.10 L 368.50 457.20 L 370.70 455.60 L 373.20 454.40 L 375.90 453.60 L 378.80 453.40 Z M 378.80 457.90 L 374.80 458.60 L 373.00 459.40 L 370.00 462.00 L 368.00 465.40 L 367.30 469.40 L 368.00 473.50 L 370.00 476.90 L 373.00 479.40 L 374.80 480.30 L 378.80 481.00 L 382.80 480.30 L 384.60 479.40 L 387.60 476.90 L 389.60 473.50 L 390.40 469.40 L 389.60 465.40 L 387.60 462.00 L 384.60 459.40 L 382.80 458.60 L 378.80 457.90 Z"
                                                fill="#e7f4ff" fill-rule="nonzero" group-id="1,2,3,6,29" id="椭圆形"
                                                node-id="39" stroke="none" target-height="32.100006"
                                                target-width="32.100006" target-x="362.8" target-y="453.4" />
                                        </g>
                                        <g node-id="544">
                                            <path
                                                d="M 406.80 354.80 L 409.70 355.10 L 412.40 355.80 L 414.90 357.00 L 417.10 358.60 L 419.00 360.50 L 420.60 362.80 L 421.80 365.30 L 422.60 368.00 L 422.80 370.90 L 422.60 373.80 L 421.80 376.50 L 420.60 379.00 L 419.00 381.30 L 417.10 383.20 L 414.90 384.80 L 412.40 386.00 L 409.70 386.70 L 406.80 387.00 L 403.80 386.70 L 401.20 386.00 L 398.70 384.80 L 396.40 383.20 L 394.50 381.30 L 392.90 379.00 L 391.70 376.50 L 391.00 373.80 L 390.70 370.90 L 391.00 368.00 L 391.70 365.30 L 392.90 362.80 L 394.50 360.50 L 396.40 358.60 L 398.70 357.00 L 401.20 355.80 L 403.80 355.10 L 406.80 354.80 Z M 406.80 359.30 L 402.70 360.10 L 400.90 360.90 L 398.00 363.50 L 395.90 366.90 L 395.20 370.90 L 395.90 375.00 L 398.00 378.40 L 400.90 380.90 L 404.70 382.30 L 408.90 382.30 L 410.80 381.80 L 414.20 379.80 L 416.70 376.80 L 417.60 375.00 L 418.30 370.90 L 417.60 366.90 L 415.60 363.50 L 412.60 360.90 L 410.80 360.10 L 406.80 359.30 Z"
                                                fill="#e7f4ff" fill-rule="nonzero" group-id="1,2,3,6,30" id="椭圆形"
                                                node-id="40" stroke="none" target-height="32.200012"
                                                target-width="32.099976" target-x="390.7" target-y="354.8" />
                                        </g>
                                        <g node-id="545">
                                            <path
                                                d="M 453.90 464.80 L 456.80 465.00 L 459.50 465.80 L 462.00 467.00 L 464.30 468.60 L 466.20 470.50 L 467.80 472.70 L 468.90 475.20 L 469.70 477.90 L 470.00 480.80 L 469.70 483.80 L 468.90 486.50 L 467.80 489.00 L 466.20 491.20 L 464.30 493.10 L 462.00 494.70 L 459.50 495.90 L 456.80 496.60 L 453.90 496.90 L 451.00 496.60 L 448.30 495.90 L 445.80 494.70 L 443.50 493.10 L 441.60 491.20 L 440.00 489.00 L 438.90 486.50 L 438.10 483.80 L 437.80 480.80 L 438.10 477.90 L 438.90 475.20 L 440.00 472.70 L 441.60 470.50 L 443.50 468.60 L 445.80 467.00 L 448.30 465.80 L 451.00 465.00 L 453.90 464.80 Z M 453.90 469.30 L 449.90 470.00 L 448.10 470.90 L 445.10 473.40 L 443.10 476.80 L 442.40 480.80 L 443.10 484.90 L 445.10 488.30 L 448.10 490.80 L 451.80 492.20 L 456.00 492.20 L 457.90 491.70 L 461.30 489.70 L 463.90 486.70 L 464.70 484.90 L 465.40 480.80 L 464.70 476.80 L 462.70 473.40 L 459.70 470.90 L 457.90 470.00 L 453.90 469.30 Z"
                                                fill="#e7f4ff" fill-rule="nonzero" group-id="1,2,3,6,31" id="椭圆形"
                                                node-id="41" stroke="none" target-height="32.100006"
                                                target-width="32.200012" target-x="437.8" target-y="464.8" />
                                        </g>
                                        <g node-id="546">
                                            <path
                                                d="M 514.50 494.30 L 517.40 494.60 L 520.10 495.30 L 522.60 496.50 L 524.80 498.10 L 526.80 500.00 L 528.40 502.30 L 529.50 504.80 L 530.30 507.50 L 530.50 510.40 L 530.30 513.30 L 529.50 516.00 L 528.40 518.50 L 526.80 520.80 L 524.80 522.70 L 522.60 524.30 L 520.10 525.50 L 517.40 526.20 L 514.50 526.50 L 511.60 526.20 L 508.90 525.50 L 506.40 524.30 L 504.10 522.70 L 502.20 520.80 L 500.60 518.50 L 499.40 516.00 L 498.70 513.30 L 498.40 510.40 L 498.70 507.50 L 499.40 504.80 L 500.60 502.30 L 502.20 500.00 L 504.10 498.10 L 506.40 496.50 L 508.90 495.30 L 511.60 494.60 L 514.50 494.30 Z M 514.50 498.80 L 510.50 499.60 L 508.70 500.40 L 505.70 502.90 L 503.70 506.40 L 502.90 510.40 L 503.70 514.50 L 505.70 517.90 L 508.70 520.40 L 512.40 521.80 L 514.50 522.00 L 516.60 521.80 L 518.50 521.20 L 521.90 519.20 L 524.50 516.20 L 525.30 514.50 L 526.00 510.40 L 525.30 506.40 L 523.30 502.90 L 520.30 500.40 L 518.50 499.60 L 514.50 498.80 Z"
                                                fill="#e7f4ff" fill-rule="nonzero" group-id="1,2,3,6,32" id="椭圆形"
                                                node-id="42" stroke="none" target-height="32.200012"
                                                target-width="32.100006" target-x="498.4" target-y="494.3" />
                                        </g>
                                        <g node-id="547">
                                            <path
                                                d="M 526.90 409.30 L 529.80 409.60 L 532.50 410.30 L 535.00 411.50 L 537.30 413.10 L 539.20 415.00 L 540.80 417.20 L 542.00 419.70 L 542.70 422.40 L 543.00 425.40 L 542.70 428.30 L 542.00 431.00 L 540.80 433.50 L 539.20 435.70 L 537.30 437.60 L 535.00 439.20 L 532.50 440.40 L 529.80 441.20 L 526.90 441.40 L 524.00 441.20 L 521.30 440.40 L 518.80 439.20 L 516.60 437.60 L 514.70 435.70 L 513.10 433.50 L 511.90 431.00 L 511.10 428.30 L 510.90 425.40 L 511.10 422.40 L 511.90 419.70 L 513.10 417.20 L 514.70 415.00 L 516.60 413.10 L 518.80 411.50 L 521.30 410.30 L 524.00 409.60 L 526.90 409.30 Z M 526.90 413.80 L 522.90 414.50 L 521.10 415.40 L 518.10 417.90 L 516.10 421.30 L 515.40 425.40 L 516.10 429.40 L 518.10 432.80 L 521.10 435.40 L 522.90 436.20 L 526.90 436.90 L 531.00 436.20 L 532.70 435.40 L 535.70 432.80 L 537.70 429.40 L 538.50 425.40 L 537.70 421.30 L 535.70 417.90 L 532.70 415.40 L 531.00 414.50 L 526.90 413.80 Z"
                                                fill="#e7f4ff" fill-rule="nonzero" group-id="1,2,3,6,33" id="椭圆形"
                                                node-id="43" stroke="none" target-height="32.100006"
                                                target-width="32.100006" target-x="510.9" target-y="409.3" />
                                        </g>
                                        <g node-id="548">
                                            <path
                                                d="M 461.10 409.30 L 464.10 409.60 L 466.80 410.30 L 469.30 411.50 L 471.50 413.10 L 473.40 415.00 L 475.00 417.20 L 476.20 419.70 L 476.90 422.40 L 477.20 425.40 L 476.90 428.30 L 476.20 431.00 L 475.00 433.50 L 473.40 435.70 L 471.50 437.60 L 469.30 439.20 L 466.80 440.40 L 464.10 441.20 L 461.10 441.40 L 458.20 441.20 L 455.50 440.40 L 453.00 439.20 L 450.80 437.60 L 448.90 435.70 L 447.30 433.50 L 446.10 431.00 L 445.40 428.30 L 445.10 425.40 L 445.40 422.40 L 446.10 419.70 L 447.30 417.20 L 448.90 415.00 L 450.80 413.10 L 453.00 411.50 L 455.50 410.30 L 458.20 409.60 L 461.10 409.30 Z M 461.10 413.80 L 457.10 414.50 L 455.30 415.40 L 452.30 417.90 L 450.30 421.30 L 449.60 425.40 L 450.30 429.40 L 452.30 432.80 L 455.30 435.40 L 457.10 436.20 L 461.10 436.90 L 465.20 436.20 L 467.00 435.40 L 470.00 432.80 L 472.00 429.40 L 472.70 425.40 L 472.00 421.30 L 470.00 417.90 L 467.00 415.40 L 465.20 414.50 L 461.10 413.80 Z"
                                                fill="#e7f4ff" fill-rule="nonzero" group-id="1,2,3,6,34" id="椭圆形"
                                                node-id="44" stroke="none" target-height="32.100006"
                                                target-width="32.100006" target-x="445.1" target-y="409.3" />
                                        </g>
                                        <g node-id="549">
                                            <path
                                                d="M 491.20 356.90 L 494.10 357.20 L 496.80 357.90 L 499.30 359.10 L 501.50 360.70 L 503.50 362.60 L 505.00 364.90 L 506.20 367.40 L 507.00 370.10 L 507.20 373.00 L 507.00 375.90 L 506.20 378.60 L 505.00 381.10 L 503.50 383.40 L 501.50 385.30 L 499.30 386.90 L 496.80 388.10 L 494.10 388.80 L 491.20 389.10 L 488.30 388.80 L 485.60 388.10 L 483.10 386.90 L 480.80 385.30 L 478.90 383.40 L 477.30 381.10 L 476.10 378.60 L 475.40 375.90 L 475.10 373.00 L 475.40 370.10 L 476.10 367.40 L 477.30 364.90 L 478.90 362.60 L 480.80 360.70 L 483.10 359.10 L 485.60 357.90 L 488.30 357.20 L 491.20 356.90 Z M 491.20 361.40 L 487.10 362.10 L 485.40 363.00 L 482.40 365.50 L 480.40 368.90 L 479.60 373.00 L 480.40 377.00 L 482.40 380.50 L 485.40 383.00 L 487.10 383.80 L 491.20 384.60 L 495.20 383.80 L 497.00 383.00 L 500.00 380.50 L 502.00 377.00 L 502.70 373.00 L 502.00 368.90 L 500.00 365.50 L 497.00 363.00 L 495.20 362.10 L 491.20 361.40 Z"
                                                fill="#e7f4ff" fill-rule="nonzero" group-id="1,2,3,6,35" id="椭圆形"
                                                node-id="45" stroke="none" target-height="32.200012"
                                                target-width="32.100006" target-x="475.1" target-y="356.9" />
                                        </g>
                                        <g node-id="550">
                                            <path
                                                d="M 494.00 366.10 L 497.90 372.40 L 502.00 377.90 L 506.10 382.80 L 510.30 386.90 L 514.60 390.50 L 519.00 393.50 L 523.50 396.00 L 528.60 398.10 L 528.40 398.70 L 523.60 396.70 L 519.10 394.20 L 514.60 391.20 L 510.20 387.70 L 506.00 383.50 L 501.80 378.70 L 497.80 373.20 L 493.80 366.90 L 493.50 366.40 L 494.00 366.10 Z"
                                                fill="#000000" fill-rule="nonzero" group-id="1,2,3,6,36" id="路径-275"
                                                node-id="46" stroke="none" target-height="32.600006"
                                                target-width="35.099976" target-x="493.5" target-y="366.1" />
                                        </g>
                                        <g node-id="551">
                                            <path
                                                d="M 342.80 372.40 L 343.30 372.50 L 341.40 379.40 L 339.10 385.40 L 336.50 390.90 L 333.60 395.70 L 330.50 399.90 L 327.00 403.70 L 323.30 406.90 L 319.20 409.70 L 314.80 412.10 L 310.00 414.00 L 309.50 414.20 L 309.30 413.70 L 314.10 411.80 L 318.50 409.50 L 322.50 406.80 L 326.30 403.60 L 329.70 399.90 L 332.90 395.80 L 335.80 391.10 L 338.40 385.70 L 340.70 379.80 L 342.80 372.40 Z"
                                                fill="#000000" fill-rule="nonzero" group-id="1,2,3,6,37" id="路径-276"
                                                node-id="47" stroke="none" target-height="41.80002" target-width="34"
                                                target-x="309.3" target-y="372.4" />
                                        </g>
                                        <g node-id="552">
                                            <path
                                                d="M 493.50 366.30 L 494.50 370.70 L 495.00 370.60 L 494.10 366.20 L 493.50 366.30 Z M 495.40 375.10 L 496.40 379.50 L 496.90 379.40 L 496.00 375.00 L 495.40 375.10 Z M 497.30 383.90 L 498.30 388.30 L 498.90 388.20 L 497.90 383.80 L 497.30 383.90 Z M 499.30 392.70 L 500.20 397.10 L 500.80 397.00 L 499.80 392.60 L 499.30 392.70 Z M 501.20 401.50 L 502.10 405.90 L 502.70 405.80 L 501.70 401.40 L 501.20 401.50 Z M 503.10 410.30 L 504.10 414.70 L 504.60 414.60 L 503.70 410.20 L 503.10 410.30 Z M 505.00 419.10 L 506.00 423.50 L 506.50 423.40 L 505.60 419.00 L 505.00 419.10 Z M 506.90 427.90 L 507.90 432.30 L 508.50 432.20 L 507.50 427.80 L 506.90 427.90 Z M 508.90 436.70 L 509.80 441.10 L 510.40 441.00 L 509.40 436.60 L 508.90 436.70 Z M 510.80 445.50 L 511.70 449.90 L 512.30 449.80 L 511.30 445.40 L 510.80 445.50 Z M 512.70 454.30 L 513.70 458.70 L 514.20 458.60 L 513.30 454.20 L 512.70 454.30 Z M 514.60 463.10 L 515.60 467.60 L 516.10 467.40 L 515.20 463.00 L 514.60 463.10 Z M 516.50 472.00 L 517.50 476.40 L 518.10 476.20 L 517.10 471.80 L 516.50 472.00 Z M 518.50 480.80 L 519.40 485.20 L 520.00 485.00 L 519.00 480.60 L 518.50 480.80 Z M 520.40 489.60 L 521.40 494.00 L 521.90 493.80 L 520.90 489.40 L 520.40 489.60 Z M 522.30 498.40 L 523.30 502.80 L 523.80 502.60 L 522.90 498.20 L 522.30 498.40 Z M 524.20 507.20 L 525.20 511.60 L 525.70 511.40 L 524.80 507.00 L 524.20 507.20 Z M 526.20 516.00 L 527.10 520.40 L 527.70 520.30 L 526.70 515.90 L 526.20 516.00 Z M 528.10 524.80 L 529.00 529.20 L 529.60 529.10 L 528.60 524.70 L 528.10 524.80 Z M 530.00 533.60 L 530.30 534.80 L 530.80 534.70 L 530.50 533.50 L 530.00 533.60 Z"
                                                fill="#000000" fill-rule="nonzero" group-id="1,2,3,6,38" id="路径-277"
                                                node-id="48" stroke="none" target-height="168.59998"
                                                target-width="37.299988" target-x="493.5" target-y="366.2" />
                                        </g>
                                        <g node-id="553">
                                            <path
                                                d="M 342.30 373.00 L 341.90 377.50 L 342.50 377.50 L 342.80 373.00 L 342.30 373.00 Z M 341.50 381.90 L 341.20 386.40 L 341.70 386.50 L 342.10 382.00 L 341.50 381.90 Z M 340.80 390.90 L 340.40 395.40 L 341.00 395.50 L 341.40 391.00 L 340.80 390.90 Z M 340.10 399.90 L 339.70 404.40 L 340.30 404.40 L 340.60 400.00 L 340.10 399.90 Z M 339.30 408.90 L 339.00 413.40 L 339.50 413.40 L 339.90 408.90 L 339.30 408.90 Z M 338.60 417.90 L 338.20 422.40 L 338.80 422.40 L 339.10 417.90 L 338.60 417.90 Z M 337.80 426.80 L 337.50 431.30 L 338.00 431.40 L 338.40 426.90 L 337.80 426.80 Z M 337.10 435.80 L 336.70 440.30 L 337.30 440.40 L 337.70 435.90 L 337.10 435.80 Z M 336.40 444.80 L 336.00 449.30 L 336.60 449.30 L 336.90 444.90 L 336.40 444.80 Z M 335.60 453.80 L 335.30 458.30 L 335.80 458.30 L 336.20 453.80 L 335.60 453.80 Z M 334.90 462.80 L 334.50 467.30 L 335.10 467.30 L 335.50 462.80 L 334.90 462.80 Z M 334.20 471.80 L 333.80 476.20 L 334.30 476.30 L 334.70 471.80 L 334.20 471.80 Z M 333.40 480.70 L 333.00 485.20 L 333.60 485.30 L 334.00 480.80 L 333.40 480.70 Z M 332.70 489.70 L 332.30 494.20 L 332.90 494.20 L 333.20 489.80 L 332.70 489.70 Z M 331.90 498.70 L 331.60 503.20 L 332.10 503.20 L 332.50 498.70 L 331.90 498.70 Z M 331.20 507.70 L 330.80 512.20 L 331.40 512.20 L 331.80 507.70 L 331.20 507.70 Z M 330.50 516.70 L 330.10 521.10 L 330.70 521.20 L 331.00 516.70 L 330.50 516.70 Z M 329.70 525.60 L 329.40 530.10 L 329.90 530.20 L 330.30 525.70 L 329.70 525.60 Z M 329.00 534.60 L 328.60 539.10 L 329.20 539.20 L 329.50 534.70 L 329.00 534.60 Z"
                                                fill="#000000" fill-rule="nonzero" group-id="1,2,3,6,39" id="路径-278"
                                                node-id="49" stroke="none" target-height="166.20001"
                                                target-width="14.199982" target-x="328.6" target-y="373" />
                                        </g>
                                        <g node-id="554">
                                            <path d="M 309.40 382.30 L 526.80 367.80 L 526.80 363.20 L 309.40 369.50 Z"
                                                fill="#000000" fill-rule="evenodd" group-id="1,2,3,6,40" id="路径-210"
                                                node-id="50" stroke="none" target-height="19.099976"
                                                target-width="217.4" target-x="309.4" target-y="363.2" />
                                        </g>
                                        <path
                                            d="M 556.80 532.40 L 519.10 355.10 L 312.60 364.60 L 298.80 542.70 L 418.10 545.40 L 418.10 399.10 L 433.60 545.50 L 556.80 532.40 Z M 518.60 355.70 L 556.10 531.90 L 434.10 544.80 L 418.10 393.70 L 417.60 393.70 L 417.60 544.90 L 299.40 542.20 L 313.10 365.20 L 518.60 355.70 Z"
                                            fill="#000000" fill-rule="nonzero" group-id="1,2,3,6" id="路径-271"
                                            node-id="51" stroke="none" target-height="190.4" target-width="258"
                                            target-x="298.8" target-y="355.1" />
                                    </g>
                                    <g node-id="521">
                                        <g node-id="555">
                                            <path
                                                d="M 230.20 186.40 L 60.10 92.30 L 57.00 91.40 L 52.70 90.90 L 49.30 90.20 L 45.60 89.00 L 40.80 86.80 L 37.70 85.00 L 34.40 82.60 L 29.30 78.30 L 8.90 71.10 L 7.40 69.30 L 6.70 67.60 L 6.40 66.00 L 6.70 64.50 L 7.40 62.90 L 8.50 61.70 L 9.90 60.70 L 11.50 60.00 L 13.40 59.80 L 15.80 60.10 L 21.30 61.70 L 31.00 65.20 L 1.60 39.90 L 0.80 37.90 L 0.60 36.20 L 0.80 34.70 L 1.60 33.30 L 2.90 32.00 L 4.40 31.10 L 6.00 30.70 L 7.80 30.90 L 9.90 31.70 L 12.40 33.20 L 36.90 54.00 L 26.10 43.40 L 26.20 41.90 L 26.80 40.50 L 27.90 39.30 L 29.70 38.40 L 31.60 38.00 L 33.90 38.60 L 46.70 49.80 L 36.10 39.30 L 36.00 37.80 L 36.40 36.60 L 37.10 35.60 L 39.60 34.10 L 42.30 34.10 L 43.80 34.70 L 53.10 43.40 L 45.10 34.70 L 45.40 33.00 L 46.30 31.70 L 47.60 30.90 L 49.20 30.50 L 50.80 30.50 L 52.40 30.90 L 61.00 39.40 L 67.40 46.50 L 72.10 52.40 L 75.30 57.20 L 77.30 61.20 L 78.50 62.20 L 97.00 70.00 L 255.70 139.20 L 230.20 186.40 Z"
                                                fill="#ffc7ca" fill-rule="evenodd" group-id="1,2,3,7,41" node-id="437"
                                                stroke="none" target-height="155.9" target-width="255.09999"
                                                target-x="0.6" target-y="30.5" />
                                        </g>
                                        <path d="M 251.00 137.20 L 219.40 180.20 L 223.60 182.80 Z" fill="#000000"
                                            fill-rule="evenodd" group-id="1,2,3,7,42" id="路径-287" node-id="56"
                                            stroke="none" target-height="45.600006" target-width="31.600006"
                                            target-x="219.4" target-y="137.2" />
                                    </g>
                                    <path
                                        d="M 47.60 30.60 L 49.30 30.20 L 50.80 30.20 L 52.60 30.60 L 52.40 31.20 L 50.90 30.70 L 49.40 30.70 L 47.90 31.20 L 46.60 31.90 L 45.90 33.00 L 45.50 34.60 L 53.50 43.30 L 53.10 43.70 L 43.60 34.90 L 41.90 34.30 L 40.30 34.30 L 38.70 34.90 L 37.50 35.70 L 36.40 37.70 L 36.40 39.20 L 47.10 49.60 L 46.70 50.00 L 34.90 39.50 L 33.40 38.60 L 31.60 38.30 L 29.90 38.60 L 28.20 39.50 L 27.10 40.60 L 26.50 41.90 L 26.50 43.30 L 37.20 53.80 L 36.80 54.20 L 12.30 33.40 L 9.90 31.90 L 7.80 31.20 L 6.10 31.00 L 4.50 31.40 L 3.00 32.20 L 1.80 33.50 L 1.10 34.80 L 0.80 36.20 L 1.00 37.80 L 1.80 39.80 L 32.50 66.10 L 21.20 62.00 L 15.80 60.40 L 13.60 60.20 L 11.80 60.30 L 10.20 60.90 L 8.80 61.80 L 7.80 63.00 L 7.00 64.60 L 6.70 66.00 L 6.90 67.50 L 7.60 69.10 L 9.10 71.00 L 29.60 78.20 L 34.70 82.50 L 38.20 85.00 L 41.90 87.00 L 48.30 89.60 L 52.90 90.80 L 57.10 91.20 L 60.40 92.10 L 60.20 92.60 L 57.30 91.80 L 50.60 90.90 L 45.40 89.20 L 41.60 87.50 L 37.90 85.40 L 34.30 82.90 L 29.40 78.70 L 8.70 71.50 L 7.20 69.50 L 6.40 67.70 L 6.20 66.00 L 6.50 64.40 L 7.30 62.70 L 8.40 61.40 L 9.90 60.40 L 11.60 59.80 L 13.60 59.60 L 16.30 60.00 L 29.70 64.50 L 1.40 40.20 L 0.50 38.00 L 0.30 36.20 L 0.60 34.70 L 1.30 33.20 L 2.70 31.80 L 4.30 30.90 L 6.00 30.50 L 7.80 30.60 L 9.90 31.30 L 12.60 33.00 L 31.10 48.60 L 25.90 43.60 L 26.00 41.80 L 26.60 40.40 L 27.80 39.10 L 29.10 38.30 L 31.70 37.80 L 34.20 38.40 L 37.80 41.30 L 35.90 39.40 L 35.90 37.80 L 36.20 36.50 L 37.00 35.40 L 38.30 34.50 L 40.10 33.80 L 41.90 33.70 L 44.00 34.40 L 48.00 38.20 L 44.90 34.80 L 45.70 32.10 L 47.60 30.60 Z"
                                        fill="#000000" fill-rule="nonzero" group-id="1,2,3" id="路径" node-id="57"
                                        stroke="none" target-height="62.399998" target-width="60.100002" target-x="0.3"
                                        target-y="30.2" />
                                    <g node-id="522">
                                        <g node-id="557">
                                            <path
                                                d="M 404.30 107.60 L 405.50 129.10 L 405.70 130.30 L 406.40 131.20 L 407.50 131.90 L 409.50 132.50 L 419.20 133.00 L 427.40 134.00 L 435.10 135.40 L 440.50 136.90 L 440.90 137.40 L 440.90 138.10 L 440.10 139.40 L 438.30 141.30 L 435.10 143.90 L 426.90 149.40 L 422.00 152.00 L 416.80 154.40 L 411.40 156.50 L 406.20 157.90 L 399.50 158.80 L 396.50 158.70 L 392.50 157.90 L 388.50 156.50 L 384.80 154.70 L 381.10 152.20 L 377.50 149.00 L 374.00 145.20 L 370.60 140.50 L 367.20 135.00 L 375.90 133.80 L 380.80 133.60 L 383.10 133.10 L 384.10 132.40 L 384.40 131.70 L 384.40 107.60 L 404.30 107.60 Z"
                                                fill="#ffc7ca" fill-rule="evenodd" group-id="1,2,3,8,43" node-id="448"
                                                stroke="none" target-height="51.200005" target-width="73.69998"
                                                target-x="367.2" target-y="107.6" />
                                        </g>
                                        <path
                                            d="M 404.30 107.90 L 404.50 108.40 L 401.20 109.60 L 397.60 110.40 L 393.90 110.70 L 387.30 109.90 L 384.00 108.90 L 384.20 108.40 L 387.20 109.30 L 390.40 109.90 L 393.90 110.10 L 397.40 109.90 L 400.80 109.20 L 404.30 107.90 Z"
                                            fill="#000000" fill-rule="nonzero" group-id="1,2,3,8,44" id="路径"
                                            node-id="62" stroke="none" target-height="2.7999954" target-width="20.5"
                                            target-x="384" target-y="107.9" />
                                    </g>
                                    <g node-id="523">
                                        <path
                                            d="M 435.30 56.00 L 435.80 52.70 L 435.60 49.90 L 435.00 47.40 L 433.30 44.20 L 433.10 43.20 L 433.80 40.30 L 437.90 31.40 L 438.50 28.90 L 438.70 26.40 L 438.20 23.70 L 436.90 21.00 L 435.40 19.00 L 433.60 17.50 L 431.50 16.50 L 429.30 16.00 L 427.00 15.90 L 422.50 16.70 L 418.20 18.50 L 416.20 19.00 L 413.20 18.70 L 410.60 17.00 L 409.40 15.40 L 406.90 10.00 L 404.10 5.60 L 402.40 4.00 L 400.60 2.70 L 398.50 1.90 L 396.20 1.30 L 392.40 1.30 L 390.70 1.90 L 389.30 3.00 L 388.00 4.70 L 384.10 2.70 L 380.50 1.60 L 377.10 1.10 L 373.90 1.20 L 370.80 2.00 L 368.30 3.10 L 366.00 4.70 L 363.90 6.70 L 362.10 9.00 L 360.70 11.60 L 359.70 14.40 L 359.10 17.40 L 359.00 20.50 L 359.40 23.70 L 356.10 26.50 L 353.60 29.30 L 351.70 32.10 L 350.30 34.90 L 349.40 37.70 L 349.00 40.00 L 349.10 42.40 L 349.70 44.70 L 350.90 47.10 L 352.60 49.60 L 354.90 52.20 L 353.30 55.30 L 352.50 57.80 L 352.40 59.90 L 352.70 61.70 L 353.30 62.70 L 354.00 63.10 L 354.80 62.80 L 356.00 61.70 L 357.80 59.00 L 365.30 58.10 L 366.80 50.40 L 378.90 50.40 L 385.00 41.80 L 393.90 35.50 L 400.40 37.70 L 409.40 46.10 L 416.60 50.40 L 421.90 54.70 L 429.40 57.10 L 435.30 56.00 Z"
                                            fill="#2f1b16" fill-rule="evenodd" group-id="1,2,3,9" id="路径-266"
                                            node-id="64" stroke="none" target-height="62" target-width="89.70001"
                                            target-x="349" target-y="1.1" />
                                        <path
                                            d="M 388.10 31.80 L 388.40 32.00 L 388.30 32.30 L 386.30 33.40 L 384.20 35.10 L 382.30 37.30 L 377.50 44.40 L 376.30 45.80 L 375.10 46.60 L 373.90 46.80 L 372.40 46.70 L 370.70 45.90 L 368.70 44.50 L 368.70 44.10 L 369.10 44.00 L 371.30 45.60 L 373.00 46.20 L 374.40 46.20 L 375.70 45.60 L 383.70 34.80 L 385.90 32.90 L 388.10 31.80 Z"
                                            fill="#ffffff" fill-rule="nonzero" group-id="1,2,3,9" id="路径-310"
                                            node-id="65" stroke="none" target-height="15" target-width="19.699982"
                                            target-x="368.7" target-y="31.8" />
                                        <path
                                            d="M 387.90 4.30 L 389.00 2.80 L 390.40 1.60 L 392.00 0.80 L 394.10 0.40 L 396.80 0.30 L 401.80 1.30 L 404.80 3.10 L 406.70 5.10 L 412.30 13.80 L 414.20 15.40 L 416.70 15.40 L 426.10 13.40 L 428.10 13.20 L 433.10 13.50 L 435.80 14.50 L 438.20 16.00 L 440.50 18.20 L 442.10 20.60 L 443.10 23.00 L 443.60 25.50 L 443.60 28.10 L 442.90 31.00 L 441.60 34.10 L 439.50 37.50 L 436.50 41.40 L 436.10 41.40 L 436.10 41.00 L 439.10 37.20 L 441.10 33.90 L 442.40 30.80 L 443.00 28.10 L 443.10 25.50 L 442.60 23.10 L 441.60 20.80 L 440.00 18.60 L 437.90 16.50 L 435.50 15.00 L 433.00 14.10 L 430.10 13.70 L 426.30 13.90 L 416.50 16.00 L 414.10 15.90 L 412.00 14.30 L 406.40 5.60 L 404.50 3.60 L 403.10 2.60 L 400.00 1.40 L 396.80 0.90 L 394.30 0.90 L 392.30 1.30 L 390.70 2.10 L 389.40 3.10 L 388.40 4.50 L 388.00 4.70 L 387.90 4.30 Z"
                                            fill="#2f1b16" fill-rule="nonzero" group-id="1,2,3,9" id="路径-311"
                                            node-id="66" stroke="none" target-height="41.100002"
                                            target-width="55.700012" target-x="387.9" target-y="0.3" />
                                        <path
                                            d="M 357.50 23.00 L 357.90 23.10 L 357.80 23.50 L 354.10 25.80 L 351.30 28.10 L 349.20 30.30 L 347.70 32.50 L 346.80 34.60 L 346.20 36.80 L 346.10 39.80 L 346.60 42.80 L 347.50 45.70 L 348.70 48.30 L 350.30 50.60 L 352.00 52.30 L 352.00 52.70 L 351.60 52.70 L 349.90 51.00 L 348.20 48.60 L 346.90 45.90 L 346.00 43.00 L 345.60 39.90 L 345.70 36.70 L 346.20 34.50 L 347.20 32.20 L 348.80 30.00 L 350.90 27.70 L 353.80 25.40 L 357.50 23.00 Z"
                                            fill="#2f1b16" fill-rule="nonzero" group-id="1,2,3,9" id="路径-312"
                                            node-id="67" stroke="none" target-height="29.7" target-width="12.299988"
                                            target-x="345.6" target-y="23" />
                                    </g>
                                    <path
                                        d="M 363.40 77.50 L 365.20 84.10 L 367.30 89.70 L 369.60 94.50 L 372.00 98.40 L 374.60 101.70 L 377.40 104.40 L 380.30 106.60 L 383.40 108.20 L 386.70 109.40 L 390.20 110.10 L 394.10 110.40 L 397.80 110.10 L 401.30 109.40 L 404.60 108.10 L 407.80 106.30 L 410.80 104.00 L 413.60 101.00 L 416.40 97.40 L 419.10 92.90 L 421.60 87.60 L 424.00 81.20 L 426.10 73.70 L 429.20 71.20 L 431.60 68.60 L 433.50 65.70 L 434.90 62.50 L 435.70 59.00 L 435.70 55.10 L 435.20 53.80 L 433.40 51.90 L 430.40 50.90 L 428.70 51.00 L 427.10 51.40 L 425.30 52.80 L 424.60 53.00 L 423.90 52.70 L 420.40 47.70 L 418.70 46.30 L 416.90 45.50 L 413.90 45.00 L 412.20 44.20 L 410.00 42.50 L 407.10 39.70 L 401.90 33.50 L 400.20 32.10 L 398.30 31.30 L 396.30 31.00 L 394.10 31.10 L 391.30 31.90 L 388.80 33.00 L 386.50 34.60 L 382.50 39.00 L 378.70 45.10 L 377.00 46.90 L 375.50 48.00 L 374.30 48.40 L 373.00 48.40 L 371.70 47.90 L 367.80 45.60 L 366.80 45.50 L 365.40 45.90 L 364.30 46.80 L 363.60 48.20 L 363.40 50.00 L 363.40 54.90 L 362.80 56.50 L 361.90 56.80 L 357.00 56.70 L 355.80 57.10 L 354.60 58.00 L 353.50 60.00 L 353.20 61.60 L 353.20 64.10 L 354.60 68.90 L 357.10 72.50 L 360.60 75.90 L 362.40 77.20 L 363.40 77.50 Z"
                                        fill="#ffc7ca" fill-rule="evenodd" group-id="1,2,3" id="路径-265" node-id="68"
                                        stroke="none" target-height="79.4" target-width="82.5" target-x="353.2"
                                        target-y="31" />
                                    <path
                                        d="M 376.10 133.50 L 379.80 137.00 L 383.50 139.90 L 387.20 142.00 L 390.80 143.50 L 394.50 144.40 L 398.30 144.70 L 402.10 144.50 L 406.20 143.70 L 410.40 142.30 L 414.90 140.20 L 419.60 137.30 L 424.60 133.50 L 416.40 371.10 L 370.70 369.60 L 376.10 133.50 Z"
                                        fill="#fdf7da" fill-rule="evenodd" group-id="1,2,3" id="路径-268" node-id="69"
                                        stroke="none" target-height="237.6" target-width="53.899994" target-x="370.7"
                                        target-y="133.5" />
                                    <g node-id="524">
                                        <g node-id="559">
                                            <path
                                                d="M 306.80 375.10 L 313.70 240.60 L 218.00 191.80 L 258.30 125.60 L 293.40 139.70 L 301.00 141.60 L 307.90 142.70 L 314.10 143.30 L 319.60 143.40 L 324.60 143.10 L 329.20 142.40 L 333.20 141.20 L 342.10 137.60 L 347.70 135.90 L 353.80 134.50 L 360.40 133.60 L 367.70 133.20 L 375.70 133.20 L 384.70 370.00 L 306.80 375.10 Z"
                                                fill="#95bdec" fill-rule="evenodd" group-id="1,2,3,10,45" node-id="466"
                                                stroke="none" target-height="249.5" target-width="166.70001"
                                                target-x="218" target-y="125.6" />
                                        </g>
                                        <g node-id="560">
                                            <path
                                                d="M 378.00 131.70 L 363.60 131.70 L 365.80 142.80 L 371.80 144.40 L 365.70 150.80 L 384.50 300.90 L 385.10 300.90 L 378.00 131.70 Z M 377.50 132.20 L 384.20 294.10 L 366.30 151.00 L 372.90 144.10 L 366.30 142.30 L 364.30 132.20 L 377.50 132.20 Z"
                                                fill="#ffffff" fill-rule="nonzero" group-id="1,2,3,10,46" id="路径-284"
                                                node-id="74" stroke="none" target-height="169.2" target-width="21.5"
                                                target-x="363.6" target-y="131.7" />
                                        </g>
                                        <path d="M 246.50 206.20 L 317.40 237.30 L 308.80 331.00 L 313.80 240.80 Z"
                                            fill="#000000" fill-rule="evenodd" group-id="1,2,3,10,47" id="路径-285"
                                            node-id="75" stroke="none" target-height="124.8" target-width="70.899994"
                                            target-x="246.5" target-y="206.2" />
                                    </g>
                                    <g node-id="525">
                                        <g node-id="562">
                                            <path
                                                d="M 423.20 133.50 L 435.00 134.40 L 446.40 135.90 L 457.40 137.80 L 468.10 140.30 L 478.40 143.20 L 488.40 146.60 L 498.20 150.60 L 507.60 155.00 L 516.80 159.80 L 525.80 165.20 L 534.50 171.10 L 543.00 177.50 L 551.30 184.40 L 559.30 191.90 L 567.10 200.00 L 516.60 263.50 L 482.90 217.80 L 525.70 364.80 L 415.10 369.40 L 423.20 133.50 Z"
                                                fill="#95bdec" fill-rule="evenodd" group-id="1,2,3,11,48" node-id="480"
                                                stroke="none" target-height="235.9" target-width="151.99997"
                                                target-x="415.1" target-y="133.5" />
                                        </g>
                                        <path
                                            d="M 438.30 132.90 L 422.50 131.40 L 416.80 300.60 L 417.40 300.60 L 436.10 151.20 L 430.80 146.50 L 436.10 142.90 L 438.30 132.90 Z M 423.10 132.00 L 437.60 133.40 L 435.60 142.60 L 429.90 146.50 L 435.50 151.40 L 417.60 294.40 L 423.10 132.00 Z"
                                            fill="#ffffff" fill-rule="nonzero" group-id="1,2,3,11,49" id="路径-283"
                                            node-id="80" stroke="none" target-height="169.20001" target-width="21.5"
                                            target-x="416.8" target-y="131.4" />
                                    </g>
                                    <g node-id="526">
                                        <path
                                            d="M 337.80 304.60 L 339.60 300.80 L 341.40 298.00 L 343.40 296.00 L 345.40 294.60 L 347.60 293.80 L 350.00 293.50 L 441.10 293.50 L 442.90 294.20 L 444.30 295.30 L 445.50 296.80 L 446.40 298.70 L 447.00 301.30 L 447.20 304.60 L 447.20 346.80 L 446.80 349.50 L 446.20 351.80 L 445.20 353.60 L 444.10 355.10 L 442.60 356.30 L 440.50 357.50 L 435.80 358.70 L 433.20 358.80 L 347.70 358.80 L 344.50 357.20 L 342.00 355.40 L 340.20 353.40 L 338.90 351.10 L 338.10 348.50 L 337.80 345.50 L 337.80 304.60 Z"
                                            fill="#83acdb" fill-rule="evenodd" group-id="1,2,3,12" id="路径-120"
                                            node-id="82" stroke="none" target-height="65.29999"
                                            target-width="109.400024" target-x="337.8" target-y="293.5" />
                                        <path
                                            d="M 371.50 292.20 L 372.20 289.10 L 373.10 286.80 L 374.30 285.00 L 375.70 283.70 L 377.30 282.90 L 379.20 282.40 L 406.50 282.10 L 409.20 282.70 L 411.20 283.50 L 412.60 284.60 L 413.60 285.80 L 414.20 287.20 L 414.50 292.40 L 414.00 296.00 L 412.80 299.20 L 371.50 299.20 L 371.50 292.20 Z"
                                            fill="#83acdb" fill-rule="evenodd" group-id="1,2,3,12" id="路径-121"
                                            node-id="83" stroke="none" target-height="17.100006" target-width="43"
                                            target-x="371.5" target-y="282.1" />
                                        <path
                                            d="M 382.10 285.30 L 403.80 285.40 L 405.60 285.90 L 408.70 287.80 L 411.00 290.50 L 411.80 292.20 L 412.50 295.90 L 412.30 297.80 L 411.80 299.60 L 409.90 302.70 L 407.20 305.00 L 403.80 306.30 L 382.10 306.50 L 378.40 305.80 L 375.30 304.00 L 373.00 301.20 L 371.70 297.80 L 371.50 295.90 L 372.20 292.20 L 374.00 289.00 L 376.80 286.70 L 380.20 285.40 L 382.10 285.30 Z"
                                            fill="#ffbe33" fill-rule="evenodd" group-id="1,2,3,12" id="矩形" node-id="84"
                                            stroke="none" target-height="21.200012" target-width="41" target-x="371.5"
                                            target-y="285.3" />
                                        <g node-id="564">
                                            <g node-id="569">
                                                <path
                                                    d="M 362.80 299.20 L 415.00 299.20 L 418.50 299.50 L 421.90 300.20 L 425.10 301.30 L 428.10 302.80 L 430.80 304.70 L 433.30 306.90 L 435.50 309.40 L 437.40 312.10 L 438.90 315.10 L 440.00 318.30 L 440.70 321.70 L 441.00 333.90 L 440.70 337.40 L 440.00 340.80 L 438.90 344.00 L 437.40 347.00 L 435.50 349.70 L 433.30 352.20 L 430.80 354.40 L 428.10 356.30 L 425.10 357.80 L 421.90 358.90 L 418.50 359.60 L 415.00 359.90 L 362.80 359.90 L 359.20 359.60 L 355.90 358.90 L 352.70 357.80 L 349.70 356.30 L 346.90 354.40 L 344.40 352.20 L 342.20 349.70 L 340.40 347.00 L 338.80 344.00 L 337.70 340.80 L 337.00 337.40 L 336.80 325.20 L 337.00 321.70 L 337.70 318.30 L 338.80 315.10 L 340.40 312.10 L 342.20 309.40 L 344.40 306.90 L 346.90 304.70 L 349.70 302.80 L 352.70 301.30 L 355.90 300.20 L 359.20 299.50 L 362.80 299.20 Z"
                                                    fill="#ffce66" fill-rule="evenodd" group-id="1,2,3,12,50,55"
                                                    node-id="494" stroke="none" target-height="60.69998"
                                                    target-width="104.20001" target-x="336.8" target-y="299.2" />
                                            </g>
                                            <g node-id="570">
                                                <path
                                                    d="M 333.90 337.60 L 440.80 337.60 L 440.80 347.80 L 333.90 347.80 Z"
                                                    fill="#ffffff" fill-rule="evenodd" group-id="1,2,3,12,50,56"
                                                    id="路径-123" node-id="89" stroke="none" target-height="10.199982"
                                                    target-width="106.899994" target-x="333.9" target-y="337.6" />
                                            </g>
                                            <path d="M 441.00 316.90 L 441.00 317.90 L 336.80 317.90 L 336.80 316.90 Z"
                                                fill="#ffffff" fill-rule="nonzero" group-id="1,2,3,12,50,57" id="路径-122"
                                                node-id="90" stroke="none" target-height="1" target-width="104.20001"
                                                target-x="336.8" target-y="316.9" />
                                        </g>
                                        <path
                                            d="M 409.30 332.10 L 409.10 335.20 L 407.60 340.70 L 406.30 343.20 L 404.10 346.30 L 401.50 349.00 L 398.40 351.10 L 395.90 352.40 L 390.40 353.90 L 387.30 354.20 L 384.30 353.90 L 378.70 352.40 L 376.20 351.10 L 373.10 349.00 L 370.50 346.30 L 368.30 343.20 L 366.10 338.00 L 365.50 335.20 L 365.30 332.10 L 366.10 326.20 L 368.30 321.00 L 370.50 317.90 L 373.10 315.30 L 376.20 313.10 L 378.70 311.80 L 384.30 310.30 L 387.30 310.10 L 390.40 310.30 L 395.90 311.80 L 398.40 313.10 L 401.50 315.30 L 404.10 317.90 L 406.30 321.00 L 407.60 323.60 L 409.10 329.10 L 409.30 332.10 Z"
                                            fill="#95bdec" fill-rule="evenodd" group-id="1,2,3,12" id="椭圆形" node-id="91"
                                            stroke="none" target-height="44.100006" target-width="44" target-x="365.3"
                                            target-y="310.1" />
                                        <path
                                            d="M 402.60 331.60 L 402.40 334.30 L 401.70 336.80 L 400.60 339.10 L 399.20 341.10 L 397.50 342.90 L 395.40 344.40 L 393.20 345.50 L 390.70 346.10 L 388.10 346.40 L 385.50 346.10 L 383.00 345.50 L 380.80 344.40 L 378.70 342.90 L 377.00 341.10 L 375.60 339.10 L 374.50 336.80 L 373.80 334.30 L 373.60 331.60 L 373.80 328.90 L 374.50 326.50 L 375.60 324.20 L 377.00 322.10 L 378.70 320.30 L 380.80 318.90 L 383.00 317.80 L 385.50 317.10 L 388.10 316.90 L 390.70 317.10 L 393.20 317.80 L 395.40 318.90 L 397.50 320.30 L 399.20 322.10 L 400.60 324.20 L 401.70 326.50 L 402.40 328.90 L 402.60 331.60 Z"
                                            fill="#e1e1e1" fill-rule="evenodd" group-id="1,2,3,12" id="椭圆形" node-id="92"
                                            stroke="none" target-height="29.5" target-width="29" target-x="373.6"
                                            target-y="316.9" />
                                        <path
                                            d="M 387.60 312.70 L 391.20 313.00 L 394.50 313.90 L 397.50 315.40 L 400.30 317.40 L 402.60 319.70 L 404.60 322.50 L 406.00 325.50 L 406.90 328.80 L 407.30 332.40 L 406.90 336.00 L 406.00 339.30 L 404.60 342.30 L 402.60 345.10 L 400.30 347.40 L 397.50 349.40 L 394.50 350.80 L 391.20 351.70 L 387.60 352.10 L 384.00 351.70 L 380.70 350.80 L 377.60 349.40 L 374.90 347.40 L 372.50 345.10 L 370.60 342.30 L 369.10 339.30 L 368.20 336.00 L 367.90 332.40 L 368.20 328.80 L 369.10 325.50 L 370.60 322.50 L 372.50 319.70 L 374.90 317.40 L 377.60 315.40 L 380.70 313.90 L 384.00 313.00 L 387.60 312.70 Z M 387.60 313.30 L 384.10 313.60 L 380.90 314.50 L 377.90 315.90 L 375.20 317.80 L 373.00 320.10 L 371.10 322.70 L 369.60 325.70 L 368.80 328.90 L 368.40 332.40 L 368.80 335.90 L 369.60 339.10 L 371.10 342.00 L 373.00 344.70 L 375.20 347.00 L 377.90 348.90 L 380.90 350.30 L 384.10 351.20 L 387.60 351.50 L 391.10 351.20 L 394.30 350.30 L 397.20 348.90 L 399.90 347.00 L 402.20 344.70 L 404.10 342.00 L 405.50 339.10 L 406.40 335.90 L 406.70 332.40 L 406.40 328.90 L 405.50 325.70 L 404.10 322.70 L 402.20 320.10 L 399.90 317.80 L 397.20 315.90 L 394.30 314.50 L 391.10 313.60 L 387.60 313.30 Z"
                                            fill="#6784a7" fill-rule="nonzero" group-id="1,2,3,12" id="椭圆形" node-id="93"
                                            stroke="none" target-height="39.399994" target-width="39.399994"
                                            target-x="367.9" target-y="312.7" />
                                        <path
                                            d="M 393.30 331.90 L 393.10 333.40 L 391.70 335.90 L 389.30 337.40 L 387.80 337.60 L 386.40 337.40 L 384.00 335.90 L 382.60 333.40 L 382.40 331.90 L 382.60 330.30 L 384.00 327.80 L 386.40 326.40 L 387.80 326.20 L 389.30 326.40 L 391.70 327.80 L 393.10 330.30 L 393.30 331.90 Z"
                                            fill="#344b65" fill-rule="evenodd" group-id="1,2,3,12" id="椭圆形" node-id="94"
                                            stroke="none" target-height="11.399994" target-width="10.899994"
                                            target-x="382.4" target-y="326.2" />
                                    </g>
                                    <g node-id="527">
                                        <g node-id="565">
                                            <path
                                                d="M 526.60 250.20 L 545.30 265.40 L 548.50 269.50 L 550.90 273.20 L 552.40 276.60 L 553.30 279.80 L 553.60 282.90 L 552.80 288.00 L 550.50 292.60 L 548.90 294.60 L 544.90 298.00 L 539.80 300.60 L 445.10 336.70 L 441.50 337.90 L 438.50 338.60 L 436.00 338.70 L 434.00 338.40 L 432.30 337.70 L 430.80 336.70 L 426.80 332.40 L 422.20 326.80 L 418.10 321.30 L 414.80 316.30 L 413.80 315.60 L 412.60 315.20 L 411.00 315.30 L 408.90 315.90 L 407.50 317.20 L 406.70 318.70 L 406.40 320.40 L 406.70 322.60 L 407.70 325.20 L 414.50 336.40 L 415.80 339.50 L 416.40 342.30 L 416.30 344.10 L 415.70 345.80 L 414.60 347.50 L 413.10 348.90 L 408.50 352.00 L 402.70 354.30 L 399.20 355.10 L 395.60 355.50 L 391.80 355.50 L 387.70 354.90 L 383.60 353.90 L 379.30 352.10 L 368.30 345.50 L 366.50 344.70 L 364.90 344.40 L 363.50 344.60 L 362.30 345.20 L 361.30 346.20 L 360.80 347.40 L 360.70 348.80 L 361.70 351.10 L 386.00 365.90 L 360.50 350.70 L 358.20 350.50 L 356.70 351.00 L 355.60 351.80 L 355.00 353.20 L 354.80 354.80 L 355.00 356.20 L 356.60 358.70 L 360.90 361.70 L 370.10 366.30 L 380.50 370.20 L 386.80 372.10 L 393.40 373.60 L 405.50 375.00 L 415.60 374.80 L 422.80 373.80 L 434.60 371.40 L 452.70 367.00 L 479.30 359.90 L 516.50 349.30 L 566.80 334.30 L 574.20 330.10 L 580.60 325.90 L 586.20 321.60 L 591.00 317.20 L 595.00 312.70 L 598.50 308.10 L 601.30 303.50 L 603.50 298.70 L 605.20 293.70 L 606.30 288.60 L 607.00 282.60 L 607.10 276.70 L 606.50 270.90 L 605.40 265.20 L 603.60 259.60 L 601.10 253.90 L 598.00 248.30 L 594.10 242.60 L 589.40 236.80 L 559.20 208.90 L 526.60 250.20 Z"
                                                fill="#ffc7ca" fill-rule="evenodd" group-id="1,2,3,13,51" node-id="513"
                                                stroke="none" target-height="166.1" target-width="252.29999"
                                                target-x="354.8" target-y="208.9" />
                                        </g>
                                        <path d="M 531.90 255.00 L 560.40 210.40 L 557.40 206.40 L 525.80 249.50 Z"
                                            fill="#000000" fill-rule="evenodd" group-id="1,2,3,13,52" id="路径-286"
                                            node-id="99" stroke="none" target-height="48.600006"
                                            target-width="34.600037" target-x="525.8" target-y="206.4" />
                                    </g>
                                    <path
                                        d="M 408.70 315.80 L 410.90 315.20 L 412.50 315.10 L 413.80 315.50 L 414.90 316.20 L 418.30 321.50 L 422.40 327.00 L 427.00 332.60 L 430.90 336.80 L 432.30 337.80 L 433.90 338.40 L 435.90 338.70 L 438.20 338.60 L 441.10 338.00 L 444.90 336.70 L 445.10 337.20 L 441.40 338.50 L 438.40 339.20 L 435.90 339.30 L 433.80 339.00 L 432.10 338.30 L 430.60 337.20 L 426.70 333.00 L 422.10 327.50 L 418.00 322.00 L 414.60 316.70 L 413.70 316.00 L 412.50 315.70 L 411.10 315.70 L 409.00 316.30 L 407.60 317.60 L 406.90 319.00 L 406.60 320.60 L 406.90 322.60 L 407.90 325.30 L 414.40 336.20 L 415.60 338.80 L 416.60 342.90 L 416.50 344.80 L 415.90 346.50 L 414.80 348.00 L 410.70 351.30 L 405.40 354.10 L 402.40 355.10 L 399.20 355.80 L 395.20 356.20 L 391.20 356.20 L 387.10 355.50 L 383.10 354.40 L 379.10 352.70 L 366.40 345.30 L 364.90 345.00 L 363.60 345.20 L 362.40 345.80 L 361.50 346.70 L 361.10 347.80 L 361.20 350.30 L 361.80 351.30 L 386.10 366.20 L 385.80 366.70 L 360.40 351.40 L 358.20 351.20 L 356.80 351.60 L 355.90 352.40 L 355.30 353.70 L 355.30 356.50 L 355.90 357.70 L 357.00 359.00 L 361.00 361.70 L 365.20 363.90 L 375.30 368.20 L 381.20 370.30 L 387.10 372.00 L 398.70 374.40 L 404.50 375.10 L 410.10 375.30 L 415.50 375.10 L 421.00 374.40 L 429.50 372.80 L 441.90 370.00 L 461.50 365.00 L 489.20 357.30 L 566.50 334.30 L 566.70 334.80 L 490.50 357.50 L 462.30 365.40 L 442.30 370.50 L 429.70 373.30 L 421.10 374.90 L 415.60 375.60 L 410.10 375.80 L 404.50 375.60 L 398.60 375.00 L 387.00 372.60 L 381.00 370.80 L 374.40 368.50 L 364.50 364.20 L 360.70 362.20 L 356.40 359.20 L 354.70 356.70 L 354.50 355.20 L 354.80 353.50 L 355.30 352.30 L 356.00 351.50 L 357.00 350.90 L 358.40 350.70 L 361.00 351.00 L 360.40 349.50 L 360.50 348.00 L 361.00 346.50 L 362.10 345.30 L 363.40 344.70 L 364.80 344.50 L 366.40 344.70 L 368.20 345.50 L 379.00 352.10 L 383.10 353.80 L 387.00 355.00 L 391.10 355.60 L 395.10 355.70 L 399.10 355.20 L 402.20 354.50 L 405.10 353.60 L 410.40 350.90 L 414.30 347.60 L 415.40 346.20 L 415.90 344.70 L 416.00 342.90 L 415.10 339.00 L 413.90 336.40 L 407.40 325.60 L 406.40 322.90 L 406.10 320.70 L 406.30 318.90 L 407.10 317.30 L 408.70 315.80 Z"
                                        fill="#000000" fill-rule="nonzero" group-id="1,2,3" id="路径" node-id="100"
                                        stroke="none" target-height="60.69998" target-width="212.20001" target-x="354.5"
                                        target-y="315.1" />
                                    <g node-id="528">
                                        <path
                                            d="M 273.80 789.50 L 398.30 789.50 L 399.10 783.20 L 399.30 777.60 L 398.90 772.60 L 398.00 768.20 L 396.50 764.20 L 394.60 760.60 L 392.20 757.40 L 389.30 754.60 L 385.80 752.00 L 381.70 749.80 L 381.70 740.10 L 380.30 737.30 L 379.20 736.60 L 378.00 736.10 L 376.80 736.10 L 375.70 736.70 L 374.50 737.90 L 373.30 740.10 L 372.50 750.90 L 368.50 753.00 L 364.20 754.50 L 359.60 755.60 L 354.80 756.20 L 349.60 756.30 L 343.90 755.90 L 337.90 754.90 L 331.40 753.30 L 324.30 750.90 L 316.00 747.60 L 308.80 745.30 L 302.50 743.80 L 297.10 743.00 L 292.30 742.90 L 288.20 743.30 L 284.70 744.10 L 281.50 745.40 L 278.80 747.10 L 276.40 749.20 L 274.40 751.80 L 272.60 755.00 L 271.10 758.70 L 270.00 763.10 L 269.90 772.00 L 270.50 776.90 L 273.10 788.00 L 273.50 789.50 L 273.80 789.50 Z"
                                            fill="#ffffff" fill-rule="evenodd" group-id="1,2,3,14" id="路径-274"
                                            node-id="102" stroke="none" target-height="53.400024" target-width="129.4"
                                            target-x="269.9" target-y="736.1" />
                                        <path d="M 272.40 786.00 L 398.80 786.00 L 398.40 789.60 L 273.30 789.60 Z"
                                            fill="#95bdec" fill-rule="evenodd" group-id="1,2,3,14" id="路径-281"
                                            node-id="103" stroke="none" target-height="3.5999756"
                                            target-width="126.399994" target-x="272.4" target-y="786" />
                                        <path
                                            d="M 373.00 740.00 L 372.40 750.70 L 368.30 752.70 L 364.10 754.20 L 359.60 755.30 L 354.70 755.90 L 349.60 756.10 L 344.00 755.60 L 337.90 754.60 L 331.40 753.00 L 324.40 750.70 L 316.10 747.30 L 308.80 745.00 L 302.50 743.50 L 297.00 742.70 L 292.30 742.60 L 288.10 743.00 L 284.60 743.80 L 281.40 745.10 L 278.70 746.90 L 276.20 749.00 L 274.10 751.70 L 272.30 754.80 L 270.90 758.60 L 269.70 763.10 L 269.70 772.00 L 270.20 777.00 L 271.30 782.30 L 273.40 789.80 L 398.50 789.80 L 399.40 782.80 L 399.60 777.30 L 399.10 772.40 L 398.20 768.00 L 396.80 764.10 L 394.90 760.60 L 392.50 757.40 L 389.70 754.50 L 386.30 752.00 L 382.00 749.60 L 382.00 740.10 L 381.30 738.30 L 380.40 737.10 L 379.40 736.30 L 378.10 735.80 L 376.80 735.90 L 375.50 736.40 L 374.30 737.70 L 373.00 740.00 Z M 378.10 736.40 L 379.50 737.00 L 380.60 738.20 L 381.40 740.10 L 381.40 750.00 L 386.00 752.50 L 389.30 755.00 L 392.10 757.80 L 394.40 760.90 L 396.30 764.30 L 397.70 768.20 L 398.60 772.50 L 399.00 777.30 L 398.90 782.80 L 398.00 789.20 L 273.70 789.30 L 271.50 780.80 L 270.40 774.40 L 270.10 768.50 L 270.30 763.20 L 271.40 758.80 L 272.80 755.10 L 274.60 752.00 L 276.60 749.40 L 279.00 747.30 L 281.70 745.60 L 284.80 744.40 L 288.30 743.50 L 292.40 743.10 L 297.10 743.30 L 302.50 744.10 L 308.80 745.60 L 315.90 747.90 L 324.20 751.20 L 331.20 753.50 L 337.70 755.20 L 343.70 756.20 L 349.30 756.60 L 354.50 756.50 L 359.40 755.90 L 363.90 754.90 L 368.20 753.40 L 372.80 751.10 L 373.50 740.20 L 374.70 738.10 L 375.80 736.90 L 376.90 736.40 L 378.10 736.40 Z"
                                            fill="#000000" fill-rule="nonzero" group-id="1,2,3,14" id="路径-274"
                                            node-id="104" stroke="none" target-height="54" target-width="129.9"
                                            target-x="269.7" target-y="735.8" />
                                        <path
                                            d="M 284.70 736.60 L 285.20 736.90 L 285.10 760.40 L 284.20 760.20 L 284.20 736.90 L 284.70 736.60 Z"
                                            fill="#0083ec" fill-rule="nonzero" group-id="1,2,3,14" id="路径-341"
                                            node-id="105" stroke="none" target-height="23.800049" target-width="1"
                                            target-x="284.2" target-y="736.6" />
                                        <path
                                            d="M 289.90 736.60 L 290.40 736.90 L 290.30 760.40 L 289.40 760.20 L 289.40 736.90 L 289.90 736.60 Z"
                                            fill="#0083ec" fill-rule="nonzero" group-id="1,2,3,14" id="路径-341"
                                            node-id="106" stroke="none" target-height="23.800049" target-width="1"
                                            target-x="289.4" target-y="736.6" />
                                        <path
                                            d="M 295.10 736.60 L 295.60 736.90 L 295.50 760.40 L 294.60 760.20 L 294.60 736.90 L 295.10 736.60 Z"
                                            fill="#0083ec" fill-rule="nonzero" group-id="1,2,3,14" id="路径-341"
                                            node-id="107" stroke="none" target-height="23.800049" target-width="1"
                                            target-x="294.6" target-y="736.6" />
                                    </g>
                                    <g node-id="529">
                                        <g node-id="567">
                                            <path
                                                d="M 588.40 789.50 L 464.00 789.50 L 463.10 783.20 L 463.00 777.60 L 463.40 772.60 L 464.30 768.20 L 465.70 764.20 L 467.60 760.60 L 470.00 757.40 L 473.00 754.60 L 476.40 752.00 L 480.50 749.80 L 480.60 740.10 L 482.00 737.30 L 484.20 736.10 L 485.40 736.10 L 486.60 736.70 L 487.80 737.90 L 489.00 740.10 L 489.80 750.90 L 493.80 753.00 L 498.10 754.50 L 502.60 755.60 L 507.50 756.20 L 512.70 756.30 L 518.30 755.90 L 524.40 754.90 L 530.90 753.30 L 538.00 750.90 L 546.20 747.60 L 553.50 745.30 L 559.70 743.80 L 565.20 743.00 L 569.90 742.90 L 574.00 743.30 L 577.60 744.10 L 580.70 745.40 L 583.40 747.10 L 585.80 749.20 L 587.90 751.80 L 589.70 755.00 L 591.10 758.70 L 592.30 763.10 L 592.30 772.00 L 591.70 776.90 L 589.20 788.00 L 588.80 789.50 L 588.40 789.50 Z"
                                                fill="#ffffff" fill-rule="evenodd" group-id="1,2,3,15,53" id="路径-274"
                                                node-id="109" stroke="none" target-height="53.400024"
                                                target-width="129.29999" target-x="463" target-y="736.1" />
                                        </g>
                                        <path d="M 463.50 786.50 L 589.40 786.50 L 588.50 789.60 L 463.90 789.60 Z"
                                            fill="#95bdec" fill-rule="evenodd" group-id="1,2,3,15" id="路径-282"
                                            node-id="110" stroke="none" target-height="3.0999756"
                                            target-width="125.900024" target-x="463.5" target-y="786.5" />
                                        <g node-id="568">
                                            <path
                                                d="M 489.30 740.00 L 489.90 750.70 L 493.90 752.70 L 498.20 754.20 L 502.70 755.30 L 507.50 755.90 L 512.70 756.10 L 518.30 755.60 L 524.30 754.60 L 530.80 753.00 L 537.90 750.70 L 546.20 747.30 L 553.40 745.00 L 559.70 743.50 L 565.20 742.70 L 570.00 742.60 L 574.10 743.00 L 577.70 743.80 L 580.80 745.10 L 583.60 746.90 L 586.00 749.00 L 588.10 751.70 L 589.90 754.80 L 591.40 758.60 L 592.50 763.10 L 592.60 772.00 L 592.00 777.00 L 591.00 782.30 L 588.80 789.80 L 463.80 789.80 L 462.80 782.80 L 462.70 777.30 L 463.10 772.40 L 464.10 768.00 L 465.50 764.10 L 467.40 760.60 L 469.70 757.40 L 472.60 754.50 L 476.00 752.00 L 480.30 749.60 L 480.30 740.10 L 480.90 738.30 L 481.80 737.10 L 482.90 736.30 L 484.20 735.80 L 485.50 735.90 L 486.70 736.40 L 488.00 737.70 L 489.30 740.00 Z M 484.10 736.40 L 482.80 737.00 L 481.70 738.20 L 480.80 740.10 L 480.80 750.00 L 476.30 752.50 L 472.90 755.00 L 470.10 757.80 L 467.80 760.90 L 466.00 764.30 L 464.60 768.20 L 463.70 772.50 L 463.20 777.30 L 463.40 782.80 L 464.20 789.20 L 588.60 789.30 L 590.70 780.80 L 591.80 774.40 L 592.20 768.50 L 592.00 763.20 L 590.90 758.80 L 589.40 755.10 L 587.70 752.00 L 585.60 749.40 L 583.30 747.30 L 580.60 745.60 L 577.50 744.40 L 573.90 743.50 L 569.90 743.10 L 565.20 743.30 L 559.70 744.10 L 553.50 745.60 L 546.30 747.90 L 538.10 751.20 L 531.00 753.50 L 524.50 755.20 L 518.50 756.20 L 512.90 756.60 L 507.70 756.50 L 502.90 755.90 L 498.30 754.90 L 494.00 753.40 L 489.50 751.10 L 488.70 740.20 L 487.60 738.10 L 486.40 736.90 L 485.40 736.40 L 484.10 736.40 Z"
                                                fill="#000000" fill-rule="nonzero" group-id="1,2,3,15,54" id="路径-274"
                                                node-id="111" stroke="none" target-height="54" target-width="129.89996"
                                                target-x="462.7" target-y="735.8" />
                                        </g>
                                        <path
                                            d="M 562.30 736.60 L 562.80 736.90 L 562.80 760.20 L 562.30 760.50 L 561.80 760.20 L 561.80 736.90 L 562.30 736.60 Z"
                                            fill="#0083ec" fill-rule="nonzero" group-id="1,2,3,15" id="路径-341"
                                            node-id="112" stroke="none" target-height="23.900024" target-width="1"
                                            target-x="561.8" target-y="736.6" />
                                        <path
                                            d="M 567.50 736.60 L 568.00 736.90 L 567.80 760.40 L 567.00 760.20 L 567.00 736.90 L 567.50 736.60 Z"
                                            fill="#0083ec" fill-rule="nonzero" group-id="1,2,3,15" id="路径-341"
                                            node-id="113" stroke="none" target-height="23.800049" target-width="1"
                                            target-x="567" target-y="736.6" />
                                        <path
                                            d="M 572.70 736.60 L 573.20 736.90 L 573.20 760.20 L 572.70 760.50 L 572.20 760.20 L 572.20 736.90 L 572.70 736.60 Z"
                                            fill="#0083ec" fill-rule="nonzero" group-id="1,2,3,15" id="路径-341"
                                            node-id="114" stroke="none" target-height="23.900024" target-width="1"
                                            target-x="572.2" target-y="736.6" />
                                    </g>
                                    <path
                                        d="M 392.80 73.10 L 393.50 72.70 L 393.90 73.30 L 393.20 77.00 L 393.40 80.70 L 393.90 81.40 L 394.80 81.70 L 396.70 81.30 L 397.00 82.00 L 395.00 82.80 L 393.90 82.70 L 393.00 82.10 L 392.30 81.00 L 392.00 79.40 L 392.10 76.90 L 392.80 73.10 Z"
                                        fill="#000000" fill-rule="nonzero" group-id="1,2,3" id="路径-288" node-id="115"
                                        stroke="none" target-height="10.100006" target-width="5" target-x="392"
                                        target-y="72.7" />
                                    <path
                                        d="M 388.00 95.20 L 390.50 96.10 L 393.00 96.60 L 395.60 96.60 L 398.20 96.10 L 401.00 95.20 L 398.80 96.70 L 394.90 98.00 L 392.10 97.50 L 388.00 95.20 Z"
                                        fill="#000000" fill-rule="evenodd" group-id="1,2,3" id="路径-289" node-id="116"
                                        stroke="#000000" stroke-linecap="butt" stroke-width="1" target-height="2.800003"
                                        target-width="13" target-x="388" target-y="95.2" />
                                    <path
                                        d="M 383.50 65.90 L 383.20 68.40 L 382.50 70.30 L 380.80 71.90 L 379.90 72.10 L 378.10 71.30 L 377.30 70.30 L 376.50 68.40 L 376.20 65.90 L 376.50 63.40 L 377.30 61.50 L 378.90 59.90 L 379.90 59.70 L 380.80 59.90 L 382.50 61.50 L 383.20 63.40 L 383.50 65.90 Z"
                                        fill="#ffffff" fill-rule="evenodd" group-id="1,2,3" id="椭圆形" node-id="117"
                                        stroke="none" target-height="12.399998" target-width="7.299988" target-x="376.2"
                                        target-y="59.7" />
                                    <path
                                        d="M 383.00 66.50 L 382.70 68.70 L 382.10 70.40 L 380.70 71.90 L 379.90 72.10 L 378.40 71.40 L 377.00 68.70 L 376.80 66.50 L 377.00 64.20 L 377.70 62.50 L 379.10 61.00 L 380.70 61.00 L 382.10 62.50 L 382.70 64.20 L 383.00 66.50 Z"
                                        fill="#000000" fill-rule="evenodd" group-id="1,2,3" id="椭圆形" node-id="118"
                                        stroke="none" target-height="11.099998" target-width="6.200012" target-x="376.8"
                                        target-y="61" />
                                    <path
                                        d="M 411.70 65.90 L 411.40 68.40 L 410.60 70.30 L 409.80 71.30 L 408.00 72.10 L 406.20 71.30 L 405.40 70.30 L 404.70 68.40 L 404.40 65.90 L 404.70 63.40 L 405.40 61.50 L 406.20 60.50 L 408.00 59.70 L 409.80 60.50 L 410.60 61.50 L 411.40 63.40 L 411.70 65.90 Z"
                                        fill="#ffffff" fill-rule="evenodd" group-id="1,2,3" id="椭圆形" node-id="119"
                                        stroke="none" target-height="12.399998" target-width="7.3000183"
                                        target-x="404.4" target-y="59.7" />
                                    <path
                                        d="M 411.10 66.50 L 410.90 68.70 L 410.20 70.40 L 408.80 71.90 L 408.00 72.10 L 406.50 71.40 L 405.20 68.70 L 404.90 66.50 L 405.20 64.20 L 405.80 62.50 L 407.20 61.00 L 408.80 61.00 L 410.20 62.50 L 410.90 64.20 L 411.10 66.50 Z"
                                        fill="#000000" fill-rule="evenodd" group-id="1,2,3" id="椭圆形" node-id="120"
                                        stroke="none" target-height="11.099998" target-width="6.200012" target-x="404.9"
                                        target-y="61" />
                                    <g node-id="530">
                                        <path
                                            d="M 371.80 54.40 L 373.80 53.40 L 376.10 52.90 L 378.70 52.70 L 381.60 53.00 L 384.90 53.80 L 385.40 54.20 L 385.50 54.90 L 385.10 55.40 L 384.50 55.40 L 380.60 54.60 L 377.50 54.40 L 374.80 54.90 L 372.00 55.90 L 371.50 55.50 L 371.40 54.90 L 371.80 54.40 Z"
                                            fill="#000000" fill-rule="nonzero" group-id="1,2,3,16" id="路径-380"
                                            node-id="121" stroke="none" target-height="3.2000008"
                                            target-width="14.100006" target-x="371.4" target-y="52.7" />
                                    </g>
                                    <g node-id="531">
                                        <path
                                            d="M 415.00 54.50 L 413.00 53.50 L 410.70 52.90 L 408.20 52.70 L 405.20 53.00 L 401.90 53.70 L 401.40 54.10 L 401.30 54.70 L 401.70 55.30 L 402.30 55.30 L 406.10 54.50 L 409.30 54.50 L 411.90 54.90 L 414.80 56.00 L 415.30 55.60 L 415.40 55.00 L 415.00 54.50 Z"
                                            fill="#000000" fill-rule="nonzero" group-id="1,2,3,17" id="路径-380"
                                            node-id="122" stroke="none" target-height="3.2999992"
                                            target-width="14.100006" target-x="401.3" target-y="52.7" />
                                    </g>
                                    <path
                                        d="M 426.90 55.30 L 429.10 54.70 L 430.70 54.70 L 431.80 55.10 L 432.70 55.90 L 433.10 56.80 L 432.60 60.10 L 430.80 64.10 L 428.20 67.50 L 426.90 68.70 L 426.90 55.30 Z"
                                        fill="#ffbdc1" fill-rule="evenodd" group-id="1,2,3" id="路径-384" node-id="123"
                                        stroke="none" target-height="13.999996" target-width="6.200012" target-x="426.9"
                                        target-y="54.7" />
                                    <g node-id="532">
                                        <path
                                            d="M 362.20 73.80 L 361.70 59.50 L 358.80 58.60 L 357.20 58.80 L 356.20 59.40 L 355.50 60.50 L 355.10 63.60 L 356.10 66.90 L 357.30 68.80 L 362.20 73.80 Z"
                                            fill="#ffbdc1" fill-rule="evenodd" group-id="1,2,3,18" id="路径-385"
                                            node-id="124" stroke="none" target-height="15.200005"
                                            target-width="7.100006" target-x="355.1" target-y="58.6" />
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </div>
            </div>
        </div>

        <!-- 导航栏 -->
        <div class="topBar">
            <!-- 图标 -->
            <div class="icon">
                <img src="//y.qq.com/mediastyle/yqq/img/logo.png?max_age=2592000" alt="QQ音乐" class="qqmusic_logo">
            </div>
            <!-- 选项 -->
            <div class="select">
                <div class="option">
                    <router-link :class="{newMusic:true,active:isnew}" to="/newMusic">
                        音乐馆
                    </router-link>
                </div>
                <div class="option">
                    <router-link :class="{MyMusic:true,active:!isnew}" to="/myMusic">
                        我的音乐
                    </router-link>
                </div>
            </div>
            <!-- 搜索页 -->
            <div class="search" @click.stop="isQuick=true">
                <input class="searchInput" v-model="searchText" @input="quickSearch()" @keydown.enter="toSearch"
                    type="search" placeholder="搜索音乐、MV、歌单、用户">
                <div v-show="isQuick" class="quickList">
                    <ul>
                        <li>
                            <div class="quickTitle">单曲</div>
                            <div class="quickData" v-for="item in quickData.song" @click="searchMic(item)" :key="item">
                                <p class="listName">{{item.name}}</p>
                                <p class="listSinger">{{'-'+item.singer}}</p>
                            </div>
                        </li>
                        <li>
                            <div class="quickTitle">歌手</div>
                            <div class="quickData" @click="toSinger(item.name,item.mid)"
                                v-for="item in quickData.singer" :key="item">
                                <p class="listName">{{item.name}}</p>
                            </div>
                        </li>
                        <li>
                            <div class="quickTitle">专辑</div>
                            <div class="quickData" @click="toAlbum(item.mid)" v-for="item in quickData.album"
                                :key="item">
                                <p class="listName">{{item.name}}</p>
                                <p class="listSinger">{{'-'+item.singer}}</p>
                            </div>
                        </li>
                        <li>
                            <div class="quickTitle">MV</div>
                            <div class="quickData" @click="toMV(item.vid)" v-for="item in quickData.mv" :key="item">
                                <p class="listName">{{item.name}}</p>
                                <p class="listSinger">{{'-'+item.singer}}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- 我的 -->
            <div id="My">
                <p class="login" v-if="MyMsg" @click="isLogin=true"> 登陆</p>
                <img class="userImg" v-else :src="userMsg.headpic" alt="" @click="isLogin=true">
            </div>
        </div>
        <!-- 音乐馆导航栏 -->
        <div class="newBar" v-show="isnew">
            <div class="newList" v-for="item in isnewList" :key="item">
                <router-link class="newListLink" :to="'/newMusic'+item.path">
                    {{item.name}}
                </router-link>
            </div>
        </div>
        <!-- 显示栏 -->
        <router-view />
    </div>
</template>

<style scoped>
    #home {
        overflow-x: hidden;
        width: 100%;
        height: 100%;

        #login {
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 10;

            .loginBG {
                position: absolute;
                z-index: 10;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }

            .loginBox {
                padding: 1% 2%;
                display: flex;
                flex-direction: row;
                border-radius: 2%;
                position: absolute;
                z-index: 12;
                background-color: white;
                width: 30%;
                height: 40%;

                .bg {
                    position: absolute;
                    z-index: 10;
                    right: 6%;
                    width: 40%;
                    height: 100%;

                    svg {
                        cursor: pointer;
                        width: 100%;
                        height: 100%;
                    }
                }

                .box {
                    width: 60%;
                    height: 100%;

                    .title {
                        width: 100%;
                        height: 10%;
                    }

                    textArea {
                        color: green;
                        border: none;
                        border-radius: 1rem;
                        font: normal 400 15px 微软雅黑;
                        padding: 1%;
                        resize: none;
                        background-color: #ddd;
                        height: 80%;
                        width: 100%;
                    }

                    textArea:focus {
                        outline: none;
                    }

                    .inputBtn {
                        display: flex;
                        flex-direction: row;

                        .text {
                            width: 50%;
                        }

                        .toLogin {
                            cursor: pointer;
                            margin-left: 10%;
                            height: 10%;
                        }

                        .toLogin:hover {
                            color: #61BF82;
                        }
                    }
                }

            }
        }

        .topBar {
            display: flex;
            flex-direction: row;
            background-color: white;
            padding: 0 10%;
            width: 100%;
            height: 90px;

            .icon {
                display: flex;
                align-items: center;

                img {
                    width: 80%;
                }
            }

            /* 选栏页 */
            .select {
                display: flex;
                flex-direction: row;
                width: 40%;

                .option {
                    width: 50%;

                    a {
                        display: block;
                        background-color: white;
                        color: #000;
                        font: normal normal 18px 微软雅黑;
                        line-height: 90px;
                        text-align: center;
                        text-decoration: none;
                        height: 90px;
                    }

                    a:hover {
                        color: #61BF82;
                    }

                    .active {
                        color: white;
                        background-color: #61BF82;
                    }

                    .active:hover {
                        color: white;
                    }
                }
            }

            /* 搜索页 */
            .search {
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 20%;
                height: 100%;

                .searchInput {
                    padding: 2%;
                    border-radius: 5px;
                    border: 2px solid #ddd;
                    font: normal normal 15px 微软雅黑;
                    height: 40%;
                    width: 80%;
                }

                .searchInput:focus {
                    outline: none;
                    /* 移除默认的聚焦轮廓线（可选） */
                }

                .quickList {
                    top: 70%;
                    position: absolute;
                    background-color: white;
                    border: 2px solid #ddd;
                    z-index: 99;
                    width: 80%;

                    ul {
                        li {
                            padding: 5% 0;
                            margin: 0 5%;
                            border-bottom: 1px solid #ddd;
                            list-style-type: none;

                            .quickTitle {
                                cursor: default;
                                padding: 0 0 5% 5%;
                                color: #999;
                            }

                            .quickData {
                                cursor: pointer;
                                padding: 5% 0 5% 10%;
                                display: flex;
                                flex-direction: row;
                                white-space: nowrap;
                                font: normal 300 15px 微软雅黑;
                                overflow: hidden;

                                .listSinger {
                                    flex-wrap: nowrap;
                                    color: #999;
                                }
                            }

                            .quickData:hover {
                                color: white;
                                background-color: #61BF82;

                                .listSinger {
                                    color: white;
                                }
                            }
                        }
                    }
                }
            }

            /* 我的 */
            #My {
                display: flex;
                align-items: center;
                width: 20%;
                height: 100%;

                .login {
                    cursor: pointer;
                    font: normal normal 18px 微软雅黑;
                }

                .login:hover {
                    color: #61BF82;
                }

                .userImg {
                    cursor: pointer;
                    border-radius: 50%;
                    padding: 2%;
                    height: 60%;
                }
            }
        }

        .newBar {
            border-top: 1px #efefef solid;
            display: flex;
            justify-content: center;
            flex-direction: row;
            margin: auto;
            width: 80%;

            .newList {
                text-align: center;
                width: 15%;

                a {
                    line-height: 50px;
                    color: #000;
                    text-decoration: none;
                }

                a:hover {
                    color: #61BF82;
                }

                .router-link-exact-active,
                .router-link-exact-active:hover {
                    color: #61BF82;
                }
            }
        }

        router-view {
            background-color: wheat;
            width: 100%;

        }
    }
</style>