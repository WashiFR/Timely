<script setup>
import { useApiKeysStore } from "@/stores/apiKeys.js";
import router from "@/router/index.js";

const apiKeysStore = useApiKeysStore()

function logout() {
    let confirmLogout = confirm('Are you sure you want to logout?')

    if (!confirmLogout) {
        return
    }

    apiKeysStore.setApiKey('')
    router.push({name: 'Login'})
}
</script>

<template>
    <button @click="logout()">Logout</button>
</template>

<style scoped>

</style>
