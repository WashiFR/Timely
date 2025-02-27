<script setup>
import { useApiKeysStore } from '@/stores/apiKeys.js'
import { ref } from 'vue'
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
            toast.error('API Key invalide', { theme: 'colored' });
        })
}
</script>

<template>
    <div class="login-container">
        <h2>Login</h2>

        <form class="login-form">
            <label for="apiKey">API Key</label>
            <input type="text" id="apiKey" name="apiKey" v-model="apiKey" required />
            <button type="submit" @click.prevent="login">Login</button>
        </form>

        <router-link to="/register" class="register-link">Pas de compte ?</router-link>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100%;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
}

h2 {
    margin-bottom: 20px;
    color: #333;
}

.login-form {
    display: flex;
    flex-direction: column;
    width: 300px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

label {
    margin-bottom: 10px;
    color: #555;
}

input[type="text"] {
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

button {
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #0056b3;
}

.register-link {
    margin-top: 20px;
    color: #007bff;
    text-decoration: none;
}

.register-link:hover {
    text-decoration: underline;
}
</style>
