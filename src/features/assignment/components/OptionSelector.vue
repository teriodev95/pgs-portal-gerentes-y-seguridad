<script setup lang="ts">
import { watch, onMounted } from 'vue';

// Interface - Props - Emits
interface RadioListSelectorProps {
  options: string[];
  modelValue: string;
  type: 'sender' | 'recipient';
  text?: string;
}

const props = defineProps<RadioListSelectorProps>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// Methods
const handleOptionSelect = (option: string): void => {
  emit('update:modelValue', option);
};

const autoSelectSingleOption = () => {
  if (props.options.length === 1 && props.modelValue !== props.options[0]) {
    emit('update:modelValue', props.options[0]);
  }
};

// Watchers
watch(() => props.options, () => {
  autoSelectSingleOption();
}, { immediate: true });

// Lifecycle Hooks
onMounted(() => {
  console.log(props.options);
  autoSelectSingleOption();
});
</script>

<template>
  <div >
    <p class="text-xs font-light text-gray-400 mb-2">
      {{ text }}
    </p>
    <ul
      class="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      <li v-for="(option, index) in options" :key="option" class="w-full border-b border-gray-200 dark:border-gray-600"
        :class="{ 'rounded-t-lg': index === 0, 'rounded-b-lg': index === options.length - 1 }">
        <div class="flex items-center ps-3">
          <input :id="`list-radio-${option}`" type="radio" :value="option" :name="`radio-${type}`"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
            :checked="modelValue === option" @change="handleOptionSelect(option)">
          <label :for="`list-radio-${option}`"
            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
            {{ option }}
          </label>
        </div>
      </li>
    </ul>
  </div>
</template>