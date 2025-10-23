<script setup lang="ts">
import { computed } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { ICobranza } from '@/interfaces'

// Components
import CheckIcon from '@/shared/components/icons/CheckCircleIcon.vue'

// Interface - Props - Emits
const $props = defineProps<{
  cobranza: ICobranza
}>()

// State definitions
const iconStyle = computed(() => {
  switch ($props.cobranza.status) {
    case 'Completado':
      return 'text-green-500 dark:text-green-400'
    case 'Desfase':
      return 'text-red-500 dark:text-red-400'
    case 'Pendiente':
      return 'text-gray-500 dark:text-gray-400'
    default:
      return 'text-amber-500 dark:text-amber-400'
  }
})
</script>

<template>
  <div class="flex gap-2 border-b-2 pb-2">
    <!-- Icon -->
    <div class="flex-none">
      <CheckIcon class="h-6 w-6" :class="iconStyle" />
    </div>

    <!-- Content -->
    <div class="flex-1 text-sm">
      <p class="uppercase">{{ cobranza.nombre }}</p>
      <p class="font-extralight">{{ cobranza.prestamoId }}</p>
    </div>

    <!-- Icon -->
    <div class="flex-none text-sm">
      <p class="font-extralight">{{ toCurrency(cobranza.tarifa) }}</p>
      <p class="font-bold">{{ toCurrency(cobranza.cobradoEnLaSemana) }}</p>
    </div>
  </div>
</template>
