<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { userStore } from '@/stores/userData.js'
import { inject } from 'vue'
import Chart from 'chart.js/auto'

const api = inject('api')
const store = userStore()

const today = new Date()
const startDate = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().slice(0, 10))
const endDate = ref(today.toISOString().slice(0, 10))

const selectedProject = ref('')

let projectChartInstance = null
let activityChartInstance = null

onMounted(async () => {
  await store.fetchAllProjects(api)
  await store.fetchActivities(api)
  await fetchTimeEntries()
  initCharts()
})

watch([startDate, endDate, selectedProject], () => {
  if (validateDateRange()) {
    fetchTimeEntries()
  }
})

function validateDateRange() {
  if (!startDate.value || !endDate.value) {
    return false
  }

  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  return start <= end
}

async function fetchTimeEntries() {
  if (!validateDateRange()) return

  try {
    const params = {
      start_date: startDate.value,
      end_date: endDate.value,
      project_id: selectedProject.value || undefined
    }

    await store.fetchTimeEntries(api)

    updateCharts()
  } catch (error) {
    console.error('Error fetching time entries:', error)
  }
}

function initCharts() {
  const projectChartCtx = document.getElementById('project-chart')
  if (projectChartCtx) {
    projectChartInstance = new Chart(projectChartCtx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Time Distribution by Project'
          }
        }
      }
    })
  }

  const activityChartCtx = document.getElementById('activity-chart')
  if (activityChartCtx) {
    activityChartInstance = new Chart(activityChartCtx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Time Distribution by Activity'
          }
        }
      }
    })
  }

  updateCharts()
}

function updateCharts() {
  const filteredEntries = getFilteredEntries()

  if (projectChartInstance && !selectedProject.value) {
    const projectData = calculateProjectDistribution(filteredEntries)

    projectChartInstance.data.labels = projectData.labels
    projectChartInstance.data.datasets[0].data = projectData.data
    projectChartInstance.update()
  }

  if (activityChartInstance) {
    const activityData = calculateActivityDistribution(filteredEntries)

    activityChartInstance.data.labels = activityData.labels
    activityChartInstance.data.datasets[0].data = activityData.data
    activityChartInstance.data.datasets[0].backgroundColor = activityData.colors
    activityChartInstance.update()
  }
}

function getFilteredEntries() {
  const startDateTime = new Date(startDate.value)
  const endDateTime = new Date(endDate.value)
  endDateTime.setHours(23, 59, 59, 999)

  return store.timeEntries.filter(entry => {
    const entryDate = new Date(entry.start)
    const isInDateRange = entryDate >= startDateTime && entryDate <= endDateTime

    if (selectedProject.value) {
      return isInDateRange && entry.project_id === parseInt(selectedProject.value)
    }

    return isInDateRange
  })
}

function calculateProjectDistribution(entries) {
  const projectTotals = {}

  entries.forEach(entry => {
    const projectId = entry.project_id
    const projectName = entry.projectName || 'Unknown'
    const duration = calculateDuration(entry)

    if (!projectTotals[projectId]) {
      projectTotals[projectId] = {
        name: projectName,
        duration: 0
      }
    }

    projectTotals[projectId].duration += duration
  })

  const sortedProjects = Object.values(projectTotals).sort((a, b) => b.duration - a.duration)

  return {
    labels: sortedProjects.map(project => project.name),
    data: sortedProjects.map(project => project.duration)
  }
}

function calculateActivityDistribution(entries) {
  const activityTotals = {}

  entries.forEach(entry => {
    const activityId = entry.activity_id
    const activity = store.activities.find(a => a.id === activityId) || { name: 'Unknown', color: '#999999' }
    const duration = calculateDuration(entry)

    if (!activityTotals[activityId]) {
      activityTotals[activityId] = {
        name: activity.name,
        duration: 0,
        color: activity.color || getRandomColor(activityId)
      }
    }

    activityTotals[activityId].duration += duration
  })

  const sortedActivities = Object.values(activityTotals).sort((a, b) => b.duration - a.duration)

  return {
    labels: sortedActivities.map(activity => activity.name),
    data: sortedActivities.map(activity => activity.duration),
    colors: sortedActivities.map(activity => activity.color)
  }
}

function calculateDuration(entry) {
  if (!entry.start || !entry.end) return 0

  const startTime = new Date(entry.start).getTime()
  const endTime = new Date(entry.end).getTime()

  return Math.max(0, (endTime - startTime) / (1000 * 60))
}

function formatTotalTime(minutes) {
  if (minutes === 0) return '0h 0m'

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)

  return `${hours}h ${remainingMinutes}m`
}

