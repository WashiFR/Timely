<script setup>
import { ref, computed, onMounted } from 'vue'
import { userStore } from '@/stores/userData.js'
import { inject } from 'vue'
import { toast } from 'vue3-toastify'

const api = inject('api')
const store = userStore()

const objectiveName = ref('')
const objectiveContent = ref('')
const objectiveColor = ref('#4caf50')
const editingObjectiveId = ref(null)
const isEditing = ref(false)

const showCompleted = ref(true)
const searchQuery = ref('')

const filteredObjectives = computed(() => {
  let filtered = store.dailyObjectives || []

  if (!showCompleted.value) {
    filtered = filtered.filter(obj => !obj.is_done)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(obj =>
      obj.name.toLowerCase().includes(query) ||
      (obj.content && obj.content.toLowerCase().includes(query))
    )
  }

  return filtered
})

async function fetchObjectives() {
  await store.fetchDailyObjectives(api)
}

onMounted(() => {
  fetchObjectives()
})

function resetForm() {
  objectiveName.value = ''
  objectiveContent.value = ''
  objectiveColor.value = '#4caf50'
  editingObjectiveId.value = null
  isEditing.value = false
}

async function createObjective() {
  if (!objectiveName.value.trim()) {
    toast.error("Objective name is required", { autoClose: 3000 })
    return
  }

  try {
    await store.createObjective(api, objectiveName.value, objectiveContent.value)
    resetForm()
  } catch (error) {
    console.error("Error creating objective", error)
    toast.error("Failed to create objective", { autoClose: 3000 })
  }
}

function editObjective(objective) {
  objectiveName.value = objective.name
  objectiveContent.value = objective.content || ''
  objectiveColor.value = objective.color || '#4caf50'
  editingObjectiveId.value = objective.id
  isEditing.value = true
}

async function updateObjective() {
  if (!objectiveName.value.trim()) {
    toast.error("Objective name is required", { autoClose: 3000 })
    return
  }

  try {
    await store.updateObjective(api, editingObjectiveId.value, {
      name: objectiveName.value,
      content: objectiveContent.value,
      color: objectiveColor.value
    })
    resetForm()
  } catch (error) {
    console.error("Error updating objective", error)
    toast.error("Failed to update objective", { autoClose: 3000 })
  }
}

async function deleteObjective(id) {
  if (confirm("Are you sure you want to delete this objective?")) {
    try {
      await store.deleteObjective(api, id)
    } catch (error) {
      console.error("Error deleting objective", error)
      toast.error("Failed to delete objective", { autoClose: 3000 })
    }
  }
}

async function toggleObjectiveStatus(objective) {
  try {
    if (objective.is_done) {
      await store.markObjectiveAsUndone(api, objective.id)
    } else {
      await store.markObjectiveAsDone(api, objective.id)
    }
  } catch (error) {
    console.error("Error toggling objective status", error)
    toast.error("Failed to update objective status", { autoClose: 3000 })
  }
}

