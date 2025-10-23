<script setup lang="ts">
import { useRouter, type RouteLocationRaw } from 'vue-router'
import { getDateTime } from '@/shared/utils'

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */

import ArrowLeftIcon from '@/shared/components/icons/ArrowLeftIcon.vue'

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */

export interface Emit {
  (e: 'onBack'): void
}
export interface Props {
  back?: RouteLocationRaw | boolean
  label: string
  user?: string
}

const $emit = defineEmits<Emit>()
const $props = defineProps<Props>()
const $router = useRouter()

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */

/**
 * handleBackAction
 */
function handleBackAction() {
  if ($props.back) {
    if (typeof $props.back === 'boolean') $router.back()
    else $router.push($props.back)
  }
  $emit('onBack')
}
</script>

<template>
  <nav class="flex items-center gap-3 px-4 py-2">
    <!-- Back -->
    <div
      class="h-10 w-10 cursor-pointer rounded-full bg-blue-700 p-2 opacity-95 shadow-md"
      @click="handleBackAction"
    >
      <ArrowLeftIcon class="text-white" />
    </div>

    <div class="flex flex-col opacity-95" v-if="label">
      <p class="title">
        {{ label }} <span>{{ user }}</span>
      </p>
      <p class="subtitle">{{ getDateTime() }}</p>
    </div>
  </nav>
</template>
