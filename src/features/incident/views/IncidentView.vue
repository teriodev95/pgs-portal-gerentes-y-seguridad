<script setup lang="ts">
import { ref } from 'vue'
import { ROUTE_NAME } from '@/router'
import type { IIncident, IIncidentFormData } from '../types'
import { useIncidentData } from '../composables'

// Components
import NavbarTop from '@/shared/components/NavbarTop.vue'
import FloatBtn from '@/shared/components/FloatBtn.vue'
import IncidentBottomSheet from '@/features/incident/components/IncidentBottomSheet.vue'
import IncidentsList from '@/features/incident/components/IncidentsList.vue'

// Composables
const {
  incidents,
  selectedIncident,
  isLoadingIncidents,
  isSavingIncident,
  user,
  isUserManager,
  gerenciaSelected,
  hasIncidents,
  saveIncident,
  selectIncidentForEditing,
  clearSelectedIncident
} = useIncidentData()

// State definitions
const incidentBottomSheetRef = ref<InstanceType<typeof IncidentBottomSheet>>()

// Methods
function openIncidentForm(): void {
  incidentBottomSheetRef.value?.open()
}

function closeIncidentForm(): void {
  incidentBottomSheetRef.value?.close()
}

function handleIncidentFormClose(): void {
  clearSelectedIncident()
}

function handleIncidentSelect(incident: IIncident): void {
  selectIncidentForEditing(incident)
  openIncidentForm()
}

async function handleIncidentSubmit(formData: IIncidentFormData): Promise<void> {
  try {
    await saveIncident(formData)
    closeIncidentForm()
  } catch (error) {
    // Error is handled in the composable
  }
}
</script>

<template>
  <IncidentBottomSheet 
    ref="incidentBottomSheetRef"
    :selected-incident="selectedIncident"
    :usuario-id="user?.usuarioId || 0"
    :is-saving="isSavingIncident"
    :is-user-manager="isUserManager"
    :gerencia-selected="gerenciaSelected"
    @submit="handleIncidentSubmit"
    @closed="handleIncidentFormClose"
  />

  <div data-dial-init class="group fixed bottom-[1.5rem] right-6 z-50">
    <FloatBtn type="primary" @click="openIncidentForm" />
  </div>

  <main class="min-h-screen bg-slate-100 pb-[6rem]">
    <div class="block p-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop label="Incidentes y salidas" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
      </div>
    </div>

    <IncidentsList 
      :incidents="incidents"
      :is-loading="isLoadingIncidents"
      :has-incidents="hasIncidents"
      @incident:select="handleIncidentSelect"
    />
  </main>
</template>