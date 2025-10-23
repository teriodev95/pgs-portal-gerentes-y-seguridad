<script setup lang="ts">
import { ref } from 'vue'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'
import SlideUnlock from 'vue-slide-unlock'
import FormCreatePayment from '@/features/loan/components/FormCreatePayment.vue'
import type { ICobranza } from '@/interfaces'
import type { PaymentSource, RecoverySource } from '@/features/loan/types'

interface PaymentForm {
  amount: number
  paymentSource: PaymentSource
  paymentRecovery: RecoverySource
}

interface Props {
  selectedPayment?: ICobranza
  isProcessing: boolean
  paymentForm: PaymentForm
  maxWidth?: number
  maxHeight?: number
  slideText?: string
  slideSuccessText?: string
  slideButtonColor?: string
}

interface Emits {
  (event: 'update:paymentForm', value: PaymentForm): void
  (event: 'submit'): void
  (event: 'completed'): void
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 1000,
  maxHeight: 1500,
  slideText: 'Registrar',
  slideSuccessText: 'Completado',
  slideButtonColor: 'rgb(26 86 219 / 1)'
})

const emit = defineEmits<Emits>()

const bottomSheetRef = ref<InstanceType<typeof VueBottomSheet>>()
const slideUnlockRef = ref()

function updatePaymentForm(value: PaymentForm) {
  emit('update:paymentForm', value)
}

function handleSubmit() {
  emit('submit')
}

function handleCompleted() {
  emit('completed')
}

function open() {
  bottomSheetRef.value?.open()
}

function close() {
  bottomSheetRef.value?.close()
}

function resetSlide() {
  slideUnlockRef.value?.reset()
}

defineExpose({
  open,
  close,
  resetSlide
})
</script>

<template>
  <vue-bottom-sheet 
    ref="bottomSheetRef" 
    :max-width="maxWidth" 
    :max-height="maxHeight"
  >
    <FormCreatePayment 
      :model-value="paymentForm"
      @update:modelValue="updatePaymentForm"
      :show-amount-input="true" 
      :selectedPayment="selectedPayment" 
      :isProcessing="isProcessing"
      @action:submit="handleSubmit" 
    />
    
    <div class="space-y-2 p-5">
      <slide-unlock 
        ref="slideUnlockRef" 
        :auto-width="true" 
        :circle="true" 
        :disabled="false" 
        :noanimate="false"
        :text="slideText" 
        :success-text="slideSuccessText" 
        name="slideunlock" 
        :style="{
          '--su-color-text-normal': 'white',
          '--su-color-bg': slideButtonColor,
          '--su-color-progress-normal-bg': 'rgb(14 159 110 / 1)',
          '--su-color-progress-complete-bg': 'rgb(14 159 110 / 1)',
          '--su-size-padding': '0'
        }" 
        @completed="handleCompleted" 
      />
    </div>
  </vue-bottom-sheet>
</template>