<script setup>
    import { useRoute, useRouter } from 'vue-router'
    import { ref, reactive, onMounted } from 'vue'
    import { getmvUrl, getmvMsg } from '@/utils/api/newMusic/mvList'
    import {
        comment
    } from '@/utils/api/newMusic/playList'
    import commentList from '@/slot/comment.vue'

    const route = useRoute()
    const router = useRouter()
    const id = route.query.id
    const url = ref()
    const msg = reactive({
        name: '',
        mid: '',
        desc: '',
        date: ''
    })
    const songData = reactive({
        comment: {},
        hotComment: {}
    })
    onMounted(() => {
        getUrl(id)
        getMsg(id)
        getComtent(id)
    })


    // 时间戳转换
    function timeSeconds(time) {
        const date = new Date(time * 1000)
        const year = date.getFullYear()       // 年
        const month = String(date.getMonth() + 1).padStart(2, '0')// 月（加1因为月份从0开始，并用padStart填充前导零）
        const day = String(date.getDate()).padStart(2, '0')      // 日（用padStart填充前导零）
        return year + '-' + month + '-' + day
    }

    // 查询歌曲链接
    function getUrl(id) {
        getmvMsg({ id }).then(res => {
            console.log(res);
            msg.name = res.data.info.singers[0].name
            msg.mid = res.data.info.singers[0].mid
            msg.desc = res.data.info.desc
            msg.date = res.data.info.pubdate
        })
    }

    // 查询歌曲信息
    function getMsg(id) {
        getmvUrl({ id }).then(res => {
            const nowUrl = res.data[id]
            nowUrl.forEach((item) => {
                if (item) url.value = item
            });
        })
    }

    function getComtent(id) {
        // 获取歌单评论
        comment({ id, biztype: 5 }).then(res => {
            console.log(res.data);
            songData.comment = res.data.comment.commentlist
            songData.hotComment = res.data.hotComment.commentlist
        })
    }

    function toBr(text) {
        return text ? text.replace(/\\n/g, '<br>') : text
    }
</script>

<template>
    <div id="mvDetail">
        <div class="playMV">
            <video class="video" :src="url" controls />
        </div>
        <div class="mvMsg">
            <h2 class="title">视频简介</h2>
            <p class="singer on">{{msg.name}}</p>
            <p class="date"><span class="dateText">发行时间:</span> {{timeSeconds(msg.date)}}</p>
            <p class="desc" v-html="msg.desc" />
        </div>

        <!-- 评论行 -->
        <div id="comment">
            <!-- 热门评论 -->
            <div class="hotComment" v-show="songData.hotComment">
                <commentList :songData="songData.hotComment">
                    <template #title>
                        <span>精彩评价</span>
                    </template>
                    <template #name="{item}">
                        <p>{{item.nick}}</p>
                    </template>
                    <template #time="{item}">
                        <p> {{timeSeconds(item.time)}}</p>
                    </template>
                    <template #content="{item}">
                        <p v-html="toBr(item.rootcommentcontent)" />
                    </template>
                </commentList>
            </div>
            <!-- 全部评论 -->
            <commentList :songData="songData.comment">
                <template #title>
                    <span>全部评价</span>
                </template>
                <template #name="{item}">
                    <p>{{item.nick}}</p>
                </template>
                <template #time="{item}">
                    <p> {{timeSeconds(item.time)}}</p>
                </template>
                <template #content="{item}">
                    <p v-html="toBr(item.rootcommentcontent)" />
                </template>
            </commentList>
        </div>
    </div>
</template>

<style scoped>
    #mvDetail {
        width: 100%;

        .playMV {
            padding: 0% 10%;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: #333;

            .video {
                width: 100%;
            }
        }

        .mvMsg {
            padding: 0% 10%;
            width: 100%;

            .title {
                margin: 3rem 0 1rem 0;
                font: normal normal 32px 微软雅黑;
            }

            .singer {
                display: inline;
                margin-right: 2rem;
            }

            .date {
                display: inline;
                font-weight: 300;

                .dateText {
                    margin-right: 5px;
                }
            }

            .desc {
                margin-top: 1rem;
                line-height: 2rem;
            }
        }

        #comment {
            margin: 2% 10%;
        }
    }
</style>