function resetFilters() {
  searchQuery.value = ''
  showCompleted.value = true
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="daily-objectives">
    <div class="objectives-container">
        <div class="objective-form">
        <h3>{{ isEditing ? 'Edit Objective' : 'Add New Objective' }}</h3>

        <input
          type="text"
          v-model="objectiveName"
          placeholder="Objective name (required)"
        >

        <textarea
          v-model="objectiveContent"
          placeholder="Objective details (optional)"
        ></textarea>

        <div v-if="isEditing" class="color-picker">
          <label for="objective-color">Color:</label>
          <input
            type="color"
            id="objective-color"
            v-model="objectiveColor"
          >
        </div>

        <div class="form-buttons">
          <button
            @click="isEditing ? updateObjective() : createObjective()"
            class="save-button"
          >
            {{ isEditing ? 'Update' : 'Add' }} Objective
          </button>

          <button
            v-if="isEditing"
            @click="resetForm"
            class="cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>

      <div class="objectives-list">
        <div class="list-header">
          <h3>Daily Objectives</h3>
          <div class="search-filter">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search objectives..."
              class="search-input"
            >
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="clear-search"
              title="Clear search"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="filter-options">
          <div class="filter-toggle">
            <label>
              <input type="checkbox" v-model="showCompleted">
              Show completed
            </label>
          </div>

          <button
            v-if="!showCompleted || searchQuery"
            @click="resetFilters"
            class="reset-filters"
          >
            Reset filters
          </button>
        </div>

        <div v-if="!filteredObjectives || filteredObjectives.length === 0" class="no-objectives">
          <p v-if="searchQuery">No objectives match your search.</p>
          <p v-else>No objectives found. Create one to get started!</p>
        </div>

        <div v-else class="objectives-grid">
          <div
            v-for="objective in filteredObjectives"
            :key="objective.id"
            class="objective-card"
            :style="{ borderLeftColor: objective.color || '#4caf50' }"
          >
            <div class="objective-header">
              <h4 :class="{ completed: objective.is_done }">{{ objective.name }}</h4>
              <div class="objective-actions">
                <button
                  @click="toggleObjectiveStatus(objective)"
                  :class="objective.is_done ? 'undo-button' : 'done-button'"
                  :title="objective.is_done ? 'Mark as not done' : 'Mark as done'"
                >
                  {{ objective.is_done ? '↩' : '✓' }}
                </button>
                <button
                  @click="editObjective(objective)"
                  class="edit-button"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  @click="deleteObjective(objective.id)"
                  class="delete-button"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div v-if="objective.content" class="objective-content">
              <p>{{ objective.content }}</p>
            </div>

            <div class="objective-footer">
              <span class="created-at">Created: {{ formatDate(objective.created_at || new Date()) }}</span>
              <span v-if="objective.is_done && objective.updated_at" class="completed-at">
                Completed: {{ formatDate(objective.updated_at) }}
              </span>
            </div>

            <div class="progress-bar">
              <div
                class="progress"
                :style="{
                  width: objective.is_done ? '100%' : '0%',
                  backgroundColor: objective.color || '#4caf50'
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.daily-objectives {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  width: 100%;
}

.objectives-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 1000px;
  gap: 20px;
}

.objective-form {
  width: 35%;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.objectives-list {
  width: 62%;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.search-filter {
  position: relative;
  width: 200px;
}

.search-input {
  width: 100%;
  padding: 8px 30px 8px 10px;
  border-radius: 20px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.filter-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filter-toggle {
  display: flex;
  align-items: center;
}

.reset-filters {
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  color: #555;
}

.reset-filters:hover {
  background-color: #e0e0e0;
}

.objectives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 5px;
}

.objective-card {
  background-color: #f9f9f9;
  border-radius: 5px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid;
  display: flex;
  flex-direction: column;
}

.objective-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.objective-header h4 {
  margin: 0;
  word-break: break-word;
}

.completed {
  text-decoration: line-through;
  color: #888;
}

.objective-actions {
  display: flex;
  gap: 5px;
}

.objective-content {
  flex-grow: 1;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.objective-content p {
  margin: 0;
  word-break: break-word;
}

.objective-footer {
  font-size: 0.75rem;
  color: #777;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

input[type="color"] {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.form-buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 12px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, transform 0.2s;
}

button:hover {
  transform: translateY(-2px);
}

.save-button {
  background-color: #4caf50;
  color: white;
  flex-grow: 1;
}

.save-button:hover {
  background-color: #388e3c;
}

.cancel-button {
  background-color: #f44336;
  color: white;
}

.cancel-button:hover {
  background-color: #d32f2f;
}

.done-button {
  background-color: #4caf50;
  color: white;
  font-weight: bold;
}

.undo-button {
  background-color: #ff9800;
  color: white;
}

.edit-button {
  background-color: #2196f3;
  color: white;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.no-objectives {
  text-align: center;
  color: #888;
  padding: 20px;
}

@media (max-width: 768px) {
  .objectives-container {
    flex-direction: column;
  }

  .objective-form,
  .objectives-list {
    width: 100%;
  }

  .objectives-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-filter {
    width: 100%;
  }
}
</style>
