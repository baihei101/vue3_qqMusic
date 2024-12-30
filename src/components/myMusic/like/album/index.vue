<script setup>
    import songTable from '@/slot/songTable.vue'
    import { ref, reactive, onMounted, onUpdated } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { collectAlbum } from '@/utils/api/user'
    const route = useRoute()
    const router = useRouter()
    const albumData = ref()
    onMounted(() => {
        usercollectAlbum()
    })

    // 获取用户专辑
    function usercollectAlbum(data) {
        collectAlbum(data).then(res => {
            albumData.value = res.data.list
            console.log(albumData.value);
        })
    }
    // 跳转到专辑页
    function toAlbum(id) {
        router.push({ path: '/newMusic/albumDetail', query: { id } })
    }
    // 跳转到歌手页
    function toSinger(mid, name) {
        router.push({ path: '/newMusic/singer_detail', query: { name, mid } })
    }
</script>

<template>
    <div id="album">
        <songTable :songData="albumData">
            <template #song>
                <p>专辑</p>
            </template>
            <template #singer>
                <p>歌手</p>
            </template>
            <template #time>
                <p>曲目数</p>
            </template>

            <template #songData="{pic,albumname,albummid}">
                <img class="image" @click="toAlbum(albummid)" :src="pic" alt="">
                <p class="on" @click="toAlbum(albummid)">{{albumname}}</p>
            </template>

            <template #singerData="{singermid,singername}">
                <span class="on" @click="toSinger(singermid,singername)">{{singername}}</span>
            </template>
            <template #timeData="{songnum}">
                <p>{{songnum}}</p>
            </template>
        </songTable>
    </div>
</template>

<style scoped>
    #album {
        .image {
            margin-right: 2rem;
        }
    }
</style>