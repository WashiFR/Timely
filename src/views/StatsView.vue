<script setup>
import StatsComponent from '@/components/StatsComponent.vue'
</script>

<template>
    <div class="stats-view">
        <StatsComponent />
    </div>
</template>

<style scoped>
.stats-view {
    width: 100%;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    overflow-y: scroll;
}
</style>
