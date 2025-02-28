import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

export const userStore = defineStore('timeTracker', () => {
    const projects = ref([])
    const activities = ref([])
    const timeEntries = ref([])
    const currentActivity = ref(null)

    let projectsLoaded = false
    let activitiesLoaded = false

    // Fonction pour charger les projets et les activités en une seule fois
    async function fetchAllData(api) {
        try {
            const [projectsResponse, activitiesResponse] = await Promise.all([
                api.get('/api/projects'),
                api.get('/api/activities'),
            ])

            projects.value = projectsResponse.data.filter(project => project.is_enabled === 1)
            activities.value = activitiesResponse.data.filter(activity => activity.is_enabled === 1)

            projectsLoaded = true
            activitiesLoaded = true
        } catch (error) {
            console.error('Error while fetching projects and activities', error)
        }
    }

    // Fonction pour charger les projets depuis l'API (seulement si non chargé)
    async function fetchEnabledProjects(api) {
        if (projectsLoaded) return
        try {
            let response = await api.get('/api/projects')
            projects.value = response.data.filter(project => project.is_enabled === 1)
            projectsLoaded = true
        } catch (error) {
            console.error('Error while fetching projects', error)
        }
    }

    async function fetchAllProjects(api) {
        try {
            let response = await api.get('/api/projects')
            projects.value = response.data
        } catch (error) {
            console.error('Error while fetching projects', error)
        }
    }

    // Fonction pour charger les activités depuis l'API (seulement si non chargé)
    async function fetchActivities(api) {
        if (activitiesLoaded) return
        try {
            let response = await api.get('/api/activities')
            activities.value = response.data.filter(activity => activity.is_enabled === 1)
            activitiesLoaded = true
        } catch (error) {
            console.error('Error while fetching activities', error)
        }
    }

    // Fonction pour charger les entrées de temps depuis l'API
    async function fetchTimeEntries(api) {
        try {
            let response = await api.get('/api/time-entries')
            timeEntries.value = response.data.map(entry => ({
                ...entry,
                projectName: projects.value.find(p => p.id === entry.project_id)?.name || 'Unknown Project',
                activityName: activities.value.find(a => a.id === entry.activity_id)?.name || 'Unknown Activity',
            }))
        } catch (error) {
            console.error('Error while fetching time entries', error)
        }
    }

    // Fonction pour arrêter l'activité
    async function stopActivity(api, currentActivity, notes) {
        if (currentActivity.value) {
            const endTime = new Date().toISOString()

            try {
                await api.patch(`/api/time-entries/${currentActivity.value.id}/stop`, {
                    end: endTime,
                    comment: notes.value,
                })

                // Mise à jour du store localement
                updateTimeEntry(currentActivity.value.id, { endTime, comment: notes.value })

                // Réinitialiser l'activité en cours
                currentActivity.value = null
                toast.success('Activity stopped', { theme: 'colored' })
            } catch (error) {
                console.error('Error while stopping activity', error)
                toast.error('Failed to stop activity', { theme: 'colored' })
            }
        }
    }

    // Mettre à jour une entrée de temps après modification via API
    function updateTimeEntry(entryId, updatedEntry) {
        const entryIndex = timeEntries.value.findIndex(entry => entry.id === entryId)
        if (entryIndex !== -1) {
            timeEntries.value[entryIndex] = { ...timeEntries.value[entryIndex], ...updatedEntry }
        }
    }

    // Ajouter une nouvelle entrée de temps
    function addTimeEntry(newEntry) {
        timeEntries.value.push(newEntry)
    }

    // Supprimer une entrée de temps
    function deleteTimeEntry(entryId) {
        timeEntries.value = timeEntries.value.filter(entry => entry.id !== entryId)
    }

    // Mettre à jour un projet dans le store
    function updateProject(updatedProject) {
        const projectIndex = projects.value.findIndex(project => project.id === updatedProject.id)
        if (projectIndex !== -1) {
            projects.value[projectIndex] = updatedProject
        }
    }

    // Mettre à jour une activité dans le store
    function updateActivity(updatedActivity) {
        const activityIndex = activities.value.findIndex(activity => activity.id === updatedActivity.id)
        if (activityIndex !== -1) {
            activities.value[activityIndex] = updatedActivity
        }
    }

    // Toggle la visibilité du projet
    async function toggleProject(api, project, isActive) {
        const endpoint = isActive ? 'enable' : 'disable'
        try {
            await api.patch(`/api/projects/${project.id}/${endpoint}`)
            toast.success(`Project ${isActive ? 'disabled' : 'enabled'}`, { theme: 'colored' })
            updateProject({ ...project, is_enabled: isActive ? 0 : 1 })
        } catch (error) {
            console.error(`Error while ${isActive ? 'disabling' : 'enabling'} project`, error)
            toast.error(`Failed to ${isActive ? 'disable' : 'enable'} project`, { theme: 'colored' })
        }
    }

    // Mettre à jour un projet via un formulaire
    async function updateProjectDetails(api, project, name, description) {
        // Mise à jour locale avant appel API
        updateProject({ ...project, name, description })

        try {
            await api.put(`/api/projects/${project.id}`, {
                name: name,
                description: description,
            })
            toast.success('Project updated', { theme: 'colored' })
        } catch (error) {
            console.error('Error while updating project', error)
            toast.error('Failed to update project', { theme: 'colored' })
            // Annuler la mise à jour locale en cas d'erreur
            updateProject(project)
        }
    }

    async function createProject(api, name, description) {
        try {
            const response = await api.post('/api/projects', { name, description })
            const newProject = response.data
            projects.value.push(newProject) // Add the new project to the local store
            toast.success('Project created', { theme: 'colored' })
        } catch (error) {
            console.error('Error while creating project', error)
            toast.error('Failed to create project', { theme: 'colored' })
        }
    }


    return {
        projects,
        activities,
        timeEntries,
        currentActivity,
        fetchAllData,
        fetchEnabledProjects,
        fetchActivities,
        fetchTimeEntries,
        stopActivity,
        updateTimeEntry,
        addTimeEntry,
        deleteTimeEntry,
        updateProject,
        updateActivity,
        toggleProject,
        updateProjectDetails,
        fetchAllProjects,
        createProject
    }
})
