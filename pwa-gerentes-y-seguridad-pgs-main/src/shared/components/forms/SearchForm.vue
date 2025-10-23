<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * Type definition for emits
 */
interface SearchFormEmits {
  (event: 'update:model-value', value?: string): void
}

const emit = defineEmits<SearchFormEmits>()

/**
 * Current search term
 */
const searchTerm = ref<string>()

/**
 * Handle search submission
 * Emits the current search term to parent component
 */
function submitSearch() {
  emit('update:model-value', searchTerm.value)
}

/**
 * Automatically submit search when user stops typing
 * (Optional enhancement - uncomment to enable)
 */
watch(searchTerm, (newValue) => {
  // Emit the value after a short delay to avoid too many updates
  const debounceTimeout = setTimeout(() => {
    emit('update:model-value', newValue)
  }, 300)

  // Clear timeout on component unmount
  return () => clearTimeout(debounceTimeout)
})
</script>

<template>
  <form @submit.prevent="submitSearch" class="w-full">
    <label for="search-input" class="sr-only">
      Buscar
    </label>
    <div class="relative cursor-pointer" role="search" @click="submitSearch">
      <!-- Search icon -->
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg aria-hidden="true" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor"
          viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Search input -->
      <input type="search" id="search-input" v-model="searchTerm"
        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder="Búsqueda por nombre o id" aria-label="Buscar por nombre o identificador de préstamo" />
    </div>
  </form>
</template>