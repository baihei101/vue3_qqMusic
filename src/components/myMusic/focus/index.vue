<script setup>
    import { userFocusSingers, userFocusUsers } from '@/utils/api/user'
    import { ref, reactive, onMounted, onUpdated } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    onMounted(() => {
        getSingers()
    })

    function getSingers() {
        userFocusSingers().then(res => {
            console.log(res);
        })
    }
</script>

<template>
    <div id="focus">
        <div>

        </div>
    </div>
</template>

<style scoped>
    #focus {
        width: 100%;
        height: 10vh;
        background-color: green;
    }
</style>