<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IIncident, IIncidentFormData } from '../types'

// Components
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'

// Props & Emits definition
const $props = defineProps<{
  isSaving?: boolean
  incident?: IIncident
}>()

const $emit = defineEmits<{
  (e: 'submit', data: IIncidentFormData): void
}>()

// Default form values
const defaultFormValues = (): IIncidentFormData => ({
  categoria: 'incidente',
  comentario: '',
  monto: 0,
  tipo: 'egreso',
}) 

// State
const isIncidentTypeDisabled = ref(false)
const formData = ref<IIncidentFormData>(defaultFormValues())

// Methods
function handleSubmit() { $emit('submit', { ...formData.value })}
function resetForm() { formData.value = defaultFormValues() }

function handleCategoryChange(category: string) {
  if (category === 'nomina') {
    formData.value.tipo = 'egreso'
    isIncidentTypeDisabled.value = true
    return
  }

  isIncidentTypeDisabled.value = false
}

// Watchers
watch(() => $props.incident, (newIncident) => {
  if (newIncident) {
    formData.value = { ...newIncident }
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => formData.value.categoria, handleCategoryChange)

// Expose methods to parent
defineExpose({
  resetForm
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="h-full space-y-4">
    <div class="space-y-2">
      <!-- Category Selection -->
      <div class="space-y-2">
        <LabelForm for="categoria">Categoria</LabelForm>
        <InputSelect id="categoria" placeholder="Elige la categoria" v-model="formData.categoria"
          :is-disabled="!!$props.incident">
          <option value="incidente">Incidente</option>
          <option value="reposicion">Reposición</option>
          <option value="nomina">Nomina</option>
        </InputSelect>
      </div>

      <!-- Type Selection -->
      <div class="space-y-2">
        <LabelForm for="tipo">Tipo</LabelForm>
        <InputSelect id="tipo" placeholder="Elige el tipo" v-model="formData.tipo"
          :is-disabled="!!$props.incident || isIncidentTypeDisabled">
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
        </InputSelect>
      </div>

      <!-- Comment Field -->
      <div class="space-y-2">
        <LabelForm for="comentario">Comentario</LabelForm>
        <InputGeneric id="comentario" placeholder="Escribe un comentario" type="text" v-model="formData.comentario"
          :is-disabled="!!$props.incident" :is-required="false" />
      </div>

      <!-- Amount Field -->
      <div class="space-y-2">
        <LabelForm for="monto">Monto</LabelForm>
        <InputGeneric id="monto" placeholder="Digita el monto" type="number" v-model="formData.monto"
          :is-disabled="!!$props.incident" :is-required="false" />
      </div>
    </div>

    <!-- Submit Button (only shown when not editing an existing incident) -->
    <button v-if="!$props.incident" type="submit" class="btn btn-primary w-full disabled:bg-opacity-50"
      :disabled="$props.isSaving">
      {{ $props.isSaving ? 'Guardando...' : 'Guardar' }}
    </button>
  </form>
</template>