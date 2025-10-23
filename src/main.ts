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

registerSW({
  immediate: true
  // onNeedRefresh() {},
  // onOfflineReady() {},
})
