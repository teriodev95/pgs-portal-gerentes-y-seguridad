<script setup lang="ts">
import TextCT from '@/shared/components/ui/TextCT.vue';
import BtnComponent from '@/shared/components/BtnComponent.vue';
import { computed } from 'vue';

interface Props {
  correctionType: string;
  selectedAction: string;
  showSelection: boolean;
}

interface Emits {
  (event: 'update:action', value: 'correct' | 'delete'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const isCorrectSelected = computed(() => props.selectedAction === 'correct');
const isDeleteSelected = computed(() => props.selectedAction === 'delete');
</script>

<template>
  <div v-if="showSelection" class="space-y-2">
    <div class="space-y-1">
      <TextCT variant="secondary">¿Qué deseas hacer?</TextCT>
      <TextCT variant="primary">Selecciona si quieres ajustar el monto o eliminar el registro por completo</TextCT>
    </div>

    <div class="flex space-x-2 mb-4">
      <BtnComponent
        type="button"
        :variant="isCorrectSelected ? 'primary' : 'secondary'"
        size="sm"
        @click="$emit('update:action', 'correct')"
      >
        Corregir monto
      </BtnComponent>

      <BtnComponent
        type="button"
        :variant="isDeleteSelected ? 'red' : 'secondary'"
        size="sm"
        @click="$emit('update:action', 'delete')"
      >
        Eliminar {{ correctionType }}
      </BtnComponent>
    </div>
  </div>
</template>
