<script setup lang="ts">
import { ELEMENT_ID } from '@/shared/constants'
import { Modal } from 'flowbite'

defineOptions({
  name: 'ConfirmModal',
})

interface Emit {
  (e: 'action:cancel'): void
  (e: 'action:ok'): void
}

interface Props {
  title: string
  message: string
}

const $emit = defineEmits<Emit>()
defineProps<Props>()

const id = ELEMENT_ID.CONFIRM

// Método para manejar el cierre del modal
const handleClose = () => {
  const modalElement = document.getElementById(id)
  if (modalElement) {
    const modal = new Modal(modalElement)
    modal.hide()
    // Remover el backdrop manualmente si existe
    const backdrop = document.querySelector('[modal-backdrop]')
    if (backdrop) {
      backdrop.remove()
    }
  }
  $emit('action:ok')
}
</script>

<template>
  <div :id="id" tabindex="-1"
    class="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full overflow-y-auto overflow-x-hidden p-4 md:inset-0">
    <div class="relative max-h-full w-full max-w-md">
      <div class="relative rounded-lg bg-white shadow dark:bg-gray-700">
        <div class="p-6 text-center">
          <svg class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            {{ title }}
          </h3>
          <h4 class="mb-5 text-sm font-normal text-gray-400 dark:text-gray-300">
            {{ message }}
          </h4>
          <div class="space-x-2">
            <button type="button" class="btn btn-primary w-full" @click="handleClose">
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>