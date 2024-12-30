<script setup>
    import msgDialog from '@/slot/msgDialog.vue'
    import { getradioCategory, getradioMic } from '@/utils/api/newMusic/radio'
    import {
        getSongText, getSongUrl
    } from '@/utils/api/song'
    import { onMounted, onUnmounted, ref, reactive } from 'vue'
    import { useRoute } from 'vue-router'
    const userMsg = localStorage.getItem('userMsg')
    const isLogin = ref(false)
    const route = useRoute()
    const id = route.query.id
    const userData = reactive({//用户信息
        headpic: '',
        nick: ''
    })
    const errMsg = reactive({
        isErr: false,
        msg: ''
    })//错误提醒
    const nowMic = reactive({//当前歌曲信息
        dom: null,
        isShow: false,
        // 歌词
        lyric: {
            time: [],
            text: []
        },
        trans: {},
        audioTime: 0,
        duration: 0,
        songTextIndex: 0,

        index: 0,//当前索引
        interval: 0,
        ablummid: '',
        songname: '',
        songmid: '',
        singername: '',
        singermid: '',
        musicUrl: ''
    })
    const MicTotal = ref([])//总歌曲

    onMounted(() => {
        nowMic.dom = document.getElementById('music')
        userMsg == null ? isLogin.value = false : toParseData()
        getMicTotal()//获取电台歌曲
        // 监听空格
        window.addEventListener('keydown', spacePlay)
    })
    onUnmounted(() => {
        window.removeEventListener('keydown', spacePlay)
    })

    // 判断key
    function spacePlay(event) {
        if (event.key === ' ' && nowMic.musicUrl !== '') toPlay()
    }
    // 设置用户
    function toParseData() {
        isLogin.value = true
        const Data = JSON.parse(userMsg)
        userData.headpic = Data.creator.headpic
        userData.nick = Data.creator.nick
    }

    // 获取歌曲信息
    function getMicTotal() {
        getradioMic({ id }).then(res => {
            MicTotal.value = res.data.tracks
            console.log("总歌曲", MicTotal.value);
            setNowMic(nowMic.index)
        })
    }

    // 进行设置当前歌曲
    function setNowMic(index) {
        nowMic.index = index
        nowMic.ablummid = MicTotal.value[index].album.mid
        nowMic.songname = MicTotal.value[index].name
        nowMic.songmid = MicTotal.value[index].mid
        nowMic.singername = MicTotal.value[index].singer[0].name
        nowMic.singermid = MicTotal.value[index].singer[0].mid
        nowMic.interval = MicTotal.value[index].interval
        getMusic(nowMic.songmid, nowMic.songname)
    }

    // 获取歌曲数据
    function getMusic(mid, name) {
        const songmid = mid
        // 初始化状态
        if (nowMic.dom) {
            nowMic.isShow = false
            nowMic.dom.pause()//开始暂停
            nowMic.dom.currentTime = 0;
        }
        // 获取歌词信息
        getSongText({ songmid }).then(res => {
            // 切割歌词
            toArray(res.data.lyric)
            // 获取播放链接
            getSongUrl({ id: songmid }).then(res => {
                Object.values(res.data).length !== 0 ? nowMic.musicUrl = Object.values(res.data)[0] : toErrUrl(name)
            })
        })
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

            nowMic.lyric = lyricData
            console.log(nowMic);

        } catch (error) {
            console.log('报错');
        }
    }

    // 更新时间
    function onTimeUpdate() {
        const audioTime = nowMic.dom.currentTime
        nowMic.audioTime = Math.floor(audioTime)        // 当前时间
        nowMic.duration = nowMic.dom.duration         // 总时间
        nowMic.songTextIndex = nowMic.lyric.time.findIndex(time => time >= audioTime)
        if (nowMic.songTextIndex === -1) {
            nowMic.songTextIndex = nowMic.lyric.time.length
        }
    }

    // 下一首
    function loadMusic() {
        if (nowMic.index === 4) {
            nowMic.index = 0
            getMicTotal()
        } else {
            setNowMic(nowMic.index + 1)
        }
    }
    // 控制音乐播放
    function toPlay() {
        if (nowMic.isShow) {
            nowMic.dom.pause()//开始暂停
            nowMic.isShow = false
        } else {
            nowMic.dom.play()//开始播放
            nowMic.isShow = true
        }
    }
