<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { ref } from 'vue'
import type { SaleDetails, SaleFormData } from '../types'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

// Components
import CreateSaleBottomSheetContent from './CreateSaleBottomSheetContent.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'

// Interface - Props - Emits
defineProps<{
  selectedSale?: SaleDetails
  isSaving: boolean
  gerenciaSelected?: string
}>()

const emit = defineEmits<{
  submit: [data: SaleFormData]
  closed: []
}>()

// State definitions
const bottomSheetRef = ref<InstanceType<typeof VueBottomSheet>>()
const saleFormRef = ref<InstanceType<typeof CreateSaleBottomSheetContent>>()

// Methods
function open(): void {
  bottomSheetRef.value?.open()
}

function close(): void {
  bottomSheetRef.value?.close()
}

function handleClose(): void {
  saleFormRef.value?.clearForm()
  emit('closed')
}

function handleSubmit(data: SaleFormData): void {
  emit('submit', data)
}

// Expose methods
defineExpose({
  open,
  close
})
</script>

<template>
  <vue-bottom-sheet 
    ref="bottomSheetRef" 
    :max-width="1000" 
    :max-height="1500" 
    @closed="handleClose"
  >
    <div class="p-4 space-y-4">
      <h1 class="title">Crear Nueva Venta</h1>

      <AlertMsg 
        v-if="gerenciaSelected" 
        type="info" 
        label="Estás creando una venta"
        :message="`en la gerencia ${gerenciaSelected}`" 
      />

      <CreateSaleBottomSheetContent 
        :is-disabled="isSaving" 
        ref="saleFormRef" 
        @action:save="handleSubmit" 
      />
    </div>
  </vue-bottom-sheet>
</template>