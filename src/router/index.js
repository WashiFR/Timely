import { createRouter, createWebHistory } from 'vue-router'
import { useApiKeysStore } from '@/stores/apiKeys.js'

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
                    next({ name: 'Login' })
                } else {
                    next()
                }
            },
            children: [
                {
                    path: 'time-tracking',
                    component: () => import('@/views/TimeTrackingView.vue'),
                },
                {
                    path: 'goals',
                    component: () => import('@/views/GoalsView.vue'),
                }
            ]
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/LoginView.vue'),
        },
        {
            path: '/register',
            component: () => import('@/views/RegisterView.vue'),
        },
        {
            path: '/settings',
            name: 'Settings',
            component: () => import('@/views/SettingsView.vue'),
            beforeEnter: (to, from, next) => {
                const apiKeysStore = useApiKeysStore()
                if (!apiKeysStore.hasApiKey) {
                    next({ name: 'Login' })
                } else {
                    next()
                }
            },
            children: [
                {
                    path: 'profile',
                    component: () => import('@/views/ProfileView.vue'),
                },
                {
                    path: 'projects',
                    component: () => import('@/views/ProjectsView.vue'),
                },
                {
                    path: 'activities',
                    component: () => import('@/views/ActivitiesView.vue'),
                },
            ],
        },
        {
            path: '/stats',
            name: 'Stats',
            component: () => import('@/views/StatsView.vue'),
            beforeEnter: (to, from, next) => {
                const apiKeysStore = useApiKeysStore()
                if (!apiKeysStore.hasApiKey) {
                    next({ name: 'Login' })
                } else {
                    next()
                }
            },
        },
    ],
})

export default router
