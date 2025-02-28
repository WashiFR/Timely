<script setup>
import { ref, computed, onMounted } from 'vue'
import { userStore } from '@/stores/userData.js'
import { inject } from 'vue'
import 'vue3-toastify/dist/index.css'

const api = inject('api')
const store = userStore()

const selectedProject = ref('')
const selectedActivity = ref('')
const currentActivity = ref(null)
const notes = ref('')
const startDate = ref('')
const endDate = ref('')
const elapsedTimeUpdate = ref(0)

const progressWidth = computed(() => {
    if (!currentActivity.value || !currentActivity.value.endTime) return '0%'
    const elapsed = (Date.now() - new Date(currentActivity.value.startTime).getTime()) / 1000
    const duration = (new Date(currentActivity.value.endTime).getTime() - new Date(currentActivity.value.startTime).getTime()) / 1000
    return `${Math.min((elapsed / duration) * 100, 100)}%`
})

const elapsedTime = computed(() => {
    if (!currentActivity.value || !currentActivity.value.startTime) return ''
    const now = new Date()
    let diff = Math.floor((now - new Date(currentActivity.value.startTime)) / 1000)

    const hours = Math.floor(diff / 3600)
    diff %= 3600
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60

    let formattedTime = ''
    if (hours > 0) formattedTime += `${hours} h `
    if (minutes > 0 || hours > 0) formattedTime += `${String(minutes).padStart(2, '0')} m `
    formattedTime += `${String(seconds).padStart(2, '0')} s `

    return formattedTime
})

async function fetchData() {
    await store.fetchProjects(api)
    await store.fetchActivities(api)
    await store.fetchTimeEntries(api)
}

onMounted(() => {
    fetchData()
    setInterval(() => {
        elapsedTimeUpdate.value++
    }, 1000)
})

function stopActivity() {
    store.stopActivity(api, store.currentActivity, notes)
}
</script>

<template>
    <div class="time-tracker">
        <div class="activity-container">
            <div class="start-activity">
                <select v-model="selectedProject">
                    <option disabled value="">Select Project</option>
                    <option v-for="project in store.projects" :key="project.id" :value="project.id">{{ project.name }}</option>
                </select>
                <select v-model="selectedActivity">
                    <option disabled value="">Select Activity</option>
                    <option v-for="activity in store.activities" :key="activity.id" :value="activity.id">{{ activity.name }}</option>
                </select>
                <input type="datetime-local" v-model="startDate" placeholder="Start Date">
                <input type="datetime-local" v-model="endDate" placeholder="End Date">
                <textarea v-model="notes" placeholder="Add a comment..."></textarea>
                <button @click="startActivity">Start Activity</button>
            </div>
            <div class="current-activity" v-if="store.currentActivity">
                <h3>{{ store.currentActivity.projectName }}</h3>
                <p>{{ store.currentActivity.activityName }}</p>
                <p>Duration: {{ elapsedTime }}</p>
                <div class="progress-bar" v-if="store.currentActivity.endTime">
                    <div
                        class="progress"
                        :style="{ width: progressWidth }"
                        title="Start: {{ new Date(store.currentActivity.startTime).toLocaleString() }} - End: {{ new Date(store.currentActivity.endTime).toLocaleString() }}"
                    ></div>
                </div>
                <p v-if="!store.currentActivity.endTime">No End Time Set</p>
                <textarea v-model="notes" placeholder="Take notes..."></textarea>
                <button @click="stopActivity" class="stop-activity-button">Stop Activity</button>
            </div>
        </div>
        <div class="time-entries">
            <h3>Previous Entries</h3>
            <div v-for="entry in store.timeEntries" :key="entry.id" class="previous-entry">
                <h4>{{ entry.projectName }} - {{ entry.activityName }}</h4>
                <p>Duration: {{ elapsedTime }}</p>
                <div class="progress-bar" v-if="entry.endTime">
                    <div
                        class="progress"
                        :style="{ width: (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) * 100 + '%' }"
                        title="Start: {{ new Date(entry.startTime).toLocaleString() }} - End: {{ new Date(entry.endTime).toLocaleString() }}"
                    ></div>
                </div>
                <p v-if="!entry.endTime">No End Time Set</p>
                <textarea v-model="entry.comment" readonly placeholder="Comment..."></textarea>
            </div>
        </div>
    </div>
</template>

<style scoped>
*, *::before, *::after {
    box-sizing: border-box;
}

.time-tracker {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
}

.activity-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 800px;
    gap: 20px;
}

.start-activity,
.current-activity {
    width: 48%;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.previous-entry {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f4f4f4;
    border-radius: 5px;
}

select, input[type="datetime-local"], textarea, button {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
}

button {
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #0056b3;
}

.progress-bar {
    width: 100%;
    background-color: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 10px;
}

.progress {
    height: 20px;
    background-color: #4caf50;
    border-radius: 5px;
    transition: width 0.3s;
}

textarea {
    font-size: 16px;
    height: 100px;
}

.stop-activity-button {
    background-color: #ff5733;
}

.stop-activity-button:hover {
    background-color: #c1351d;
}
</style>
