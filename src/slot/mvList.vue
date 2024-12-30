<script setup>
    const props = defineProps({
        mvList: Array
    });

</script>

<template>
    <div class="mvList">
        <ul>
            <li v-for="item in props.mvList" :key="item">
                <slot name="image" v-bind="item" />

                <p class="title">
                    <slot name="title" :item="item" />
                </p>

                <div class="singer" v-if="$slots.singer">
                    <p>
                        <slot name="singer" :item="item" />
                    </p>
                </div>

                <div class="msg" v-if="$slots.play">
                    <svg class="iconSVG" aria-hidden="true">
                        <use xlink:href="#icon-sheyingji"></use>
                    </svg>
                    <p class="play" v-if="$slots.play">
                        <slot name="play" :item="item" />
                    </p>
                    <p class="time">
                        <slot name="time" :item="item" />
                    </p>
                </div>
            </li>
        </ul>
    </div>
</template>

<style scoped>
    .mvList {

        ul {
            li {
                list-style-type: none;
                display: inline-block;
                padding: 1rem;
                width: 25%;

                .title {
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    margin: 5px 0;
                }

                .singer {
                    color: #666;
                    font: normal 300 15px 微软雅黑;
                    p {
                        display: inline;
                        margin-right: 5px;
                    }

                    p:hover {
                        cursor: pointer;
                        color: #31c27c;
                    }
                }

                .msg {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    height: 2rem;

                    p {
                        color: #666;
                        margin-left: 3%;
                        font: normal 300 15px 微软雅黑;
                    }
                }

            }
        }
    }
</style>