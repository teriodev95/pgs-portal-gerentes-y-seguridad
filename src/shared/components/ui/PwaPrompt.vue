<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePwaUpdate } from '@/shared/composables/usePwaUpdate'

// Components
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

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
const isOpen = ref(false)
const promptType = ref<PromptType>(null)

const { isUpdating, applyUpdate } = usePwaUpdate()

// Computed
const drawerTitle = computed(() => {
  if (promptType.value === 'install') {
    return 'Instala PGS'
  }
  if (promptType.value === 'update') {
    return 'Actualización disponible'
  }
  return ''
})

const drawerDescription = computed(() => {
  if (promptType.value === 'install') {
    return 'Instala la app para un acceso más rápido y directo'
  }
  if (promptType.value === 'update') {
    return 'Hay una nueva versión de PGS disponible con mejoras y correcciones'
  }
  return ''
})

// Methods
function open(type: PromptType): void {
  promptType.value = type
  isOpen.value = true
}

function close(): void {
  isOpen.value = false
}

function handleOpenChange(open: boolean): void {
  if (!open) {
    setTimeout(() => {
      promptType.value = null
    }, 100)
  }
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
  <Drawer :open="isOpen" @update:open="handleOpenChange">
    <DrawerContent>
      <div class="mx-auto w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>{{ drawerTitle }}</DrawerTitle>
          <DrawerDescription>
            {{ drawerDescription }}
          </DrawerDescription>
        </DrawerHeader>

        <div class="p-4">
          <!-- Contenido para instalación -->
          <template v-if="promptType === 'install'">
            <div class="flex flex-col items-center gap-4 mb-6">
              <img src="/icons/pgs-icon2.jpg" alt="PGS" class="w-20 h-20 rounded-lg shadow-md">
              <p class="text-center text-gray-600">
                Accede más rápido a PGS instalando la aplicación en tu dispositivo
              </p>
            </div>

            <div class="flex gap-2">
              <Button @click="handleInstall" class="flex-1">
                Instalar ahora
              </Button>
              <Button @click="close" variant="outline" class="flex-1">
                Más tarde
              </Button>
            </div>
          </template>

          <!-- Contenido para actualización -->
          <template v-else-if="promptType === 'update'">
            <div class="flex flex-col items-center gap-4 mb-6">
              <div class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p class="text-center text-gray-600">
                Actualiza ahora para obtener las últimas mejoras y correcciones de errores
              </p>
            </div>

            <div class="flex gap-2">
              <Button
                @click="handleUpdate"
                :disabled="isUpdating"
                class="flex-1"
              >
                <svg v-if="isUpdating" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                {{ isUpdating ? 'Actualizando...' : 'Actualizar ahora' }}
              </Button>
              <Button
                @click="close"
                variant="outline"
                :disabled="isUpdating"
                class="flex-1"
              >
                Más tarde
              </Button>
            </div>
          </template>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
