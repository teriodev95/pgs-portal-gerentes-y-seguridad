<script setup lang="ts">
import { useConnectionStatus } from '@/shared/composables/useConnectionStatus';

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */
const { isOnline, message } = useConnectionStatus();
</script>

<template>
  <div
    v-if="!isOnline"
    class="fixed bottom-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50"
  >
    <p>{{ message }}</p>
  </div>
</template>