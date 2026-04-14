<script setup lang="ts">
import TextCT from '@/shared/components/ui/TextCT.vue';

defineProps<{
  modelValue: boolean | null;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>

<template>
  <div class="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <TextCT as="p" weight="semibold">Origen del efectivo:</TextCT>

    <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
      <input
        type="radio"
        name="impactSelector"
        :checked="modelValue === false"
        class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
        @change="$emit('update:modelValue', false)"
      />
      <div class="flex-1">
        <TextCT as="p" weight="medium">Cobranza de agencias</TextCT>
        <TextCT variant="tertiary" as="p">No impacta en cierre - ya está en cobranza</TextCT>
      </div>
    </label>

    <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
      <input
        type="radio"
        name="impactSelector"
        :checked="modelValue === true"
        class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
        @change="$emit('update:modelValue', true)"
      />
      <div class="flex-1">
        <TextCT as="p" weight="medium">Otro origen</TextCT>
        <TextCT variant="tertiary" as="p">Sí impacta en cierre como ingreso</TextCT>
      </div>
    </label>
  </div>
</template>
