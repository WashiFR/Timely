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

        <div v-if="apiKeysStore.hasApiKey" class="nav-buttons">
            <button @click="goToRoute('Home')">Home</button>
            <LogoutButton />
            <button @click="goToRoute('Settings')">Settings</button>
            <button @click="goToRoute('Stats')">Stats</button>
        </div>
    </header>
</template>

<style lang="scss" scoped>
header {
    background-color: #333;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    h2 {
        color: white;
        font-size: 24px;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
            color: #ddd;
        }
    }

    .nav-buttons {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        button,
        .logout-button {
            background-color: #555;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 5px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s, color 0.3s;

            &:hover {
                background-color: #777;
                color: #eee;
            }
        }
    }
}
</style>
