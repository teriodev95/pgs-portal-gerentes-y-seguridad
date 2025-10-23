<script setup lang="ts">
import { toCurrency } from '@/shared/utils'
import { computed } from 'vue'
import type { CobranzaStatus, ICobranza } from '@/interfaces'
import CardContainer from '@/shared/components/CardContainer.vue'
import InfoIcon from '@/shared/components/icons/InfoIcon.vue'

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

function ceilToInteger(value: number): number {
  return Math.ceil(value)
}

function handlePaymentSelection() {
  emit('action:select-payment', props.payment)
}
</script>

<template>
  <CardContainer>
    <p class="font-md-700 text-black">{{ payment.nombre }}</p>

    <div class="flex justify-between gap-2">
      <p class="font-300 text-gray-400">Id del prestamo</p>
      <p class="font-md-700 text-blue-800">{{ payment.prestamoId }}</p>
    </div>

    <div class="flex justify-between gap-2">
      <p class="font-300 text-gray-400">Tarifa</p>
      <p class="font-md-700 text-blue-800">{{ toCurrency(ceilToInteger(payment.tarifa)) }}</p>
    </div>

    <div class="flex items-center justify-between gap-2">
      <div>
        <p class="font-300 text-gray-400">Cobrado</p>
        <p class="font-sm-700 flex items-center gap-1 text-gray-400">
          <InfoIcon class="h-4 w-4" />
          El total de los pagos registrados en la semana
        </p>
      </div>
      <p class="px-1 py-0.5 rounded-md font-bold border flex items-center gap-2" :class="statusStyles">
        <span>●</span>
        {{ toCurrency(ceilToInteger(payment.cobradoEnLaSemana)) }}
      </p>
    </div>

    <div class="space-y-2">
      <button @click="handlePaymentSelection" class="btn btn-primary w-full" :disabled="isProcessing">
        Registrar pago
      </button>
    </div>
  </CardContainer>
</template>