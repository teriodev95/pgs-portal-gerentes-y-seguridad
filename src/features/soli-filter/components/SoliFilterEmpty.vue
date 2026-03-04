<script setup lang="ts">
import { ScanSearch } from 'lucide-vue-next'
</script>

<template>
  <div class="flex min-h-[32rem] items-center justify-center p-8">
    <div class="text-center">
      <div class="mb-6 flex justify-center">
        <div class="rounded-full bg-blue-50 p-6">
          <ScanSearch class="h-16 w-16 text-blue-300" />
        </div>
      </div>
      <h2 class="mb-2 text-xl font-semibold text-gray-800">
        Sin solicitudes de filtro
      </h2>
      <p class="mx-auto max-w-xs text-sm text-gray-500">
        No hay solicitudes de filtro registradas para esta semana. Presiona el botón <span class="font-semibold text-blue-600">+</span> para crear una.
      </p>
    </div>
  </div>
</template>
