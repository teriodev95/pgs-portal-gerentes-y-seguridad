<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import type { IIncident } from '../types'
import { useIncidentData } from '../composables'
import { useIncidentStore } from '../stores'
import { useDrawer } from '@/shared/composables'

// Components
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import FloatBtn from '@/shared/components/FloatBtn.vue'
import IncidentDrawer from '@/features/incident/components/IncidentDrawer.vue'
import IncidentsList from '@/features/incident/components/IncidentsList.vue'

const router = useRouter()

// Stores & Composables
const incidentStore = useIncidentStore()
const incidentDrawer = useDrawer<IIncident>('incident')

// Inicializar lógica de negocio (fetch inicial en onBeforeMount)
useIncidentData()

// Methods
function handleIncidentSelect(incident: IIncident): void {
  incidentDrawer.openWith(incident)
}

function handleBack(): void {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <IncidentDrawer />

  <div data-dial-init class="group fixed bottom-[1.5rem] right-6 z-50">
    <FloatBtn type="primary" @click="incidentDrawer.open()" />
  </div>

  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Incidentes y salidas"
      :show-back-button="true"
      @back="handleBack"
    />

    <IncidentsList
      :incidents="incidentStore.incidents"
      :is-loading="incidentStore.isLoadingIncidents"
      :has-incidents="incidentStore.hasIncidents"
      @incident:select="handleIncidentSelect"
    />
  </MainCT>
</template>