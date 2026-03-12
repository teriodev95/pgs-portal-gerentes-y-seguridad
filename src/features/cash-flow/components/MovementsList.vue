<script setup lang="ts">
import type { Movimiento } from '../types/cashFlow.types'

type ListVariant = 'ingreso' | 'egreso' | 'enCampo'

interface Props {
  title: string
  movements: Movimiento[]
  variant: ListVariant
  animationDelay?: number
  formatMoney: (value: number) => string
}

withDefaults(defineProps<Props>(), {
  animationDelay: 0,
})

const variantClasses = {
  ingreso: {
    bar: 'bg-emerald-500',
    badge: 'text-emerald-600 bg-emerald-50',
    amount: 'text-emerald-600',
  },
  egreso: {
    bar: 'bg-red-500',
    badge: 'text-red-600 bg-red-50',
    amount: 'text-red-600',
  },
  enCampo: {
    bar: 'bg-amber-500',
    badge: 'text-amber-600 bg-amber-50',
    amount: 'text-amber-600',
  },
}
</script>

<template>
  <div
    class="fade-in bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    :style="{ animationDelay: `${animationDelay}ms` }"
  >
    <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-1.5 h-5 rounded-full" :class="variantClasses[variant].bar" />
        <h3 class="text-sm font-bold text-slate-700">{{ title }}</h3>
      </div>
      <span
        class="text-xs font-semibold px-2 py-0.5 rounded-full"
        :class="variantClasses[variant].badge"
      >
        {{ movements.length }}
      </span>
    </div>

    <div v-if="movements.length === 0" class="px-4 py-8 text-center">
      <p class="text-xs text-slate-400">No hay movimientos</p>
    </div>

    <div v-else class="divide-y divide-slate-100/70">
      <div
        v-for="(item, i) in movements"
        :key="i"
        class="px-4 py-3 flex items-center justify-between gap-4"
      >
        <p class="text-xs text-slate-600 min-w-0 flex-1 leading-relaxed">
          {{ item.concepto }}
        </p>
        <span
          class="text-xs font-bold tabular-nums shrink-0"
          :class="variantClasses[variant].amount"
        >
          {{ formatMoney(item.monto) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeInUp 0.4s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
