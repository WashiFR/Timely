<template>
    <div class="project-item">
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <div class="project-actions">
            <span class="wrapper">
                <p>{{ isActive ? 'Active' : 'Inactive' }}</p>
                <label class="toggle-switch">
                    <input type="checkbox" v-model="isActive" @change="toggleProject" />
                    <span class="slider"></span>
                </label>
            </span>
            <button class="manage" @click="openPopup">Manage</button>
        </div>
        <Popup v-if="showPopup" @close="closePopup">
            <h3>Manage Project</h3>
            <form @submit.prevent="updateProject">
                <label for="project-name">Name</label>
                <input type="text" id="project-name" v-model="projectName" required />
                <label for="project-description">Description</label>
                <textarea id="project-description" v-model="projectDescription" required></textarea>
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
    project: Object
})

const emit = defineEmits(['update'])
const api = inject('api')

let isActive = ref(props.project.is_enabled === 1)
let projectName = ref(props.project.name)
let projectDescription = ref(props.project.description)
let showPopup = ref(false)

async function toggleProject() {
    const endpoint = isActive.value ? 'disable' : 'enable'
    try {
        await api.patch(`/api/projects/${props.project.id}/${endpoint}`)
        toast.success(`Project ${isActive.value ? 'disabled' : 'enabled'}`, { theme: 'colored' })
        emit('update', { ...props.project, is_enabled: isActive.value ? 1 : 0 })
    } catch (error) {
        console.error(`Error while ${isActive.value ? 'disabling' : 'enabling'} project`)
        toast.error(`Failed to ${isActive.value ? 'disable' : 'enable'} project`, { theme: 'colored' })
    }
}

async function updateProject() {
    try {
        await api.put(`/api/projects/${props.project.id}`, {
            name: projectName.value,
            description: projectDescription.value,
        })
        toast.success('Project updated', { theme: 'colored' })
        emit('update', { ...props.project, name: projectName.value, description: projectDescription.value })
        closePopup()
    } catch (error) {
        console.error('Error while updating project')
        toast.error('Failed to update project', { theme: 'colored' })
    }
}

function openPopup() {
    showPopup.value = true
}

function closePopup() {
    showPopup.value = false
    projectName.value = props.project.name
    projectDescription.value = props.project.description
}

watch(() => props.project, (newProject) => {
    isActive.value = newProject.is_enabled === 1
    projectName.value = newProject.name
    projectDescription.value = newProject.description
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

.project-item {
    margin: 10px;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    position: relative;
    width: 200px;
}

.project-item h3 {
    margin-bottom: 10px;
    color: #333;
}

.project-item p {
    color: #555;
}

.project-actions {
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
