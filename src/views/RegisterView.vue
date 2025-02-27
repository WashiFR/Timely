<script setup>
import { useApiKeysStore } from '@/stores/apiKeys.js'
import { inject, ref } from 'vue'
import router from '@/router/index.js'
import { toast } from "vue3-toastify";
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
                toast.error(error, { theme: 'colored' });
            })
        })
}
</script>

<template>
    <div class="register-container">
        <h2>Register</h2>

        <form class="register-form">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" v-model="userName" required />
            <label for="email">Email</label>
            <input type="email" id="email" name="email" v-model="email" required />
            <button type="submit" @click.prevent="register">Register</button>
        </form>

        <router-link to="/login" class="login-link">Déjà un compte ?</router-link>
    </div>
</template>

<style scoped>
.register-container {
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

.register-form {
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

input[type="text"],
input[type="email"] {
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

.login-link {
    margin-top: 20px;
    color: #007bff;
    text-decoration: none;
}

.login-link:hover {
    text-decoration: underline;
}
</style>
