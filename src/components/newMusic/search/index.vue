<template>
    <div id='searchBox'>
        <!-- 搜索列表 -->
        <div class='searchInput'>
            <input class="input" type="search" v-model="keyData" placeholder="搜索音乐、MV、歌单、用户" @keydown.enter="searchNum">
        </div>
        <!-- 歌手 -->
        <div class="singer" v-if="searchSinger.singerMID">
            <div class="singerPic">
                <img @click="toSinger(searchSinger.singerMID,searchSinger.singerName)" :src="searchSinger.singerPic"
                    alt="">
            </div>
            <div class="singerMsg">
                <div class="singerBox">
                    <p class="name">{{searchSinger.singerName}}</p>
                    <p class="song">{{'单曲 '+searchSinger.songNum}}</p>
                    <p class="album">{{'专辑 '+searchSinger.albumNum}}</p>
                    <p class="mv">{{'MV '+searchSinger.mvNum}}</p>
                </div>
                <div class="toPlay">
                    <div class="playButton">
                        播放歌手热门歌曲
                    </div>
                </div>
            </div>
        </div>
        <!-- 分类 -->
        <div class="searchType">
            <ul>
                <li :class="{active:nowType===item.type}" v-for="item in typeList" :key="item"
                    @click="searchType(item.type)">{{item.name}}</li>
            </ul>
        </div>
        <!-- 歌曲行 -->
        <div class="songList" v-if="nowType===0">
            <songTable :songData="searchData">
                <template #indexTitle>
                    <p></p>
                </template>
                <template #song>
                    <p>歌曲</p>
                </template>
                <template #singer>
                    <p>歌手</p>
                </template>
                <template #album>
                    <p>专辑</p>
                </template>
                <template #time>
                    <p>发行时间</p>
                </template>

                <template #index>
                </template>
                <template #songData="{songname}">
                    <p class="on">{{songname}}</p>
                </template>

                <template #singerData="{singer}">
                    <p class="on" @click="toSinger(singer[0].mid,singer[0].name)">{{singer[0].name}}</p>
                </template>
                <template #albumData="{albumname,albummid}">
                    <p class="on" @click="toAlbum(albummid)">{{albumname}}</p>
                </template>
                <template #timeData="{interval}">
                    <p>{{`${Math.floor(interval/60)}`+':'+`${String(interval %
                        60).padStart(2, '0')}`}}</p>
                </template>
            </songTable>
        </div>
        <!-- 专辑行 -->
        <div class="ablumList" v-else-if="nowType===8">
            <songTable :songData="ablumData">
                <template #song>
                    <p>专辑</p>
                </template>
                <template #singer>
                    <p>歌手</p>
                </template>
                <template #time>
                    <p>发行时间</p>
                </template>

                <template #songData="{albumPic,albumName,albumMID}">
                    <img class="image" @click="toAlbum(albumMID)" :src="albumPic" alt="">
                    <p class="on" @click="toAlbum(albumMID)">{{albumName}}</p>
                </template>

                <template #singerData="{singerMID,singerName}">
                    <p class="on" @click="toSinger(singerMID,singerName)">{{singerName}}</p>
                </template>
                <template #timeData="{publicTime}">
                    <p>{{publicTime}}</p>
                </template>
            </songTable>
        </div>
        <!-- MV行 -->
        <div class="MVList" v-else-if="nowType===12">
            <mvTable :mvList="mvData">
                <template #image="{mv_pic_url,v_id}">
                    <div class="bgI" @click="toMV(v_id)"
                        :style="{background:'url('+mv_pic_url+') no-repeat center center / cover'}">
                        <img class="toplay"
                            src="https://y.qq.com/ryqq/static/media/cover_play@2x.53a26efb.png?max_age=2592000" alt="">
                    </div>
                </template>

                <template #title="{item}">
                    <span class="on" @click="toMV(item.v_id)">{{item.mv_name}}</span>
                </template>

                <template #singer="{item}">
                    <span
                        @click="toSinger(item.singer_list[0].mid,item.singer_list[0].name)">{{item.singer_list[0].name}}</span>
                </template>
            </mvTable>
        </div>
        <!-- 歌单行 -->
        <div class="ablumList" v-else-if="nowType===2">
            <songTable :songData="songListData">
                <template #song>
                    <p>歌单</p>
                </template>
                <template #singer>
                    <p>创建人</p>
                </template>
                <template #time>
                    <p>收听</p>
                </template>

                <template #songData="item">
                    <img class="image" :src="item.imgurl" alt="" @click="toSongBox(item)">
                    <p class="on" v-html="item.dissname" @click="toSongBox(item)" />
                </template>
                <template #singerData="{creator}">
                    <p class="on">{{creator.name}}</p>
                </template>
                <template #timeData="{listennum}">
                    <p class="on">{{listennum}}</p>
                </template>
            </songTable>
        </div>
        <!-- 用户行 -->
        <div class="singerList" v-else-if="nowType===9">
            <ul>
                <li v-for="item in singerList" :key="item">
                    <img @click="toSinger(item.singerMID,item.singerName)" :src="item.singerPic" alt="">
                    <div class="name">
                        <span class="on" @click="toSinger(item.singerMID,item.singerName)">{{item.singerName}}</span>
                    </div>
                    <div class="list">
                        {{'单曲: '+item.songNum}}
                    </div>
                    <div class="list">
                        {{'专辑: '+item.albumNum}}
                    </div>
                    <div class="list">
                        {{'MV: '+item.mvNum}}
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
    import mvTable from '@/slot/mvList.vue'
    import songTable from '@/slot/songTable.vue'
    import { ref, reactive, onMounted, onUpdated } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import {
        search, quick
    } from '@/utils/api/search'

    const route = useRoute()
    let query = route.query.search
    const router = useRouter()
    const typeList = [
        { name: '单曲', type: 0 },
        { name: '专辑', type: 8 },
        { name: 'MV', type: 12 },
        { name: '歌单', type: 2 },
        { name: '歌手', type: 9 }
    ]
    const nowType = ref(0)//当前分类

    const searchSinger = reactive({
        albumNum: 0,
        docid: "",
        mvNum: 0,
        singerID: 0,
        singerMID: "",
        singerName: "",
        singerPic: "",
        songNum: 0
    })//搜索用户

    const keyData = ref()//关键词
    const searchData = ref()//搜索数据
    const ablumData = ref()//专辑数据
    const mvData = ref()//MV数据
    const songListData = ref()//歌单数据
    const singerList = ref()//歌手数据
    const textList = ref()//歌词数据


    onMounted(async () => {
        if (!query) {
            query = '周杰伦'
        }
        topSinger(query)
        const data = await toSearch({ key: query })
        searchData.value = data.data.list
    })
    // 搜索最优歌手
    async function topSinger(key) {
        // 获取歌手信息
        let singer = await toSearch({ key, pageSize: '1', t: '9' })

        singer = singer.data.list[0]
        if (singer) {
            searchSinger.albumNum = singer.albumNum
            searchSinger.docid = singer.docid
            searchSinger.mvNum = singer.mvNum
            searchSinger.singerID = singer.singerID
            searchSinger.singerMID = singer.singerMID
            searchSinger.singerName = singer.singerName
            searchSinger.singerPic = singer.singerPic
            searchSinger.songNum = singer.songNum
        }

    }

    // input搜索
    function searchNum() {
        topSinger(keyData.value)
        searchType(nowType.value)
    }

    // 搜索分类
    async function searchType(type) {
        nowType.value = type
        const data = keyData.value ? { key: keyData.value, t: nowType.value } : { key: query, t: nowType.value }
        const res = await toSearch(data)
        if (res.result === 100) {
            switch (type) {
                case 0://歌曲
                    searchData.value = res.data.list
                    break
                case 8://专辑
                    ablumData.value = res.data.list
                    console.log('专辑', ablumData.value)
                    break
                case 12://MV
                    mvData.value = res.data.list
                    console.log('MV', mvData.value)
                    break
                case 2://歌单
                    songListData.value = res.data.list
                    console.log('歌单', songListData.value)
                    break
                case 9://歌手
                    singerList.value = res.data.list
                    console.log('歌手', singerList.value)
                    break
                case 7://歌词
                    textList.value = res.data.list
                    console.log('歌词', textList.value)
                    break
            }
        }
    }

    async function toSearch(data) {
        return await search(data)
    }

    // 跳转到歌单页
    function toSongBox(singBox) {
        console.log(singBox);
        // 跳转到歌单页
        router.push({ path: '/newMusic/playList', query: { id: singBox.dissid, img: singBox.imgurl } })
    }

    // 跳转到歌手页
    function toSinger(mid, name) {
        router.push({ path: 'singer_detail', query: { name, mid } })
    }
    // 跳转MV详情页
    function toMV(id) {
        router.push({ path: 'mvDetail', query: { id } })
    }

    // 跳转到专辑页
    function toAlbum(id) {
        router.push({ path: '/newMusic/albumDetail', query: { id } })
    }
