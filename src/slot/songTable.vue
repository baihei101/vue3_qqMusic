<script setup>
    import { defineEmits } from 'vue'
    const emit = defineEmits(['toMusic'])
    const props = defineProps({
        songData: Array
    });
    function toMusic(data) {
        emit('toMusic', data);
    }
</script>

<!-- 歌单组件 -->
<template>
    <div class="songList">
        <!-- 标题行 -->
        <ul class="songTitle">
            <li class="songlist__index" v-if="$slots.indexTitle">
                <slot name="indexTitle" />
            </li>
            <li class="songlist__header_name" v-if="$slots.song">
                <slot name="song" />
            </li>
            <li class="songlist__header_author" v-if="$slots.singer">
                <slot name="singer" />
            </li>
            <li class="songlist__header_album" v-if="$slots.album">
                <slot name="album" />
            </li>
            <li class="songlist__header_time">
                <slot name="time" />
            </li>
        </ul>
        <!-- 歌手行 -->
        <ul class="songBox" v-for="(item,index) in props.songData" :key="item">
            <li class="songBox__index" v-if="$slots.index">
                <slot name="index">
                    {{index+1}}
                </slot>
            </li>
            <li class="songBox__header_name" v-if="$slots.songData">
                <slot name="songData" v-bind="item" />
            </li>
            <li class="songBox__header_author" v-if="$slots.singerData">
                <slot name="singerData" v-bind="item" />
            </li>
            <li class="songBox__header_album" v-if="$slots.albumData">
                <slot name="albumData" v-bind="item" />
            </li>
            <li class="songBoxt__header_time" v-if="$slots.timeData">
                <slot name="timeData" v-bind="item" />
            </li>
            <li class="playMusic" v-if="$slots.playMusic">
                <slot name="playMusic">
                    <svg class="play-icon" aria-hidden="true" @click="toMusic({item,index})">
                        <use xlink:href="#icon-bofang">
                        </use>
                    </svg>
                </slot>
            </li>
        </ul>
    </div>
</template>

<style scoped>
    .songList {
        width: 100%;

        .songTitle {
            display: flex;
            list-style-type: none;
            color: #999;
            line-height: 50px;
            height: 50px;

            .songlist__index {
                width: 36px;
                height: 100%;
            }

            .songlist__header_name {
                padding-left: 20px;
                width: 45%;
                height: 100%;
            }

            .songlist__header_author {
                width: 20%;
                height: 100%;
            }

            .songlist__header_album {
                width: 20%;
                height: 100%;
            }

            .songlist__header_time {
                width: 10%;
                height: 100%;
            }
        }

        .songBox {
            display: flex;
            margin-bottom: 2%;
            list-style-type: none;
            color: #999;
            font-size: 15px;
            line-height: 50px;
            height: 50px;

            .songBox__index {
                padding-left: 10px;
                width: 36px;
                height: 100%;
            }

            .songBox__header_name {
                display: flex;
                flex-direction: row;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                padding-left: 20px;
                font-weight: 400;
                color: black;
                width: 45%;
                height: 100%;

                img {
                    margin-right: 2rem;
                    height: 100%;
                }
            }

            .songBox__header_author {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                font-weight: 400;
                color: black;
                width: 20%;
                height: 100%;
            }

            .songBox__header_album {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                font-weight: 400;
                color: black;
                overflow: hidden;
                width: 20%;
                height: 100%;
            }

            .songBox__header_time {

                width: 10%;
                height: 100%;
            }

            .playMusic {
                width: 10%;
                height: 100%;
                display: flex;
                justify-content: right;
                align-items: center;

                .play-icon {
                    opacity: 0;
                    transition: 0.5s all ease-out;
                    cursor: pointer;
                    width: 50%;
                    height: 50%;
                }
            }
        }

        .songBox:hover {
            .play-icon {
                opacity: 1;
            }
        }
    }
</style>