<script setup lang="ts">
import { computed } from 'vue'
import { toCurrency } from '@/shared/utils'
import { tipoBadgeClass, tipoPagoLabel } from '../constants'
import type { IPayment } from '../types'

// Components
import TextCT from '@/shared/components/ui/TextCT.vue'
import AngleRight from '@/shared/components/icons/AngleRight.vue'

// Fila compacta de pago dentro de una semana: la fila ENTERA es el affordance
// (chevron → hay más). Badge + fecha responden "¿qué fue?"; monto "¿cuánto?".
// Todo lo demás vive en PagoDetallesDrawer. Misma forma para 1 o N pagos.
interface Props {
  payment: IPayment
}

interface Emits {
  (e: 'verDetalles', payment: IPayment): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const yaAdelantado = computed(() => !!props.payment.comentario?.includes('ADELANTO:'))

const fechaCorta = computed(() => {
  const fecha = new Date(props.payment.fechaPago)
  if (isNaN(fecha.getTime())) return ''
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(fecha)
})
</script>

<template>
  <!-- Tipografía de segundo nivel: monto gris (el azul bold es de los
       totales semanales) y chevron ligero — se lee como sub-ítem -->
  <button
    type="button"
    class="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50"
    @click="emit('verDetalles', payment)"
  >
    <span class="flex min-w-0 items-center gap-2">
      <span
        class="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium"
        :class="tipoBadgeClass(payment.tipo)"
      >
        {{ tipoPagoLabel(payment.tipo) }}
      </span>
      <svg
        v-if="yaAdelantado"
        class="h-4 w-4 shrink-0 text-green-600"
        aria-label="Pago adelantado: cubre semanas siguientes"
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <TextCT variant="tertiary" class="truncate">{{ fechaCorta }}</TextCT>
    </span>

    <span class="flex shrink-0 items-center gap-1.5">
      <span class="text-sm font-semibold text-gray-700">{{ toCurrency(payment.monto) }}</span>
      <AngleRight class="size-3.5 text-gray-300" />
    </span>
  </button>
</template>
