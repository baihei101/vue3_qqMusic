<script setup>
    import ablumTable from '@/slot/ablumList.vue'
    import { getNewAlbum } from '@/utils/api/album'
    import { useRouter } from 'vue-router'
    import { ref, reactive, onMounted } from 'vue'
    const router = useRouter()
    const TypeAlbum = [
        { type: 1, name: '内地' },
        { type: 2, name: '港台' },
        { type: 3, name: '欧美' },
        { type: 4, name: '韩国' },
        { type: 5, name: '日本' },
        { type: 6, name: '其他' },
    ]
    const newType = ref(1)//当前分类
    const ablumList = ref([])//当前专辑列表

    onMounted(() => {
        // 获取当前分类专辑
        getAblum(newType.value)
    });

    // 获取当前分类专辑
    function getAblum(type) {
        newType.value = type
        const data = { type, num: 100 }
        getNewAlbum(data).then(res => {
            ablumList.value = res.data.list
        })
    }

    // 跳转歌手页
    function toSinger(mid, name) {
        router.push({ path: 'singer_detail', query: { name, mid } })
    }
    // 跳转到专辑页
    function toAlbum(id) {
        router.push({ path: 'albumDetail', query: { id } })
    }
</script>
<template>
    <!-- 新碟 -->
    <div id="album">
        <!-- 分类 -->
        <div class="type">
            <ul>
                <li v-for="item in TypeAlbum" :key="item">
                    <p :class="{onAcitve:item.type===newType,on:true}" @click="getAblum(item.type)">{{item.name}}</p>
                </li>
            </ul>
        </div>
        <!-- 专辑展示 -->
        <ablumTable :albumData="ablumList">
            <template #img="{mid}">
                <div class="bgI" @click="toAlbum(mid)"
                    :style="{background:'url(//y.qq.com/music/photo_new/T002R300x300M000'+mid+'.jpg) no-repeat center center / cover'}">
                    <img class="toplay"
                        src="https://y.qq.com/ryqq/static/media/cover_play@2x.53a26efb.png?max_age=2592000" alt="">
                </div>
            </template>
            <template #ablumName="{name,mid}">
                <p class="on" @click="toAlbum(mid)">{{name}}</p>
            </template>

            <template #singerName="{singers}">
                <p class="on" @click="toSinger(singers[0].mid,singers[0].name)">{{singers[0].name}}</p>
            </template>

            <template #timeData="{release_time}">
                <p> {{release_time}}</p>
            </template>
        </ablumTable>
    </div>
</template>

<style scoped>
    p {
        display: inline;
    }

    #album {
        background-color: #efefef;
        padding: 3% 10% 0 10%;
        width: 100%;

        .type {
            width: 100%;

            ul {
                width: 100%;
                padding: 1% 5%;
                display: flex;
                flex-direction: row;

                li {
                    white-space: nowrap;
                    text-align: center;
                    list-style-type: none;
                    margin-right: 2rem;

                    .on {
                        padding: 10% 20%;
                    }

                }
            }
        }


    }
</style>