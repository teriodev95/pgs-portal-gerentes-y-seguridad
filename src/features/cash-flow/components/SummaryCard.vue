<script setup lang="ts">
type CardVariant = 'ingreso' | 'egreso' | 'enCampo' | 'balance'

interface Props {
  label: string
  value: string
  variant: CardVariant
  animationDelay?: number
  balance?: number
}

const props = withDefaults(defineProps<Props>(), {
  animationDelay: 0,
  balance: 0,
})

const variantClasses = {
  ingreso: {
    dot: 'bg-emerald-500',
    text: 'text-slate-400',
    value: 'text-slate-800',
    card: 'bg-white border-slate-100',
  },
  egreso: {
    dot: 'bg-red-500',
    text: 'text-slate-400',
    value: 'text-slate-800',
    card: 'bg-white border-slate-100',
  },
  enCampo: {
    dot: 'bg-amber-500',
    text: 'text-slate-400',
    value: 'text-slate-800',
    card: 'bg-white border-slate-100',
  },
  balance: {
    dot: props.balance >= 0 ? 'bg-emerald-600' : 'bg-red-600',
    text: props.balance >= 0 ? 'text-emerald-600' : 'text-red-600',
    value: props.balance >= 0 ? 'text-emerald-700' : 'text-red-700',
    card: props.balance >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200',
  },
}

const classes = variantClasses[props.variant]
</script>

<template>
  <div
    class="fade-in rounded-2xl p-4 shadow-sm border"
    :class="classes.card"
    :style="{ animationDelay: `${animationDelay}ms` }"
  >
    <div class="flex items-center gap-2 mb-1">
      <div class="w-2 h-2 rounded-full" :class="classes.dot" />
      <span
        class="text-[11px] font-medium uppercase tracking-wider"
        :class="classes.text"
      >
        {{ label }}
      </span>
    </div>
    <p class="text-lg font-bold tabular-nums" :class="classes.value">
      {{ value }}
    </p>
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
