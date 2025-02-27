<script setup></script>

<template>
    <div class="settings-container">
        <h2>Settings</h2>
        <div class="settings-nav">
            <router-link to="/settings/profile">Profile</router-link>
            <router-link to="/settings/projects">Projects</router-link>
            <router-link to="/settings/activities">Activities</router-link>
        </div>

        <RouterView />
    </div>
</template>

<style scoped>
a {
    display: block;
    margin-bottom: 10px;
}
.settings-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100%;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
}
.settings-nav{
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    a {
        padding: 10px;
        margin: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        color: #333;
        text-decoration: none;
        transition: background-color 0.3s;
        &:hover {
            background-color: #f5f5f5;
        }
    }
}
</style>
