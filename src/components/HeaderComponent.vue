<script setup>
import LogoutButton from '@/components/LogoutButton.vue'
import router from '@/router/index.js'
import { useApiKeysStore } from '@/stores/apiKeys.js'
import { userStore } from '@/stores/userData.js'
import { ref, computed, onMounted, inject, onUnmounted } from 'vue'

const apiKeysStore = useApiKeysStore()
const api = inject('api')
const userDataStore = userStore()

const currentActivity = computed(() => userDataStore.currentActivity)
const elapsedTimeUpdate = ref(0)
const isActivityVisible = ref(true)
let intervalId = null

function goToRoute(routeName) {
    router.push({ name: routeName })
}

function fetchCurrentActivity() {
    userDataStore.fetchTimeEntries(api)
}

function fetchObjectives() {
    userDataStore.fetchDailyObjectives(api)
}

const completedObjectives = computed(() => {
    if (!userDataStore.dailyObjectives || userDataStore.dailyObjectives.length === 0) return 0
    return userDataStore.dailyObjectives.filter(obj => obj.is_done).length
})

const totalObjectives = computed(() => {
    if (!userDataStore.dailyObjectives) return 0
    return userDataStore.dailyObjectives.length
})

const elapsedTime = computed(() => {
    const _ = elapsedTimeUpdate.value

    if (!currentActivity.value || !currentActivity.value.start) return ''

    const startTime = new Date(currentActivity.value.start)
    if (isNaN(startTime)) return ''

    const now = new Date()
    let diff = Math.floor((now - startTime) / 1000)

    const hours = Math.floor(diff / 3600)
    diff %= 3600
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60

    return [
        hours > 0 ? `${hours} h` : '',
        minutes > 0 || hours > 0 ? `${String(minutes).padStart(2, '0')} m` : '',
        `${String(seconds).padStart(2, '0')} s`
    ].filter(Boolean).join(' ')
})

const progressPercentage = computed(() => {
    if (!currentActivity.value || !currentActivity.value.start) return 0

    const _ = elapsedTimeUpdate.value

    const startTime = new Date(currentActivity.value.start)
    if (isNaN(startTime)) return 0

    const now = new Date()
    const elapsedSeconds = Math.floor((now - startTime) / 1000)

    return Math.min(elapsedSeconds / 3600 * 100, 100)
})

const objectivesProgressPercentage = computed(() => {
    if (totalObjectives.value === 0) return 0
    return (completedObjectives.value / totalObjectives.value) * 100
})

async function stopActivity() {
    if (currentActivity.value) {
        try {
            await userDataStore.stopActivity(api)
            fetchCurrentActivity()
        } catch (error) {
            console.error('Error while stopping activity', error)
        }
    }
}

onMounted(() => {
    fetchCurrentActivity()
    fetchObjectives()
    intervalId = setInterval(() => {
        elapsedTimeUpdate.value++
    }, 1000)
})

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId)
    }
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
                <p><strong>Project:</strong> {{ currentActivity.projectName }}</p>
                <p><strong>Activity:</strong> {{ currentActivity.activityName }}</p>
                <p><strong>Time:</strong> {{ elapsedTime }}</p>
                <div v-if="currentActivity.start" class="progress-bar">
                    <div class="progress" :style="{ width: `${progressPercentage}%` }"></div>
                </div>
                <button @click="stopActivity" class="stop-activity-button">Stop</button>
            </div>
            <div v-else>
                <p>No activity found.</p>
            </div>
        </div>
        <div v-if="apiKeysStore.hasApiKey" class="objectives">
            <h2>Daily</h2>
            <div class="objectives-counter">
                <p>{{ completedObjectives }} / {{ totalObjectives }} objectives completed</p>
                <div class="progress-bar">
                    <div class="progress" :style="{ width: `${objectivesProgressPercentage}%` }"></div>
                </div>
            </div>
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

    .objectives {
        margin-top: 20px;
        background-color: #444;
        padding: 15px;
        border-radius: 5px;
        color: white;

        .objectives-counter {
            margin-top: 10px;

            p {
                margin-bottom: 5px;
            }
        }
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
            transition: width 0.3s ease;
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
