<script setup>
    const props = defineProps({
        albumData: Array
    });

</script>

<template>
    <div class="albumList">
        <ul>
            <li v-for="item in albumData" :key="item">
                <div class="img">
                    <slot name="img" v-bind="item"/>
                </div>

                <div class="name">
                    <slot name="ablumName" v-bind="item" />
                </div>
                <div class="singers" v-if="$slots.singerName">
                    <slot name="singerName" v-bind="item" />
                </div>
                <div class="time">
                    <slot name="timeData" v-bind="item" />
                </div>
            </li>
        </ul>
    </div>
</template>

<style scoped>
    .albumList {
        ul {
            li {
                margin: 2rem 0;
                display: inline-block;
                list-style-type: none;
                font: normal 300 15px 微软雅黑;
                margin: 1%;
                width: 18%;

                .name {
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    font: normal normal 18px 微软雅黑;
                    width: 100%;
                }
            }
        }
    }
</style>