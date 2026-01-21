<script setup lang="ts">
import type { ReportType } from '../types'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import TextCT from '@/shared/components/ui/TextCT.vue';

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
    <TextCT as="h2" variant="title">
      Selecciona el tipo de reporte que deseas generar.
    </TextCT>

    <TextCT>
      Este proceso puede tardar unos segundos. Por favor, mantén abierta esta ventana hasta que la generación del reporte haya finalizado. Luego, selecciona el grupo al que deseas enviar la imagen.
    </TextCT>

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