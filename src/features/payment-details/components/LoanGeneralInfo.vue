<script setup lang="ts">
import { computed } from 'vue';
import { toCurrency } from '@/shared/utils';
import type { ILoan } from '@/features/loan/types'
import CardContainer from '@/shared/components/CardContainer.vue';
import DataField from '@/shared/components/DataField.vue';

// Interface & Props
interface Props {
  loanData: ILoan
}

const props = defineProps<Props>()

const nombreCompleto = computed(() =>
  [props.loanData.nombres, props.loanData.apellidoPaterno, props.loanData.apellidoMaterno]
    .filter(Boolean)
    .join(' ')
    .trim()
)

// Avance del crédito: cobrado real contra el total a pagar
const progreso = computed(() => {
  const total = props.loanData.totalAPagar || 0
  const cobrado = props.loanData.cobrado || 0
  if (total <= 0) return null
  const pct = Math.max(0, Math.min((cobrado / total) * 100, 100))
  return { pct: Math.round(pct), cobrado, total }
})
</script>

<template>
  <CardContainer title="Datos Generales">
    <DataField label="Nombre" :value="nombreCompleto" />
    <DataField label="Dirección" :value="loanData.direccion" />
    <DataField label="Teléfono" :value="loanData.telefonoCliente" />
    <DataField label="Nivel" :value="loanData.tipoDeCliente" />
    <DataField label="Otorgado" :value="toCurrency(loanData.montoOtorgado)" />
    <DataField label="Tarifa" :value="toCurrency(loanData.tarifa)" />

    <!-- Avance del crédito: discreto — informa sin competir con los datos -->
    <div v-if="progreso" class="border-t border-gray-100 pt-3">
      <div class="mb-1.5 flex items-baseline justify-between">
        <span class="text-xs font-light text-gray-400">
          Pagado {{ toCurrency(progreso.cobrado) }} de {{ toCurrency(progreso.total) }}
        </span>
        <span class="text-xs font-medium text-gray-500">{{ progreso.pct }}%</span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          class="h-full rounded-full bg-blue-600/80 transition-all"
          :style="{ width: `${progreso.pct}%` }"
        ></div>
      </div>
    </div>
  </CardContainer>
</template>
