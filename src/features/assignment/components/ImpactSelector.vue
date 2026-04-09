<script setup lang="ts">
import TextCT from '@/shared/components/ui/TextCT.vue';
import BadgetCT from '@/shared/components/ui/BadgetCT.vue';

defineProps<{
  modelValue: boolean | null;
  management: string;
  name: string;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>

<template>
  <div class="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <TextCT as="p" weight="semibold">¿De donde viene este dinero?</TextCT>
    <TextCT variant="tertiary" as="p">Selecciona el origen para que el cierre de {{ management }} cuadre correctamente.</TextCT>

    <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-100 transition-colors">
      <input
        type="radio"
        name="impactSelector"
        :checked="modelValue === false"
        class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
        @change="$emit('update:modelValue', false)"
      />
      <div class="flex-1 space-y-1">
        <div class="flex items-center gap-2">
          <TextCT as="p" weight="medium">Cobranza de agencias</TextCT>
          <BadgetCT value="No suma al cierre" variant="orange" :show-label="false" />
        </div>
        <TextCT variant="tertiary" as="p">Dinero que {{ name }} recogió de las agencias de {{ management }} y esta retornando al gerente</TextCT>
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
      <div class="flex-1 space-y-1">
        <div class="flex items-center gap-2">
          <TextCT as="p" weight="medium">Ingreso nuevo a la gerencia</TextCT>
          <BadgetCT value="Suma al cierre" variant="blue" :show-label="false" />
        </div>
        <TextCT variant="tertiary" as="p">Efectivo que ingresa a {{ management }} desde administración, otra gerencia u otro origen</TextCT>
      </div>
    </label>
  </div>
</template>