</script>

<style scoped>
    P {
        display: inline;
    }

    #searchBox {
        width: 100%;
        height: 100%;

        .searchInput {
            display: flex;
            align-items: center;
            justify-content: center;
            background-image: url('https://y.qq.com/mediastyle/yqq/img/bg_search.jpg?max_age=2592000');
            background-size: cover;
            height: 30%;
            width: 100%;

            .input {
                padding: 1%;
                border-radius: 5px;
                border: 2px solid #ddd;
                font: normal normal 15px 微软雅黑;
                height: 20%;
                width: 40%;
            }

            .input:focus {
                outline: none;
                /* 移除默认的聚焦轮廓线（可选） */
            }
        }

        .singer {
            display: flex;
            flex-direction: row;
            padding: 1% 10%;
            height: 15%;
            width: 100%;

            .singerPic {
                margin-right: 2%;

                img {
                    cursor: pointer;
                    border-radius: 50%;
                    height: 100%;
                }
            }

            .singerMsg {
                height: 100%;

                .singerBox {
                    height: 30%;
                    margin-bottom: 5%;
                    display: flex;
                    flex-direction: row;

                    p {
                        display: inline;
                        margin-right: 1rem;
                    }

                }

                .toPlay {
                    height: 70%;

                    .playButton {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        color: white;
                        border-radius: 2%;
                        padding: 0 10%;
                        background-color: #31c27c;
                        width: 80%;
                        height: 60%;
                    }
                }
            }

        }

        .songList,
        .ablumList {
            padding: 0 5%;

            .image {
                margin-right: 2rem;
            }
        }

        .searchType {
            margin-top: 2%;
            padding: 0 10%;
            width: 100%;

            ul {
                display: flex;
                flex-direction: row;

                li {
                    cursor: pointer;
                    margin-right: 4rem;
                    list-style-type: none;
                }

                li:hover {
                    color: #61BF82;
                }

            }
        }

        .MVList {
            padding: 2% 10%;
        }

        .image {
            margin-right: 1rem;
        }

        .singerList {
            padding: 2% 10%;

            ul {
                li {
                    display: flex;
                    align-items: center;
                    flex-direction: row;
                    list-style-type: none;
                    margin: 1rem;
                    width: 100%;
                    height: 4rem;

                    img {
                        cursor: pointer;
                        margin-right: 1rem;
                        border-radius: 50%;
                        height: 100%;
                    }

                    .name {
                        width: 20%;
                    }

                    .list {
                        font: normal 300 15px 微软雅黑;
                        width: 20%;
                    }
                }
            }
        }
    }
</style>