<script setup lang="ts">
import { onMounted, ref } from 'vue'

const showPrompt = ref(false)
const deferredPrompt = ref<any>(null)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que el navegador muestre su propio prompt
    e.preventDefault()
    // Guardar el evento para usarlo después
    deferredPrompt.value = e
    // Mostrar nuestro modal
    showPrompt.value = true
  })
})

const handleInstall = async () => {
  if (!deferredPrompt.value) return

  // Mostrar el prompt de instalación
  deferredPrompt.value.prompt()

  // Esperar la respuesta del usuario
  const { outcome } = await deferredPrompt.value.userChoice

  // Limpiar el prompt guardado
  deferredPrompt.value = null

  // Ocultar el modal independientemente de la respuesta
  showPrompt.value = false

  console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`)
}

const closePrompt = () => {
  showPrompt.value = false
}
</script>

<template>
  <!-- Modal de instalación -->
  <Transition name="slide-up">
    <div
      v-if="showPrompt"
      class="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-[#001954] shadow-2xl max-w-6xl mx-auto"
    >
      <div class="flex items-start justify-between gap-4">
        <!-- Contenido -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <img src="" alt="24Link" class="w-12 h-12 rounded-lg">
            <div>
              <h3 class="text-primary font-bold text-lg">Descarga 24Link</h3>
              <p class="text-secondary text-sm">
                Instala la app para un acceso más rápido y directo
              </p>
            </div>
          </div>
        </div>

        <!-- Botón de cerrar -->
        <button
          @click="closePrompt"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <LucideX :size="20" />
        </button>
      </div>

      <!-- Botones de acción -->
      <div class="mt-4 flex gap-2">
        <button
          @click="handleInstall"
          class="flex-1 bg-[#001954] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#002066] transition-colors"
        >
          Instalar ahora
        </button>
        <button
          @click="closePrompt"
          class="px-6 py-3 text-secondary hover:text-primary transition-colors"
        >
          Más tarde
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
