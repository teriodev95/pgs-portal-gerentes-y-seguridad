<script setup lang="ts">
import { ref } from 'vue'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
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
  open: boolean
  selectedPayment?: ICobranza
  isProcessing: boolean
  paymentForm: PaymentForm
  slideText?: string
  slideSuccessText?: string
  slideButtonColor?: string
}

interface Emits {
  (event: 'update:open', value: boolean): void
  (event: 'update:paymentForm', value: PaymentForm): void
  (event: 'submit'): void
  (event: 'completed'): void
}

withDefaults(defineProps<Props>(), {
  slideText: 'Registrar',
  slideSuccessText: 'Completado',
  slideButtonColor: 'rgb(26 86 219 / 1)'
})

const emit = defineEmits<Emits>()

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

function handleOpenChange(value: boolean) {
  if (!value) {
    slideUnlockRef.value?.reset()
  }
  emit('update:open', value)
}

function resetSlide() {
  slideUnlockRef.value?.reset()
}

defineExpose({
  resetSlide
})
</script>

<template>
  <Drawer :open="open" @update:open="handleOpenChange">
    <DrawerContent class="max-h-[90vh]">
      <div class="mx-auto w-full max-w-lg overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Registrar Pago</DrawerTitle>
          <DrawerDescription>
            Completa la información del pago y desliza para confirmar
          </DrawerDescription>
        </DrawerHeader>

        <div class="px-4 pb-6">
          <FormCreatePayment
            :model-value="paymentForm"
            @update:modelValue="updatePaymentForm"
            :show-amount-input="true"
            :selectedPayment="selectedPayment"
            :isProcessing="isProcessing"
            @action:submit="handleSubmit"
          />

          <div class="space-y-2 mt-4">
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
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
