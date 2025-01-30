<script setup>
import { useApiKeysStore } from '@/stores/apiKeys.js'
import {ref} from 'vue'
import router from '@/router/index.js'
import axios from "axios";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const apiKeysStore = useApiKeysStore()

let apiKey = ref('')
let profile = ref('')

// Vérifie si l'API Key est valide en récupérant le profil de l'utilisateur
async function fetchGetProfile() {

    // Création d'une instance d'axios avec l'API Key
    const newAxios = axios.create(
        {
            baseURL: import.meta.env.VITE_API_URL,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'key=' + apiKey.value
            }
        }
    )

    try {
        let response = await newAxios.get('/api/profile')
        profile.value = response.data
    } catch (error) {
        console.error('Error while authenticating')
        return Promise.reject(error)
    }
}

function login() {
    fetchGetProfile()
        .then(() => {
            // Stockage de l'API Key dans le store et redirection vers la page d'accueil
            apiKeysStore.setApiKey(apiKey.value)
            router.push({ name: 'Home' })
        })
        .catch(() => {
            // Reset de l'API Key et affichage d'un message d'erreur
            apiKeysStore.setApiKey('')
            toast.error('API Key invalide', {theme: 'colored'});
        })
}
</script>

<template>
    <div>
        <h2>Login</h2>

        <form>
            <label for="apiKey">API Key</label>
            <input type="text" id="apiKey" name="apiKey" v-model="apiKey" required />
            <button type="submit" @click.prevent="login">Login</button>
        </form>

        <router-link to="/register">Pas de compte ?</router-link>
    </div>
</template>

<style scoped></style>
