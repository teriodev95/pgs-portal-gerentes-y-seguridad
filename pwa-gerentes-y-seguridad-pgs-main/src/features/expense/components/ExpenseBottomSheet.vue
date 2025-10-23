<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { ref } from 'vue'
import type { ExpenseFormData, WeeklyExpense } from '../types'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

// Components
import ExpenseForm from './ExpenseForm.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'

// Interface - Props - Emits
defineProps<{
  selectedExpense?: WeeklyExpense
  usuarioId: number
  isSaving: boolean
  isUserManager: boolean
  gerenciaSelected?: string
}>()

const emit = defineEmits<{
  submit: [data: ExpenseFormData]
  closed: []
}>()

// State definitions
const bottomSheetRef = ref<InstanceType<typeof VueBottomSheet>>()
const expenseFormRef = ref<InstanceType<typeof ExpenseForm>>()

// Methods
function open(): void {
  bottomSheetRef.value?.open()
}

function close(): void {
  bottomSheetRef.value?.close()
}

function handleClose(): void {
  expenseFormRef.value?.resetForm()
  emit('closed')
}

function handleSubmit(data: ExpenseFormData): void {
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
      <h1 class="title">Información del gasto</h1>

      <AlertMsg 
        v-if="isUserManager" 
        type="info" 
        label="Estás agregando un gasto"
        :message="`en la gerencia ${gerenciaSelected}`" 
      />

      <ExpenseForm 
        v-if="selectedExpense" 
        :expense="selectedExpense" 
        :usuario-id="usuarioId"
        :is-saving="isSaving" 
        ref="expenseFormRef" 
        @submit="handleSubmit" 
      />
      <ExpenseForm 
        v-else 
        :usuario-id="usuarioId" 
        :is-saving="isSaving" 
        ref="expenseFormRef"
        @submit="handleSubmit" 
      />
    </div>
  </vue-bottom-sheet>
</template>