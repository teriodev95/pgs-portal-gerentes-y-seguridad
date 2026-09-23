<script setup lang="ts" generic="T extends string | number">
/**
 * Grupo de opciones de un solo toque. Sustituye a un <select> cuando las opciones
 * caben en pantalla: el gerente ve todo y elige con un tap, sin abrir nada.
 * `detail` explica la consecuencia de la opcion (p. ej. si paga comision) y
 * `tone` la colorea para que se lea sin pensar.
 */
export interface ChoiceOption<V extends string | number> {
  value: V
  label: string
  detail?: string
  tone?: 'positive' | 'negative'
  disabled?: boolean
}

interface Props {
  options: ChoiceOption<T>[]
  modelValue: T | ''
  /** Nombre del grupo, para accesibilidad. */
  name: string
  columns?: 2 | 3 | 4
  /** `sm` para listas largas (montos), `md` para decisiones (tipo, quien genero). */
  size?: 'sm' | 'md'
}

interface Emits {
  (event: 'update:modelValue', value: T): void
}

const props = withDefaults(defineProps<Props>(), { columns: 2, size: 'md' })
const emit = defineEmits<Emits>()

const GRID: Record<NonNullable<Props['columns']>, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

const PADDING: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-2 py-2',
  md: 'p-2.5',
}

const TONE: Record<NonNullable<ChoiceOption<T>['tone']>, string> = {
  positive: 'text-emerald-700 dark:text-emerald-400',
  negative: 'text-red-600 dark:text-red-400',
}

const isSelected = (option: ChoiceOption<T>) => option.value === props.modelValue
</script>

<template>
  <div role="radiogroup" :aria-label="name" class="grid gap-2" :class="GRID[columns]">
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      role="radio"
      :aria-checked="isSelected(option)"
      :disabled="option.disabled"
      class="rounded-lg border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      :class="[
        PADDING[size],
        isSelected(option)
          ? 'border-blue-700 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400'
          : 'border-slate-200 bg-white text-gray-600 hover:border-slate-300 hover:bg-slate-50 dark:border-gray-600 dark:bg-transparent dark:text-gray-400',
      ]"
      @click="emit('update:modelValue', option.value)"
    >
      <span class="block tabular-nums" :class="[size === 'sm' ? 'text-sm' : 'text-sm font-medium', isSelected(option) && 'font-semibold']">
        {{ option.label }}
      </span>
      <span
        v-if="option.detail"
        class="mt-0.5 block truncate text-xs leading-4"
        :class="option.tone ? TONE[option.tone] : 'text-slate-500 dark:text-gray-400'"
      >
        {{ option.detail }}
      </span>
    </button>
  </div>
</template>
