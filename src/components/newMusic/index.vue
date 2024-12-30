<script setup>
    import { songlist } from '@/utils/api/newMusic/playList'
    import { recommend, playlist, newSongs } from '@/utils/api/newMusic/index'
    import { getNewAlbum } from '@/utils/api/album'
    import swiperView from '@/slot/swiper.vue'
    import { useStore } from 'vuex'
    import { useRouter } from 'vue-router'
    import { ref, reactive, onMounted, computed, inject } from 'vue'
    import { setMicKey } from '@/utils/key'
    // 注入方法
    const setMicFn = inject(setMicKey)

    // 歌单推荐数据
    const tab = reactive({
        mod_tab: 0,//当前歌单推荐高亮
        song_tab: 0,//当前新歌首发高亮
        album_tab: 0//当前新碟首发高亮
    });
    const store = useStore()
    const router = useRouter()
    const state = store.state.newMusicHome
    const mod_index = state.mod_index//推荐歌单
    const tab_index = state.tab_index//新歌首发
    const album_index = state.album_index//新碟首发
    const transform = reactive({
        mod: 5,
        song: 1,
        album: 1,
    })
    onMounted(() => {
        toRecommend()  // 获取为你推荐
        toNewSongs(0, 0) //获取最新新歌推荐
        toAlbum(1, 0)//获取新碟首发
    });
    // 跳转到歌单详情页
    function toSongList(content) {
        const id = tab.mod_tab === 0 ? content.content_id : content.tid
        router.push({ path: '/newMusic/playList', query: { id, img: content.cover } });
    }
    // 直接播放
    function toPlay(content) {
        const id = tab.mod_tab === 0 ? content.content_id : content.tid
        // 获取歌单详情
        songlist({ id }).then(res => {
            const songList = res.data.songlist
            // 将歌单数据存储本地
            localStorage.setItem('songList', JSON.stringify(songList))
            // 跳转到播放页
            router.push({ path: '/playList' })
        })

    }
    // 为你推荐
    function toRecommend() {
        recommend().then(res => {
            const index = 0
            const data = res.data.list.map(item => ({
                ...item,
                listen_num: (item.listen_num / 10000).toFixed(1)
            }))

            store.commit('newMusicHome/uploadData', { index, data })
        })
    }
    // 切换歌单推荐
    function playList(id, index) {
        tab.mod_tab = index//设置高亮
        // 如果数据为空，则获取数据
        if (mod_index[index].data === null) {
            id === 0 ? toRecommend() : playlist(id).then(res => {
                const data = res.data.list.map(item => ({
                    ...item,
                    cover: item.cover_url_big,
                    listen_num: (item.access_num / 10000).toFixed(1)
                }))
                store.commit('newMusicHome/uploadData', { index, data })
            })
        }
    }

    // 切换新歌首发
    function toNewSongs(type, index) {
        tab.song_tab = index//设置高亮
        // 如果数据为空，则获取数据
        if (tab_index[index].data === null) {
            newSongs({ type }).then(res => {
                const data = chunkArray(res.data.list, 9)
                store.commit('newMusicHome/uploadDataSong', { index, data })
            })
        }
    }

    // 切换新碟推荐
    function toAlbum(type, index) {
        tab.album_tab = index//设置高亮

        // 如果数据为空，则获取数据
        if (album_index[index].data === null) {
            getNewAlbum({ type, num: 20 }).then(res => {
                const data = chunkArray(res.data.list, 10)
                console.log('数据', data);
                store.commit('newMusicHome/uploadDataAlbum', { index, data })
            })
        }
    }
    // 数组分割
    function chunkArray(array, size) {
        let result = [];
        for (let i = 0; i < array.length; i += size) {
            let chunk = array.slice(i, i + size);
            result.push(chunk);
        }
        return result;
    }

    // 去切换歌单推荐
    function toPlayList({ type, index }) {
        playList(type, index)
    }

    // 去换新歌首发
    function toSongs({ type, index }) {
        toNewSongs(type, index)
    }
    // 去新碟首发
    function toAlbumList({ type, index }) {
        toAlbum(type, index)
    }

    // 跳转歌手页
    function toSinger(mid, name) {
        router.push({ path: '/newMusic/singer_detail', query: { name, mid } })
    }
    // 跳转到专辑页
    function toAlbumPage(id) {
        router.push({ path: '/newMusic/albumDetail', query: { id } })
    }

</script>

