<script setup>
    import { ref, reactive, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    const route = useRoute()
    const router = useRouter()
    const page = [
        { title: '歌曲', path: '/music' },
        { title: '歌单', path: '/songList' },
        { title: '专辑', path: '/album' },
    ]
</script>

<template>
    <div id="like">
        <!-- 分类 -->
        <div class="type">
            <ul>
                <li v-for="item in page" :key="item">
                    <p :class="{text:true,on:true,active:route.path.includes(item.path)}"
                        @click="router.push({path:'/myMusic/like'+item.path})">{{item.title}}</p>
                </li>
            </ul>
        </div>
        <!-- 显示页 -->
        <router-view />
    </div>
</template>

<style scoped>
    #like {
        width: 100%;

        .type {
            ul {
                display: flex;
                flex-direction: row;
                padding: 2% 0;

                li {
                    list-style-type: none;
                    margin-right: 5rem;

                    .text {}
                }
            }
        }
    }
</style>