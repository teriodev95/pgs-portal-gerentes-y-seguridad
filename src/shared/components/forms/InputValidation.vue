<script setup lang="ts">
import { computed } from 'vue'

import LockIcon from '@/shared/components/icons/LockIcon.vue'

interface InputConfig {
  label: string
  input: string
  message: string
  icon: string
}

type InputConfigKey = 'success' | 'error' | 'default'
type AllConfig = Record<InputConfigKey, InputConfig>

export interface Props {
  label: string
  correctPin: string
  modelValue: string
}

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */

interface Emit {
  (e: 'password-validation', isCorrect: boolean): void
  (e: 'update:modelValue', pin: string): void
}

const emits = defineEmits<Emit>()

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */

const props = defineProps<Props>()

const styles: AllConfig = {
  success: {
    label: 'text-green-700 dark:text-green-500',
    input:
      'bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500',
    message: 'text-green-600 dark:text-green-500',
    icon: 'text-green-500'
  },
  error: {
    label: 'text-red-700 dark:text-red-500',
    input:
      'bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500',
    message: 'text-red-600 dark:text-red-500',
    icon: 'text-red-500'
  },
  default: {
    label: '',
    input:
      'bg-gray-50 border border-gray-500 text-gray-400 placeholder-gray-700 text-sm rounded-lg focus:ring-gray-500 dark:bg-gray-700 focus:border-gray-500 block w-full p-2.5 dark:text-gray-500 dark:placeholder-gray-500 dark:border-gray-500',
    message: '',
    icon: 'text-gray-500'
  }
}

const type = computed<InputConfigKey>(() => {
  const { modelValue, correctPin } = props

  if (modelValue === '') {
    return 'default'
  }

  const isCorrect: boolean = modelValue === correctPin
  emits('password-validation', isCorrect)

  return modelValue === correctPin ? 'success' : 'error'
})

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */

/**
 * handleInput
 */
const handleInput = (event: Event) => {
  const inputElement = event.target as HTMLInputElement
  emits('update:modelValue', inputElement.value)
}
</script>

<template>
  <div class="space-y-3">
    <label
      for="error"
      :class="[styles[type]?.label || styles.default.label, 'text-xs font-normal']"
    >
      {{ label }}
    </label>

    <div class="relative">
      <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
        <LockIcon class="size-6" :class="[styles[type]?.icon || styles.default.icon]" />
      </div>
      <input
        type="password"
        id="error"
        :value="modelValue"
        @input="($event) => handleInput($event)"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5"
        :class="[styles[type]?.input || styles.default.input]"
        placeholder="Ingresa tu PIN aquí"
      />
    </div>

    <p class="text-xs font-normal">
      <span class="font-medium"
        >No lo compartas con nadie y asegúrate de que nadie lo vea mientras lo ingresas.</span
      >
    </p>
  </div>
</template>
