<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  agencyName: string
  status: string
}

const props = defineProps<Props>()

const isActive = computed(() => props.status === 'ACTIVA')
const statusText = computed(() => isActive.value ? 'Activa' : 'Vacante')
const statusClasses = computed(() => 
  isActive.value
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
)
const dotClasses = computed(() => 
  isActive.value ? 'bg-green-500' : 'bg-gray-500'
)
</script>

<template>
  <div class="space-y-2">
    <h5 class="title">Status de Agencia</h5>
    
    <div class="flex items-center gap-2">
      <span class="text-gray-400">{{ agencyName }}</span>
      <span 
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
        :class="statusClasses"
      >
        <span class="me-1 h-2 w-2 rounded-full" :class="dotClasses"></span>
        {{ statusText }}
      </span>
    </div>
  </div>
</template>