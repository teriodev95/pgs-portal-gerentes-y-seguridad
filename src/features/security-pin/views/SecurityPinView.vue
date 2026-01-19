<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { useSecurityPin } from '../composables'

import CircularTimer from '../components/CircularTimer.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import ManagementList from '../components/ManagementList.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import PinDetails from '../components/PinDetails.vue'
import { useStore } from '@/shared/stores'


const $store = useStore()

// Composables
const $router = useRouter()
const {
  isLoading,
  selectedManagement,
  timer,
  managementList,
  handleSelectManagement,
  handleNewPin,
  clearSelection
} = useSecurityPin()

// Methods
const goBack = () => {
  if (selectedManagement.value) {
    clearSelection()
  } else {
    $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
  }
}
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Pin de Seguridad"
      :show-back-button="true"
      @back="goBack"
    />

    <!-- Content -->
    <template v-if="!isLoading">
      <!-- Management Selection View -->
      <template v-if="!selectedManagement">
        <CardContainer>
          <h2 class="title">¿Qué es el PIN de Seguridad?</h2>
          <p class="subtitle">
            Permite a los gerentes cerrar la semana de una agencia en casos urgentes cuando el agente no está disponible. Cada gerencia genera un PIN único que es válido por 10 minutos. Después de este tiempo, deberás generar uno nuevo.
          </p>
        </CardContainer>

        <ManagementList :management-list="managementList" @selectManagement="handleSelectManagement" />
      </template>

      <!-- PIN Details View -->
      <template v-if="timer && selectedManagement">
        <CircularTimer v-bind="timer" @action:new-pin="handleNewPin" />
        <PinDetails :pin="`${timer?.pin}`" :user="`${$store.user?.usuario}`" :to-end="timer.expiresAt as string" :management="selectedManagement"/>
      </template>
    </template>

    <!-- Loading State -->
    <LoadSkeleton v-else :items="5" />
  </MainCT>
</template>