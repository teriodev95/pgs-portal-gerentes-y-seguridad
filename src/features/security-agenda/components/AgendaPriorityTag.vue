<script setup lang="ts">
import { computed } from 'vue'
import { PRIORITY_STYLE } from '../constants'
import type { AgendaPriority } from '../types'

const props = defineProps<{ priority: AgendaPriority }>()

const style = computed(() => PRIORITY_STYLE[props.priority])
</script>

<template>
  <!-- La prioridad nunca pinta el bloque: punto de 8px + texto. El color de
       fondo está reservado al estado. -->
  <span class="inline-flex items-center gap-1.5 text-xs">
    <span class="size-2 shrink-0 rounded-full" :class="style.dot" aria-hidden="true" />
    {{ style.label }}
  </span>
</template>
