import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

export const userStore = defineStore('timeTracker', () => {
    const projects = ref([])
    const activities = ref([])
    const timeEntries = ref([])
    const currentActivity = ref(null)
    const dailyObjectives = ref([]) // Ajout d'un état pour les objectifs journaliers

    let projectsLoaded = false
    let activitiesLoaded = false
    let objectivesLoaded = false // Nouvel état pour le chargement des objectifs

    async function fetchAllData(api) {
        try {
            const [projectsResponse, activitiesResponse, objectivesResponse] = await Promise.all([
                api.get('/api/projects'),
                api.get('/api/activities'),
                api.get('/api/daily-objectives'),
            ])

            projects.value = projectsResponse.data.filter((project) => project.is_enabled === 1)
            activities.value = activitiesResponse.data.filter(
                (activity) => activity.is_enabled === 1,
            )
            dailyObjectives.value = objectivesResponse.data

            projectsLoaded = true
            activitiesLoaded = true
            objectivesLoaded = true
        } catch (error) {
            console.error('Error while fetching data', error)
        }
    }

    // Fonction pour charger les projets depuis l'API (seulement si non chargé)
    async function fetchEnabledProjects(api) {
        if (projectsLoaded) return
        try {
            let response = await api.get('/api/projects')
            projects.value = response.data.filter((project) => project.is_enabled === 1)
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
            activities.value = response.data.filter((activity) => activity.is_enabled === 1)
            activitiesLoaded = true
        } catch (error) {
            console.error('Error while fetching activities', error)
        }
    }

    // Fonction pour charger les entrées de temps depuis l'API
    async function fetchTimeEntries(api) {
        try {
            let response = await api.get('/api/time-entries')
            timeEntries.value = response.data.map((entry) => ({
                ...entry,
                projectName:
                    projects.value.find((p) => p.id === entry.project_id)?.name ||
                    'Unknown Project',
                activityName:
                    activities.value.find((a) => a.id === entry.activity_id)?.name ||
                    'Unknown Activity',
            }))

            // Mettre à jour la currentActivity avec l'entrée ayant end === null
            currentActivity.value = timeEntries.value.find((entry) => entry.end === null) || null
        } catch (error) {
            console.error('Error while fetching time entries', error)
        }
    }

    // Fonction pour charger les objectifs journaliers
    async function fetchDailyObjectives(api) {
        if (objectivesLoaded) return
        try {
            let response = await api.get('/api/daily-objectives')
            dailyObjectives.value = response.data
            objectivesLoaded = true
        } catch (error) {
            console.error('Error while fetching daily objectives', error)
        }
    }

    // Fonction pour récupérer un objectif par son ID
    async function fetchObjectiveById(api, id) {
        try {
            let response = await api.get(`/api/dailyobjectives/${id}`)
            return response.data
        } catch (error) {
            console.error('Error while fetching objective details', error)
            toast.error("Failed to load objective details", { theme: "colored" })
            return null
        }
    }

    // Fonction pour créer un nouvel objectif
    async function createObjective(api, name, content = '') {
        try {
            const response = await api.post('/api/daily-objectives', {
                name,
                content
            })

            // Ajouter le nouvel objectif au store
            dailyObjectives.value.push(response.data)

            toast.success("Objective created", { theme: "colored" })
            return response.data
        } catch (error) {
            console.error('Error while creating objective', error)
            toast.error("Failed to create objective", { theme: "colored" })
            return null
        }
    }

    // Fonction pour mettre à jour un objectif
    async function updateObjective(api, id, data) {
        try {
            await api.put(`/api/daily-objectives/${id}`, data)

            // Mettre à jour l'objectif dans le store
            const index = dailyObjectives.value.findIndex(obj => obj.id === id)
            if (index !== -1) {
                dailyObjectives.value[index] = {
                    ...dailyObjectives.value[index],
                    ...data
                }
            }

            toast.success("Objective updated", { theme: "colored" })
            return true
        } catch (error) {
            console.error('Error while updating objective', error)
            toast.error("Failed to update objective", { theme: "colored" })
            return false
        }
    }

    // Fonction pour supprimer un objectif
    async function deleteObjective(api, id) {
        try {
            await api.delete(`/api/daily-objectives/${id}`)

            // Supprimer l'objectif du store
            dailyObjectives.value = dailyObjectives.value.filter(obj => obj.id !== id)

            toast.success("Objective deleted", { theme: "colored" })
            return true
        } catch (error) {
            console.error('Error while deleting objective', error)
            toast.error("Failed to delete objective", { theme: "colored" })
            return false
        }
    }

    // Fonction pour marquer un objectif comme terminé
    async function markObjectiveAsDone(api, id) {
        try {
            await api.patch(`/api/daily-objectives/${id}/done`)

            // Mettre à jour l'état de l'objectif dans le store
            const index = dailyObjectives.value.findIndex(obj => obj.id === id)
            if (index !== -1) {
                dailyObjectives.value[index].is_done = true
            }

            toast.success("Objective marked as done", { theme: "colored" })
            return true
        } catch (error) {
            console.error('Error while marking objective as done', error)
            toast.error("Failed to update objective status", { theme: "colored" })
            return false
        }
    }

    // Fonction pour marquer un objectif comme non terminé
    async function markObjectiveAsUndone(api, id) {
        try {
            await api.patch(`/api/daily-objectives/${id}/undone`)

            // Mettre à jour l'état de l'objectif dans le store
            const index = dailyObjectives.value.findIndex(obj => obj.id === id)
            if (index !== -1) {
                dailyObjectives.value[index].is_done = false
            }

            toast.success("Objective marked as undone", { theme: "colored" })
            return true
        } catch (error) {
            console.error('Error while marking objective as undone', error)
            toast.error("Failed to update objective status", { theme: "colored" })
            return false
        }
    }

    // Fonction pour arrêter l'activité
    async function stopActivity(api) {
        try {
            if (!currentActivity.value || !currentActivity.value.id) {
                toast.error("No active activity to stop.", { theme: "colored" });
                console.warn("Attempted to stop an activity, but none was found.");
                return;
            }

            console.log("Stopping activity:", currentActivity.value);

            await api.patch(`/api/time-entries/${currentActivity.value.id}/stop`);

            currentActivity.value = null;

            await fetchTimeEntries(api);

            toast.success("Activity stopped", { theme: "colored" });
        } catch (error) {
            console.error("Error while stopping activity", error);
            toast.error("Failed to stop activity", { theme: "colored" });
        }
    }


    // Mettre à jour une entrée de temps après modification via API
    function updateTimeEntry(entryId, updatedEntry) {
        const entryIndex = timeEntries.value.findIndex((entry) => entry.id === entryId)
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
        timeEntries.value = timeEntries.value.filter((entry) => entry.id !== entryId)
    }

    // Mettre à jour un projet dans le store
    function updateProject(updatedProject) {
        const projectIndex = projects.value.findIndex((project) => project.id === updatedProject.id)
        if (projectIndex !== -1) {
            projects.value[projectIndex] = updatedProject
        }
    }

    // Mettre à jour une activité dans le store
    function updateActivity(updatedActivity) {
        const activityIndex = activities.value.findIndex(
            (activity) => activity.id === updatedActivity.id,
        )
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
            toast.error(`Failed to ${isActive ? 'disable' : 'enable'} project`, {
                theme: 'colored',
            })
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

    async function startActivity(api, projectId, activityId, start, end, comment) {
        try {
            const payload = {
                project_id: projectId,
                activity_id: activityId,
                start: start,
                end: end,
                comment: comment || '',
            }

            const response = await api.post('/api/time-entries', payload)

            addTimeEntry(response.data)
            currentActivity.value = response.data
            toast.success('Activity started', { theme: 'colored' })
        } catch (error) {
            console.error('Error while starting activity', error)
            toast.error('Failed to start activity', { theme: 'colored' })
        }
    }

    return {
        projects,
        activities,
        timeEntries,
        currentActivity,
        dailyObjectives, // Exposition des objectifs journaliers
        fetchAllData,
        fetchEnabledProjects,
        fetchActivities,
        fetchTimeEntries,
        stopActivity,
        startActivity,
        updateTimeEntry,
        addTimeEntry,
        deleteTimeEntry,
        updateProject,
        updateActivity,
        toggleProject,
        updateProjectDetails,
        fetchAllProjects,
        createProject,
        fetchDailyObjectives,
        fetchObjectiveById,
        createObjective,
        updateObjective,
        deleteObjective,
        markObjectiveAsDone,
        markObjectiveAsUndone
    }
})
