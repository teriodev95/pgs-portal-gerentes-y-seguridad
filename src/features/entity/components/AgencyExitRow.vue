<script setup lang="ts">
import { computed } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { ISalidaSemana, IPorTerminar } from '../types/agency.types'

// Components
import AngleRight from '@/shared/components/icons/AngleRight.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'

// Una fila por cliente. El chip dice cómo salió (o cuánto le falta); el monto
// de la derecha es con cuánto cerró. Nada más: para reconocerlo basta eso, el
// detalle completo está a un tap.
const $props = defineProps<{
  salida?: ISalidaSemana
  porTerminar?: IPorTerminar
}>()

const emit = defineEmits<{
  (event: 'select', prestamoId: string): void
}>()

const prestamoId = computed(() => $props.salida?.prestamoId ?? $props.porTerminar?.prestamoId ?? '')
const nombre = computed(() => $props.salida?.nombre ?? $props.porTerminar?.nombre ?? '')

// Texto y color del chip. Los colores siguen el código del inicio: verde es
// "ya quedó", ámbar "a medias", rojo "hay algo que atender", gris "sin resolver".
const chip = computed(() => {
  const s = $props.salida
  if (!s) {
    return { text: 'Por terminar', tone: 'text-gray-600 border-gray-400 bg-gray-100' }
  }
  switch (s.tipo) {
    case 'TERMINO':
      return { text: 'Terminó de pagar', tone: 'text-green-700 border-green-600 bg-green-100' }
    case 'CON_DESCUENTO':
      return { text: `Liquidó con ${toCurrency(s.descuento)} de descuento`, tone: 'text-blue-700 border-blue-600 bg-blue-100' }
    case 'ESPECIAL':
      return s.recuperacion === 'PENDIENTE'
        ? { text: 'Liquidación especial · pendiente de recuperar', tone: 'text-red-700 border-red-600 bg-red-100' }
        : { text: 'Liquidación especial', tone: 'text-amber-700 border-amber-600 bg-amber-100' }
    default:
      return { text: s.tipo, tone: 'text-gray-600 border-gray-400 bg-gray-100' }
  }
})

const amount = computed(() => toCurrency($props.salida?.cerroCon ?? $props.porTerminar?.falta ?? 0))
const amountLabel = computed(() => ($props.salida ? 'cerró con' : 'le falta'))
</script>

<template>
  <button
    type="button"
    class="flex min-h-14 w-full items-center gap-2 border-b border-slate-200 py-2 text-left transition-colors active:bg-slate-200"
    :aria-label="`${nombre}, ${chip.text}, ${amountLabel} ${amount}`"
    @click="emit('select', prestamoId)"
  >
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2 text-sm">
        <div class="min-w-0">
          <TextCT class="truncate">{{ nombre }}</TextCT>
          <TextCT variant="tertiary">{{ prestamoId }}</TextCT>
        </div>

        <div class="flex-none text-right">
          <TextCT variant="secondary">{{ amount }}</TextCT>
          <p class="text-xs text-slate-500">{{ amountLabel }}</p>
        </div>
      </div>

      <span class="mt-1.5 inline-block rounded-md border px-1.5 py-0.5 text-xs font-semibold" :class="chip.tone">
        {{ chip.text }}
      </span>
    </div>

    <!-- Affordance: la fila lleva al detalle del préstamo -->
    <AngleRight class="h-4 w-4 flex-none text-slate-400" />
  </button>
</template>
