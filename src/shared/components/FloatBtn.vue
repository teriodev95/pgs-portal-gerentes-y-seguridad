<script setup lang="ts">

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import PlusIcon from '@/shared/components/icons/PlusIcon.vue';

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */
interface Props {
  type: 'primary' | 'secondary'
  text?: string
}

defineProps<Props>()

</script>

<template>
  <button
    class="ml-auto flex items-center justify-center focus:outline-none focus:ring-4 shadow-[0px_0px_11px_4px_rgba(0,0,0,0.2)]"
    :class="{
      'text-white bg-blue-700  hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus:ring-blue-800 rounded-full h-14 w-14': type === 'primary',
      'text-blue-700 bg-white hover:bg-gray-100 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 rounded-lg p-2 space-x-2': type === 'secondary'
    }" type="button">

    <PlusIcon class="size-4" />
    <span v-if="text">{{ text }}</span>
    <span class="sr-only">Open actions menu</span>
  </button>
</template>