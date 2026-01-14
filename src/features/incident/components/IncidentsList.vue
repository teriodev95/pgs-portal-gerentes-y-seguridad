<script setup lang="ts">
import type { IIncident } from '../types'

// Components
import IncidentCard from './IncidentCard.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'

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

    <EmptyCT
      v-else
      message="No hay incidencias en esta semana"
      description="Aún no se han registrado incidencias para esta semana. Usa el botón de abajo para agregar una nueva."
    />
  </section>
</template>