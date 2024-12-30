<script setup>
    import {
        category, comment
    } from '@/utils/api/newMusic/playList'
    import { getAlbum, getAlbumSongs } from '@/utils/api/album'
    import { useStore } from 'vuex'
    import { useRoute, useRouter } from 'vue-router'
    import { ref, reactive, onMounted, computed } from 'vue'
    import songTable from '@/slot/songTable.vue'
    import commentList from '@/slot/comment.vue'

    const store = useStore()
    const state = store.state.songlist
    const route = useRoute()
    const router = useRouter()
    const img = route.query.img//当前歌单封面
    const id = route.query.id//当前歌单id
    const content = ref()//评论区位置
    const songData = reactive({
        msg: {},
        data: {},
        author: {},
        comment: {},
        hotComment: {}
    })

    onMounted(() => {
        // 获取评论区dom树
        content.value = document.getElementById('comment');
        // 获取专辑信息
        getAlbum({ albummid: id }).then(res => {
            songData.author = res.data.ar[0]
            songData.msg = res.data
        })
        // 获取专辑
        getAlbumSongs({ albummid: id }).then(res => {
            const songList = songData.data.songlist = res.data.list
            // 将歌单数据存储本地
            localStorage.setItem('songList', JSON.stringify(songList))
        })
        // 获取歌单评论
        comment({ id, biztype: 2 }).then(res => {
            songData.comment = res.data.comment.commentlist
            songData.hotComment = res.data.hotComment.commentlist
        })
    })

    // 时间戳转换
    function timeSeconds(time) {
        const date = new Date(time * 1000)
        const year = date.getFullYear();           // 年
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月（加1因为月份从0开始，并用padStart填充前导零）
        const day = String(date.getDate()).padStart(2, '0');       // 日（用padStart填充前导零）
        const hours = String(date.getHours()).padStart(2, '0');    // 时（用padStart填充前导零）
        const minutes = String(date.getMinutes()).padStart(2, '0'); // 分（用padStart填充前导零）
        const seconds = String(date.getSeconds()).padStart(2, '0'); // 秒（用padStart填充前导零）
        return year + '年' + month + '月' + day + '日' + hours + ':' + minutes + ':' + seconds;
    }

    // 跳转评论区
    function toContent() {
        content.value.scrollIntoView({ behavior: 'smooth' });
    }
    // 跳转到歌曲列表
    function toplayList() {
        router.push({ path: '/playList' })
    }
    // 跳转到歌手页
    function toSinger({ name, mid }) {
        router.push({ path: 'singer_detail', query: { name, mid } })
    }

    function toBr(text) {
        return text ? text.replace(/\\n/g, '<br>') : text
    }
</script>

<template>
    <div id="ablum">
        <!-- 标题行 -->
        <div class="header">
            <!-- 图片栏 -->
            <div class="imgBar">
                <img :src="'//y.qq.com/music/photo_new/T002R300x300M000'+id+'.jpg'" alt="">
            </div>
            <!-- 信息栏 -->
            <div class="message">
                <!-- 歌单名 -->
                <div class="title">{{songData.msg.name}}</div>
                <!-- 作者 -->
                <div class="author">
                    <p class="on">{{songData.author.name}}</p>
                </div>
                <!-- 播放量 -->
                <div class="visitnum">{{'发行时间：'+songData.msg.publishTime}}</div>
                <!-- 按钮 -->
                <div class="btnBox">
                    <!-- 播放全部 -->
                    <div class="btn_green" @click="toplayList">播放全部</div>
                    <!-- 评价 -->
                    <div class="btn" @click="toContent">评论</div>
                </div>
            </div>
        </div>

        <!-- 歌曲行 -->
        <songTable :songData="songData.data.songlist">
            <template #indexTitle />

            <template #song>
                <p>歌曲</p>
            </template>
            <template #singer>
                <p>歌手</p>
            </template>
            <template #album />
            <template #time>
                <p>时长</p>
            </template>

            <template #index></template>
            <template #songData="{name}">
                <p class="on">{{name}}</p>
            </template>
            <template #singerData="{singer}">
                <p class="on" @click="toSinger(singer[0])">{{singer[0].name}}</p>
            </template>
            <template #albumData />
            <template #timeData="{interval}">
                {{`${Math.floor(interval/60)}`+':'+`${String(interval %
                60).padStart(2, '0')}`}}
            </template>
        </songTable>

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
    #ablum {
        padding: 0% 5%;
        width: 100%;
        height: 100%;

        p {
            display: inline;
        }

        .header {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 40%;

            .imgBar {
                padding: 2%;
                height: 100%;

                img {
                    height: 100%;
                }
            }

            .message {
                width: 50%;
                padding: 5% 0 0 2%;

                .title {
                    font: normal normal 32px 微软雅黑;
                }

                .author {
                    cursor: pointer;
                    font: normal 300 16px 微软雅黑;
                    margin: 2%;
                }

                .visitnum {
                    font: normal 400 16px 微软雅黑;
                }

                .btnBox {
                    margin-top: 5%;
                    text-align: center;
                    display: flex;
                    font-size: 18px;
                    line-height: 38px;
                    height: 20%;

                    .btn_green {
                        border-radius: 3px;
                        margin-right: 5px;
                        cursor: pointer;
                        border: 1px solid #31c27c;
                        background-color: #31c27c;
                        color: white;
                        width: 122px;
                        height: 38px;
                    }

                    .btn_green:hover {
                        filter: brightness(0.9);
                    }

                    .btn {
                        border-radius: 3px;
                        cursor: pointer;
                        background-color: #ededed;
                        color: #333;
                        width: 122px;
                        height: 38px;
                    }

                    .btn:hover {
                        filter: brightness(0.9);
                    }
                }
            }
        }

        #comment {
            margin-top: 100px;
        }
    }
</style>