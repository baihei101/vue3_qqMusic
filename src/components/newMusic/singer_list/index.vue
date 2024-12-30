<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { singerlist, singertypelist } from '@/utils/api/newMusic/singer'
    import { useRouter } from 'vue-router'
    import { useStore } from 'vuex'
    const store = useStore()
    const state = store.state.singer

    const router = useRouter()
    const title = reactive({
        h1: '你关注的歌手将展示在这里',
        h4: '快速起歌,想听就听！'
    })
    const category = reactive({
        area: [],
        genre: [],
        index: [],
        sex: []
    })

    const nowCategory = reactive({
        area: -100,
        genre: -100,
        index: -100,
        sex: -100,
        pageNo: 1
    })

    const singerList = ref([])

    onMounted(() => {
        // 获取歌手分类
        if (state.category) {
            category.area = state.category.area
            category.genre = state.category.genre
            category.index = state.category.index
            category.sex = state.category.sex
        } else {
            getSinger().then(res => {
                store.commit('singer/uploadCategory', res.data)
                category.area = state.category.area
                category.genre = state.category.genre
                category.index = state.category.index
                category.sex = state.category.sex
            })
        }
        getTypeList(nowCategory)
    });
    // 设置分类
    function setCategory(str, id) {
        nowCategory[str] = id
        getTypeList(nowCategory)
    }
    // 获取歌手分类
    async function getSinger() {
        return singerlist()
    }
    // 获取分类歌手列表
    function getTypeList(data) {
        singertypelist(data).then(res => {
            singerList.value = res.data.list
        })
    }
    // 跳转歌手详情页
    function getSingerDetail(singerMid, singerName) {
        router.push({ path: '/newMusic/singer_detail', query: { mid: singerMid, name: singerName } })
    }

</script>
<template>
    <div id="singer">
        <!-- 顶部栏 -->
        <div class="bgImg">
            <h1>{{title.h1}}</h1>
            <h4>{{title.h4}}</h4>
        </div>
        <!-- 选项栏 -->
        <div class="select">
            <ul>
                <li :class="{on:nowCategory.index===item.id}" @click="setCategory('index',item.id)"
                    v-for="item in category.index" :key="item">
                    {{item.name}}
                </li>
            </ul>
            <ul>
                <li :class="{on:nowCategory.area===item.id}" @click="setCategory('area',item.id)"
                    v-for="item in category.area" :key="item">{{item.name}}
                </li>
            </ul>
            <ul>
                <li :class="{on:nowCategory.sex===item.id}" @click="setCategory('sex',item.id)"
                    v-for="item in category.sex" :key="item">{{item.name}}
                </li>
            </ul>
            <ul>
                <li :class="{on:nowCategory.genre===item.id}" @click="setCategory('genre',item.id)"
                    v-for="item in category.genre" :key="item">{{item.name}}
                </li>
            </ul>
        </div>

        <!-- 歌手区 -->
        <div class="singer">
            <ul>
                <li v-for="(item,index) in singerList" :key="item">
                    <div class="singerMsg">
                        <img v-if="index<10" :src="item.singer_pic"
                            @click="getSingerDetail(item.singer_mid,item.singer_name)" alt="">
                        <div class="name" @click="getSingerDetail(item.singer_mid,item.singer_name)">
                            {{item.singer_name}}
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
    #singer {
        width: 100%;
        height: 100%;

        .bgImg {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            color: white;
            width: 100%;
            height: 50%;

            h1 {
                font-weight: 300;
                font-size: 4rem;
                margin-bottom: 1rem;
            }

            h4 {
                font-weight: 300;
                font-size: 2rem;
            }

        }

        .bgImg::after {
            top: 0;
            content: "";
            position: absolute;
            z-index: -1;
            background: url(https://y.qq.com/ryqq/static/media/bg_singer.0ba4a7af.jpg?max_age=2592000) 50% 0 repeat-x;
            width: 100%;
            height: 100%;
        }

        .select {
            padding-left: 10%;

            ul {
                display: flex;
                flex-direction: row;
                width: 100%;
                margin: 2% 0;

                li {
                    padding: 5px;
                    margin-right: 1rem;
                    list-style-type: none;
                }

                li:hover {
                    cursor: pointer;
                    color: #31c27c;
                }

                .on {
                    color: white;
                    background-color: #31c27c;
                }

                .on:hover {
                    color: white;
                }
            }
        }

        .singer {
            padding: 0% 10%;
            width: 100%;

            ul {
                li {
                    display: inline-block;
                    width: 20%;
                    list-style-type: none;

                    .singerMsg {
                        padding: 5%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        height: 100%;

                        img {
                            cursor: pointer;
                            border-radius: 50%;
                            margin-bottom: 10%;
                            width: 60%;
                        }

                        .name {
                            text-align: center;
                        }

                        .name:hover {
                            cursor: pointer;
                            color: #31c27c;
                        }
                    }
                }

                li:nth-child(-n+10) {
                    margin: 2rem 0;

                }
            }

        }
    }
</style>