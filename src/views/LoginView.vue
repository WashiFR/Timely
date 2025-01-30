<script setup>
import {useApiKeysStore} from "@/stores/apiKeys.js";
import {ref} from "vue";
import router from "@/router/index.js";

const apiKeysStore = useApiKeysStore()

let apiKey = ref('')

function login(apiKey) {
    apiKeysStore.setApiKey(apiKey)
    router.push({name: 'Home'})
}
</script>

<template>
    <div>
        <h2>Login</h2>

        <form>
            <label for="apiKey">API Key</label>
            <input type="text" id="apiKey" name="apiKey" v-model="apiKey" required />
            <button type="submit" @click.prevent="login(apiKey)">Login</button>
        </form>

        <router-link to="/register">Pas de compte ?</router-link>
    </div>
</template>

<style scoped>

</style>
