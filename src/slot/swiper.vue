<script setup>
    import { ref, reactive, onMounted } from 'vue'
    const emit = defineEmits(['playList']);
    const table = defineModel('table')
    const swiperType = defineModel('swiperType');
    const swiperData = defineModel('swiperData');
    const swiperNumber = defineModel('swiper')
    const props = defineProps({
        title: String,
        height: String
    });
    const swiper = reactive({
        dom: null,
        transform: 0
    })
    onMounted(() => {
        swiper.dom = document.getElementById(props.title)
    })
    // 切换分类歌单
    function playList(type, index) {
        swiper.transform = 0
        swiper.dom.style.transform = 'translateX(' + swiper.transform + '%)'
        emit('playList', { type, index })
    }
    // 向右偏移
    function toRight() {
        const remainder = swiperData.value.length % swiperNumber.value
        const result = swiperData.value.length / swiperNumber.value
        const index = remainder !== 0 ? Math.floor(result) + 1 : result
        swiper.transform = swiper.transform > (1 - index) * 100 ? swiper.transform -= 100 : swiper.transform = 0
        swiper.dom.style.transform = 'translateX(' + swiper.transform + '%)'
    }
    // 向左偏移
    function toLeft() {
        const remainder = swiperData.value.length % swiperNumber.value
        const result = swiperData.value.length / swiperNumber.value
        const index = remainder !== 0 ? Math.floor(result) + 1 : result
        swiper.transform = swiper.transform < 0 ? swiper.transform += 100 : swiper.transform = (1 - index) * 100
        swiper.dom.style.transform = 'translateX(' + swiper.transform + '%)'
    }
</script>

<template>
    <div class="swiper" :style="{height:props.height}">
        <!-- 标题行 -->
        <h2 class="swiper_title">
            <slot name="swiper_title" />
        </h2>
        <!-- 分类行 -->
        <div class="swiper_type" v-if="$slots.isType">
            <slot name="isType">
                <ul class="type_ul">
                    <li class="type_li" v-for="(type,index) in swiperType" :key="type">
                        <p :class="{on:true,active:table===index}" @click="playList(type.value,index)">
                            {{type.title}}
                        </p>
                    </li>
                </ul>
            </slot>
        </div>
        <!-- 轮播图 -->
        <div class="swiper_view">
            <svg class="icon left" aria-hidden="true" @click="toLeft">
                <use xlink:href="#icon-xiangzuojiantou"></use>
            </svg>

            <div class="showView">
                <ul class="view_ul" :id="props.title">
                    <li class="view_li" :style="{width:100/swiperNumber+'%'}" v-for="item in swiperData" :key="item">
                        <slot name="view" :item="item" />
                    </li>
                </ul>
            </div>

            <svg class="icon right" aria-hidden="true" @click="toRight">
                <use xlink:href="#icon-xiangyoujiantou"></use>
            </svg>
        </div>
    </div>
</template>

<style scoped>
    .swiper {
        background: linear-gradient(to bottom, #f3f3f3, #FBFAFB);
        width: 100%;

        /* 标题行 */
        .swiper_title {
            padding: 2% 0 1%;
            font: normal 600 30px 微软雅黑;
            letter-spacing: 10px;
            text-align: center;
            width: 100%;
            height: 20%;
        }

        /* 分类行 */
        .swiper_type {
            display: flex;
            justify-content: center;
            margin-bottom: 2%;
            width: 100%;
            height: 5%;

            .type_ul {
                display: flex;
                justify-content: center;
                flex-direction: row;

                .type_li {
                    margin: 0 2rem;
                    list-style-type: none;

                    .type_text {
                        display: inline;
                    }
                }
            }
        }

        /* 轮播图 */
        .swiper_view {
            padding: 0% 10%;
            position: relative;
            overflow: hidden;
            width: 100vw;
            height: 68%;

            .showView {
                position: relative;
                overflow: hidden;
                z-index: 2;

                .view_ul {
                    position: relative;
                    z-index: 1;
                    transition: 1s all ease-out;
                    display: block;
                    white-space: nowrap;
                    height: 100%;

                    .view_li {
                        height: 100%;
                        display: inline-block;
                    }
                }
            }


            .icon {
                cursor: pointer;
                position: absolute;
                display: inline-block;
                transition: 1s all ease;
                background-color: #ddd;
                padding: 1%;
                top: 20%;
                z-index: 1;
                width: 5%;
                height: 30%;
            }

            .left {
                left: 0;
                transform: translateX(-100%);
            }

            .right {
                right: 0;
                transform: translateX(100%);
            }
        }
    }

    .swiper:hover {
        .left {
            transform: translateX(0);
        }

        .right {
            transform: translateX(0);
        }
    }
</style>