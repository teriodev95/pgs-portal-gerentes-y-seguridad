<script setup lang="ts">
/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */
interface InputSelectProps {
  isDisabled?: boolean;
  id: string;
  isRequired?: boolean;
  modelValue: string | number;
  placeholder?: string;
}

const $emit = defineEmits(['update:modelValue']);
const props = withDefaults(defineProps<InputSelectProps>(), {
  isRequired: true,
  isDisabled: false,
});

/**
 * handleChange
 * @param event
 */
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target.value;

  // Si el modelValue original es un número, convertir el valor
  if (typeof props.modelValue === 'number') {
    $emit('update:modelValue', value === '' ? 0 : Number(value));
  } else {
    $emit('update:modelValue', value);
  }
};
</script>

<template>
  <select
    :disabled="isDisabled"
    :id="id"
    :placeholder="placeholder"
    :required="isRequired"
    :value="modelValue"
    @change="handleChange"
    class="rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-sm bg-white border border-slate-100 !text-customBlueDark dark:!text-customBlue dark:bg-customDark dark:border-customBlue/30"
  >
    <slot></slot>
  </select>
</template>