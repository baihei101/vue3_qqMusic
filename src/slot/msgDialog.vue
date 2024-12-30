<script setup>
    import { watch } from 'vue'
    const props = defineProps({
        errMsg: String
    });

</script>
<template>
    <div id="dialog">
        <p>{{errMsg}}</p>
    </div>
</template>

<style scoped>
    @keyframes dislog {
        0% {
            top: 10%;
            opacity: 0;
        }

        50% {
            top: 5%;
            opacity: 1;
        }

        100% {
            top: 1%;
            opacity: 0;
        }
    }

    #dialog {
        opacity: 0;
        display: flex;
        white-space: nowrap;
        align-items: center;
        padding: 1%;
        position: absolute;
        z-index: 99;
        left: 50%;
        border-radius: 10px;
        transform: translate(-50%, 0);
        animation: 5s dislog ease;
        color: rgb(243, 69, 69);
        background-color: rgb(216, 149, 187);
        height: 2rem;
    }
</style>