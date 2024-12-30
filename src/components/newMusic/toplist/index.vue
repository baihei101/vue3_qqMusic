<script setup>
    import songTable from '@/slot/songTable.vue'
    import { getTopCategory, getTop } from '@/utils/api/newMusic/topList'
    import { ref, reactive, onMounted, inject } from 'vue'
    import { useRouter } from 'vue-router'
    import { useStore } from 'vuex'
    import { setMicKey } from '@/utils/key'
    // 注入方法
    const setMicFn = inject(setMicKey)

    const store = useStore()
    const router = useRouter()
    const state = store.state.topList
    const category = ref(state.category)
    const newCategory = ref(62)
    const isShow = ref(false)
    const topData = reactive({
        title: '',
        period: '',
        desc: '',
        list: []
    })

    onMounted(() => {
        category.value ? toCategory(newCategory.value) : getTopCategory({ showDetail: 0 }).then(res => {
            store.commit('topList/uploadCategory', res.data)
            category.value = state.category
            toCategory(newCategory.value)
        })
    })
    function toCategory(id) {
        newCategory.value = id
        getTop({ id }).then(res => {
            topData.title = res.data.info.title
            topData.period = res.data.period
            topData.desc = res.data.info.desc
            topData.list = res.data.list
            console.log(topData.list);

        })
    }
    // 跳转到歌手页
    function toSinger(name, mid) {
        router.push({ path: 'singer_detail', query: { name, mid } })
    }
</script>
<template>
    <div id="topList">
        <!-- 侧边栏 -->
        <div class="topCategory">
            <div class="title" v-for="item in category" :key="item">
                <h2 class="titleName">{{item.title}}</h2>
                <div class="category">
                    <ul>
                        <li :class="{on:category.topId===newCategory}" v-for="category in item.list"
                            @click="toCategory(category.topId)" :key="category">
                            {{category.label}}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!-- 展示栏 -->
        <div class="showTopList">
            <!-- 标题栏 -->
            <div class="topTitle">
                <ul>
                    <li class="name">{{topData.title}}</li>
                    <li class="time">{{topData.period}}</li>
                    <li class="rule">
                        <p class="text" @click="isShow=!isShow">榜单规则</p>
                        <div class="ruleText" v-show="isShow">
                            <p class="name">榜单规则</p>
                            <p v-html="topData.desc" />
                        </div>
                    </li>
                </ul>
            </div>
            <!-- 歌曲列 -->
            <div class="topList">
                <songTable :songData="topData.list">
                    <template #indexTitle>
                        <p></p>
                    </template>
                    <template #song>
                        <p>歌曲</p>
                    </template>
                    <template #singer>
                        <p>歌手</p>
                    </template>
                    <template #time>
                        <p>日期</p>
                    </template>

                    <template #index></template>
                    <template #songData="song">
                        <p class="on" @click="setMicFn(song)">{{song.name}}</p>
                    </template>
                    <template #singerData="{singer}">
                        <p class="on" @click="toSinger(singer[0].name,singer[0].mid)">{{singer[0].name}}</p>
                    </template>
                    <template #timeData="{time_public}">
                        {{time_public}}
                    </template>
                </songTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
    #topList {
        display: flex;
        flex-direction: row;
        background-color: #fff;
        padding: 5% 10% 0 10%;
        width: 100%;

        .topCategory {
            border: 1px solid #ddd;
            height: 100%;
            width: 15%;

            .title {
                .titleName {
                    font: normal 500 20px 微软雅黑;
                    margin: 0 5%;
                    padding: 10% 0;
                    border-bottom: 1px solid #efefef;
                }

                .category {

                    ul {
                        padding: 5% 0;

                        li {
                            padding: 5%;
                            list-style-type: none;
                        }

                        li:hover {
                            cursor: pointer;
                            color: #61BF82;
                        }

                        .on {
                            background-color: #61BF82;
                            color: white;
                        }

                        .on:hover {
                            color: white;
                        }
                    }
                }
            }
        }

        .showTopList {
            padding-left: 5%;
            width: 85%;

            .topTitle {
                ul {
                    display: flex;
                    align-items: center;
                    padding-top: 2%;

                    li {
                        font: normal 300 16px 微软雅黑;
                        display: inline-block;
                        margin-right: 2rem;
                        list-style-type: none;
                    }

                    .name {
                        font: normal normal 28px 微软雅黑;
                    }

                    .rule {
                        position: relative;

                        .text:hover {
                            cursor: pointer;
                            color: #61BF82;
                        }

                        .ruleText {
                            top: 5vh;
                            left: -20vw;
                            border: 2px solid #ddd;
                            background-color: white;
                            position: absolute;
                            width: 50vw;
                            z-index: 1;

                            p {
                                margin: 2%;
                                font: normal normal 18px 微软雅黑;
                            }

                            .name {
                                font: normal 700 18px 微软雅黑;
                            }
                        }

                        .ruleText:hover {
                            color: black;
                        }
                    }

                }
            }

            .topList {
                width: 100%;

                p {
                    display: inline;
                }
            }
        }
    }
</style>