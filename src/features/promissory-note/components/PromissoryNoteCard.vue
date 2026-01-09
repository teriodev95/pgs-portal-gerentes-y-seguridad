<script setup lang="ts">
import CardContainer from '@/shared/components/CardContainer.vue'
import type { Pagare } from '../types'

defineProps<{
  pagare: Pagare
}>()

const emit = defineEmits<{
  click: [pagare: Pagare]
}>()
</script>

<template>
  <CardContainer class="cursor-pointer hover:shadow-md transition-shadow" @click="emit('click', pagare)">
    <div class="flex justify-between items-start mb-2">
      <div>
        <p class="font-semibold text-lg">{{ pagare.cliente_nombre }}</p>
        <p class="text-sm text-gray-600">ID: {{ pagare.id_sistemas }}</p>
      </div>
      <span v-if="pagare.semaforo" class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
        {{ pagare.semaforo }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-2 text-sm">
      <div>
        <p class="text-gray-500">Préstamo</p>
        <p class="font-medium">{{ pagare.prestamo_id }}</p>
      </div>
      <div>
        <p class="text-gray-500">Agencia</p>
        <p class="font-medium">{{ pagare.agencia }}</p>
      </div>
      <div>
        <p class="text-gray-500">Monto</p>
        <p class="font-medium">${{ pagare.monto_prestamo.toLocaleString() }}</p>
      </div>
      <div>
        <p class="text-gray-500">Total a pagar</p>
        <p class="font-medium">${{ pagare.total_a_pagar.toLocaleString() }}</p>
      </div>
    </div>
  </CardContainer>
</template>
