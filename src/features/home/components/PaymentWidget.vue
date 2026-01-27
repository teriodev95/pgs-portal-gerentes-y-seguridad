<script setup lang="ts">
import { computed } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { ICobranza } from '@/interfaces'

// Components
import CheckIcon from '@/shared/components/icons/CheckCircleIcon.vue'
import TextCT from '@/shared/components/ui/TextCT.vue';

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
  <div class="flex gap-2 border-b-2 py-1">
    <!-- Icon -->
    <div class="flex-none">
      <CheckIcon class="h-6 w-6" :class="iconStyle" />
    </div>

    <!-- Content -->
    <div class="flex-1 text-sm">
      <TextCT>{{ cobranza.nombre }}</TextCT>
      <TextCT variant="tertiary">{{ cobranza.prestamoId }}</TextCT>
    </div>

    <!-- Icon -->
    <div class="flex-none text-sm">
      <TextCT variant="primary">{{ toCurrency(cobranza.tarifa) }}</TextCT>
      <TextCT variant="secondary">{{ toCurrency(cobranza.cobradoEnLaSemana) }}</TextCT>
    </div>
  </div>
</template>
