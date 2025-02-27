<script setup>
import { inject, onMounted, ref, computed } from 'vue'
import { toast } from "vue3-toastify";
import 'vue3-toastify/dist/index.css';
import Popup from '@/components/PopupComponent.vue'
import ActivityComponent from '@/components/ActivityComponent.vue'

const api = inject('api')

let activities = ref([])
let search = ref('')
let showPopup = ref(false)
let newActivityName = ref('')
let newActivityColor = ref('')

const filteredActivities = computed(() => {
    return activities.value.filter(activity =>
        activity.name.toLowerCase().includes(search.value.toLowerCase())
    )
})

async function fetchGetActivities() {
    try {
        let response = await api.get('/api/activities')
        activities.value = response.data.filter(activity => activity.is_enabled === 1)
        console.log(activities.value)
    } catch (error) {
        console.error('Error while fetching activities')
        return Promise.reject(error)
    }
}

async function createActivity() {
    try {
        await api.post('/api/activities', {
            name: newActivityName.value,
            color: newActivityColor.value,
        })
        toast.success('Activity created', { theme: 'colored' })
        fetchGetActivities()
        closePopup()
    } catch (error) {
        console.error('Error while creating activity')
        toast.error('Failed to create activity', { theme: 'colored' })
    }
}

function openPopup() {
    showPopup.value = true
}

function closePopup() {
    showPopup.value = false
    newActivityName.value = ''
    newActivityColor.value = ''
}

function handleActivityUpdate(updatedActivity) {
    const index = activities.value.findIndex(activity => activity.id === updatedActivity.id)
    if (index !== -1) {
        activities.value[index] = updatedActivity
    }
}

onMounted(() => {
    fetchGetActivities()
})
</script>

<template>
    <div class="activities-container">
        <h2>Activities</h2>
        <div class="activities-nav">
            <input type="text" class="search" placeholder="Search activities ..." v-model="search" />
            <button class="create" @click="openPopup">+ Create Activity</button>
        </div>
        <div class="activities-list">
            <ActivityComponent
                v-for="activity in filteredActivities"
                :key="activity.id"
                :activity="activity"
                @update="handleActivityUpdate"
            />
        </div>
        <Popup v-if="showPopup" @close="closePopup">
            <h3>Create New Activity</h3>
            <form @submit.prevent="createActivity">
                <label for="activity-name">Name</label>
                <input type="text" id="activity-name" v-model="newActivityName" required />
                <label for="activity-color">Color</label>
                <input type="color" id="activity-color" v-model="newActivityColor" required />
                <button type="submit">Create</button>
            </form>
        </Popup>
    </div>
</template>

<style scoped>
.activities-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80%;
    box-sizing: border-box;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

h2 {
    margin-bottom: 20px;
    color: #333;
}

.activities-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
    margin: 10px;
    width: 100%;
}

.search {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    width: 70%;
    margin-bottom: 0;
    width: 50%;
    box-sizing: border-box;
}

.create {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.create:hover {
    background-color: #0056b3;
}

.activities-list {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    margin-top: 20px;
}

.activities-list::-webkit-scrollbar {
    width: 8px;
}

.activities-list::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.activities-list::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 5px;
}

.activities-list::-webkit-scrollbar-thumb:hover {
    background: #555;
}

form {
    display: flex;
    flex-direction: column;
}

label {
    margin-bottom: 10px;
    color: #555;
}

input, textarea {
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

button[type="submit"] {
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button[type="submit"]:hover {
    background-color: #0056b3;
}
</style>