</script>

<template>
    <div id="radioDetail">
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

        <div class="Micmsg">
            <!-- 歌曲卡片 -->
            <div class="MicCard">
                <!-- 功能栏 -->
                <div class="cardBox">
                    <audio :src="nowMic.musicUrl" @timeupdate="onTimeUpdate" id="music"></audio>
                    <!-- 歌名 -->
                    <p class="songname"><span>{{nowMic.songname}}</span></p>
                    <!-- 作者 -->
                    <p class="singername"><span class="on">{{nowMic.singername}}</span></p>
                    <div class="time">
                        <p>
                            {{`${Math.floor(nowMic.audioTime/60)}`+':'+`${String(nowMic.audioTime
                            % 60).padStart(2, '0')}`}}
                        </p>
                        <p>{{'/'}}</p>
                        <p>{{`${Math.floor(nowMic.interval/60)}`+':'+`${String(nowMic.interval
                            % 60).padStart(2, '0')}`}}</p>
                    </div>
                    <!-- 进度条 -->
                    <div class="progress" @mousedown="">
                        <!-- 可拖拽进度条 -->
                        <div class="nowProgress"
                            :style="{width:`${Math.floor((nowMic.audioTime/nowMic.duration)*100)}`+'%'}">
                        </div>
                    </div>
                    <!-- 控制按钮 -->
                    <div class="cardBtn">
                        <!-- 播放暂停 -->
                        <div class="Btn" @click="toPlay">
                            <svg class="icon" v-show="nowMic.isShow===true" aria-hidden="true">
                                <use xlink:href="#icon-zantingsvg"></use>
                            </svg>
                            <svg class="icon" v-show="nowMic.isShow===false" aria-hidden="true">
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
                </div>

                <div class="cardImg">
                    <img class="img"
                        :src="'//y.qq.com/music/photo_new/T002R300x300M000'+(nowMic.ablummid||'0039c3iG034Cs7')+'.jpg'"
                        alt="https://y.qq.com/favicon.ico?max_age=2592000">
                </div>
            </div>
            <!-- 歌词 -->
            <div class="MusicText">
                <ul id="musicProgress"
                    :style="{transform:'translateY('+ (34*2-(nowMic.songTextIndex*34)) +'px)',transition:'transform 0.1s ease-out 0s'}">
                    <li v-for="(item,index) in  nowMic.lyric.text" :key="index"
                        :class="{on:index===nowMic.songTextIndex}">{{item}}</li>
                </ul>
            </div>
        </div>
    </div>

    <msgDialog v-if="errMsg.isErr" :errMsg="errMsg.msg" />
</template>

<style scoped>
    #radioDetail {
        position: relative;
        z-index: 1;
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

        .Micmsg {
            padding: 10% 10% 5%;
            display: flex;
            justify-content: center;
            width: 100%;
            height: 94%;

            .MicCard {
                display: flex;
                flex-direction: row;
                background-color: white;
                width: 50%;
                height: 50%;

                .cardBox {
                    padding: 0 1rem 2rem;
                    width: 60%;
                    height: 100%;

                    .songname {
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        margin: 1rem 0;
                        font: normal normal 24px 微软雅黑;
                    }

                    .singername {
                        font: normal normal 15px 微软雅黑;
                    }

                    .time {
                        display: flex;
                        justify-content: right;
                        font: normal normal 12px 微软雅黑;
                        margin: 3rem 1rem 5px 0;

                        p {
                            display: inline;
                        }
                    }

                    .progress {
                        margin-bottom: 1rem;
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

                    .cardBtn {
                        padding-left: 5%;
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                        width: 20%;

                        .Btn {
                            margin: 1rem 2rem 0 0;

                            .icon {
                                cursor: pointer;
                                width: 32px;
                                height: 32px;
                            }
                        }
                    }
                }

                .cardImg {
                    display: flex;
                    width: 40%;
                    padding: 10px;

                    .img {
                        height: 100%;
                    }
                }
            }
        }

        .MusicText {
            position: absolute;
            z-index: 1;
            bottom: 100px;
            overflow: hidden;
            width: 50%;
            height: 170px;

            ul {
                li {
                    color: #ddd;
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
</style>