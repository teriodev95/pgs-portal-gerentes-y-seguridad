<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { IUserVerificationPin } from '@/features/assignment/types'
import { useValidationPin, type ValidationPinType } from '../composables'

// Components
import ArrowDown from '@/shared/components/icons/ArrowDown.vue'
import ArrowUp from '@/shared/components/icons/ArrowUp.vue'
import LockIcon from '@/shared/components/icons/LockIcon.vue'

// Interface
interface Emit {
  (e: 'update:pin', pin: string): void
  (e: 'password-validation', isCorrect: boolean, msg?: string): void
  (e: 'user', user: IUserVerificationPin): void
}

export interface Props {
  label: string
  pin: string
  type: ValidationPinType
}

// Props and emits
const emits = defineEmits<Emit>()
const props = defineProps<Props>()

// Composable
const {
  status,
  user,
  isVerifyingPin,
  isInvalidRecipient,
  currentStyles,
  handleInput,
  validatePin,
  resetStatus
} = useValidationPin({
  pin: toRef(props, 'pin'),
  type: props.type,
  emits
})

// Computed
const actionText = computed(() => props.type === 'sender' ? 'entrega' : 'recibe')

// Expose methods for parent component
defineExpose({
  resetStatus
})
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
          :disabled="status === 'success' || isVerifyingPin"
          placeholder="Ingresa tu PIN aquí"
          autocomplete="off"
        />
      </div>

      <button 
        @click="validatePin" 
        class="btn btn-primary disabled:bg-opacity-50 min-w-[80px]"
        :disabled="isVerifyingPin || status === 'success' || !pin.trim()"
      >
        <span v-if="isVerifyingPin">...</span>
        <span v-else-if="status === 'success'">✓</span>
        <span v-else>Validar</span>
      </button>
    </div>
  </section>
</template>