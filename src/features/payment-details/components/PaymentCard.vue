<script setup lang="ts">
import CardContainer from '@/shared/components/CardContainer.vue'
import EyeIcon from '@/shared/components/icons/EyeIcon.vue'
import ToolsIcon from '@/shared/components/icons/ToolsIcon.vue'
import { toCurrency } from '@/shared/utils'
import { useStore } from '@/shared/stores'
import type { IPayment } from '../types'
import TextCT from '@/shared/components/ui/TextCT.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import DataField from '@/shared/components/DataField.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

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
      <SectionContainer>
        <TextCT variant="tertiary">ID: {{ payment.pagoId }}</TextCT>

        <div class="flex justify-between gap-2">
          <DataField label="Tarifa" :value="toCurrency(payment.tarifa)" orientation="vertical" />
          <DataField label="Tipo" :value="payment.tipo" orientation="vertical" />
        </div>

        <div class="flex justify-between gap-2">
          <DataField label="Abre con" :value="toCurrency(payment.abreCon)" orientation="vertical" />
          <DataField label="Cierra con" :value="toCurrency(payment.cierraCon)" orientation="vertical" />
        </div>

        <DataField v-if="payment.comentario" label="Comentario" :value="payment.comentario" orientation="vertical" />

        <div class="flex justify-between gap-2">
          <DataField label="Creado desde" :value="payment.creadoDesde" orientation="vertical" />
          <DataField label="¿Quien Pago?" :value="''" orientation="vertical" />
        </div>
      </SectionContainer>

      <!-- Action Buttons (only for the most recent payment) -->
      <div v-if="payment.semana === $store.currentDate.week" class="space-y-2">
        <!-- View Map Button -->
        <BtnComponent @click="showPaymentLocation" variant="primary" full-width size="sm">
          <template #icon-left>
            <EyeIcon class="size-4" />
          </template>
          Ver mapa
        </BtnComponent>

        <!-- Request Correction Button -->
        <BtnComponent @click="navigateToCorrection" variant="primary" outline full-width size="sm">
          <template #icon-left>
            <ToolsIcon class="size-4" />
          </template>
          Solicitar correción
        </BtnComponent>
      </div>
    </CardContainer>
  </div>
</template>