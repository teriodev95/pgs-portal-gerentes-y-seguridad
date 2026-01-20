<script setup lang="ts">
import TextCT from '@/shared/components/ui/TextCT.vue';
import { ACTION_BUTTON_VARIANTS } from '../constants/correction.constants';

interface Props {
  correctionType: string;
  selectedAction: string;
  showSelection: boolean;
}

interface Emits {
  (event: 'update:action', value: 'correct' | 'delete'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <div v-if="showSelection" class="space-y-2">
    <div class="space-y-1">
      <TextCT variant="secondary">¿Qué deseas hacer?</TextCT>
      <TextCT variant="primary">Selecciona si quieres ajustar el monto o eliminar el registro por completo</TextCT>
    </div>

    <div class="flex space-x-2 mb-4">
      <button 
        type="button" 
        @click="$emit('update:action', 'correct')" 
        :class="{
          [ACTION_BUTTON_VARIANTS.primary]: selectedAction === 'correct',
          [ACTION_BUTTON_VARIANTS.inactive]: selectedAction !== 'correct'
        }" 
        class="px-3 py-1 rounded-md text-sm font-medium"
      >
        Corregir monto
      </button>
      
      <button 
        type="button" 
        @click="$emit('update:action', 'delete')" 
        :class="{
          [ACTION_BUTTON_VARIANTS.danger]: selectedAction === 'delete',
          [ACTION_BUTTON_VARIANTS.inactive]: selectedAction !== 'delete'
        }" 
        class="px-3 py-1 rounded-md text-sm font-medium"
      >
        Eliminar {{ correctionType }}
      </button>
    </div>
  </div>
</template>
