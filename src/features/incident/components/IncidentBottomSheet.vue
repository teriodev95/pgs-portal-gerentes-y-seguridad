<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { ref } from 'vue'
import type { IIncident, IIncidentFormData } from '../types'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

// Components
import IncidentForm from './IncidentForm.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'

// Interface - Props - Emits
defineProps<{
  selectedIncident?: IIncident
  usuarioId: number
  isSaving: boolean
  isUserManager: boolean
  gerenciaSelected?: string
}>()

const emit = defineEmits<{
  submit: [data: IIncidentFormData]
  closed: []
}>()

// State definitions
const bottomSheetRef = ref<InstanceType<typeof VueBottomSheet>>()
const incidentFormRef = ref<InstanceType<typeof IncidentForm>>()

// Methods
function open(): void {
  bottomSheetRef.value?.open()
}

function close(): void {
  bottomSheetRef.value?.close()
}

function handleClose(): void {
  incidentFormRef.value?.resetForm()
  emit('closed')
}

function handleSubmit(data: IIncidentFormData): void {
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
      <h1 class="title">Incidentes y salidas</h1>

      <AlertMsg 
        v-if="!selectedIncident && isUserManager" 
        type="info" 
        label="Estás agregando un incidente/salida"
        :message="`en la gerencia ${gerenciaSelected}`" 
      />

      <IncidentForm 
        :incident="selectedIncident" 
        :usuario-id="usuarioId"
        :is-saving="isSaving" 
        ref="incidentFormRef" 
        @submit="handleSubmit" 
      />
    </div>
  </vue-bottom-sheet>
</template>