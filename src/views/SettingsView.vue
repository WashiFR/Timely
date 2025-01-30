<script setup></script>

<template>
    <div>
        <h2>Settings</h2>

        <RouterLink to="/settings/profile">Profile</RouterLink>
        <RouterLink to="/settings/projects">Projects</RouterLink>
        <RouterLink to="/settings/activities">Activities</RouterLink>

        <RouterView />
    </div>
</template>

<style scoped>
a {
    display: block;
    margin-bottom: 10px;
}
</style>
