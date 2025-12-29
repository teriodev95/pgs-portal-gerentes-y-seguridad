<script setup lang="ts">
import { computed } from 'vue'
import { useErrorDialogStore } from '@/shared/stores/errorDialog'
import { usePwaUpdate } from '@/shared/composables/usePwaUpdate'
import { useShareData } from '@/shared/composables/useShareData'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import CopyError from '@/shared/components/CopyError.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const errorStore = useErrorDialogStore()
const { clearCacheAndReload, isUpdating } = usePwaUpdate()
const { shareData, isSharing } = useShareData()

// Computed para facilitar el acceso
const isOpen = computed(() => errorStore.isOpen)
const errorInfo = computed(() => errorStore.errorInfo)

// Computed para el ícono según el tipo de error
const iconClass = computed(() => {
  const type = errorInfo.value?.type || 'error'
  switch (type) {
    case 'warning':
      return 'text-yellow-500'
    case 'info':
      return 'text-blue-500'
    case 'error':
    default:
      return 'text-red-500'
  }
})

// Computed para mostrar detalles
const showDetails = computed(() => {
  return errorInfo.value?.details && errorInfo.value.details.trim() !== ''
})

function handleClose(): void {
  errorStore.closeDialog()
}

async function handleAccept(): Promise<void> {
  errorStore.clearError()
  await clearCacheAndReload()
}

async function handleShareError(): Promise<void> {
  const details = errorInfo.value?.details
  const title = errorInfo.value?.title || 'Error'

  if (!details) return

  const errorText = `Detalles:\n${details}`

  await shareData({
    title: `Error - ${title}`,
    text: errorText
  })
}
</script>

<template>
  <Dialog
    :open="isOpen"
    @update:open="(value) => value ? null : handleClose()"
  >
    <DialogContent
      class="rounded-lg max-w-md w-full mx-auto"
      :disable-outside-pointer-events="false"
    >
      <DialogHeader>
        <div class="flex items-center gap-3">
          <!-- Icono según el tipo -->
          <div :class="iconClass" class="flex-shrink-0">
            <!-- Icono de Error -->
            <svg v-if="errorInfo?.type === 'error' || !errorInfo?.type"
                 class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <!-- Icono de Advertencia -->
            <svg v-else-if="errorInfo?.type === 'warning'"
                 class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <!-- Icono de Información -->
            <svg v-else-if="errorInfo?.type === 'info'"
                 class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <DialogTitle class="text-left flex-1">
            {{ errorInfo?.title || 'Error' }}
          </DialogTitle>
        </div>
      </DialogHeader>

      <DialogDescription class="w-full text-left space-y-3">
        <!-- Mensaje principal -->
        <p class="text-gray-700 leading-relaxed">
          {{ errorInfo?.message || 'Ha ocurrido un error inesperado.' }}
        </p>

        <!-- Detalles técnicos (colapsible) -->
        <div v-if="showDetails" class="mt-4 w-full">
          <div class="mt-2 space-y-2">
            <div class="flex justify-end">
              <CopyError :text="errorInfo?.details || ''" />
            </div>
            <div class="p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32 w-full min-w-0 text-gray-800 border">
              <pre class="whitespace-pre-wrap break-all m-0">{{ errorInfo?.details }}</pre>
            </div>
          </div>
        </div>
      </DialogDescription>

      <DialogFooter>
        <div class="flex flex-col gap-2 w-full">
          <BtnComponent
            variant="primary"
            outline
            @click="handleShareError"
            class="w-full"
            :disabled="isSharing || !showDetails"
          >
            {{ isSharing ? 'Compartiendo...' : 'Compartir error' }}
          </BtnComponent>
          <BtnComponent
            variant="primary"
            @click="handleAccept"
            class="w-full"
            :disabled="isUpdating"
          >
            {{ isUpdating ? 'Actualizando...' : 'Borrar caché y volver a intentar' }}
          </BtnComponent>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
details summary::-webkit-details-marker {
  display: none;
}

details summary::before {
  content: "▶ ";
  margin-right: 0.5rem;
  transition: transform 0.2s ease;
}

details[open] summary::before {
  transform: rotate(90deg);
}
</style>