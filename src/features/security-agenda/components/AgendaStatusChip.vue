<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_STYLE } from '../constants'
import type { AgendaActivityStatus } from '../types'

const props = defineProps<{ status: AgendaActivityStatus }>()

const style = computed(() => STATUS_STYLE[props.status])
</script>

<template>
  <!-- El estado lo mueve Administración: el chip informa, no invita a tocar.
       Sin chevron, sin sombra, sin fondo de botón. Icono + texto además del color. -->
  <span class="inline-flex items-center gap-1 text-xs font-medium">
    <component :is="style.icon" class="size-3.5" :stroke-width="2" aria-hidden="true" />
    {{ style.label }}
  </span>
</template>
