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

const levelClasses = computed(() => ({
  neutral: 'border-slate-200 bg-white text-slate-800',
  green: 'border-[#A9D7B2] bg-[#C6EFCE] text-[#006100]',
  yellow: 'border-[#E6CF75] bg-[#FFEB9C] text-[#7A5100]',
  pink: 'border-[#E7AAB2] bg-[#FFC7CE] text-[#8B0006]',
  red: 'border-[#D60000] bg-[#FF0000] text-white'
})[level.value])
const smallTextClasses = computed(() => level.value === 'red'
  ? 'inline-flex rounded-md bg-black/70 px-2 py-1 text-sm font-bold text-white'
  : 'text-xs font-medium opacity-90'
)
</script>

<template>
  <button
    v-if="isContactAction"
    type="button"
    class="min-h-[5.5rem] w-full rounded-xl border p-3 text-left shadow-sm transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
    :class="levelClasses"
    :aria-label="`${label}: ${formatCurrency(amount)}. Contactar al responsable`"
    @click="emit('contact')"
  >
    <span :class="smallTextClasses">{{ label }}</span>
    <strong class="mt-1 block text-lg leading-tight">{{ formatCurrency(amount) }}</strong>
    <span class="mt-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-sm font-bold text-white underline decoration-2 underline-offset-2">
      <PhoneCall class="size-3.5" aria-hidden="true" />
      Contactar
    </span>
  </button>

  <div
    v-else
    class="min-h-[5.5rem] rounded-xl border p-3 shadow-sm"
    :class="levelClasses"
  >
    <span :class="smallTextClasses">{{ label }}</span>
    <strong class="mt-1 block text-lg leading-tight">{{ formatCurrency(amount) }}</strong>
    <span class="mt-2" :class="smallTextClasses">{{ status }}</span>
  </div>
</template>
