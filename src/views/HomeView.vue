<script setup>

</script>

<template>
    <div>
        <h2>Home</h2>

        <RouterLink to="/time-tracking">Time Tracking</RouterLink>
        <RouterLink to="/goals">Goals</RouterLink>

        <RouterView />
    </div>
</template>

<style scoped>
a {
    display: block;
    margin-bottom: 10px;
}
</style>
