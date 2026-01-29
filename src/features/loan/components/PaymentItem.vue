<script setup lang="ts">
import { toCurrency } from '@/shared/utils'
import { computed } from 'vue'
import type { CobranzaStatus, ICobranza } from '@/interfaces'
import CardContainer from '@/shared/components/CardContainer.vue'
import DataField from '@/shared/components/DataField.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

interface Props {
  payment: ICobranza
  isProcessing?: boolean
}

interface Emits {
  (event: 'action:select-payment', payment: ICobranza): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const statusStyles = computed(() => {
  const status = props.payment.status
  const stylesByStatus: Record<CobranzaStatus, string> = {
    'Completado': 'text-green-600 border-green-600 bg-green-100',
    'Parcial': 'text-amber-600 border-amber-600 bg-amber-100',
    'Desfase': 'text-red-600 border-red-600 bg-red-100',
    'Pendiente': 'text-gray-600 border-gray-600 bg-gray-200'
  }

  return stylesByStatus[status] || 'text-gray-600 border-gray-600 bg-gray-200'
})

const badgeStyles = computed(() => {
  return `px-1 py-0.5 rounded-md font-bold border inline-flex items-center gap-2 ${statusStyles.value}`
})

function ceilToInteger(value: number): number {
  return Math.ceil(value)
}

function handlePaymentSelection() {
  emit('action:select-payment', props.payment)
}
</script>

<template>
  <CardContainer>
    <DataField label="Id del prestamo" :value="payment.prestamoId" />
    <DataField label="Tarifa" :value="toCurrency(ceilToInteger(payment.tarifa))" />
    <DataField
      label="Cobrado en la semana"
      notice="El total de los pagos registrados en la semana"
      :value="`● ${toCurrency(ceilToInteger(payment.cobradoEnLaSemana))}`"
      :value-class="badgeStyles"
    />

    <BtnComponent @click="handlePaymentSelection" full-width :disabled="isProcessing">
      Registrar pago
    </BtnComponent>
  </CardContainer>
</template>