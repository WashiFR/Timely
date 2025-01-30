import { createRouter, createWebHistory } from 'vue-router'
import {useApiKeysStore} from "@/stores/apiKeys.js";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: () => import('@/views/HomeView.vue'),
            beforeEnter: (to, from, next) => {
                const apiKeysStore = useApiKeysStore()
                if (!apiKeysStore.hasApiKey) {
                    next('/login')
                } else {
                    next()
                }
            }
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/LoginView.vue')
        },
        {
            path: '/register',
            component: () => import('@/views/RegisterView.vue')
        },
        {
            path: '/settings',
            component: () => import('@/views/SettingsView.vue')
        },
        {
            path: '/stats',
            component: () => import('@/views/StatsView.vue')
        }
    ],
})

export default router
