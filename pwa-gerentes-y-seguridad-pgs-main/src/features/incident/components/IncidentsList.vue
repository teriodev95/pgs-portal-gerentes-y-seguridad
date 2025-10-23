<script setup lang="ts">
import type { IIncident } from '../types'

// Components
import IncidentCard from './IncidentCard.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import BoxCloseOutline from '@/shared/components/icons/BoxCloseOutline.vue'

// Interface - Props - Emits
defineProps<{
  incidents: IIncident[]
  isLoading: boolean
  hasIncidents: boolean
}>()

const emit = defineEmits<{
  'incident:select': [incident: IIncident]
}>()

// Methods
function handleIncidentSelect(incident: IIncident): void {
  emit('incident:select', incident)
}
</script>

<template>
  <section class="space-y-4 p-2">
    <template v-if="hasIncidents">
      <IncidentCard 
        v-for="incident in incidents" 
        :key="incident.id" 
        :incident="incident"
        @click="handleIncidentSelect(incident)" 
      />
    </template>

    <LoadSkeleton v-else-if="isLoading" :items="6" class="mt-4" />

    <div v-else class="flex items-center justify-center">
      <div class="text-center text-gray-600">
        <BoxCloseOutline class="mx-auto h-28 w-28" />

        <div class="mt-2 text-center">
          <h2 class="text-2xl font-semibold">No hay incidencias en esta semana</h2>
        </div>
      </div>
    </div>
  </section>
</template>