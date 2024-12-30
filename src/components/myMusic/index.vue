<script setup>
    import { ref, reactive, onMounted, onUpdated } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    const route = useRoute()
    const router = useRouter()
    const bgMsg = reactive({
        headurl: '',
        name: '',
        fansnum: 0,//粉丝
        follownum: 0//关注
    })//个人信息
    const userList = [
        { title: '我喜欢', path: '/like' },
        { title: '我创建的歌单', path: '/create' },
        // { title: '关注', path: '/focus' },
        // { title: '粉丝', path: '/fans' }
    ]
    onMounted(() => {
        const userMsg = JSON.parse(localStorage.getItem('userMsg'))
        bgMsg.headurl = userMsg.creator.headpic
        bgMsg.name = userMsg.creator.nick
        bgMsg.fansnum = userMsg.creator.nums.fansnum
        bgMsg.follownum = userMsg.creator.nums.follownum
    })

</script>

<template>
    <div id="My">
        <!-- 背景墙 -->
        <div class="bgImg">
            <div class="userMsg">
                <img class="headpic" :src="bgMsg.headurl" alt="">
                <p class="name">{{bgMsg.name}}</p>
                <div class="list">
                    <div class="nums">
                        <!-- 关注 -->
                        <p class="fansnum">{{bgMsg.follownum}}</p>
                        <p class="title">关注</p>
                    </div>
                    <div class="nums">
                        <!-- 粉丝 -->
                        <p class="fansnum">{{bgMsg.fansnum}}</p>
                        <p class="title">粉丝</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="userBtn">
            <ul>
                <li v-for="item in userList" :key="item">
                    <p :class="{on:true,active:route.path.includes(item.path)}"
                        @click="router.push({ path:'/myMusic'+item.path })">
                        {{item.title}}</p>
                </li>
            </ul>
        </div>
        <!-- 功能 -->
        <div class="userView">
            <router-view />
        </div>
    </div>
</template>

<style scoped>
    #My {
        width: 100%;

        .bgImg {
            display: flex;
            justify-content: center;
            align-items: center;
            background: url('https://y.qq.com/ryqq/static/media/bg_profile.bd497b5a.jpg?max_age=2592000') no-repeat center center /cover;
            width: 100%;
            height: 50vh;

            .userMsg {
                .headpic {
                    width: 8rem;
                    border: 5px solid white;
                    border-radius: 50%;
                }

                .name {
                    margin: 2% 0;
                    color: aliceblue;
                    text-align: center;
                    font: normal normal 32px 微软雅黑;
                }

                .list {
                    display: flex;
                    flex-direction: row;
                    width: 100%;

                    .nums {
                        width: 50%;
                        color: white;
                        font: normal normal 18px 微软雅黑;
                        text-align: center;
                        text-align: center;
                    }
                }
            }
        }

        .userBtn {
            width: 100%;
            position: relative;

            ul {
                position: absolute;
                transform: translate(0, -100%);
                display: flex;
                flex-direction: row;
                padding: 1% 10%;

                li {
                    color: aliceblue;
                    margin-right: 2rem;
                    list-style-type: none;
                }
            }
        }

        .userView {
            padding: 0 10%;
            width: 100%;
        }
    }
</style>