<script setup lang="ts">
interface Props {
  totalCount: number
  filteredCount: number
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-2 p-2">
    <div class="space-y-2 rounded-lg border bg-white p-4">
      <div class="flex justify-between gap-2">
        <div class="flex items-center gap-2">
          <p class="font-300 text-gray-400">Total de no pagos:</p>
          <p class="font-md-700 text-blue-800">{{ totalCount }}</p>
        </div>

        <div class="flex items-center gap-2">
          <p class="font-300 text-gray-400">Filtrados:</p>
          <p class="font-md-700 text-blue-800">{{ filteredCount }}</p>
        </div>
      </div>
    </div>
  </div>
</template>