<script setup>
    import songTable from '@/slot/songTable.vue'
    import ablumTable from '@/slot/ablumList.vue'
    import mvTable from '@/slot/mvList.vue'
    import { singerdesc, singersongs, singerablum, getMV, singersim } from '@/utils/api/newMusic/singer'
    import { ref, reactive, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    const route = useRoute()
    const router = useRouter()
    const singermid = route.query.mid
    const singerData = reactive({
        name: route.query.name,
        basic: [],
        text: '',
        desc: '',
        other: [],
        songNum: 0,
        songData: [],
        ablumNum: 0,
        ablumData: [],
        mvNum: 0,
        mvData: [],

        nowType: 0,
        nowTitle: '单曲',
        nowNum: 0,
    })

    onMounted(() => {
        // 获取歌手介绍
        singerdesc({ singermid }).then(res => {
            singerData.basic = res.data.basic.item
            singerData.desc = res.data.desc
            singerData.basic.forEach(item => {
                singerData.text = singerData.text.concat(item.key, ' : ', item.value, ' ')
            });
            singerData.other = res.data.other
            console.log(singerData);
        })
        getMusic(singermid, 1)
        getAblum(singermid, 1)
        getMVData(singermid, 1)
    });
    // 获取热门歌曲
    function getMusic(singermid, page) {
        singersongs({ singermid, page }).then(res => {
            console.log('热门歌曲', res);
            singerData.songNum = res.data.total
            singerData.songData = res.data.list
            singerData.nowNum = res.data.total
        })
    }
    // 获取专辑
    function getAblum(singermid, page) {
        singerablum({ singermid, page }).then(res => {
            console.log('专辑', res);
            singerData.ablumNum = res.data.total
            singerData.ablumData = res.data.list
        })
    }
    // 获取专辑
    function getMVData(singermid, page) {
        getMV({ singermid, page }).then(res => {
            console.log('MV', res);
            singerData.mvNum = res.data.total
            singerData.mvData = res.data.list
        })
    }
    // 跳转
    function toShow(name, num, type) {
        singerData.nowTitle = name
        singerData.nowNum = num
        singerData.nowType = type
    }
    // 跳转MV详情页
    function toMV(id) {
        router.push({ path: 'mvDetail', query: { id } })
    }

    // 跳转到专辑页
    function toAlbum(id) {
        router.push({ path: '/newMusic/albumDetail', query: { id } })
    }

    // 播放单曲
    function toPlayMic() {
        localStorage.setItem('songList', JSON.stringify(singerData.songData))
        router.push({ path: '/playList' })
    }
</script>

<template>
    <div id="singer">
        <!-- 歌手信息栏 -->
        <div class="singerDesc">
            <img :src="'https://y.gtimg.cn/music/photo_new/T001R300x300M000'+singermid+'.jpg'" alt="">
            <div class="singerMsg">
                <!-- 名字 -->
                <div class="singerName">
                    {{singerData.name}}
                </div>
                <!-- 更多 -->
                <div class="singerMore" v-if="singerData.text">
                    <p class="text">
                        {{singerData.text}}
                    </p>
                    <p class="more on">
                        [更多]
                    </p>
                </div>
                <!-- 歌曲|专辑|MV -->
                <div class="singerBox">
                    <p class="songText on" @click="toShow('单曲',singerData.songNum,0)">
                        <span class="title">单曲</span>
                        <strong class="num"> {{singerData.songNum}}</strong>
                    </p>
                    <p class="songText on" @click="toShow('专辑',singerData.ablumNum,1)">
                        <span class="title">专辑</span>
                        <strong class="num"> {{singerData.ablumNum}}</strong>
                    </p>
                    <p class="songText on" @click="toShow('MV',singerData.mvNum,2)">
                        <span class="title">MV</span>
                        <strong class="num"> {{singerData.mvNum}}</strong>
                    </p>
                </div>
                <!-- 播放 -->
                <div class="playMusic">
                    <div class="playBtn onAcitve">
                        <p @click="toPlayMic">播放歌手热门歌曲</p>
                    </div>
                </div>
            </div>
        </div>
        <!-- 展示栏 -->
        <div class="showSong">
            <p class="songText">
                <span class="title">{{singerData.nowTitle}}</span>
                <strong class="num"> {{singerData.nowNum}}</strong>
            </p>
            <!-- 单曲 -->
            <div v-show="singerData.nowType==0">
                <div class="playMusic">
                    <div class="playBtn onAcitve">
                        <p @click="toPlayMic">播放全部</p>
                    </div>
                </div>
                <songTable :songData="singerData.songData">
                    <template #indexTitle />
                    <template #song>
                        <p>歌曲</p>
                    </template>
                    <template #singer>
                        <p>专辑</p>
                    </template>
                    <template #album />
                    <template #time>
                        <p>时长</p>
                    </template>

                    <template #index />
                    <template #songData="{name}">
                        <p class="on">{{name}}</p>
                    </template>

                    <template #singerData="{album}">
                        <p class="on" @click="toAlbum(album.mid)">{{album.name}}</p>
                    </template>
                    <template #albumData />
                    <template #timeData="{interval}">
                        <p>{{`${Math.floor(interval/60)}`+':'+`${String(interval %
                            60).padStart(2, '0')}`}}</p>
                    </template>
                </songTable>
            </div>
            <!-- 专辑 -->
            <div v-show="singerData.nowType==1">
                <!-- 专辑展示 -->
                <ablumTable :albumData="singerData.ablumData">
                    <template #img="{album_mid}">
                        <div class="bgI" @click="toAlbum(album_mid)"
                            :style="{background:'url(//y.qq.com/music/photo_new/T002R300x300M000'+album_mid+'.jpg) no-repeat center center / cover'}">
                            <img class="toplay"
                                src="https://y.qq.com/ryqq/static/media/cover_play@2x.53a26efb.png?max_age=2592000"
                                alt="">
                        </div>
                    </template>
                    <template #ablumName="{album_name,album_mid}">
                        <p class="on" @click="toAlbum(album_mid)">{{album_name}}</p>
                    </template>
                    <template #timeData="{pub_time}">
                        <p> {{pub_time}}</p>
                    </template>
                </ablumTable>
            </div>
            <!-- MV -->
            <div v-show="singerData.nowType==2">
                <mvTable :mvList="singerData.mvData">
                    <template #image="{pic,vid}">
                        <div class="bgI" @click="toMV(vid)"
                            :style="{background:'url('+pic+') no-repeat center center / cover'}">
                            <img class="toplay"
                                src="https://y.qq.com/ryqq/static/media/cover_play@2x.53a26efb.png?max_age=2592000"
                                alt="">
                        </div>
                    </template>

                    <template #title="{item}">
                        <span class="on" @click="toMV(item.vid)">{{item.title}}</span>
                    </template>

                    <template #time="{item}">
                        <span> {{item.date}}</span>
                    </template>
                </mvTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
    p {
        display: inline;
    }

    #singer {
        padding: 0% 10%;
        height: 100%;
        width: 100%;

        .playMusic {
            .playBtn {
                display: inline-block;
                border-radius: 2%;
                padding: 0.5rem 1rem;
            }
        }

        .singerDesc {
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 40%;

            img {
                margin-right: 5rem;
                border-radius: 50%;
                height: 80%;
            }

            .singerMsg {
                .singerName {
                    margin: 2% 0;
                    font: normal normal 40px 微软雅黑;
                }

                .singerMore {
                    display: flex;
                    flex-direction: row;

                    .text {
                        width: 40rem;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }

                .singerBox {
                    margin: 1rem 0;
                    display: flex;
                    flex-direction: row;

                    .songText {
                        display: inline;
                        padding: 0 2rem;
                        border-right: 1px solid #ddd;

                        .title {
                            margin-right: 1rem;
                            font: normal normal 18px 微软雅黑;
                        }

                        .num {
                            font: normal 400 25px 微软雅黑;
                        }

                    }

                    .songText:first-child {
                        padding-left: 0;
                    }

                    .songText:last-child {
                        border-right: none;
                    }
                }

            }
        }

        .showSong {
            .songText {
                padding: 1rem 0;

                .title {
                    margin-right: 1rem;
                    font: normal normal 28px 微软雅黑;
                }

                .num {
                    font: normal normal 28px 微软雅黑;
                }
            }
        }
    }
</style>