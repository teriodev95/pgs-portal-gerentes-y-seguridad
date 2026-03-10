<script setup lang="ts">
import { computed } from 'vue'
import type { IUserVerificationPin } from '@/features/assignment/types'

// Components
import ArrowDown from '@/shared/components/icons/ArrowDown.vue'
import ArrowUp from '@/shared/components/icons/ArrowUp.vue'
import LockIcon from '@/shared/components/icons/LockIcon.vue'

// Types
type ValidationStatus = 'default' | 'success' | 'error'
type ValidationPinType = 'sender' | 'recipient'

interface ValidationConfig {
  label: string
  input: string
  message: string
  icon: string
}

// Props
interface Props {
  label: string
  pin: string
  type: ValidationPinType
  status: ValidationStatus
  user?: IUserVerificationPin
  errorMessage?: string
  isVerifying?: boolean
}

// Emits
interface Emit {
  (e: 'update:pin', pin: string): void
  (e: 'validate'): void
}

const props = withDefaults(defineProps<Props>(), {
  isVerifying: false
})

const emits = defineEmits<Emit>()

// Validation styles
const validationStyles: Record<ValidationStatus, ValidationConfig> = {
  success: {
    label: 'text-green-700 dark:text-green-500',
    input: 'bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500',
    message: 'text-green-600 dark:text-green-500',
    icon: 'text-green-500'
  },
  error: {
    label: 'text-red-700 dark:text-red-500',
    input: 'bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500',
    message: 'text-red-600 dark:text-red-500',
    icon: 'text-red-500'
  },
  default: {
    label: '',
    input: 'bg-gray-50 border border-gray-500 text-gray-400 placeholder-gray-700 text-sm rounded-lg focus:ring-gray-500 dark:bg-gray-700 focus:border-gray-500 block w-full p-2.5 dark:text-gray-500 dark:placeholder-gray-500 dark:border-gray-500',
    message: '',
    icon: 'text-gray-500'
  }
}

// Computed
const currentStyles = computed(() => validationStyles[props.status])
const actionText = computed(() => props.type === 'sender' ? 'entrega' : 'recibe')
const isInvalidRecipient = computed(() => props.user?.tipo === 'Agente' && props.type === 'recipient')

// Methods
const handleInput = (event: Event) => {
  const inputElement = event.target as HTMLInputElement
  emits('update:pin', inputElement.value)
}

const handleValidate = () => {
  emits('validate')
}
</script>

<template>
  <section class="space-y-3">
    <label
      for="pin-input"
      :class="[currentStyles.label, 'text-xs flex items-center gap-0.5']"
    >
      <p>
        Ingresa el PIN de quien
        <span class="font-semibold">{{ actionText }}</span>
        la asignación
        <span v-if="user">({{ user.nombre }})</span>
        <span v-if="isInvalidRecipient" class="text-red-500 font-medium">
          - Un agente no puede recibir
        </span>
      </p>

      <ArrowUp v-if="type === 'sender'" class="size-4 text-green-500" />
      <ArrowDown v-else class="size-4 text-red-500" />
    </label>

    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
          <LockIcon class="size-6" :class="currentStyles.icon" />
        </div>

        <input
          id="pin-input"
          type="password"
          :value="pin"
          @input="handleInput"
          class="bg-gray-50 text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5 disabled:bg-opacity-60"
          :class="currentStyles.input"
          :disabled="status === 'success' || isVerifying"
          placeholder="Ingresa tu PIN aquí"
          autocomplete="off"
        />
      </div>

      <button
        @click="handleValidate"
        class="btn btn-primary disabled:bg-opacity-50 min-w-[80px]"
        :disabled="isVerifying || status === 'success' || !pin.trim()"
      >
        <span v-if="isVerifying">...</span>
        <span v-else-if="status === 'success'">✓</span>
        <span v-else>Validar</span>
      </button>
    </div>

    <p v-if="errorMessage" :class="[currentStyles.message, 'text-xs mt-1']">
      {{ errorMessage }}
    </p>
  </section>
</template>
