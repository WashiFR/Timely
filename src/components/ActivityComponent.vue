<template>
    <div class="activity-item" :style="{ borderColor: activity.color }">
        <h3>{{ activity.name }}</h3>
        <div class="activity-actions">
            <span class="wrapper">
                <p>{{ isActive ? 'Active' : 'Inactive' }}</p>
                <label class="toggle-switch">
                    <input type="checkbox" v-model="isActive" @change="toggleActivity" />
                    <span class="slider"></span>
                </label>
            </span>
            <button class="manage" @click="openPopup">Manage</button>
        </div>
        <Popup v-if="showPopup" @close="closePopup">
            <h3>Manage Activity</h3>
            <form @submit.prevent="updateActivity">
                <label for="activity-name">Name</label>
                <input type="text" id="activity-name" v-model="activityName" required />
                <label for="activity-color">Color</label>
                <input type="color" id="activity-color" v-model="activityColor" required />
                <button type="submit">Save</button>
            </form>
        </Popup>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Popup from '@/components/PopupComponent.vue'
import { toast } from "vue3-toastify";
import 'vue3-toastify/dist/index.css';
import { inject } from 'vue';

const props = defineProps({
    activity: Object
})

const emit = defineEmits(['update'])
const api = inject('api')

let isActive = ref(props.activity.is_enabled === 1)
let activityName = ref(props.activity.name)
let activityColor = ref(props.activity.color)
let showPopup = ref(false)

async function toggleActivity() {
    const endpoint = isActive.value ? 'disable' : 'enable'
    try {
        await api.patch(`/api/activities/${props.activity.id}/${endpoint}`)
        toast.success(`Activity ${isActive.value ? 'disabled' : 'enabled'}`, { theme: 'colored' })
        emit('update', { ...props.activity, is_enabled: isActive.value ? 1 : 0 })
    } catch (error) {
        console.error(`Error while ${isActive.value ? 'disabling' : 'enabling'} activity`)
        toast.error(`Failed to ${isActive.value ? 'disable' : 'enable'} activity`, { theme: 'colored' })
    }
}

async function updateActivity() {
    try {
        await api.put(`/api/activities/${props.activity.id}`, {
            name: activityName.value,
            color: activityColor.value,
        })
        toast.success('Activity updated', { theme: 'colored' })
        emit('update', { ...props.activity, name: activityName.value, color: activityColor.value })
        closePopup()
    } catch (error) {
        console.error('Error while updating activity')
        toast.error('Failed to update activity', { theme: 'colored' })
    }
}

function openPopup() {
    showPopup.value = true
}

function closePopup() {
    showPopup.value = false
    activityName.value = props.activity.name
    activityColor.value = props.activity.color
}

watch(() => props.activity, (newActivity) => {
    isActive.value = newActivity.is_enabled === 1
    activityName.value = newActivity.name
    activityColor.value = newActivity.color
})
</script>

<style scoped>
.wrapper {
    display: flex;
    align-items: center;
    margin: 10px 0;
}

.wrapper p {
    margin-right: 10px;
}

.activity-item {
    margin: 5px;
    padding: 15px;
    border: 3px solid;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    position: relative;
}

.activity-item h3 {
    margin-bottom: 10px;
    color: #333;
}

.activity-actions {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    margin: 0;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 20px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: #4caf50;
}

input:checked + .slider:before {
    transform: translateX(20px);
}

.manage {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.manage:hover {
    background-color: #0056b3;
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
