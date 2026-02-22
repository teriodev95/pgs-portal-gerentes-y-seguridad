import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { registerSW } from 'virtual:pwa-register'

import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-default.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(ToastPlugin)
app.use(router)

app.mount('#app')

export const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Emitir evento personalizado para notificar al componente PwaPrompt
    window.dispatchEvent(new CustomEvent('pwa:update-available'))
    console.log('Nueva versión disponible - se mostró prompt al usuario')
  },
  onOfflineReady() {
    console.log('App lista para funcionar offline')
  },
})
