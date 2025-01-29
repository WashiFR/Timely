import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { pluginAxios } from '@/plugins/api.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(pluginAxios, {
    baseURL: import.meta.env.VITE_API_URL,
    apiKey: import.meta.env.VITE_API_KEY,
})

app.mount('#app')