<template>
    <div id="New">
        <!-- 歌单推荐 -->
        <swiperView v-model:swiperType="mod_index" v-model:swiperData="mod_index[tab.mod_tab].data"
            v-model:swiper="transform.mod" v-model:table="tab.mod_tab" :title="'mod'" :height="'65%'"
            @playList="toPlayList">
            <!-- 标题行 -->
            <template #swiper_title>
                <p>歌单推荐</p>
            </template>
            <!-- 分类行 -->
            <template #isType />
            <!-- 轮播图 -->
            <template #view="{item}">
                <div class="view">
                    <img class="view_img" @click="toSongList(item)" :src="item.cover" alt="">
                    <!-- 跳转页面 -->
                    <img class="toMusic"
                        src="https://y.qq.com/ryqq/static/media/cover_play@2x.53a26efb.png?max_age=2592000" alt=""
                        @click="toPlay(item)">
                    <p class="view_title on" @click="toSongList(item)"> {{item.title}}</p>
                    <p class="view_num">{{'播放量: '+item.listen_num+'万'}}</p>
                </div>
            </template>
        </swiperView>

        <!-- 新歌首发 -->
        <swiperView v-model:swiperType="tab_index" v-model:swiperData="tab_index[tab.song_tab].data"
            v-model:swiper="transform.song" v-model:table="tab.song_tab" :title="'song'" :height="'65%'"
            @playList="toSongs">
            <!-- 标题行 -->
            <template #swiper_title>
                <p>新歌首发</p>
            </template>
            <!-- 分类行 -->
            <template #isType />
            <!-- 轮播图 -->
            <template #view="{item}">
                <ul class="song">
                    <li class="song_li" v-for="song in item" :key="song.id">
                        <!-- 图像 -->
                        <div class="bgI" @click="setMicFn(song)"
                            :style="{background:'url(//y.qq.com/music/photo_new/T002R300x300M000'+song.album.mid+'.jpg) no-repeat center center / cover'}">
                            <img class="toplay"
                                src="https://y.qq.com/ryqq/static/media/cover_play@2x.53a26efb.png?max_age=2592000"
                                alt="">
                        </div>
                        <!-- 歌曲信息 -->
                        <div class="micMsg">
                            <p><span class="song on" @click="setMicFn(song)">{{song.name}}</span></p>
                            <p><span class="singer on"
                                    @click="toSinger(song.singer[0].mid,song.singer[0].name)">{{song.singer[0].name}}</span>
                            </p>
                        </div>
                        <!-- 时间 -->
                        <div class="time">
                            <p> {{`${Math.floor(song.interval/60)}`+':'+`${String(song.interval %
                                60).padStart(2, '0')}`}}</p>
                        </div>
                    </li>
                </ul>
            </template>
        </swiperView>

        <!-- 新碟首发 -->
        <swiperView v-model:swiperType="album_index" v-model:swiperData="album_index[tab.album_tab].data"
            v-model:swiper="transform.album" v-model:table="tab.album_tab" :title="'album'" :height="'100%'"
            @playList="toAlbumList">
            <!-- 标题行 -->
            <template #swiper_title>
                <p>新碟首发</p>
            </template>
            <!-- 分类行 -->
            <template #isType />
            <!-- 轮播图 -->
            <template #view="{item}">
                <ul class="album">
                    <li class="album_li" v-for="album in item" :key="album.id">
                        <div class="bgI" @click="toAlbumPage(album.mid)"
                            :style="{background:'url(//y.qq.com/music/photo_new/T002R300x300M000'+album.mid+'.jpg) no-repeat center center / cover'}">
                            <img class="toplay"
                                src="https://y.qq.com/ryqq/static/media/cover_play@2x.53a26efb.png?max_age=2592000"
                                alt="">
                        </div>
                        <!-- 专辑名 -->
                        <div class="name">
                            <p><span class="albumname on" @click="toAlbumPage(album.mid)">{{album.name}}</span></p>
                            <p><span class="singer on"
                                    @click="toSinger(album.singers[0].mid,album.singers[0].name)">{{album.singers[0].name}}</span>
                            </p>
                        </div>
                    </li>
                </ul>
            </template>
        </swiperView>
    </div>
</template>

<style scoped>
    #New {
        width: 100%;
        height: 100%;
        background-color: palegoldenrod;

        /* 推荐歌单 */
        .view {
            position: relative;

            .view_img {
                position: relative;
                transition: 0.5s all ease-out;
                filter: brightness(1);
                cursor: pointer;
                margin: 5%;
                width: 90%;
            }

            .toMusic {
                transition: 0.5s all ease-out;
                transform: translate(-50%, -100%);
                position: absolute;
                cursor: pointer;
                top: 50%;
                left: 50%;
                opacity: 0;
                z-index: 1;
                width: 30%;
            }

            .view_title {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                display: block;
                height: 48px;
                width: 90%;
                margin: 0 5%;
            }

            .view_num {
                font: normal normal 15px poppin, Tahoma, Arial, \5FAE\8F6F\96C5\9ED1, sans-serif;
                color: #99999A;
                display: block;
                margin: 0 5%;
            }
        }

        .view:hover {
            .toMusic {
                opacity: 1;
            }

            .view_img {
                margin: 2%;
                width: 96%;
                filter: brightness(0.5);
            }
        }

        /* 新歌首发 */
        .song {
            box-sizing: border-box;
            display: flex;
            flex-flow: row wrap;
            align-content: space-around;
            width: 100%;

            .song_li {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin: 0 1%;
                padding: 1% 0;
                list-style-type: none;
                border-bottom: 1px solid #efefef;
                width: calc(30%);

                .bgI {
                    width: 5rem;
                    height: 5rem;
                }

                .micMsg {
                    width: 60%;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    margin: 0 1rem;

                    .song {
                        display: inline;
                        font: normal normal 16px 微软雅黑;
                    }

                    .singer {
                        display: inline;
                        color: #999;
                        font: normal normal 14px 微软雅黑;
                    }

                    .singer:hover {
                        color: #61BF82;
                    }
                }

                .time {
                    color: #999;
                    font: normal 300 14px 微软雅黑;
                }
            }
        }

        /* 新碟首发 */
        .album {
            display: flex;
            flex-flow: row wrap;
            align-content: space-around;
            width: 100%;

            .album_li {
                padding: 1%;
                display: flex;
                flex-direction: column;
                align-items: center;
                list-style-type: none;
                width: calc(20%);

                .bgI {
                    width: 12rem;
                    height: 12rem;
                }

                .name {
                    display: flex;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    flex-direction: column;
                    padding: 1% 10%;
                    width: 100%;

                    .albumname {
                        font: normal normal 16px 微软雅黑;
                    }

                    .singer {
                        color: #999;
                        font: normal normal 14px 微软雅黑;
                    }

                    .singer:hover {
                        color: #61BF82;
                    }
                }
            }
        }
    }
</style>