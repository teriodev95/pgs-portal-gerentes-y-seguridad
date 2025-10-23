<script setup lang="ts">
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  isOpen: boolean
  comment: string
  actionType: string | null
  isLoading?: boolean
}

interface Emits {
  (e: 'update:comment', value: string): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <Dialog :open="isOpen" @update:open="(value) => value ? null : (!props.isLoading && $emit('cancel'))">
    <DialogContent class="rounded-lg" :class="{ 'dialog-loading': props.isLoading }" :disable-outside-pointer-events="props.isLoading">
      <DialogHeader>
        <DialogTitle>{{ props.actionType === 'checked' ? 'Aprobar Solicitud' : 'Rechazar Solicitud' }}</DialogTitle>
        <DialogDescription>
          {{ props.actionType === 'checked' 
            ? '¿Estás seguro de que deseas aprobar esta solicitud de crédito?' 
            : '¿Estás seguro de que deseas rechazar esta solicitud de crédito?' 
          }}
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-2">
        <LabelForm for="comment">
          {{ props.actionType === 'checked' ? 'Comentario (opcional)' : 'Motivo del rechazo' }}
        </LabelForm>
        <InputGeneric 
          id="comment" 
          type="text" 
          :model-value="comment"
          @update:model-value="$emit('update:comment', String($event))"
          :placeholder="props.actionType === 'checked' ? 'Agregar un comentario...' : 'Especifica el motivo del rechazo'"
          :disabled="props.isLoading"
        />
      </div>
      <DialogFooter>
        <div class="flex flex-col gap-2">
          <BtnComponent variant="primary" @click="$emit('confirm')" :disabled="props.isLoading">
            {{ props.isLoading 
              ? (props.actionType === 'checked' ? 'Aprobando...' : 'Rechazando...')
              : (props.actionType === 'checked' ? 'Confirmar Aprobación' : 'Confirmar Rechazo')
            }}
          </BtnComponent>
          <BtnComponent variant="primary" outline @click="$emit('cancel')" :disabled="props.isLoading">
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