<script setup>
    import songTable from '@/slot/songTable.vue'
    import { ref, reactive, onMounted, onUpdated } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { collectSongList } from '@/utils/api/user'
    const route = useRoute()
    const router = useRouter()
    const songList = ref()
    onMounted(() => {
        usercollectSongList()
    })
    // 获取用户收藏的专辑
    function usercollectSongList(data) {
        collectSongList(data).then(res => {
            console.log(res);
            songList.value = res.data.list
        })
    }
    // 跳转到歌单页
    function toSongBox(singBox) {
        console.log(singBox);
        // 跳转到歌单页
        router.push({ path: '/newMusic/playList', query: { id: singBox.dissid, img: singBox.logo } })
    }
</script>

<template>
    <!-- 歌单行 -->
    <div id="songList">
        <songTable :songData="songList">
            <template #song>
                <p>歌单</p>
            </template>
            <template #singer>
                <p>创建人</p>
            </template>
            <template #album>
                <p>曲目数</p>
            </template>
            <template #time>
                <p>收听</p>
            </template>

            <template #songData="item">
                <img class="image" :src="item.logo" alt="" @click="toSongBox(item)">
                <p class="on" v-html="item.dissname" @click="toSongBox(item)" />
            </template>
            <template #singerData="{nickname}">
                <span class="on">{{nickname}}</span>
            </template>
            <template #albumData="{songnum}">
                <p class="num">{{songnum+'首'}}</p>
            </template>
            <template #timeData="{listennum}">
                <p>{{listennum}}</p>
            </template>
        </songTable>
    </div>
</template>

<style scoped>
    #songList {
        .image {
            margin-right: 2rem;
        }

        .num {
            color: #999;
        }
    }
</style>