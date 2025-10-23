<script setup lang="ts">
interface Props {
  managementList: string[]
  selectedManagement: string
  agencyList: string[]
  selectedAgency: string
  hasVisit: boolean
  isFilterDisabled: boolean
  isUserManager: boolean
}

interface Emit {
  (e: 'update:selectedManagement', value: string): void
  (e: 'update:selectedAgency', value: string): void
  (e: 'update:hasVisit', value: boolean): void
  (e: 'managementChange'): void
}

defineProps<Props>()
defineEmits<Emit>()
</script>

<template>
  <div class="ounded-lg mx-2 flex items-center justify-between space-y-2 border bg-white p-4">
    <form class="flex gap-2">
      <!-- Management Filter -->
      <div>
        <label for="management_select" class="sr-only">Select management</label>
        <select
          :model-value="selectedManagement"
          @change="$emit('update:selectedManagement', ($event.target as HTMLSelectElement).value); $emit('managementChange')"
          id="management_select"
          class="peer block w-full appearance-none border-0 border-b-2 border-gray-200 bg-transparent px-0 py-2.5 text-sm text-gray-500 focus:border-gray-200 focus:outline-none focus:ring-0 dark:border-gray-700 dark:text-gray-400"
          :disabled="isUserManager || isFilterDisabled"
        >
          <option v-for="management in managementList" :key="management" :value="management">
            {{ management }}
          </option>
        </select>
      </div>

      <!-- Agency Filter -->
      <div>
        <label for="agency_select" class="sr-only">Select agency</label>
        <select
          id="agency_select"
          class="bloc peer w-full appearance-none border-0 border-b-2 border-gray-200 bg-transparent px-0 py-2.5 text-sm text-gray-500 focus:border-gray-200 focus:outline-none focus:ring-0 dark:border-gray-700 dark:text-gray-400"
          :model-value="selectedAgency"
          @change="$emit('update:selectedAgency', ($event.target as HTMLSelectElement).value)"
          :disabled="isFilterDisabled"
        >
          <option selected value="">-- TODAS --</option>
          <option v-for="agency in agencyList" :key="agency" :value="agency">
            {{ agency }}
          </option>
        </select>
      </div>
    </form>

    <!-- Visit Toggle -->
    <label class="mb-5 inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        :checked="hasVisit"
        @change="$emit('update:hasVisit', ($event.target as HTMLInputElement).checked)"
        class="peer sr-only"
        :disabled="isFilterDisabled"
      />
      <div
        class="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full">
      </div>
      <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Visita</span>
    </label>
  </div>
</template>