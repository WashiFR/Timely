<script setup>
import { inject, onMounted, ref } from 'vue'

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
        console.error(error)
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
        console.error(error)
    }
}

function saveProfile() {
    fetchUpdateProfile().then(() => {
        alert('Profile saved')
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
