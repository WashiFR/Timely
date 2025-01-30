<script setup>
import LogoutButton from "@/components/LogoutButton.vue";
</script>

<template>
    <header>
        <h2>Timely</h2>

        <LogoutButton />
    </header>
</template>

<style lang="scss" scoped>
header {
    background-color: black;
    padding: 10px;
    text-align: center;

    h2 {
        color: white;
    }
}
</style>
