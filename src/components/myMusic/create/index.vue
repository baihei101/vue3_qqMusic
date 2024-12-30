<script setup>
    import songTable from '@/slot/songTable.vue'
    import { ref, reactive, onMounted, onUpdated } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { userSongList } from '@/utils/api/user'
    const route = useRoute()
    const router = useRouter()
    const albumData = ref()
    const QQId = JSON.parse(localStorage.getItem('QQId'))
    const createSongList = ref()
    onMounted(() => {
        getCreateSongList(QQId)
    })
    // 获取创建的歌单
    function getCreateSongList(id) {
        userSongList({ id }).then(res => {
            console.log(res.data.list);
            createSongList.value = res.data.list
        })
    }
    // 跳转到歌单页
    function toSongList(id, diss_cover) {
        router.push({ path: '/newMusic/playList', query: { id, img: diss_cover } });
    }
</script>

<template>
    <div id="myCreate">
        <songTable :songData="createSongList">
            <template #song>
                <p>歌单</p>
            </template>
            <template #singer>
                <p>曲目数</p>
            </template>
            <template #album />
            <template #time>
                <p>收听</p>
            </template>
            <template #songData="{diss_cover,diss_name,tid,song_cnt}">
                <img class="image" @click="toSongList(tid,diss_cover)" :src="diss_cover" alt="">
                <p class="on" @click="toSongList(tid,diss_cover)">{{diss_name}}</p>
            </template>

            <template #singerData="{song_cnt}">
                <span>{{song_cnt}}</span>
            </template>
            <template #albumData />
            <template #timeData="{listen_num,song_cnt}">
                <p>{{listen_num}}</p>
            </template>
        </songTable>
    </div>
</template>

<style scoped>
    #myCreate {
        .image {
            margin-right: 2rem;
        }
    }
</style>