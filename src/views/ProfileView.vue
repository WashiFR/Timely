<script setup>
import { inject, onMounted, ref } from 'vue'
import { toast } from "vue3-toastify";
import 'vue3-toastify/dist/index.css';

const api = inject('api')

let userName = ref('')
let email = ref('')

async function fetchGetProfile() {
    try {
        let response = await api.get('/api/profile')
        userName.value = response.data.name
        email.value = response.data.email
    } catch (error) {
        console.error('Error while fetching profile')
        return Promise.reject(error)
    }
}

async function fetchUpdateProfile() {
    try {
        await api.put('/api/profile', {
            name: userName.value,
            email: email.value,
        })
    } catch (error) {
        console.error('Error while updating profile')
        return Promise.reject(error)
    }
}

function saveProfile() {
    fetchUpdateProfile()
        .then(() => {
            toast.success('Profile updated', { theme: 'colored' });
        })
        .catch((error) => {
            error.response.data.errors.forEach((error) => {
                toast.error(error, { theme: 'colored' });
            })
        })
}

onMounted(() => {
    fetchGetProfile()
})
</script>

<template>
    <div class="profile-container">
        <h3>Profile</h3>

        <form class="profile-form">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" v-model="userName" required />

            <label for="email">Email</label>
            <input type="email" id="email" name="email" v-model="email" required />

            <button type="submit" @click.prevent="saveProfile">Save</button>
        </form>
    </div>
</template>

<style scoped>
body, html {
    height: 100%;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 400px;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

h3 {
    margin-bottom: 20px;
    color: #333;
}

.profile-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
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
</style>
