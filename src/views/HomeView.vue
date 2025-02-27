<script setup>

</script>

<template>
    <div class="home-view">
        <h2>Home</h2>

        <RouterLink to="/time-tracking">Time Tracking</RouterLink>
        <RouterLink to="/goals">Goals</RouterLink>

        <RouterView />
    </div>
</template>

<style scoped>
.home-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100%;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
}
a {
    display: block;
    margin-bottom: 10px;
}
</style>
