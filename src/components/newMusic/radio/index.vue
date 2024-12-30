<script setup>
    import { useStore } from 'vuex'
    import { useRouter } from 'vue-router'
    import { ref, reactive, onMounted, computed } from 'vue'
    import { getradioCategory } from '@/utils/api/newMusic/radio'
    const store = useStore()
    const router = useRouter()
    const state = store.state.radio
    const list = ref(state.category)
    const newId = ref()

    onMounted(() => {
        if (!list.value) {
            getradioCategory().then(res => {
                store.commit('radio/uploadCategory', res.data)
                list.value = res.data.filter(item => item.id !== 44);
                newId.value = list.value[0].id
                console.log(list.value);
            })
        } else {
            newId.value = list.value[0].id
        }
    })

    // 跳转到雷达详情页
    function toDetail(id) {
        router.push({ path: '/radioDetail', query: { id } })
    }
</script>

<template>
    <div id="radio">
        <!-- 侧边栏 -->
        <div class="category">
            <div :class="{title:true,on:newId===item.id}" v-for="item in list" :key="item">
                <a class="text" @click="newId=item.id" :href="'#'+item.id">
                    {{item.title}}
                </a>
            </div>
        </div>
        <!-- 展示栏 -->
        <div class="list">
            <!-- 展示区 -->
            <section class="listSection" :id="item.id" v-for="item in list" :key="item">
                <p class="title">{{item.title}}</p>
                <ul class="type">
                    <li v-for="type in item.list" :key="type">
                        <img :src="type.pic_url" @click="toDetail(type.id)" alt="">
                        <p @click="toDetail(type.id)">{{type.title}}</p>
                    </li>
                </ul>
            </section>
        </div>
    </div>
</template>

<style scoped>
    #radio {
        transition: 2s all e;
        background-color: #fff;
        padding: 0% 10%;
        width: 100%;

        .category {
            position: fixed;
            background: url(https://y.qq.com/mediastyle/yqq/img/radio_sidebar.png?max_age=2592000) 0 0 no-repeat;
            height: 590px;
            width: 120px;

            .title {
                display: flex;
                align-items: center;
                padding-left: 4rem;
                height: 59px;
                width: 120px;

                .text {
                    color: black;
                    text-decoration: none;
                }

                .text:hover {
                    cursor: pointer;
                    color: #31c27c;
                }
            }

            .on {
                position: relative;

                .text {
                    color: #31c27c;
                }
            }

            .on::after {
                content: "";
                position: absolute;
                left: 0;
                top: 50%;
                z-index: 1;
                background-color: #31c27c;
                height: 2px;
                width: 37px;
            }
        }

        .list {
            margin-left: 120px;
            padding: 2% 5%;

            .listSection {
                .title {
                    display: inline-block;
                    position: relative;
                    color: #666;
                    width: 100%;
                    padding: 2%;
                }

                .title::after {
                    content: "";
                    display: inline-block;
                    position: absolute;
                    top: 50%;
                    margin-left: 2%;
                    background-color: #ddd;
                    height: 1px;
                    width: 100%;
                }

                .type {
                    padding-left: 2%;

                    li {
                        display: inline-block;
                        list-style-type: none;
                        padding: 2%;
                        width: 25%;

                        img {
                            cursor: pointer;
                            margin-bottom: 5%;
                            width: 100%;
                        }

                        p {
                            display: inline;
                        }

                        p:hover {
                            cursor: pointer;
                            color: #31c27c
                        }
                    }
                }
            }
        }
    }
</style>