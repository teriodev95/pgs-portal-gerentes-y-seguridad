<script setup lang="ts">
import { computed } from 'vue'
import SearchIcon from '@/shared/components/icons/SearchIcon.vue'
import { useCallCenterSearch } from '../composables/useCallCenterSearch'
import { useItemRenderer } from '@/shared/composables'
import type { ICallCenterSearchResult } from '../types'

// Interface - Props - Emits
interface Emits {
  (e: 'selectReport', report: ICallCenterSearchResult): void
}

const emit = defineEmits<Emits>()

// Composables
const { highlightText } = useItemRenderer()

const {
  searchQuery,
  searchResults,
  isSearching,
  searchError,
  showResults,
  handleSearchInput,
  clearSearch,
  hideResults,
  revealResults
} = useCallCenterSearch()

// Computeds
const hasResults = computed(() => searchResults.value.length > 0)
const isMinimumLength = computed(() => searchQuery.value.length >= 3)

/**
 * Maneja la selección de un reporte
 */
const selectReport = (report: ICallCenterSearchResult) => {
  emit('selectReport', report)
  clearSearch()
}

/**
 * Maneja el blur con delay para permitir clicks en resultados
 */
const handleBlur = () => {
  setTimeout(() => hideResults(), 200)
}

/**
 * Maneja el input del usuario
 */
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  handleSearchInput(target.value)
}
</script>

<template>
  <div class="w-full col-span-2">
    <!-- Label -->
    <label for="search-report" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      Buscar por nombre
    </label>

    <div class="relative">
      <!-- Search Icon -->
      <div class="absolute top-3.5 flex items-center ps-3.5 pointer-events-none">
        <SearchIcon class="h-5 w-5 text-gray-400 dark:text-gray-400" />
      </div>

      <!-- Input Field -->
      <input
        id="search-report"
        type="text"
        :value="searchQuery"
        @input="onInput"
        @focus="revealResults"
        @blur="handleBlur"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Buscar por nombre del cliente o aval (mín. 3 caracteres)"
        autocomplete="off"
      />

      <!-- Loading Spinner -->
      <div v-if="isSearching" class="absolute top-3.5 right-3.5">
        <svg
          class="animate-spin h-5 w-5 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      </div>

      <!-- Dropdown Results -->
      <div
        v-if="showResults && isMinimumLength"
        class="bg-white border border-gray-300 rounded-lg shadow-lg mt-1 absolute z-10 left-0 right-0 max-h-80 overflow-y-auto dark:bg-gray-700 dark:border-gray-600"
      >
        <!-- Error State -->
        <div v-if="searchError" class="p-4 text-center text-red-600 text-sm dark:text-red-400">
          {{ searchError }}
        </div>

        <!-- Empty State -->
        <div v-else-if="!isSearching && !hasResults" class="p-4 text-center text-gray-500 text-sm dark:text-gray-400">
          No se encontraron reportes con ese nombre
        </div>

        <!-- Results -->
        <div v-else-if="hasResults" class="divide-y divide-gray-100 dark:divide-gray-600">
          <div
            v-for="report in searchResults"
            :key="report.prestamoId"
            @click="selectReport(report)"
            class="p-3 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
          >
            <!-- Loan ID & Management Badges -->
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                {{ report.prestamoId }}
              </span>
              <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">
                {{ report.gerencia }}
              </span>
            </div>

            <!-- Client & Aval Names -->
            <div class="text-sm space-y-1">
              <p class="text-gray-900 dark:text-gray-100">
                <span class="font-medium">Cliente:</span> <span v-html="highlightText(report.nombresCliente, searchQuery)"></span>
              </p>
              <p class="text-gray-600 dark:text-gray-300">
                <span class="font-medium">Aval:</span> <span v-html="highlightText(report.nombresAval, searchQuery)"></span>
              </p>
            </div>

            <!-- Additional Info -->
            <div class="flex gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{{ report.agencia }}</span>
              <span>•</span>
              <span>Semana {{ report.semana }}</span>
              <span>•</span>
              <span>{{ report.anio }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
