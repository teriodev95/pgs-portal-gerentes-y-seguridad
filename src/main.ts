import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { registerSW } from 'virtual:pwa-register'

import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-default.css'

import App from './App.vue'
import router from './router'

/**
 * Tras un despliegue, una pestaña que ya estaba abierta pide sus chunks con el
 * hash viejo, que ya no existen en el servidor. Cloudflare responde con el
 * `index.html` de respaldo del SPA y el import dinámico truena con "Expected a
 * JavaScript module... MIME type text/html". Vite avisa con este evento;
 * recargar trae el `index.html` nuevo, que apunta a los hashes nuevos.
 *
 * El candado de diez segundos evita el bucle: si el servidor está roto de
 * verdad, la segunda falla se queda como hoy en vez de recargar sin fin.
 */
window.addEventListener('vite:preloadError', (event) => {
  const key = 'pgs:preload-reload'
  const last = Number(sessionStorage.getItem(key) ?? 0)
  if (Date.now() - last < 10_000) return

  event.preventDefault()
  sessionStorage.setItem(key, String(Date.now()))
  window.location.reload()
})

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
