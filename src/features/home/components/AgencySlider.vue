<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/shared/stores';
import type { IAgencyBasicInfo } from '@/interfaces'

// Interface - Props - Emits
const $props = defineProps<{
  agencies: IAgencyBasicInfo[]
  canSelect: boolean
}>()

const $emits = defineEmits<{
  (e: 'selectAgency'): void
}>()

// Services, Composables and Stores initialization
const $store = useStore()

// State definitions
const selectedAgency = computed(() => $store.agencySelected)
const formatAgentName = computed(() => {
  return (agentName: string): string => {
    if (!agentName) return ''

    const words = agentName.split(' ')
    return words.slice(0, 2).join(' ')
  }
})

// Methods
function selectAgency(agency: string): void {
  if (!$props.canSelect) return

  $store.agencySelected = agency
  $emits('selectAgency')
}
</script>

<template>
  <ul class="chip-rail space-x-2">
    <li v-for="(agency, index) in agencies" :key="`agency-${index}`" class="flex-shrink-0" :class="{
      'cursor-pointer': canSelect,
      'cursor-not-allowed': !canSelect
    }" @click="() => selectAgency(agency.agencia)">
      <!-- El chip sin elegir lleva su propio blanco: sobre el gris de la hoja,
           sin fondo, se confundía con la barra. -->
      <div :class="[
        agency.agencia === selectedAgency ? 'bg-slate-700 text-white' : 'bg-white',
        'flex flex-col rounded-xl border px-4 py-2 text-[0.8rem] shadow-md'
      ]">
        {{ agency.agencia }}
        <span class="text-[0.4rem]">{{ formatAgentName(agency.agente) }}</span>
      </div>
    </li>
  </ul>
</template>