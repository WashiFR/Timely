<script setup>
import LogoutButton from '@/components/LogoutButton.vue'
import router from '@/router/index.js'
import { useApiKeysStore } from '@/stores/apiKeys.js'

const apiKeysStore = useApiKeysStore()

function goToRoute(routeName) {
    router.push({ name: routeName })
}
</script>

<template>
    <header>
        <h2 @click="goToRoute('Home')">Timely</h2>

        <div v-if="apiKeysStore.hasApiKey">
            <LogoutButton />
            <button @click="goToRoute('Settings')">Settings</button>
            <button @click="goToRoute('Stats')">Stats</button>
        </div>
    </header>
</template>

<style lang="scss" scoped>
header {
    background-color: black;
    padding: 10px;
    text-align: center;
    width: 200px;

    h2 {
        color: white;
    }
}
</style>
