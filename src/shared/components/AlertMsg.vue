<script lang="ts" setup>
import { computed } from 'vue';

// Definimos las propiedades con sus tipos
interface Props {
  type: 'info' | 'danger' | 'success' | 'warning' | 'dark';
  message?: string;
  label?: string;
  showBoldLabel?: boolean;
}

// Definimos valores predeterminados para las propiedades
const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  message: 'Change a few things up and try submitting again.',
  label: '',
  showBoldLabel: true
});

const alertClasses = computed(() => {
  const baseClasses = 'p-4 text-sm rounded-lg';
  
  const typeClasses = {
    info: 'text-blue-800 bg-blue-50 dark:bg-gray-800 dark:text-blue-400',
    danger: 'text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400',
    success: 'text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400',
    warning: 'text-yellow-800 bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300',
    dark: 'text-gray-800 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
  };

  const specificClasses = typeClasses[props.type];
  
  return `${baseClasses} ${specificClasses}`;
});

</script>

<template>
  <div 
    :class="alertClasses" 
    role="alert"
  >
    <span v-if="showBoldLabel" class="font-medium">{{ label }}</span> {{ message }}
    <slot></slot>
  </div>
</template>