function getRandomColor(seed) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5'
  ]

  return colors[seed % colors.length] || '#' + Math.floor(Math.random() * 16777215).toString(16)
}

const totalWorkedTime = computed(() => {
  const filteredEntries = getFilteredEntries()
  const totalMinutes = filteredEntries.reduce((total, entry) => total + calculateDuration(entry), 0)
  return formatTotalTime(totalMinutes)
})

const involvedProjects = computed(() => {
  const filteredEntries = getFilteredEntries()
  const uniqueProjects = new Set(filteredEntries.map(entry => entry.project_id))
  return uniqueProjects.size
})

const averageDailyTime = computed(() => {
  const filteredEntries = getFilteredEntries()
  const totalMinutes = filteredEntries.reduce((total, entry) => total + calculateDuration(entry), 0)

  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const daysDiff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1)

  return formatTotalTime(totalMinutes / daysDiff)
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="stats-container">
    <h1 class="stats-title">Reporting & Statistics</h1>

    <!-- Filtres -->
    <div class="filters-section">
      <div class="date-filters">
        <div class="filter-group">
          <label for="start-date">From:</label>
          <input
            type="date"
            id="start-date"
            v-model="startDate"
            required
          >
        </div>

        <div class="filter-group">
          <label for="end-date">To:</label>
          <input
            type="date"
            id="end-date"
            v-model="endDate"
            required
          >
        </div>
      </div>

      <div class="project-filter">
        <label for="project-select">Project:</label>
        <select id="project-select" v-model="selectedProject">
          <option value="">All Projects</option>
          <option
            v-for="project in store.projects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="stats-summary">
      <div class="summary-card">
        <h3>Total Time</h3>
        <p class="stat-value">{{ totalWorkedTime }}</p>
      </div>

      <div class="summary-card" v-if="!selectedProject">
        <h3>Projects Involved</h3>
        <p class="stat-value">{{ involvedProjects }}</p>
      </div>

      <div class="summary-card">
        <h3>Daily Average</h3>
        <p class="stat-value">{{ averageDailyTime }}</p>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-container" v-if="!selectedProject">
        <h2>Time by Project</h2>
        <canvas id="project-chart"></canvas>
      </div>
      <div class="chart-container">
        <h2>Time by Activity</h2>
        <canvas id="activity-chart"></canvas>
      </div>
    </div>

    <div class="entries-section">
      <h2>Time Entries</h2>

      <div class="entries-list">
        <div v-if="getFilteredEntries().length === 0" class="no-entries">
          <p>No time entries found for the selected period.</p>
        </div>

        <div v-else class="entry-card" v-for="entry in getFilteredEntries().sort((a, b) => new Date(b.start) - new Date(a.start))" :key="entry.id">
          <div class="entry-header">
            <div class="entry-project">{{ entry.projectName }}</div>
            <div class="entry-activity">{{ entry.activityName }}</div>
          </div>

          <div class="entry-times">
            <div class="entry-duration">
              {{ formatTotalTime(calculateDuration(entry)) }}
            </div>
            <div class="entry-period">
              {{ formatDate(entry.start) }} - {{ entry.end ? formatDate(entry.end) : 'Ongoing' }}
            </div>
          </div>

          <div class="entry-comment" v-if="entry.comment">
            <p>{{ entry.comment }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.stats-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.filters-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.date-filters {
  display: flex;
  gap: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label,
.project-filter label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

input[type="date"],
select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

select {
  min-width: 200px;
}

.stats-summary {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-card h3 {
  margin: 0 0 10px 0;
  color: #555;
  font-size: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #2196f3;
  margin: 0;
}

.charts-section {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 40px;
}

.chart-container {
  flex: 1;
  min-width: 300px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
  text-align: center;
}

.entries-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.entries-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
}

.entry-card {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
  background-color: #f9f9f9;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.entry-project {
  font-weight: bold;
  color: #333;
}

.entry-activity {
  color: #666;
}

.entry-times {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.entry-duration {
  font-weight: bold;
  color: #2196f3;
}

.entry-period {
  color: #888;
}

.entry-comment {
  border-top: 1px solid #eee;
  padding-top: 10px;
  font-size: 14px;
  color: #666;
}

.entry-comment p {
  margin: 0;
}

.no-entries {
  text-align: center;
  padding: 30px 0;
  color: #888;
}

@media (max-width: 768px) {
  .filters-section,
  .stats-summary,
  .charts-section {
    flex-direction: column;
  }

  .date-filters {
    margin-bottom: 15px;
    width: 100%;
  }

  .project-filter {
    width: 100%;
  }

  .chart-container {
    width: 100%;
  }
}
</style>
