<script setup>
import TimeTrackerComponent from '@/components/TimeTrackerComponent.vue'
</script>

<template>
    <div class="time-tracker-view">
        <h2>Time Tracker</h2>
        <TimeTrackerComponent />
    </div>
</template>

<style scoped>
.time-tracker-view {
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
    overflow-y: scroll;
}

h2 {
    margin-bottom: 20px;
    color: #333;
}
</style>
