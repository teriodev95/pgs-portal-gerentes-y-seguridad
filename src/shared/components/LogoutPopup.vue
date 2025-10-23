<script setup lang="ts">
import { ELEMENT_ID } from '@/shared/constants'

defineOptions({
  name: 'PopupLogout'
})

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */

interface Emit {
  (e: 'action:cancel'): void
  (e: 'action:ok'): void
}

const $emit = defineEmits<Emit>()

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */

const id = ELEMENT_ID.POPUP_LOGOUT
</script>

<template>
  <div
    :id="id"
    tabindex="-1"
    class="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full overflow-y-auto overflow-x-hidden p-4 md:inset-0"
  >
    <div class="relative max-h-full w-full max-w-md">
      <div class="relative rounded-lg bg-white shadow dark:bg-gray-700">
        <button
          type="button"
          class="absolute right-2.5 top-3 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
          :data-modal-hide="id"
        >
          <svg
            class="h-3 w-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span class="sr-only">Close modal</span>
        </button>
        <div class="p-6 text-center">
          <svg
            class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            ¿Desea cerrar la sesión?
          </h3>
          <div class="space-x-2">
            <button
              @click="() => $emit('action:ok')"
              :data-modal-hide="id"
              type="button"
              class="btn-red"
            >
              Cerrar Sesión
            </button>
            <button
              @click="() => $emit('action:cancel')"
              :data-modal-hide="id"
              type="button"
              class="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
