<script setup lang="ts">
import { onMounted } from 'vue'
import { initDropdowns } from 'flowbite'
import FilterIcon from '@/shared/components/icons/FilterIcon.vue'

/**
 * Filter options model
 */
export interface FilterOptions {
  completed: boolean
  desfase: boolean
  partial: boolean
  pending: boolean
}

/**
 * Component props
 */
interface FilterButtonProps {
  modelValue: FilterOptions
}

/**
 * Component events
 */
interface FilterButtonEmits {
  (event: 'update:model-value', value: FilterOptions): void
}

// Define props and emits
const props = defineProps<FilterButtonProps>()
const emit = defineEmits<FilterButtonEmits>()

// Constants
const DROPDOWN_ID = 'filter-dropdown'

/**
 * Toggle a specific filter option
 * @param filterKey - The key of the filter to toggle
 */
function toggleFilterOption(filterKey: keyof FilterOptions) {
  emit('update:model-value', {
    ...props.modelValue,
    [filterKey]: !props.modelValue[filterKey]
  })
}

// Initialize dropdown on component mount
onMounted(() => {
  initDropdowns()
})
</script>

<template>
  <div class="relative h-full">
    <!-- Filter dropdown menu -->
    <div :id="DROPDOWN_ID"
      class="right-5 z-20 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700">
      <ul class="text-md py-2 text-gray-700 dark:text-gray-200" :aria-labelledby="`${DROPDOWN_ID}-button`">
        <!-- Pending filter option -->
        <li @click="() => toggleFilterOption('pending')" class="filter-option">
          <div class="flex items-center">
            <input :checked="modelValue.pending" type="checkbox" id="pending-checkbox"
              class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-gray-600 focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-gray-600" />
            <label for="pending-checkbox" class="text-md ml-2 font-medium text-gray-900 dark:text-gray-300">
              Pendientes
            </label>
          </div>
        </li>

        <!-- Out of phase filter option -->
        <li @click="() => toggleFilterOption('desfase')" class="filter-option">
          <div class="flex items-center">
            <input :checked="modelValue.desfase" type="checkbox" id="desfase-checkbox"
              class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-red-600 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-red-600" />
            <label for="desfase-checkbox" class="text-md ml-2 font-medium text-gray-900 dark:text-gray-300">
              Desfase
            </label>
          </div>
        </li>

        <!-- Partial filter option -->
        <li @click="() => toggleFilterOption('partial')" class="filter-option">
          <div class="flex items-center">
            <input :checked="modelValue.partial" type="checkbox" id="partial-checkbox"
              class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-amber-600 focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-amber-600" />
            <label for="partial-checkbox" class="text-md ml-2 font-medium text-gray-900 dark:text-gray-300">
              Parciales
            </label>
          </div>
        </li>

        <!-- Completed filter option -->
        <li @click="() => toggleFilterOption('completed')" class="filter-option">
          <div class="flex items-center">
            <input :checked="modelValue.completed" type="checkbox" id="completed-checkbox"
              class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-green-600 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-green-600" />
            <label for="completed-checkbox" class="text-md ml-2 font-medium text-gray-900 dark:text-gray-300">
              Completados
            </label>
          </div>
        </li>
      </ul>
    </div>

    <!-- Filter button -->
    <button type="button" :id="`${DROPDOWN_ID}-button`" :data-dropdown-toggle="DROPDOWN_ID"
      class="h-full text-md inline-flex items-center rounded-lg bg-blue-700 p-2 text-center font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      aria-label="Mostrar opciones de filtro">
      <FilterIcon />
      <span class="sr-only">Filtrar resultados</span>
    </button>
  </div>
</template>

<style scoped>
.filter-option {
  padding: 0.5rem;
  cursor: pointer;
}

.filter-option:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>