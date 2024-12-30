<script setup>
    import msgDialog from '@/slot/msgDialog.vue'
    import songTable from '@/slot/songTable.vue'
    // 引入icon样式
    import '../../assets/iconMusic/iconfont.js'
    import { ref, reactive, watch, onMounted, onUpdated, onUnmounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { song, getSongText, getSongUrl } from '@/utils/api/song'
    import { getAlbum } from '@/utils/api/album'
    const userMsg = localStorage.getItem('userMsg')
    const songList = localStorage.getItem('songList')
    const router = useRouter()
    const isLogin = ref(false)
    const userData = reactive({
        headpic: '',
        nick: ''
    })
    const musicText = reactive({
        lyric: {
            time: [],
            text: []
        },
        trans: {},
        audioTime: 0,
        duration: 0,
        songTextIndex: 0
    })//歌曲歌词
    const musicUrl = ref('')//音乐链接
    const albumUrl = ref('')//专辑链接
    const musicDom = reactive({
        isShow: false,//是否在播放
        dom: null//控件dom
    })//音乐控件
    const musicIndex = ref(0)//当前音乐
    const songMsg = ref()
    const musicProgress = ref()
    const errMsg = reactive({
        isErr: false,
        msg: ''
    })//错误提醒
    userMsg == null ? isLogin.value = false : toParseData()
    if (songList !== null) {
        getSongList()
    }

    onMounted(() => {
        getMusic(songMsg.value[musicIndex.value], musicIndex.value)
        musicDom.dom = document.getElementById('music')
        // 监听空格
        window.addEventListener('keydown', spacePlay)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', spacePlay)
    })

    // 设置用户
    function toParseData() {
        isLogin.value = true
        const Data = JSON.parse(userMsg)
        userData.headpic = Data.creator.headpic
        userData.nick = Data.creator.nick
    }
    // 获取歌曲列表
    function getSongList() {
        songMsg.value = JSON.parse(songList)
    }
    // 获取歌曲数据
    function getMusic(Mic, index) {
        const songmid = Mic.songmid || Mic.mid
        const albummid = Mic.albummid || Mic.album.mid
        // 初始化状态
        if (musicDom.dom) {
            musicDom.isShow = false
            musicDom.dom.pause()//开始暂停
            musicDom.dom.currentTime = 0;
        }
        musicIndex.value = index
        // 获取歌词信息
        getSongText({ songmid }).then(res => {
            // 切割歌词
            toArray(res.data.lyric)
            // 获取专辑信息
            getAlbum({ albummid }).then(res => {
                albumUrl.value = res.data.headpiclist[0].picurl

                // 获取播放链接
                getSongUrl({ id: songmid }).then(res => {
                    Object.values(res.data).length !== 0 ? musicUrl.value = Object.values(res.data)[0] : toErrUrl(Mic.name)
                })
            })
        })
    }
    // 判断key
    function spacePlay(event) {
        if (event.key === ' ' && musicUrl.value !== '') toPlay()
    }
    // 无链接进行跳转操作
    function toErrUrl(micName) {
        errMsg.isErr = true
        errMsg.msg = micName + '无链接,该歌曲无版权或需要Vip'
        setTimeout(() => {
            errMsg.isErr = false
            errMsg.msg = ''
        }, 5000)
        loadMusic()
    }
    // 切割歌词
    function toArray(data) {
        try {
            let regex = /[\[\]]/g;
            let matches = [...data.matchAll(regex)];
            let datalist = []
            let lyricData = {
                time: [],
                text: []
            }
            let lastIndex = 0;
            for (let match of matches) {
                let currentIndex = match.index;
                if (currentIndex > lastIndex) {
                    datalist.push(data.slice(lastIndex, currentIndex));
                }
                datalist.push(match[0]);
                lastIndex = currentIndex + 1;
            }
            if (lastIndex < data.length) {
                datalist.push(data.slice(lastIndex));
            }
            datalist = datalist.filter(segment => segment !== '[' && segment !== ']');
            // 分离数组为数组对象，切割数组
            const index = datalist.findIndex(item => item === 'offset:0')


            if (index === -1) {
                datalist.forEach((item, index) => {
                    if (index % 2 !== 0) {
                        lyricData.text.push(item)
                    } else {
                        // 使用正则表达式拆分分钟和秒（包括小数部分）
                        const [minutesStr, secondsStr] = item.match(/(\d+):([\d\.]+)/).slice(1);

                        // 将分钟和秒转换为数字
                        const minutes = parseFloat(minutesStr)
                        const seconds = parseFloat(secondsStr)
                        // 计算总秒数
                        item = minutes * 60 + seconds
                        lyricData.time.push(item)
                    }
                })
            } else {
                datalist = datalist.slice(index + 1)
                datalist.forEach((item, index) => {
                    if (index % 2 === 0) {
                        lyricData.text.push(item)
                    } else {
                        // 使用正则表达式拆分分钟和秒（包括小数部分）
                        const [minutesStr, secondsStr] = item.match(/(\d+):([\d\.]+)/).slice(1);

                        // 将分钟和秒转换为数字
                        const minutes = parseFloat(minutesStr)
                        const seconds = parseFloat(secondsStr)
                        // 计算总秒数
                        item = minutes * 60 + seconds
                        lyricData.time.push(item)
                    }
                })
            }
            musicText.lyric = lyricData
        } catch (error) {
            console.log('报错');
        }
    }
    // 上一首
    function upMusic() {
        let index = musicIndex.value
        let song = songMsg.value
        if (index === 0) {
            index = song.length
        }
        getMusic(songMsg.value[index - 1], index - 1)
    }
    // 下一首
    function loadMusic() {
        let index = musicIndex.value
        let song = songMsg.value
        if (index === song.length - 1) {
            index = -1
        }
        getMusic(songMsg.value[index + 1], index + 1)
    }
    // 控制音乐播放
    function toPlay() {
        if (musicDom.isShow) {
            musicDom.dom.pause()//开始暂停
            musicDom.isShow = false
        } else {
            musicDom.dom.play()//开始播放
            musicDom.isShow = true
        }
    }
    // 更新时间
    function onTimeUpdate() {
        const audioTime = musicDom.dom.currentTime
        musicText.audioTime = Math.floor(audioTime)        // 当前时间
        musicText.duration = musicDom.dom.duration         // 总时间
        musicText.songTextIndex = musicText.lyric.time.findIndex(time => time >= audioTime)
        if (musicText.songTextIndex === -1) {
            musicText.songTextIndex = musicText.lyric.time.length
        }
    }
    // 跳转到歌手页
    function toSinger({ name, mid }) {
        router.push({ path: '/newMusic/singer_detail', query: { name, mid } })
    }
    // 跳转到专辑页
    function toAlbum(id) {
        router.push({ path: '/newMusic/albumDetail', query: { id } })
    }
    function togetMic({ item, index }) {
        getMusic(item, index)
    }   
</script>

<template>
    <div id="playList" :style="{'--bgurl':'url('+albumUrl+')'}">
        <!-- 标题栏 -->
        <div class="playTitle">
            <!-- logo栏 -->
            <img class="logo" src="//y.qq.com/mediastyle/yqq/img/player_logo.png?max_age=2592000" alt="">
            <!-- 用户栏 -->
            <div class="user">
                <div class="userBox" v-if="isLogin">
                    <img class="userImg" :src="userData.headpic" alt="">
                    <p class="userName">{{userData.nick}}</p>
                </div>
                <div class="userLogin" v-else>
                    <p>登陆</p>
                </div>
            </div>
        </div>

        <div class="songTable">
            <!-- 歌曲行 -->
            <songTable class="MusicList" :songData="songMsg" @toMusic="togetMic">
                <template #indexTitle>
                    <p></p>
                </template>
                <template #song>
                    <p>歌曲</p>
                </template>
                <template #singer>
                    <p>歌手</p>
                </template>
                <template #time>
                    <p>时长</p>
                </template>

                <template #index></template>
                <template #songData="{songname,name}">
                    <p class="name">{{songname||name}}</p>
                </template>
                <template #singerData="{singer}">
                    <p class="name" @click="toSinger(singer[0])">{{singer[0].name}}</p>
                </template>
                <template #timeData="{interval}">
                    {{`${Math.floor(interval/60)}`+':'+`${String(interval %
                    60).padStart(2, '0')}`}}
                </template>

                <template #playMusic />
            </songTable>

            <!-- 歌曲行 -->
            <div class="songMsg">
                <!-- 歌曲图像 -->
                <div class="MusicImg">
                    <img :src="albumUrl" alt="">
                </div>
                <div class="MusicMsg">
                    <p class="text">歌曲名：<span
                            class="on">{{songMsg[musicIndex].songname||songMsg[musicIndex].name}}</span></p>
                    <p class="text">歌手：<span class="on"
                            @click="toSinger({name:songMsg[musicIndex].singer[0].name,mid:songMsg[musicIndex].singer[0].mid})">{{songMsg[musicIndex].singer[0].name}}</span>
                    </p>
                    <p class="text">专辑：<span class="on"
                            @click="toAlbum(songMsg[musicIndex].albummid||songMsg[musicIndex].album.mid)">{{songMsg[musicIndex].albumname||songMsg[musicIndex].album.name}}</span>
                    </p>
                </div>
                <!-- 歌词 -->
                <div class="MusicText">
                    <ul id="musicProgress"
                        :style="{transform:'translateY('+ (34*2-(musicText.songTextIndex*34)) +'px)',transition:'transform 0.1s ease-out 0s'}">
                        <li v-for="(item,index) in  musicText.lyric.text" :key="index"
                            :class="{on:index===musicText.songTextIndex}">{{item}}</li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 播放栏 -->
        <div class="playMic">
            <!-- 播放 -->
            <div class="playBtn">
                <!-- 上一首 -->
                <div class="Btn" @click="upMusic">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-shangyishou-"></use>
                    </svg>
                </div>
                <!-- 播放暂停 -->
                <div class="Btn" @click="toPlay">
                    <svg class="icon" v-show="musicDom.isShow===true" aria-hidden="true">
                        <use xlink:href="#icon-zantingsvg"></use>
                    </svg>
                    <svg class="icon" v-show="musicDom.isShow===false" aria-hidden="true">
                        <use xlink:href="#icon-bofang"></use>
                    </svg>
                </div>
                <!-- 下一首 -->
                <div class="Btn" @click="loadMusic">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-xiayishou-"></use>
                    </svg>
                </div>
            </div>
            <!-- 进度条 -->
            <div class="progress">
                <!-- 简要信息 -->
                <div class="songMsg">
                    <div class="lyric">
                        <!-- 歌曲名 -->
                        <p class="name">{{songMsg[musicIndex].songorig||songMsg[musicIndex].name}}</p>
                        <p>{{'-'}}</p>
                        <!-- 歌手 -->
                        <p class="name">{{songMsg[musicIndex].singer[0].name}}</p>
                    </div>
                    <div class="time">
                        <p>
                            {{`${Math.floor(musicText.audioTime/60)}`+':'+`${String(musicText.audioTime
                            % 60).padStart(2, '0')}`}}
                        </p>
                        <p>{{'/'}}</p>
                        <p>{{`${Math.floor(songMsg[musicIndex].interval/60)}`+':'+`${String(songMsg[musicIndex].interval
                            % 60).padStart(2, '0')}`}}</p>
                    </div>
                </div>
                <!-- 进度条 -->
                <div class="micProgress" @mousedown="">
                    <!-- 可拖拽进度条 -->
                    <div class="nowProgress"
                        :style="{width:`${Math.floor((musicText.audioTime/musicText.duration)*100)}`+'%'}">
                    </div>
                </div>
            </div>
            <!-- 功能栏 -->
            <div class="power">

            </div>
            <audio id="music" @timeupdate="onTimeUpdate" :src="musicUrl"></audio>
        </div>
    </div>

    <msgDialog v-if="errMsg.isErr" :errMsg="errMsg.msg" />
</template>

<style scoped>
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0%;
    }

    #playList {
        position: relative;
        z-index: 1;
        color: hsla(0, 0%, 88.2%, .8);
        background-color: hsla(0, 8%, 22%, 0.8);
        overflow: hidden;
        width: 100%;
        height: 100%;

        .playTitle {
            padding: 10px 2%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
            height: 6%;

            .logo {
                height: 70%;
            }

            .user {
                height: 100%;

                .userBox {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    height: 100%;

                    .userImg {
                        cursor: pointer;
                        border-radius: 50%;
                        margin-right: 10px;
                        height: 120%;
                    }

                    .userName {
                        cursor: pointer;
                    }
                }

                .userLogin {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    height: 100%;

                    p:hover {
                        color: #61BF82;
                    }
                }
            }
        }

        .songTable {
            padding-left: 10%;
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 74%;

            .MusicList {
                overflow-y: scroll;
                height: 100%;
                width: 55%;

                .name {
                    display: inline;
                    color: #999;
                }

                .name:hover {
                    cursor: pointer;
                    color: #31c27c;
                }
            }

            .songMsg {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                height: 100%;
                width: 45%;

                .MusicImg {
                    position: relative;
                    width: 200px;
                    height: 180px;
                    background: url(https://y.qq.com/ryqq/static/media/album_cover_player.8dfd80d6.png?max_age=2592000) 0 0 no-repeat;

                    img {
                        position: absolute;
                        top: -5px;
                        left: -24px;
                        z-index: 1;
                        width: 100%;
                    }
                }

                .MusicMsg {
                    position: absolute;
                    text-align: center;
                    z-index: 1;
                    top: 200px;
                    width: 50%;

                    .text {
                        margin: 1rem 0;
                    }
                }

                .MusicText {
                    position: absolute;
                    z-index: 1;
                    top: 380px;
                    overflow: hidden;
                    width: 50%;
                    height: 170px;

                    ul {
                        li {
                            width: 100%;
                            /* overflow: hidden; */
                            /* 隐藏溢出内容 */
                            white-space: nowrap;
                            /* 禁止换行 */
                            height: 34px;
                            line-height: 34px;
                            text-align: center;
                            list-style-type: none;
                        }

                        .on {
                            padding-left: -100%;
                            /* 初始位置从右侧开始 */
                            animation: on 10s linear infinite;
                            /* 滚动动画 */
                            color: #31c27c;
                        }
                    }
                }
            }
        }

        .playMic {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 20%;

            .playBtn {
                padding-left: 5%;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                width: 20%;
                height: 100%;

                .Btn {
                    .icon {
                        cursor: pointer;
                        width: 50px;
                        height: 50px;
                    }
                }
            }

            .progress {
                padding: 0% 3%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                width: 50%;
                height: 100%;

                .songMsg {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;

                    .lyric {
                        display: flex;
                        flex-direction: row;

                        p {
                            margin-left: 10px;
                        }

                        .name:hover {
                            cursor: pointer;
                            color: white;
                        }
                    }

                    .time {
                        display: flex;
                        flex-direction: row;

                        p {
                            color: #999;
                            margin-left: 10px;
                        }
                    }
                }

                .micProgress {
                    position: relative;
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background-color: hwb(0 35% 64%);

                    .nowProgress {
                        transition: all 0.5s ease-out;
                        position: absolute;
                        height: 6px;
                        border-radius: 3px;
                        background-color: #31c27c;
                        z-index: 1;
                    }
                }
            }

            .power {
                width: 30%;
                height: 100%;
            }
        }

    }

    /* width */
    ::-webkit-scrollbar {
        width: 15px;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
        background: hwb(0 35% 64%);
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #61BF82;
    }

    #playList::after {
        content: "";
        display: inline-block;
        position: absolute;
        z-index: -1;
        background-image: var(--bgurl);
        background-size: cover;
        background-position: center top;
        filter: brightness(30%) blur(2rem);
        transform: translate(-3rem, -3rem);
        top: 0;
        width: 130%;
        height: 130%;
    }
</style>