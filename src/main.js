import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'

import App from './App.vue'
import router from './router'
import { pluginAxios } from '@/plugins/api.js'
import {useApiKeysStore} from "@/stores/apiKeys.js";

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPersist)
app.use(pinia)
app.use(router)

const apiKeysStore = useApiKeysStore()

app.use(pluginAxios, {
    baseURL: import.meta.env.VITE_API_URL,
    apiKey: apiKeysStore.apiKey,
})

app.mount('#app')
