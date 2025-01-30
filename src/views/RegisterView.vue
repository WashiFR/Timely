<script setup>
import {useApiKeysStore} from "@/stores/apiKeys.js";
import {inject, ref} from "vue";
import router from "@/router/index.js";

const api = inject('api')
const apiKeysStore = useApiKeysStore()

let userName = ref('')
let email = ref('')
let apiKey = ref('')

async function fetchGetApiKey() {
    try {
        let response = await api.post('/api/apiKeys', {
            name: userName.value,
            email: email.value
        })
        apiKey.value = response.data
    } catch (error) {
        console.error('Error while fetching api key')
        console.error(error)
    }
}

function register(apiKey) {
    fetchGetApiKey()
        .then(() => {
            apiKeysStore.setApiKey(apiKey)
            router.push({name: 'Home'})
        })
}
</script>

<template>
    <div>
        <h2>Register</h2>

        <form>
            <label for="name">Name</label>
            <input type="text" id="name" name="name" v-model="userName" required />
            <label for="email">Email</label>
            <input type="email" id="email" name="email" v-model="email" required />
            <button type="submit" @click.prevent="register(apiKey)">Register</button>
        </form>

        <router-link to="/login">Déjà un compte ?</router-link>
    </div>
</template>

<style scoped>

</style>
