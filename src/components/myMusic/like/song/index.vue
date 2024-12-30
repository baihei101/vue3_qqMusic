<script setup>
    import { songlist } from '@/utils/api/newMusic/playList'
    import songTable from '@/slot/songTable.vue'
    import { ref, reactive, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    const route = useRoute()
    const router = useRouter()
    const mylike_id = JSON.parse(localStorage.getItem('userMsg')).mymusic[0].id
    const likeList = ref()
    onMounted(() => {
        songlist({ id: mylike_id }).then(res => {
            console.log(res.data);
            likeList.value = res.data.songlist
        })
    })
    // 跳转到歌曲列表
    function toplayList() {
        // 将歌单数据存储本地
        localStorage.setItem('songList', JSON.stringify(likeList.value))
        router.push({ path: '/playList' })
    }
    // 跳转到歌手页
    function toSinger({ name, mid }) {
        router.push({ path: '/newMusic/singer_detail', query: { name, mid } })
    }
    // 跳转到专辑页
    function toAlbum(id) {
        router.push({ path: '/newMusic/albumDetail', query: { id } })
    }
</script>

<template>
    <div id="music">
        <!-- 按钮 -->
        <div class="btnBox">
            <!-- 播放全部 -->
            <div class="btn_green" @click="toplayList">播放全部</div>
        </div>
        <!-- 歌曲行 -->
        <songTable :songData="likeList">
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
                <p>时长</p>
            </template>

            <template #index></template>
            <template #songData="{songname}">
                <span class="on">{{songname}}</span>
            </template>
            <template #singerData="{singer}">
                <span class="on" @click="toSinger(singer[0])">{{singer[0].name}}</span>
            </template>
            <template #albumData="{albumname,albummid}">
                <span class="on" @click="toAlbum(albummid)"> {{albumname}}</span>
            </template>
            <template #timeData="{interval}">
                {{`${Math.floor(interval/60)}`+':'+`${String(interval %
                60).padStart(2, '0')}`}}
            </template>
        </songTable>
    </div>
</template>

<style scoped>
    #music {
        .btnBox {
            margin-top: 1rem;
            text-align: center;
            display: flex;
            font-size: 18px;
            line-height: 38px;
            height: 20%;

            .btn_green {
                border-radius: 3px;
                margin-right: 5px;
                cursor: pointer;
                border: 1px solid #31c27c;
                background-color: #31c27c;
                color: white;
                width: 122px;
                height: 38px;
            }

            .btn_green:hover {
                filter: brightness(0.9);
            }
        }
    }
</style>