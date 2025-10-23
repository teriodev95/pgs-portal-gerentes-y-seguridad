<script setup lang="ts">
import { computed } from 'vue';

// Interfaces
interface Props {
  variant?: 'primary' | 'secondary' | 'green' | 'yellow' | 'red' | 'white-outline' | 'manual-number' | 'manual-reason';
  outline?: boolean;
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

interface Emits {
  (e: 'click', event: MouseEvent): void;
}

// Props con valores por defecto
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  outline: false,
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false,
});

// Emits
const emit = defineEmits<Emits>();

// Computed para las clases CSS
const buttonClasses = computed(() => {
  const classes: string[] = [];
  
  // Clase base según el tamaño
  if (props.size === 'sm') {
    classes.push('btn-sm');
  } else {
    classes.push('btn');
  }
  
  // Clases específicas por variante
  switch (props.variant) {
    case 'primary':
      classes.push(props.outline ? 'btn-primary-outline' : 'btn-primary');
      break;
    case 'secondary':
      classes.push(props.outline ? 'btn-secondary-outline' : 'btn-secondary');
      break;
    case 'green':
      classes.push(props.outline ? 'btn-green-outline' : 'btn-green');
      break;
    case 'yellow':
      classes.push(props.outline ? 'btn-yellow-outline' : 'btn-yellow');
      break;
    case 'red':
      classes.push(props.outline ? 'btn-red-outline' : 'btn-red');
      break;
    case 'white-outline':
      classes.push('btn-white-outline');
      break;
    case 'manual-number':
      classes.push('btn-manual-number');
      break;
    case 'manual-reason':
      classes.push('btn-manual-reason');
      break;
  }
  
  // Clase de ancho completo
  if (props.fullWidth) {
    classes.push('w-full');
  }
  
  // Estados
  if (props.disabled || props.loading) {
    classes.push('opacity-50', 'cursor-not-allowed');
  }
  
  // Efectos hover y focus (solo si no está deshabilitado)
  if (!props.disabled && !props.loading) {
    classes.push('hover:scale-[1.02]', 'active:scale-[0.98]', 'transition-all', 'duration-150');
  }
  
  return classes.join(' ');
});

// Función para manejar el click
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Slot para contenido del botón -->
    <div class="flex items-center justify-center gap-2">
      <!-- Loading spinner -->
      <div
        v-if="loading"
        class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-label="Cargando..."
      />
      
      <!-- Slot para ícono izquierdo -->
      <slot name="icon-left" />
      
      <!-- Contenido principal -->
      <span v-if="$slots.default || loading">
        <slot>{{ loading ? 'Cargando...' : '' }}</slot>
      </span>
      
      <!-- Slot para ícono derecho -->
      <slot name="icon-right" />
    </div>
  </button>
</template>

<style scoped>
/* Los estilos CSS que ya tienes definidos se aplicarán automáticamente */
</style>