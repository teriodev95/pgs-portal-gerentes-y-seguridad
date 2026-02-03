<script setup lang="ts">
import InputValidation from '@/shared/components/forms/InputValidation.vue'
import CameraVideoCapture from './CameraVideoCapture.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

interface Props {
  userType: 'agente' | 'gerente'
  userName: string
  correctPin: string
  isPasswordCorrect: boolean
  isVerificationCompleted: boolean
  pinValue: string
}

interface Emit {
  (event: 'password-validation', isCorrect: boolean): void
  (event: 'continue'): void
  (event: 'update:pinValue', value: string): void
}

defineProps<Props>()
defineEmits<Emit>()
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-6">
      <div class="space-y-2">
        <TextCT class="title">Proceso de verificación</TextCT>
        <TextCT>
          Añade los métodos de validación para el usuario {{ userName }}: PIN,
          reconocimiento facial y autenticación por voz.
        </TextCT>
      </div>

      <InputValidation
        :correctPin="correctPin"
        @password-validation="$emit('password-validation', $event)"
        :label="`PIN ${userType === 'agente' ? 'Agente' : 'Gerente'}`"
        :modelValue="pinValue"
        @update:modelValue="$emit('update:pinValue', $event)"
      />

      <CameraVideoCapture v-if="isPasswordCorrect" :mode="userType" />
    </div>

    <BtnComponent
      @click="$emit('continue')"
      full-width
      v-show="isVerificationCompleted"
    >
      Continuar
    </BtnComponent>
  </div>
</template>