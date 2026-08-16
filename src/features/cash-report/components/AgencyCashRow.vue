<script setup lang="ts">
import { computed } from 'vue'
import { PhoneCall } from 'lucide-vue-next'
import { formatCurrency, getCashLevel, getCashStatus } from '../cash-report.utils'

const props = withDefaults(
  defineProps<{
    agency: string
    agent?: string | null
    closed?: boolean
    amount: number | null
    actionable?: boolean
  }>(),
  {
    // `agent` se queda sin valor por omisión a propósito: sin dato, la fila no
    // escribe subtítulo. El histórico y la evolución horaria no traen el campo
    // en su contrato, así que ahí no hay nada que poner.
    closed: false,
    actionable: false
  }
)

const emit = defineEmits<{ contact: [] }>()

const level = computed(() => getCashLevel(props.amount))
const isContactAction = computed(() => level.value === 'red' && props.actionable)

const hasBadge = computed(() => {
  if (isContactAction.value) return false
  if (props.closed) return true
  return level.value === 'yellow' || level.value === 'pink' || level.value === 'red'
})

const badgeLabel = computed(() => {
  if (props.closed) return 'Cerrada'
  if (level.value === 'red') return 'Crítico'
  if (level.value === 'pink') return 'Atención'
  if (level.value === 'yellow') return 'Seguimiento'
  return ''
})

/**
 * El nombre del agente cuando se sabe, y nada más. La única marca de estado de
 * la fila es "Cerrada", y ésa ya la pone el distintivo de la derecha: repetirla
 * aquí la decía dos veces en el mismo renglón.
 *
 * "Sin agente" y "Vacante" se fueron. El primero afirmaba un hecho que el
 * reporte muchas veces ni trae —el histórico y la evolución horaria no mandan
 * el campo— y salía estampado en todas las filas.
 */
const subtitle = computed(() => props.agent || '')

const badgeClasses = computed(
  () =>
    ({
      neutral: 'bg-slate-100 text-slate-500',
      green: 'border border-emerald-200/60 bg-emerald-50 text-emerald-700',
      yellow: 'border border-amber-200/60 bg-amber-50 text-amber-800',
      pink: 'border border-rose-200/60 bg-rose-50 text-rose-800',
      red: 'border border-red-200/60 bg-red-50 text-red-700'
    })[level.value]
)

const borderClasses = computed(() => {
  if (level.value === 'red') return 'border-red-200/80 bg-red-50/20 hover:bg-red-50/50'
  return 'border-slate-200/70 bg-white hover:bg-slate-50/70'
})
</script>

<template>
  <div
    class="flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2 transition-colors"
    :class="borderClasses"
  >
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold text-slate-900">{{ agency }}</span>
        <!-- Sin subtítulo tampoco va el punto: solo queda colgando. -->
        <template v-if="subtitle">
          <span class="text-slate-300">·</span>
          <span class="truncate text-[11px] font-medium text-slate-500">
            {{ subtitle }}
          </span>
        </template>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <strong
        class="text-xs font-bold tracking-tight sm:text-sm"
        :class="level === 'red' ? 'text-red-700' : 'text-slate-900'"
      >
        {{ formatCurrency(amount) }}
      </strong>

      <button
        v-if="isContactAction"
        type="button"
        class="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1"
        :aria-label="`Contactar por ${agency} (${formatCurrency(amount)})`"
        @click="emit('contact')"
      >
        <PhoneCall class="size-3" aria-hidden="true" />
        Contactar
      </button>

      <span
        v-else-if="hasBadge"
        class="rounded px-1.5 py-0.5 text-[10px] font-medium"
        :class="badgeClasses"
      >
        {{ badgeLabel }}
      </span>
    </div>
  </div>
</template>
