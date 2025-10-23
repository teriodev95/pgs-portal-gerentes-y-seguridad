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
withDefaults(defineProps<InputSelectProps>(), {
  isRequired: true,
  isDisabled: false,
});

/**
 * handleChange
 * @param event
 */
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  $emit('update:modelValue', target.value);
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