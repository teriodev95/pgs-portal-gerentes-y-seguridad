<script setup lang="ts">
import type { ReportType } from '../types'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import ReportImagePreview from './ReportImagePreview.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

defineProps<{
  isOpen: boolean
  reportType: ReportType
  isLoading: boolean
  imageUrl: string
  isSharing?: boolean
}>()

const emit = defineEmits<{
  'dialog:close': []
  'report:share': []
}>()

function handleClose(): void {
  emit('dialog:close')
}

function handleShare(): void {
  emit('report:share')
}
</script>

<template>
  <Dialog
    :open="isOpen"
    @update:open="(value) => value ? null : (!isLoading && handleClose())"
  >
    <DialogContent
      class="rounded-lg"
      :class="{ 'dialog-loading': isLoading }"
      :disable-outside-pointer-events="isLoading"
    >
      <DialogHeader>
        <DialogTitle>Reporte de {{ reportType }}</DialogTitle>
        <DialogDescription v-if="isLoading">
          Por favor, no cierres esta pantalla y asegúrate de tener conexión.
          Esta operación tomará menos de un minuto.
        </DialogDescription>
      </DialogHeader>

      <ReportImagePreview
        :image-url="imageUrl"
        :is-loading="isLoading"
      />

      <DialogFooter v-if="!isLoading && imageUrl">
        <div class="flex flex-col gap-2 w-full">
          <BtnComponent
            :disabled="isSharing"
            @click="handleShare"
          >
            {{ isSharing ? 'Compartiendo...' : 'Compartir Reporte' }}
          </BtnComponent>

          <BtnComponent
            variant="primary"
            outline
            :disabled="isSharing"
            @click="handleClose"
          >
            Cancelar
          </BtnComponent>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.dialog-loading * {
  transition: opacity 0.15s ease-in-out;
}
</style>