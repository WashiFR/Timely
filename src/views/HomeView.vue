<script setup>
import { inject, onMounted, ref } from 'vue'

const api = inject('api')
let ping = ref('')

onMounted(() => {
    fetchPingApi()
})

async function fetchPingApi() {
    try {
        let response = await api.get('/api/ping')
        ping.value = response.data
    } catch (error) {
        console.error('Error while fetching ping')
        console.error(error)
    }
}
</script>

<template>
    <div>
        <h2>Home</h2>

        {{ ping.message }}
    </div>
</template>

<style scoped></style>
