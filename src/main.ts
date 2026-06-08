import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { getDatabase } from './api/database'
import { useThemeStore } from './stores/theme'

getDatabase()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Apply saved theme before first render
useThemeStore(pinia)
app.use(router)
app.use(VueQueryPlugin)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  maxToasts: 3,
})
app.mount('#app')
