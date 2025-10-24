<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css';
import { ref, onMounted } from 'vue'
import BtnComponent from '../BtnComponent.vue'
import CardTitle from './CardTitle.vue'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet';


interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const bottomSheetRef = ref<InstanceType<typeof VueBottomSheet>>()

// Methods
function open(): void {
  bottomSheetRef.value?.open()
}

function close(): void {
  bottomSheetRef.value?.close()
}
onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevenir que el navegador muestre su propio prompt
    e.preventDefault()
    // Guardar el evento para usarlo después
    deferredPrompt.value = e as BeforeInstallPromptEvent
    // Mostrar nuestro modal
    open()
  })
})

const handleInstall = async () => {
  if (!deferredPrompt.value) return

  // Mostrar el prompt de instalación
  await deferredPrompt.value.prompt()

  // Esperar la respuesta del usuario
  await deferredPrompt.value.userChoice

  // Limpiar el prompt guardado
  deferredPrompt.value = null

  // Ocultar el modal independientemente de la respuesta
  close()
}

</script>

<template>
  <!-- Modal de instalación -->
  <vue-bottom-sheet ref="bottomSheetRef" :max-width="1000" :max-height="1500">
    <div class="p-4">
      <!-- Contenido -->
      <div class="flex items-center gap-3 mb-2">
        <img src="/icons/pgs-icon2.jpg" alt="24Link" class="w-12 h-12 rounded-lg">
        <CardTitle title="Instala PGS" subtitle="Instala la app para un acceso más rápido y directo" />
      </div>

      <!-- Botones de acción -->
      <div class="mt-4 flex gap-2">
        <BtnComponent @click="handleInstall" variant="secondary" full-width>
          Instalar ahora
        </BtnComponent>
        <BtnComponent @click="close" variant="secondary" outline full-width>
          Más tarde
        </BtnComponent>
      </div>
    </div>
  </vue-bottom-sheet>

</template>