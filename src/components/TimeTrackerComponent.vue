<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { userStore } from '@/stores/userData.js'
import { inject } from 'vue'
import { toast } from 'vue3-toastify'

const api = inject('api')
const store = userStore()

const selectedProject = ref('')
const selectedActivity = ref('')
const notes = ref('')
const startDate = ref('')
const endDate = ref('')
const elapsedTimeUpdate = ref(0)
let intervalId = null

const progressWidth = computed(() => {
    const _ = elapsedTimeUpdate.value

    if (!store.currentActivity || !store.currentActivity.end) return '0%'
    const elapsed = (Date.now() - new Date(store.currentActivity.start).getTime()) / 1000
    const duration = (new Date(store.currentActivity.end).getTime() - new Date(store.currentActivity.start).getTime()) / 1000
    return `${Math.min((elapsed / duration) * 100, 100)}%`
})

function calculateElapsedTime(start, end) {
    const startTime = new Date(start).getTime()
    const endTime = end ? new Date(end).getTime() : Date.now()
    let diff = Math.floor((endTime - startTime) / 1000)

    const hours = Math.floor(diff / 3600)
    diff %= 3600
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60

    let formattedTime = ''
    if (hours > 0) formattedTime += `${hours} h `
    if (minutes > 0 || hours > 0) formattedTime += `${String(minutes).padStart(2, '0')} m `
    formattedTime += `${String(seconds).padStart(2, '0')} s`

    return formattedTime
}

const elapsedTime = computed(() => {

    const _ = elapsedTimeUpdate.value

    if (!store.currentActivity || !store.currentActivity.start) return ''

    return calculateElapsedTime(store.currentActivity.start, store.currentActivity.end)
})

async function fetchData() {
    await store.fetchEnabledProjects(api)
    await store.fetchActivities(api)
    await store.fetchTimeEntries(api)
}

onMounted(() => {
    fetchData()
    intervalId = setInterval(() => {
        elapsedTimeUpdate.value++
    }, 1000)
})

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId)
    }
})

watch(endDate, (newEndDate) => {
    if (startDate.value && newEndDate && new Date(newEndDate) < new Date(startDate.value)) {
        toast.error("The end date cannot be earlier than the start date.", { autoClose: 3000 })
        endDate.value = ''
    }
})

const isButtonDisabled = computed(() => {
    if (!startDate.value && !endDate.value) {
        return false
    }
    if (startDate.value && !endDate.value) {
        return true
    }
    if (startDate.value && endDate.value) {
        return new Date(endDate.value) < new Date(startDate.value)
    }
    return false
})

async function handleStartActivity() {
    const formattedStart = startDate.value
        ? new Date(startDate.value).toISOString().replace('T', ' ').substring(0, 19)
        : null;

    const formattedEnd = endDate.value
        ? new Date(endDate.value).toISOString().replace('T', ' ').substring(0, 19)
        : null;

    try {
        await store.startActivity(api, selectedProject.value, selectedActivity.value, formattedStart, formattedEnd, notes.value);
    } catch (error) {
        if (error.response && error.response.data.errors) {
            error.response.data.errors.forEach(errMsg => {
                toast.error(errMsg, { autoClose: 3000 });
            });
        } else {
            toast.error("An unexpected error occurred.", { autoClose: 3000 });
        }
    }
}

async function stopActivity() {
    try {
        await store.stopActivity(api, store.currentActivity, notes.value);
    } catch (error) {
        toast.error("Failed to stop the activity." + error, { autoClose: 3000 });
    }
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

                <input
                    v-if="startDate"
                    type="datetime-local"
                    v-model="endDate"
                    placeholder="End Date"
                    :min="startDate"
                >

                <textarea v-model="notes" placeholder="Add a comment..."></textarea>

                <button @click="handleStartActivity" :disabled="isButtonDisabled">Start Activity</button>
            </div>

            <div class="current-activity" v-if="store.currentActivity">
                <h3>{{ store.currentActivity.projectName }}</h3>
                <p>{{ store.currentActivity.activityName }}</p>
                <p>Duration: {{ elapsedTime }}</p>

                <div class="progress-bar" v-if="store.currentActivity.end">
                    <div
                        class="progress"
                        :style="{ width: progressWidth }"
                        title="Start: {{ new Date(store.currentActivity.start).toLocaleString() }} - End: {{ new Date(store.currentActivity.end).toLocaleString() }}"
                    ></div>
                </div>

                <p v-if="!store.currentActivity.end">No End Time Set</p>
                <textarea v-model="notes" placeholder="Take notes..."></textarea>
                <button @click="stopActivity" class="stop-activity-button">Stop Activity</button>
            </div>
        </div>

        <div class="time-entries">
            <h3>Previous Entries</h3>
            <div class="entries-list">
                <div v-for="entry in store.timeEntries" :key="entry.id" class="previous-entry">
                    <h4>{{ entry.projectName }} - {{ entry.activityName }}</h4>
                    <p>Duration: {{ calculateElapsedTime(entry.start, entry.end) }}</p>

                    <div class="progress-bar" v-if="entry.end">
                        <div
                            class="progress"
                            :style="{ width: '100%' }"
                            title="Start: {{ new Date(entry.start).toLocaleString() }} - End: {{ new Date(entry.end).toLocaleString() }}"
                        ></div>
                    </div>

                    <p v-if="!entry.end">No End Time Set</p>
                    <textarea v-model="entry.comment" readonly placeholder="Comment..."></textarea>
                </div>
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
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
}

.activity-container {
    display: flex;
    justify-content: space-around;
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
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.entries-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
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

button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>
