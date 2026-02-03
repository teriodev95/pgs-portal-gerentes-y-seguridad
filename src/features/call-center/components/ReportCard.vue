<script lang="ts" setup>
import { computed, onUnmounted, type Component } from 'vue'
import type { IQuestion, CallStatus, ICallCenterReport } from '../types'

// Components
import RatingCount from '@/features/call-center/components/RatingCount.vue'
import PhoneIcon from '@/shared/components/icons/PhoneIcon.vue'
import BanIcon from '@/shared/components/icons/BanIcon.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import DataField from '@/shared/components/DataField.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

// Interface - Props - Emits
interface Props {
  reporte: ICallCenterReport
}

interface StatusLlamadaInfo {
  component: Component
  class: string
}

interface Emits {
  (e: 'selectReport', reporteSelect: ICallCenterReport): void
}

defineEmits<Emits>()
defineProps<Props>()

// Constants
const StatusLlamada: Record<CallStatus, StatusLlamadaInfo> = {
  Contestado: {
    component: PhoneIcon,
    class: 'text-gray-400'
  },
  'No contestado': {
    component: BanIcon,
    class: 'text-gray-400'
  }
}

// State definitions
const puntuacion = computed(() => {
  return (preguntas: IQuestion[] | null) => {
    if (Array.isArray(preguntas)) {
      return preguntas.reduce((acc, pregunta) => {
        return acc + Number(pregunta.puntuacion)
      }, 0)
    } else {
      return 0
    }
  }
})

// Methods
const scrollToTop = () => window.scrollTo({ top: 0 });

// Lifecycle hooks
onUnmounted(() => {
  scrollToTop();
});
</script>

<template>
  <CardContainer>
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <span v-if="reporte.tieneVisitas"
          class="inline-flex items-center justify-center w-6 h-6 me-2 text-sm font-semibold text-green-800 bg-green-100 rounded-full dark:bg-gray-700 dark:text-blue-400">
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
            viewBox="0 0 20 20">
            <path fill="currentColor"
              d="m18.774 8.245-.892-.893a1.5 1.5 0 0 1-.437-1.052V5.036a2.484 2.484 0 0 0-2.48-2.48H13.7a1.5 1.5 0 0 1-1.052-.438l-.893-.892a2.484 2.484 0 0 0-3.51 0l-.893.892a1.5 1.5 0 0 1-1.052.437H5.036a2.484 2.484 0 0 0-2.48 2.481V6.3a1.5 1.5 0 0 1-.438 1.052l-.892.893a2.484 2.484 0 0 0 0 3.51l.892.893a1.5 1.5 0 0 1 .437 1.052v1.264a2.484 2.484 0 0 0 2.481 2.481H6.3a1.5 1.5 0 0 1 1.052.437l.893.892a2.484 2.484 0 0 0 3.51 0l.893-.892a1.5 1.5 0 0 1 1.052-.437h1.264a2.484 2.484 0 0 0 2.481-2.48V13.7a1.5 1.5 0 0 1 .437-1.052l.892-.893a2.484 2.484 0 0 0 0-3.51Z" />
            <path fill="#fff"
              d="M8 13a1 1 0 0 1-.707-.293l-2-2a1 1 0 1 1 1.414-1.414l1.42 1.42 5.318-3.545a1 1 0 0 1 1.11 1.664l-6 4A1 1 0 0 1 8 13Z" />
          </svg>
          <span class="sr-only">Icon description</span>
        </span>

        <span
          class="bg-indigo-100 text-indigo-800 text-xs font-medium  px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">{{
            reporte.gerencia }} • {{ reporte.agencia }}</span>
      </div>

      <span
        class="bg-purple-100 text-purple-800 text-xs font-medium  px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">SEM
        #{{ reporte.semana }}</span>
    </div>


    <DataField label="Prestamo" :value="reporte.prestamoId"/>


    <!-- Cliente -->
    <div v-if="reporte.status_llamada_cliente === 'Contestado'" class="space-y-2">
      <DataField label="Cliente" :value="reporte?.nombres_cliente" />

      <div class="flex items-center gap-6 text-gray-400">
        <div class="flex w-2/5 items-center gap-2">
          <component :is="StatusLlamada[reporte?.status_llamada_cliente]?.component"
            :class="StatusLlamada[reporte?.status_llamada_cliente]?.class" />

          <TextCT>{{ reporte?.status_llamada_cliente }}</TextCT>
        </div>
        <RatingCount :puntuacion="puntuacion(reporte?.preguntas_cliente)" />
      </div>
    </div>
    <!-- / Cliente -->

    <!-- Aval -->
    <div v-else-if="reporte.status_llamada_aval === 'Contestado'" class="space-y-2">
      <DataField label="Aval" :value="reporte?.nombres_aval" />

      <div class="flex items-center gap-6 text-gray-400">
        <div class="flex w-2/5 items-center gap-2">
          <component :is="StatusLlamada[reporte?.status_llamada_aval]?.component"
            :class="StatusLlamada[reporte?.status_llamada_aval]?.class" />

          <TextCT>{{ reporte?.status_llamada_aval }}</TextCT>
        </div>
        <RatingCount :puntuacion="puntuacion(reporte?.preguntas_aval)" />
      </div>
    </div>
    <!-- / Aval -->

    <TextCT v-else variant="tertiary">
      Ninguna parte contestó la llamada
    </TextCT>

    <BtnComponent @click="$emit('selectReport', reporte)" outline full-width>
      Ver detalles
    </BtnComponent>
  </CardContainer>
</template>