<script setup lang="ts">
import CardContainer from '@/shared/components/CardContainer.vue'
import EyeIcon from '@/shared/components/icons/EyeIcon.vue'
import ToolsIcon from '@/shared/components/icons/ToolsIcon.vue'
import { toCurrency } from '@/shared/utils'
import { useStore } from '@/shared/stores'
import type { IPayment } from '../types'

interface Props {
  payment: IPayment
}

interface Emits {
  (e: 'paymentAction', action: 'showMap' | 'correction', payment: IPayment): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $store = useStore()

function showPaymentLocation() {
  emit('paymentAction', 'showMap', props.payment)
}

function navigateToCorrection() {
  emit('paymentAction', 'correction', props.payment)
}
</script>

<template>
  <div class="space-y-2">
    <CardContainer>
      <div>
        <!-- Payment ID -->
        <div>
          <p class="!text-[9px] font-300 text-gray-400">ID: {{ payment.pagoId }}</p>
        </div>

        <!-- Payment Rate and Type -->
        <div class="flex justify-center gap-2">
          <div class="flex-1">
            <p class="font-300 text-gray-400">Tarifa</p>
            <p class="font-md-700 text-blue-800">{{ toCurrency(payment.tarifa) }}</p>
          </div>
          <div class="flex-1">
            <p class="font-300 text-gray-400">Tipo</p>
            <p class="font-md-700 text-blue-800">{{ payment.tipo }}</p>
          </div>
        </div>

        <!-- Opening and Closing Balances -->
        <div class="flex justify-center gap-2">
          <div class="flex-1">
            <p class="font-300 text-gray-400">Abre con</p>
            <p class="font-md-700 text-blue-800">{{ toCurrency(payment.abreCon) }}</p>
          </div>
          <div class="flex-1">
            <p class="font-300 text-gray-400">Cierra con</p>
            <p class="font-md-700 text-blue-800">{{ toCurrency(payment.cierraCon) }}</p>
          </div>
        </div>

        <!-- Comments -->
        <div>
          <p class="font-300 text-gray-400">Comentario</p>
          <p class="font-md-700 text-blue-800">{{ payment.comentario }}</p>
        </div>

        <!-- Creation Source and Payer -->
        <div class="flex justify-center gap-2">
          <div class="flex-1">
            <p class="font-300 text-gray-400">Creado desde</p>
            <p class="font-md-700 text-blue-800">{{ payment.creadoDesde }}</p>
          </div>
          <div class="flex-1">
            <p class="font-300 text-gray-400">¿Quien Pago?</p>
            <p class="font-md-700 text-blue-800">{{ payment.quienPago }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons (only for the most recent payment) -->
      <div v-if="payment.semana === $store.currentDate.week" class="space-y-2">
        <!-- View Map Button -->
        <button
          @click="showPaymentLocation"
          class="w-full btn rounded-lg bg-blue-700 p-1 text-center text-sm font-medium text-white outline-none flex items-center justify-center gap-2"
        >
          <EyeIcon class="size-4" />
          Ver mapa
        </button>

        <!-- Request Correction Button -->
        <button
          @click="navigateToCorrection"
          class="w-full btn rounded-lg border border-blue-700 p-1 text-center text-sm font-medium text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center gap-2"
        >
          <ToolsIcon class="size-4" />
          Solicitar correción
        </button>
      </div>
    </CardContainer>
  </div>
</template>