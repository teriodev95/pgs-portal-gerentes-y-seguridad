<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ExpenseFormData } from '../types'

// Components
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import ImageCapture from '@/shared/components/forms/ImageCapture.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

// Interface - Props - Emits

const $props = defineProps<{
  usuarioId: number
  isSaving?: boolean
  expense?: ExpenseFormData
}>()

const emit = defineEmits<{
  (e: 'submit', data: ExpenseFormData): void
}>()

// State definitions
const formData = ref<ExpenseFormData>({
  concepto: '',
  litros: 0,
  monto: 0,
  urlRecibo: '',
  reembolsado: false,
  tipoGasto: 'OTROS'
})

const isImageCaptureDisabled = computed(() => {
  return !formData.value.tipoGasto || !formData.value.monto
})

const isSubmitDisabled = computed(() => {
  return !formData.value.tipoGasto || !formData.value.monto
})

// Methods
function handleExpenseTypeChange() {
  formData.value.litros = 0
  formData.value.urlRecibo = ''
}

function updateReceiptImage(imageUrl: string) {
  formData.value.urlRecibo = imageUrl
}

function resetForm() {
  formData.value = {
    concepto: '',
    litros: 0,
    monto: 0,
    urlRecibo: '',
    reembolsado: false,
    tipoGasto: 'OTROS'
  }
}

// Expose methods
defineExpose({
  resetForm
})

// Watchers
watch(() => $props.expense, (newExpense) => {
  if (newExpense) {
    formData.value = { ...newExpense }
  } else {
    resetForm()
  }
}, { immediate: true })
</script>

<template>
  <form @submit.prevent="emit('submit', { ...formData })" class="h-full space-y-4">
    <div class="space-y-2">
      <InputSelect id="categoria" placeholder="Elige la categoria" v-model="formData.tipoGasto"
        @change="handleExpenseTypeChange" :is-disabled="!!expense">
        <option value="CASETAS">Casetas</option>
        <option value="MANTENIMIENTO_VEHICULAR">Mantenimineto</option>
        <option value="GASOLINA">Gasolina</option>
        <option value="CELULAR">Celular</option>
        <option value="OTROS">Otros</option>
      </InputSelect>

      <div class="flex justify-between items-center gap-2">
        <div class="space-y-2" v-if="formData.tipoGasto === 'GASOLINA'">
          <LabelForm for="litros">Litros</LabelForm>
          <InputGeneric id="litros" placeholder="Cantidad de litros" type="number" v-model="formData.litros"
            :is-disabled="!!expense" min="0" />
        </div>

        <div class="flex-grow space-y-2">
          <LabelForm for="monto">Monto</LabelForm>
          <InputGeneric id="monto" placeholder="Escribe el monto" type="number" v-model="formData.monto"
            :is-disabled="!!expense" min="0" step="0.01" />
        </div>
      </div>

      <div class="space-y-2">
        <LabelForm for="concepto">Concepto</LabelForm>
        <InputGeneric id="concepto" placeholder="Escribe la descripcion" type="text" v-model="formData.concepto"
          :is-disabled="!!expense" :is-required="false" />
      </div>

      <template v-if="!expense">
        <ImageCapture :is-disabled="isImageCaptureDisabled" :is-image-captured="formData.urlRecibo !== ''"
          :usuario-id="usuarioId" :form-data="formData" @image-url="updateReceiptImage" />
      </template>
      <template v-else>
        <img v-if="formData.urlRecibo" :src="formData.urlRecibo" alt="Recibo" class="w-full rounded-lg object-cover" />
      </template>
    </div>

    <BtnComponent 
      v-if="!expense" 
      type="submit" 
      variant="primary" 
      full-width
      :disabled="isSubmitDisabled"
      :loading="isSaving"
    >
      Guardar
    </BtnComponent>
  </form>
</template>