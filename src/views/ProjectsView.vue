<script setup>
import { inject, onMounted, ref, computed } from 'vue'
import { toast } from "vue3-toastify";
import 'vue3-toastify/dist/index.css';
import Popup from '@/components/PopupComponent.vue'
import ProjectComponent from '@/components/ProjectComponent.vue'

const api = inject('api')

let projects = ref([])
let search = ref('')
let showPopup = ref(false)
let newProjectName = ref('')
let newProjectDescription = ref('')

const filteredProjects = computed(() => {
    return projects.value.filter(project =>
        project.name.toLowerCase().includes(search.value.toLowerCase()) ||
        project.description.toLowerCase().includes(search.value.toLowerCase())
    )
})

async function fetchGetProjects() {
    try {
        let response = await api.get('/api/projects')
        projects.value = response.data.filter(project => project.is_enabled === 1)
        console.log(projects.value)
    } catch (error) {
        console.error('Error while fetching projects')
        return Promise.reject(error)
    }
}

async function createProject() {
    try {
        await api.post('/api/projects', {
            name: newProjectName.value,
            description: newProjectDescription.value,
        })
        toast.success('Project created', { theme: 'colored' })
        fetchGetProjects()
        closePopup()
    } catch (error) {
        console.error('Error while creating project')
        toast.error('Failed to create project', { theme: 'colored' })
    }
}

function openPopup() {
    showPopup.value = true
}

function closePopup() {
    showPopup.value = false
    newProjectName.value = ''
    newProjectDescription.value = ''
}

function handleProjectUpdate(updatedProject) {
    const index = projects.value.findIndex(project => project.id === updatedProject.id)
    if (index !== -1) {
        projects.value[index] = updatedProject
    }
}

onMounted(() => {
    fetchGetProjects()
})
</script>

<template>
    <div class="projects-container">
        <h2>Projects</h2>
        <div class="projects-nav">
            <input type="text" class="search" placeholder="Search projects ..." v-model="search" />
            <button class="create" @click="openPopup">+ Create Project</button>
        </div>
        <div class="projects-list">
            <ProjectComponent
                v-for="project in filteredProjects"
                :key="project.id"
                :project="project"
                @update="handleProjectUpdate"
            />
        </div>
        <Popup v-if="showPopup" @close="closePopup">
            <h3>Create New Project</h3>
            <form @submit.prevent="createProject">
                <label for="project-name">Name</label>
                <input type="text" id="project-name" v-model="newProjectName" required />
                <label for="project-description">Description</label>
                <textarea id="project-description" v-model="newProjectDescription" required></textarea>
                <button type="submit">Create</button>
            </form>
        </Popup>
    </div>
</template>

<style scoped>
.projects-container {
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

.projects-nav {
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

.projects-list {
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

.projects-list::-webkit-scrollbar {
    width: 8px;
}

.projects-list::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.projects-list::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 5px;
}

.projects-list::-webkit-scrollbar-thumb:hover {
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
