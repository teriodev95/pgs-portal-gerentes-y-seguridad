<script setup lang="ts">
import { toCurrency } from '@/shared/utils'
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
      <DataField label="Entregado" :value="toCurrency(settlement.entregado)" />
      
      <DataField label="Cargo" :value="toCurrency(settlement.cargo)" />
      
      <DataField label="Monto total" :value="toCurrency(settlement.montoTotal)" />
      
      <DataField 
        label="Cobrado" 
        :value="toCurrency(settlement.cobrado)"
        value-class="font-semibold text-green-600 w-[50%] text-right"
      />

      <hr class="border-t border-gray-200" />

      <DataField label="Saldo" :value="toCurrency(settlement.saldo)" />
    </div>
  </div>
</template>