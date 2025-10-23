<script setup lang="ts">
import { computed } from 'vue';
/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */

interface Emits {
  (event: 'update:modelValue', value: string | number): void;
  (event: 'action:blurred', value: string): void; // Evento para readonly
}

interface InputGenericProps {
  id: string;
  type: string;
  modelValue: string | number;
  isRequired?: boolean;
  readonly?: boolean; // Propiedad opcional para readonly
  maxlength?: number; // Propiedad opcional para maxlength
  placeholder?: string;
  min?: string;
  max?: string;
  isDisabled?: boolean;
}

const $emit = defineEmits<Emits>();
const $props = withDefaults(defineProps<InputGenericProps>(), {
  isRequired: true,
  isDisabled: false,
  readonly: false, // Valor por defecto para readonly
  maxlength: undefined, // Valor por defecto para maxlength
});

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */
const optionalAttributes = computed(() => {
  const attributes: Record<string, string | undefined> = {};
  if ($props.min !== undefined) attributes.min = $props.min;
  if ($props.max !== undefined) attributes.max = $props.max;
  return attributes;
});

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */

/**
 * handleBlur
 * @param event
 */
const handleBlur = (event: Event) => {
  const target = event.target as HTMLInputElement;
  $emit('action:blurred', target.value);
};

/**
 * handleInput
 * @param event
 */
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;

  
  $emit('update:modelValue', target.value);
};
</script>

<template>
  <input
    :disabled="isDisabled"
    :id="id"
    :maxlength="maxlength"
    :placeholder="placeholder"
    :readonly="readonly"
    :required="isRequired"
    :type="type"
    :value="modelValue"
    class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-[#083040] focus:ring-[#083040] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
    v-bind="optionalAttributes"
    @blur="handleBlur"
    @input="handleInput"
  />

</template>
