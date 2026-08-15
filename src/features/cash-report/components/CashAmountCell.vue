<script setup lang="ts">
import { computed } from 'vue'
import { PhoneCall } from 'lucide-vue-next'
import { formatCurrency, getCashLevel, getCashStatus } from '../cash-report.utils'

const props = withDefaults(
  defineProps<{
    label: string
    amount: number | null
    actionable?: boolean
  }>(),
  { actionable: false }
)

const emit = defineEmits<{ contact: [] }>()

const level = computed(() => getCashLevel(props.amount))
const isContactAction = computed(() => level.value === 'red' && props.actionable)
const status = computed(() => {
  if (level.value === 'red' && !props.actionable && (props.amount ?? 0) >= 0) return 'Nivel crítico'
  return getCashStatus(props.amount)
})

const hasBadge = computed(() => level.value === 'yellow' || level.value === 'pink' || level.value === 'red')

const levelClasses = computed(
  () =>
    ({
      neutral: 'border-slate-200/80 bg-slate-50/60 text-slate-800',
      green: 'border-emerald-200/70 bg-emerald-50/50 text-emerald-950',
      yellow: 'border-amber-200/70 bg-amber-50/50 text-amber-950',
      pink: 'border-rose-200/70 bg-rose-50/50 text-rose-950',
      red: 'border-red-200/80 bg-red-50/60 text-red-950'
    })[level.value]
)

const badgeClasses = computed(
  () =>
    ({
      neutral: 'bg-slate-200/70 text-slate-600',
      green: 'bg-emerald-100/80 text-emerald-800',
      yellow: 'bg-amber-100/80 text-amber-800',
      pink: 'bg-rose-100/80 text-rose-800',
      red: 'bg-red-100 text-red-700'
    })[level.value]
)
</script>

<template>
  <button
    v-if="isContactAction"
    type="button"
    class="flex min-h-[5rem] w-full flex-col justify-between rounded-xl border p-3 text-left transition-all hover:border-red-300 hover:bg-red-50/80 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1"
    :class="levelClasses"
    :aria-label="`${label}: ${formatCurrency(amount)}. Contactar al responsable`"
    @click="emit('contact')"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="text-xs font-medium text-slate-600">{{ label }}</span>
      <span
        class="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs transition-colors hover:bg-red-700"
      >
        <PhoneCall class="size-3" aria-hidden="true" />
        Contactar
      </span>
    </div>
    <div class="mt-1.5">
      <strong class="block text-lg font-bold tracking-tight">{{ formatCurrency(amount) }}</strong>
    </div>
  </button>

  <div
    v-else
    class="flex min-h-[5rem] flex-col justify-between rounded-xl border p-3"
    :class="levelClasses"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="text-xs font-medium text-slate-600">{{ label }}</span>
      <span
        v-if="hasBadge"
        class="rounded-md px-1.5 py-0.5 text-[11px] font-medium"
        :class="badgeClasses"
      >
        {{ status }}
      </span>
    </div>
    <div class="mt-1.5">
      <strong class="block text-lg font-bold tracking-tight">{{ formatCurrency(amount) }}</strong>
    </div>
  </div>
</template>
