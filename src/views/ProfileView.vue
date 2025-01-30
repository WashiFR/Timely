<script setup>
import { inject, onMounted, ref } from 'vue'
import {toast} from "vue3-toastify";
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
            toast.success('Profile updated', {theme: 'colored'});
        })
        .catch((error) => {
            error.response.data.errors.forEach((error) => {
                toast.error(error, {theme: 'colored'});
            })
        })
}

onMounted(() => {
    fetchGetProfile()
})
</script>

<template>
    <div>
        <h3>Profile</h3>

        <form>
            <label for="name">Name</label>
            <input type="text" id="name" name="name" v-model="userName" />

            <label for="email">Email</label>
            <input type="email" id="email" name="email" v-model="email" />

            <button type="submit" @click.prevent="saveProfile">Save</button>
        </form>
    </div>
</template>

<style scoped></style>
