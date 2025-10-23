<script setup lang="ts">
import { computed } from 'vue'
import { formatToHumanDate, toCurrency } from '@/shared/utils'
import RevealCircle from '@/shared/components/RevealCircle.vue'
import type { ICobranza } from '@/interfaces'

interface Props {
  show: boolean
  selectedPayment?: ICobranza
  selectedAmount: number
  mainText?: string
  secondaryText?: string
  subText?: string
}

interface Emits {
  (event: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  mainText: '¡Pago registrado con éxito!',
  subText: 'A continuación, los detalles de la transacción:'
})

const emit = defineEmits<Emits>()

const computedSecondaryText = computed(() => {
  if (props.secondaryText) return props.secondaryText
  return `Se ha registrado correctamente el pago de <span class='font-extrabold'>${props.selectedPayment?.nombre}</span>`
})

const transactionDetails = computed(() => [
  `- Fecha de aplicación del pago: <span class='font-extrabold'>${formatToHumanDate(new Date(), true)}</span>`,
  `- Monto abonado: <span class='font-extrabold'>${toCurrency(props.selectedAmount)}</span>`
])

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <RevealCircle 
    v-show="show" 
    :main-text="mainText"
    :secondary-text="computedSecondaryText" 
    :sub-text="subText"
    :list="transactionDetails" 
    type="success" 
    @action:cancel="handleCancel" 
  />
</template>