<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css';
import { ref, onMounted, onUnmounted } from 'vue'
import BtnComponent from '../BtnComponent.vue'
import CardTitle from './CardTitle.vue'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet';
import { usePwaUpdate } from '@/shared/composables/usePwaUpdate'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

type PromptType = 'install' | 'update' | null

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const bottomSheetRef = ref<InstanceType<typeof VueBottomSheet>>()
const promptType = ref<PromptType>(null)

const { isUpdating, applyUpdate } = usePwaUpdate()

// Methods
function open(type: PromptType): void {
  promptType.value = type
  bottomSheetRef.value?.open()
}

function close(): void {
  bottomSheetRef.value?.close()
  promptType.value = null
}

// Handler para instalación
const handleInstall = async () => {
  if (!deferredPrompt.value) return

  try {
    // Mostrar el prompt de instalación
    await deferredPrompt.value.prompt()

    // Esperar la respuesta del usuario
    await deferredPrompt.value.userChoice

    // Limpiar el prompt guardado
    deferredPrompt.value = null
  } finally {
    // Ocultar el modal independientemente de la respuesta
    close()
  }
}

// Handler para actualización
const handleUpdate = async () => {
  try {
    await applyUpdate()
    // La página se recargará automáticamente
  } catch (error) {
    console.error('Error al aplicar actualización:', error)
    close()
  }
}

// Listener para evento de instalación
const handleBeforeInstallPrompt = (e: Event) => {
  // Prevenir que el navegador muestre su propio prompt
  e.preventDefault()
  // Guardar el evento para usarlo después
  deferredPrompt.value = e as BeforeInstallPromptEvent
  // Mostrar nuestro modal de instalación
  open('install')
}

// Listener para evento de actualización
const handleUpdateAvailable = () => {
  open('update')
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('pwa:update-available', handleUpdateAvailable)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('pwa:update-available', handleUpdateAvailable)
})

</script>

<template>
  <!-- Modal de instalación/actualización -->
  <vue-bottom-sheet ref="bottomSheetRef" :max-width="1000" :max-height="1500">
    <div class="p-4">
      <!-- Contenido para instalación -->
      <template v-if="promptType === 'install'">
        <div class="flex items-center gap-3 mb-2">
          <img src="/icons/pgs-icon2.jpg" alt="PGS" class="w-12 h-12 rounded-lg">
          <CardTitle
            title="Instala PGS"
            subtitle="Instala la app para un acceso más rápido y directo"
          />
        </div>

        <div class="mt-4 flex gap-2">
          <BtnComponent @click="handleInstall" variant="secondary" full-width>
            Instalar ahora
          </BtnComponent>
          <BtnComponent @click="close" variant="secondary" outline full-width>
            Más tarde
          </BtnComponent>
        </div>
      </template>

      <!-- Contenido para actualización -->
      <template v-else-if="promptType === 'update'">
        <div class="flex items-center gap-3 mb-2">
          <img src="/icons/pgs-icon2.jpg" alt="PGS" class="w-12 h-12 rounded-lg">
          <CardTitle
            title="Actualización disponible"
            subtitle="Hay una nueva versión de PGS disponible con mejoras y correcciones"
          />
        </div>

        <div class="mt-4 flex gap-2">
          <BtnComponent
            @click="handleUpdate"
            variant="secondary"
            full-width
            :disabled="isUpdating"
          >
            {{ isUpdating ? 'Actualizando...' : 'Actualizar ahora' }}
          </BtnComponent>
          <BtnComponent
            @click="close"
            variant="secondary"
            outline
            full-width
            :disabled="isUpdating"
          >
            Más tarde
          </BtnComponent>
        </div>
      </template>
    </div>
  </vue-bottom-sheet>
</template>
