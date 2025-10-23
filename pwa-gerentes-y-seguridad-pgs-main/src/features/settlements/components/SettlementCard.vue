<script setup lang="ts">
import DataField from '@/shared/components/DataField.vue'
import type { Liquidacion } from '../types'

interface Props {
  settlement: Liquidacion
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-2 p-2">
    <div class="space-y-3 rounded-lg border bg-white p-4">
      <DataField label="Cliente" :value="settlement.cliente" />
      
      <DataField label="Identificador" :value="settlement.identificador" />
      
      <DataField label="Sem. Entregada" :value="settlement.semEntrega" />
    </div>
  </div>
</template>