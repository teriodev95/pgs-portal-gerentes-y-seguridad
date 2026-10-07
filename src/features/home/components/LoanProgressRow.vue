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

// Oficina pide el contrato como "ID cliente" (Belén, 7-oct-2026); se copia sin abrir el detalle.
const contratoCopiado = ref(false)

async function copiarContrato() {
  if (!$props.cobranza.contrato) return
  try {
    await navigator.clipboard.writeText($props.cobranza.contrato)
    contratoCopiado.value = true
    setTimeout(() => (contratoCopiado.value = false), 2000)
  } catch {
    /* clipboard no disponible: el contrato sigue a la vista */
  }
}
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
          <TextCT variant="tertiary" class="flex min-w-0 items-center gap-1">
            <!-- Al copiar, "Contrato" cambia a "Copiado" en su lugar: el aviso no empuja ni tapa el número. -->
            <span class="truncate">
              {{ cobranza.prestamoId }}<template v-if="cobranza.contrato">
                · <span :class="{ 'text-green-600': contratoCopiado }">{{ contratoCopiado ? 'Copiado' : 'Contrato' }}</span>
                {{ cobranza.contrato }}</template>
            </span>
            <!-- La fila entera es un <button> y otro adentro no es válido: un span con
                 rol de botón que corta el toque para que no abra el detalle. -->
            <span
              v-if="cobranza.contrato"
              role="button"
              tabindex="0"
              :aria-label="`Copiar contrato ${cobranza.contrato}`"
              class="-m-1.5 flex-none p-1.5 text-gray-400 active:text-gray-700"
              @click.stop="copiarContrato"
              @keydown.enter.stop.prevent="copiarContrato"
              @keydown.space.stop.prevent="copiarContrato"
            >
              <svg v-if="contratoCopiado" class="h-3.5 w-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </span>
          </TextCT>
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
