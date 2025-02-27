<template>
    <div class="time-tracker">
        <div v-if="!currentActivity" class="start-activity">
            <select v-model="selectedProject" @change="startActivity">
                <option disabled value="">Select Project</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
            </select>
            <select v-model="selectedActivity" @change="startActivity">
                <option disabled value="">Select Activity</option>
                <option v-for="activity in activities" :key="activity.id" :value="activity.id">{{ activity.name }}</option>
            </select>
        </div>
        <div v-else class="current-activity">
            <h3>{{ currentActivity.projectName }}</h3>
            <p>{{ currentActivity.activityName }}</p>
            <p>Duration: {{ formatDuration(currentActivity.startTime) }}</p>
            <div class="progress-bar">
                <div class="progress" :style="{ width: progressWidth }"></div>
            </div>
            <textarea v-model="notes" placeholder="Take notes..."></textarea>
            <button @click="stopActivity">Stop Activity</button>
        </div>
        <div class="time-entries">
            <h3>Time Entries</h3>
            <ul>
                <li v-for="entry in sortedTimeEntries" :key="entry.id">
                    {{ entry.projectName }} - {{ entry.activityName }} ({{ formatDuration(entry.start, entry.end) }})
                    <button @click="deleteTimeEntry(entry.id)">Delete</button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { inject } from 'vue';
import { toast } from "vue3-toastify";
import 'vue3-toastify/dist/index.css';

const api = inject('api')

let projects = ref([])
let activities = ref([])
let selectedProject = ref('')
let selectedActivity = ref('')
let currentActivity = ref(null)
let notes = ref('')
let timeEntries = ref([])

const progressWidth = computed(() => {
    if (!currentActivity.value) return '0%'
    const elapsed = (Date.now() - new Date(currentActivity.value.startTime).getTime()) / 1000
    const maxDuration = 3600 // 1 hour
    return `${Math.min((elapsed / maxDuration) * 100, 100)}%`
})

const sortedTimeEntries = computed(() => {
    return timeEntries.value.slice().sort((a, b) => new Date(b.start) - new Date(a.start))
})

function formatDuration(startTime, endTime) {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const elapsed = (end - start) / 1000
    const seconds = Math.floor(elapsed % 60)
    const minutes = Math.floor((elapsed / 60) % 60)
    const hours = Math.floor(elapsed / (60 * 60))
    return `${hours}h ${minutes}m ${seconds}s`
}

async function fetchProjects() {
    try {
        let response = await api.get('/api/projects')
        projects.value = response.data.filter(project => project.is_enabled === 1)
    } catch (error) {
        console.error('Error while fetching projects')
    }
}

async function fetchActivities() {
    try {
        let response = await api.get('/api/activities')
        activities.value = response.data.filter(activity => activity.is_enabled === 1)
    } catch (error) {
        console.error('Error while fetching activities')
    }
}

async function fetchTimeEntries() {
    try {
        let response = await api.get('/api/time-entries')
        timeEntries.value = response.data.map(entry => ({
            ...entry,
            projectName: projects.value.find(p => p.id === entry.project_id).name,
            activityName: activities.value.find(a => a.id === entry.activity_id).name,
        }))
    } catch (error) {
        console.error('Error while fetching time entries')
    }
}

async function fetchCurrentActivity() {
    try {
        let response = await api.get('/api/time-entries/current')
        if (response.data) {
            const project = projects.value.find(p => p.id === response.data.project_id)
            const activity = activities.value.find(a => a.id === response.data.activity_id)
            currentActivity.value = {
                id: response.data.id,
                projectName: project.name,
                activityName: activity.name,
                startTime: response.data.start,
                comment: response.data.comment,
            }
            notes.value = response.data.comment
        }
    } catch (error) {
        console.error('Error while fetching current activity')
    }
}

async function startActivity() {
    if (selectedProject.value && selectedActivity.value) {
        const project = projects.value.find(p => p.id === selectedProject.value)
        const activity = activities.value.find(a => a.id === selectedActivity.value)

        // Close the previous time entry if it's still open
        if (currentActivity.value) {
            await stopActivity()
        }

        try {
            let response = await api.post('/api/time-entries', {
                project_id: selectedProject.value,
                activity_id: selectedActivity.value,
                comment: notes.value,
            })
            currentActivity.value = {
                id: response.data.id,
                projectName: project.name,
                activityName: activity.name,
                startTime: response.data.start,
                comment: notes.value,
            }
            toast.success('Activity started', { theme: 'colored' })
            fetchTimeEntries()
        } catch (error) {
            console.error('Error while starting activity')
            toast.error('Failed to start activity', { theme: 'colored' })
        }
    }
}

async function stopActivity() {
    if (currentActivity.value) {
        const duration = Date.now() - new Date(currentActivity.value.startTime).getTime()
        const endTime = new Date(new Date(currentActivity.value.startTime).getTime() + duration).toISOString()

        try {
            await api.patch(`/api/time-entries/${currentActivity.value.id}/stop`, {
                end: endTime,
                comment: notes.value,
            })
            toast.success('Activity stopped', { theme: 'colored' })
            fetchTimeEntries()
        } catch (error) {
            console.error('Error while stopping activity')
            toast.error('Failed to stop activity', { theme: 'colored' })
        }

        currentActivity.value = null
        selectedProject.value = ''
        selectedActivity.value = ''
        notes.value = ''
    }
}

async function deleteTimeEntry(id) {
    try {
        await api.delete(`/api/time-entries/${id}`)
        toast.success('Time entry deleted', { theme: 'colored' })
        fetchTimeEntries()
    } catch (error) {
        console.error('Error while deleting time entry')
        toast.error('Failed to delete time entry', { theme: 'colored' })
    }
}

onMounted(() => {
    fetchProjects()
    fetchActivities()
    fetchTimeEntries()
    fetchCurrentActivity()
})

watch(() => currentActivity.value, (newVal, oldVal) => {
    if (newVal && !oldVal) {
        notes.value = newVal.comment
    }
})
</script>

<style scoped>
.time-tracker {
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.start-activity {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

.current-activity {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.progress-bar {
    width: 100%;
    background-color: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
}

.progress {
    height: 20px;
    background-color: #4caf50;
    border-radius: 5px;
    transition: width 0.3s;
}

textarea {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    height: 100px;
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

.time-entries {
    margin-top: 20px;
}

.time-entries h3 {
    margin-bottom: 10px;
}

.time-entries ul {
    list-style-type: none;
    padding: 0;
}

.time-entries li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 10px;
    background-color: #f9f9f9;
}

.time-entries button {
    padding: 5px 10px;
    font-size: 14px;
}
</style>
