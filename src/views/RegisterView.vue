<script setup>
import { useApiKeysStore } from '@/stores/apiKeys.js'
import { inject, ref } from 'vue'
import router from '@/router/index.js'
import {toast} from "vue3-toastify";
import 'vue3-toastify/dist/index.css';

const api = inject('api')
const apiKeysStore = useApiKeysStore()

let userName = ref('')
let email = ref('')
let apiKey = ref('')

async function fetchGetApiKey() {
    try {
        let response = await api.post('/api/apikeys', {
            name: userName.value,
            email: email.value,
        })
        apiKey.value = response.data
    } catch (error) {
        console.error('Error while registering')
        return Promise.reject(error)
    }
}

function register() {
    fetchGetApiKey()
        .then(() => {
            apiKeysStore.setApiKey(apiKey.value.key)
            router.push({ name: 'Home' })
        })
        .catch((error) => {
            apiKeysStore.setApiKey('')
            error.response.data.errors.forEach((error) => {
                toast.error(error, {theme: 'colored'});
            })
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
            <button type="submit" @click.prevent="register()">Register</button>
        </form>

        <router-link to="/login">Déjà un compte ?</router-link>
    </div>
</template>

<style scoped></style>
