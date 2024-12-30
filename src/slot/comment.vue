<script setup>
    const props = defineProps({
        songData: Object
    });

</script>

<template>
    <p>
        <slot name="title"/>
    </p>

    <div class="hotList" v-for="item in songData" :key="item">
        <img class="img" :src="item.avatarurl" alt="">
        <div class="userMsg">
            <!-- 昵称 -->
            <div class="name">
                <slot name="name" :item="item" />
            </div>
            <!-- 时间 -->
            <div class="time">
                <slot name="time" :item="item" />
            </div>
            <!-- 评论 -->
            <div class="content">
                <slot name="content" :item="item" />
            </div>
        </div>
    </div>
</template>

<style scoped>
    p {
        margin-bottom: 2%;
    }

    .hotList {
        display: flex;
        flex-direction: row;
        border-top: 1px #efefef solid;
        padding: 2% 0;

        .img {
            cursor: pointer;
            color: #31c27c;
            border-radius: 20px;
            margin-right: 20px;
            height: 40px;
            width: 40px;
        }

        .userMsg {
            font: normal normal 15px 微软雅黑;
            color: #999;

            .name {
                margin-bottom: 5px;
            }

            .name:hover {
                cursor: pointer;
                color: #31c27c;
            }

            .time {
                font-weight: 300;
                font-size: 14px;
                margin-bottom: 10px;
            }

            .content {
                padding: 5px 0;
                font: normal normal 15px 微软雅黑;
                color: black;
            }
        }
    }
</style>