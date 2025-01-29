<script setup>
import { inject, onMounted } from 'vue'

const api = inject('api')

onMounted(() => {
    fetchPingApi()
})

async function fetchPingApi() {
    try {
        let response = await api.get('/api/ping')
        console.log(response.data)
    } catch (error) {
        console.error('Error while fetching ping')
        console.error(error)
    }
}
</script>

<template>
    <div>
        <h1>Home</h1>
    </div>
</template>

<style scoped></style>
