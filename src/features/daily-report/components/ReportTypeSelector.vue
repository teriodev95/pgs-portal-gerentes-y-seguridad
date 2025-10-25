<script setup lang="ts">
import type { ReportType } from '../types'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import CardTitle from '@/shared/components/ui/CardTitle.vue'

defineProps<{
  isGenerating?: boolean
}>()

const emit = defineEmits<{
  'report:generate': [type: ReportType]
}>()

function handleGenerateReport(type: ReportType): void {
  emit('report:generate', type)
}
</script>

<template>
  <CardContainer>
    <CardTitle
      title="Selecciona el tipo de reporte que deseas generar."
      subtitle="Este proceso puede tardar unos segundos. Por favor, mantén abierta esta ventana hasta que la generación del reporte haya finalizado. Luego, selecciona el grupo al que deseas enviar la imagen."
    />

    <div class="grid grid-cols-1 gap-2">
      <BtnComponent
        :disabled="isGenerating"
        @click="handleGenerateReport('gerencia')"
      >
        Reporte Gerencia
      </BtnComponent>

      <BtnComponent
        variant="primary"
        outline
        :disabled="isGenerating"
        @click="handleGenerateReport('agencia')"
      >
        Reporte Agencia
      </BtnComponent>
    </div>
  </CardContainer>
</template>