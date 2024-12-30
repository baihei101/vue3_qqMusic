<script setup>
    import mvTable from '@/slot/mvList.vue'
    import { useStore } from 'vuex'
    import { useRouter } from 'vue-router'
    import { ref, reactive, onMounted, computed } from 'vue'
    import { mvCategory, getmvList } from '@/utils/api/newMusic/mvList'
    const store = useStore()
    const router = useRouter()
    const state = store.state.mv

    const mvCategoryList = ref(state.category)
    const newCategory = reactive({
        pageNo: 1,
        pageSize: 20,
        area: 15,
        version: 7
    })
    const mvList = ref([])

    onMounted(() => {
        (mvCategoryList.value.category && mvCategoryList.value.version) ? null : mvCategory().then(res => {
            store.commit('mv/uploadCategory', res.data)
            mvCategoryList.value = state.category
            getList(newCategory)
        })
    })

    // 获取分类列表
    function getList(data) {
        newCategory.area = data.area
        newCategory.version = data.version
        newCategory.pageNo = data.pageNo
        newCategory.pageSize = data.pageSize
        getmvList(newCategory).then(res => {
            res.data.list.forEach(item => {
                const date = new Date(item.pubdate * 1000)
                const Y = date.getFullYear() + '-'
                const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
                const D = date.getDate() + ' '
                item.pubdate = Y + M + D
            })
            mvList.value = res.data.list
            console.log(mvList);
        })
    }

    // 跳转歌手页
    function toSinger({ mid, name }) {
        router.push({ path: 'singer_detail', query: { name, mid } })
    }
    // 跳转MV详情页
    function toMV(id) {
        router.push({ path: 'mvDetail', query: { id } })
    }
</script>

<template>
    <div id="mv">
        <div class="mvCategory">
            <ul class="category">
                <p>区域</p>
                <li :class="{on:newCategory.area===item.id}" @click="getList({...newCategory,area:item.id})"
                    v-for="item in mvCategoryList.area" :key="item">
                    {{item.name}}</li>
            </ul>
            <ul class="category">
                <p>版本</p>
                <li :class="{on:newCategory.version===item.id}" @click="getList({...newCategory,version:item.id})"
                    v-for="item in mvCategoryList.version" :key="item">
                    {{item.name}}</li>
            </ul>
        </div>
        <mvTable :mvList="mvList">
            <template #image="{vid,picurl}">
                <div class="bgI" :style="{background:'url('+picurl+') no-repeat center center / cover'}"
                    @click="toMV(vid)">
                    <img class="toplay"
                        src="https://y.qq.com/ryqq/static/media/cover_play@2x.53a26efb.png?max_age=2592000" alt="">
                </div>
            </template>

            <template #title="{item}">
                <span class="on" @click="toMV(item.vid)">{{item.title}}</span>
            </template>

            <template #singer=" {item}">
                <span @click="toSinger(item.singers[0])">{{item.singers[0].name}}</span>
            </template>

            <template #play="{item}">
                <span> {{item.playcnt}}</span>
            </template>

            <template #time="{item}">
                <span> {{item.pubdate}}</span>
            </template>
        </mvTable>
    </div>
</template>

<style scoped>

    #mv {
        padding: 2% 10%;
        width: 100%;

        .mvCategory {
            .category {
                display: flex;
                flex-direction: row;
                font-size: 15px;
                margin: 2% 0;

                p {
                    padding: 5px 10px;
                    margin-right: 3%;
                }

                li {
                    padding: 5px 10px;
                    cursor: pointer;
                    margin-right: 2%;
                    list-style-type: none;
                }

                li:hover {
                    color: #31c27c;
                }

                .on {
                    background-color: #31c27c;
                    color: white;
                }

                .on:hover {
                    color: white;
                }
            }
        }
    }
</style>