<script setup lang="ts">
import { computed } from 'vue'
import type { IReport } from '../types/debts.types'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import DataField from '@/shared/components/DataField.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import { toCurrency } from '@/shared/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps<{
  isOpen: boolean
  reports: IReport[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  'dialog:close': []
}>()

const totalSum = computed(() => {
  return props.reports.reduce((sum, report) => sum + report.debitoTotal, 0)
})

function handleClose(): void {
  emit('dialog:close')
}
</script>

<template>
  <Dialog
    :open="isOpen"
    @update:open="(value) => value ? null : (!isLoading && handleClose())"
  >
    <DialogContent
      class="rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto"
      :class="{ 'dialog-loading': isLoading }"
      :disable-outside-pointer-events="isLoading"
    >
      <DialogHeader>
        <DialogTitle>Débitos de Gerencia</DialogTitle>
        <DialogDescription v-if="isLoading">
          Cargando información de débitos...
        </DialogDescription>
      </DialogHeader>

      <div v-if="!isLoading && reports.length > 0" class="space-y-4">
        <CardContainer
          v-for="report in reports"
          :key="`${report.agencia}-${report.semana}-${report.anio}`"
          :title="`Agencia ${report.agencia}`"
        >
          <DataField label="Miércoles" :value="toCurrency(report.debitoMiercoles)" />
          <DataField label="Jueves" :value="toCurrency(report.debitoJueves)" />
          <DataField label="Viernes" :value="toCurrency(report.debitoViernes)" />
          <DataField label="Total" :value="toCurrency(report.debitoTotal)" />
        </CardContainer>

        <CardContainer title="Total General">
          <DataField label="Total de Todas las Agencias" :value="toCurrency(totalSum)" class="text-lg font-bold" />
        </CardContainer>
      </div>

      <div v-else-if="!isLoading && reports.length === 0" class="text-center py-8">
        <h3 class="text-lg font-medium text-gray-900">No hay datos de débitos</h3>
        <p class="text-gray-500">No se encontraron reportes para mostrar.</p>
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <DialogFooter v-if="!isLoading">
        <BtnComponent
          variant="primary"
          outline
          @click="handleClose"
        >
          Cerrar
        </BtnComponent>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.dialog-loading * {
  transition: opacity 0.15s ease-in-out;
}
</style>