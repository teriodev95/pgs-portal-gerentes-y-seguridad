<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { ICobranzaV2 } from '@/interfaces'

// Components
import CheckIcon from '@/shared/components/icons/CheckCircleIcon.vue'
import AngleRight from '@/shared/components/icons/AngleRight.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'

// Interface - Props - Emits
const $props = defineProps<{
  cobranza: ICobranzaV2
}>()

const emit = defineEmits<{
  (event: 'select', prestamoId: string): void
}>()

// El ícono habla de la semana (¿ya pagó?). La barra habla del préstamo
// (¿cuánto lleva?). Son dos cosas distintas, por eso la barra no toma el color
// del estado: un préstamo al 30 % en verde diría algo que no es.
const iconTone = computed(() => {
  switch ($props.cobranza.status) {
    case 'Completado':
      return 'text-green-500 dark:text-green-400'
    case 'Desfase':
      return 'text-red-500 dark:text-red-400'
    case 'Pendiente':
      return 'text-gray-500 dark:text-gray-400'
    default:
      return 'text-amber-500 dark:text-amber-400'
  }
})

// La barra arranca en cero y crece al montar: se nota que es dato vivo.
const barWidth = ref(0)
const avance = computed(() => Math.min(100, Math.max(0, $props.cobranza.prestamo.avance)))

onMounted(() => {
  requestAnimationFrame(() => {
    barWidth.value = avance.value
  })
})
</script>

<template>
  <button
    type="button"
    class="flex min-h-14 w-full items-center gap-2 border-b border-slate-200 py-2 text-left transition-colors active:bg-slate-200"
    :aria-label="`${cobranza.nombre}, saldo ${toCurrency(cobranza.prestamo.saldo)}, ${avance}% pagado`"
    @click="emit('select', cobranza.prestamoId)"
  >
    <!-- Icon -->
    <div class="flex-none">
      <CheckIcon class="h-6 w-6" :class="iconTone" />
    </div>

    <!-- Content -->
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2 text-sm">
        <div class="min-w-0">
          <TextCT class="truncate">{{ cobranza.nombre }}</TextCT>
          <TextCT variant="tertiary">{{ cobranza.prestamoId }}</TextCT>
        </div>

        <div class="flex-none text-right">
          <TextCT variant="primary">{{ toCurrency(cobranza.semana.tarifa) }}</TextCT>
          <TextCT variant="secondary">{{ toCurrency(cobranza.semana.cobrado) }}</TextCT>
        </div>
      </div>

      <!-- Avance del préstamo: la barra dice cuánto lleva, el número cuánto falta.
           "Pagado X de Y" no va: es lo mismo que ya dibuja la barra. -->
      <div class="mt-1.5 flex items-center gap-2">
        <div
          class="h-1 flex-1 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          :aria-valuenow="avance"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="h-full rounded-full bg-blue-700 transition-[width] duration-500 ease-out"
            :style="{ width: `${barWidth}%` }"
          />
        </div>
        <p class="flex-none text-xs text-slate-500">
          Saldo <span class="font-semibold text-slate-700">{{ toCurrency(cobranza.prestamo.saldo) }}</span>
        </p>
      </div>
    </div>

    <!-- Affordance: la fila lleva al detalle -->
    <AngleRight class="h-4 w-4 flex-none text-slate-400" />
  </button>
</template>
