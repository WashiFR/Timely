<script setup>
import LogoutButton from '@/components/LogoutButton.vue'
import router from '@/router/index.js'
import { useApiKeysStore } from '@/stores/apiKeys.js'
import { userStore } from '@/stores/userData.js'
import { ref, computed, onMounted, inject } from 'vue'
import { toast } from 'vue3-toastify'

const apiKeysStore = useApiKeysStore()
const api = inject('api')
const userDataStore = userStore()

const currentActivity = computed(() => userDataStore.currentActivity)
const elapsedTimeUpdate = ref(0)
const notes = ref('')
const isActivityVisible = ref(true)

function goToRoute(routeName) {
    router.push({ name: routeName })
}

function fetchCurrentActivity() {
    userDataStore.fetchTimeEntries(api)
    const current = userDataStore.timeEntries.find(entry => entry.endTime === null)
    if (current) {
        isActivityVisible.value = true
    } else {
        isActivityVisible.value = false
    }
}

const elapsedTime = computed(() => {
    if (!currentActivity.value || !currentActivity.value.startTime) return ''
    const now = new Date()
    let diff = Math.floor((now - currentActivity.value.startTime) / 1000)

    const hours = Math.floor(diff / 3600)
    diff %= 3600
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60

    let formattedTime = ''
    if (hours > 0) formattedTime += `${hours} h `
    if (minutes > 0 || hours > 0) formattedTime += `${String(minutes).padStart(2, '0')} m `
    formattedTime += `${String(seconds).padStart(2, '0')} s`

    return formattedTime
})

async function stopActivity() {
    if (currentActivity.value) {
        const endTime = new Date().toISOString()

        try {
            await userDataStore.stopActivity(api, currentActivity, notes) // Utilisation de la fonction stopActivity du store
            toast.success('Activity stopped', { theme: 'colored' })
            fetchCurrentActivity()
        } catch (error) {
            console.error('Error while stopping activity', error)
            toast.error('Failed to stop activity', { theme: 'colored' })
        }

        notes.value = ''
    }
}

onMounted(() => {
    fetchCurrentActivity()
    setInterval(() => {
        elapsedTimeUpdate.value++
    }, 1000)
})
</script>

<template>
    <header>
        <h2 @click="goToRoute('Home')">Timely</h2>

        <div v-if="apiKeysStore.hasApiKey" class="nav-buttons">
            <button @click="goToRoute('Home')">Home</button>
            <LogoutButton />
            <button @click="goToRoute('Settings')">Settings</button>
            <button @click="goToRoute('Stats')">Stats</button>
        </div>
        <div v-if="apiKeysStore.hasApiKey && isActivityVisible" class="current-activity">
            <h2>Current Activity</h2>
            <div v-if="currentActivity">
                <p><strong>Project:</strong> {{ currentActivity.project }}</p>
                <p><strong>Activity:</strong> {{ currentActivity.activity }}</p>
                <p><strong>Time:</strong> {{ elapsedTime }}</p>
                <div v-if="elapsedTimeUpdate > 0" class="progress-bar">
                    <div class="progress" :style="{ width: elapsedTimeUpdate + '%' }"></div>
                </div>
                <button @click="stopActivity" class="stop-activity-button">Stop</button>
            </div>
            <div v-else>
                <p>No activity found.</p>
            </div>
        </div>
        <div v-if="apiKeysStore.hasApiKey" class="objectives">
            <h2>Daily</h2>
        </div>
    </header>
</template>

<style lang="scss" scoped>
header {
    font-family: 'Arial', sans-serif;
    background-color: #333;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    h2 {
        color: white;
        font-size: 24px;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
            color: #ddd;
        }
    }

    .nav-buttons {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        button,
        .logout-button {
            background-color: #555;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 5px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s, color 0.3s;

            &:hover {
                background-color: #777;
                color: #eee;
            }
        }
    }

    .current-activity {
        margin-top: 20px;
        background-color: #444;
        padding: 15px;
        border-radius: 5px;
        color: white;
    }

    .progress-bar {
        width: 100%;
        background-color: #666;
        border-radius: 5px;
        overflow: hidden;
        margin-top: 10px;
        height: 10px;

        .progress {
            height: 100%;
            background-color: #4caf50;
        }
    }

    .stop-activity-button {
        background-color: #d9534f;
        color: white;
        border: none;
        padding: 10px 20px;
        margin-top: 10px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s;

        &:hover {
            background-color: #c9302c;
            transform: scale(1.05);
        }
    }
}
</style>
