<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { useSecurityPin } from '../composables'

import CircularTimer from '../components/CircularTimer.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import ManagementList from '../components/ManagementList.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
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

  <main class="h-screen p-2 bg-slate-100 space-y-4 pb-[6rem]">
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Pin de Seguridad" @on-back="goBack" />
    </div>

    
    <template v-if="!isLoading">
      <template v-if="!selectedManagement">
        <CardContainer>
          <h2 class="title">¿Qué es el PIN de Seguridad?</h2>
           <p class="subtitle">
            Permite a los gerentes cerrar la semana de una agencia en casos urgentes cuando el agente no está disponible. Cada gerencia genera un PIN único que es válido por 10 minutos. Después de este tiempo, deberás generar uno nuevo.
          </p>
        </CardContainer>
        
        <ManagementList :management-list="managementList" @selectManagement="handleSelectManagement" />
      </template>

      <template v-if="timer && selectedManagement" >
        <CircularTimer v-bind="timer" @action:new-pin="handleNewPin" />
        <PinDetails :pin="`${timer?.pin}`" :user="`${$store.user?.usuario}`" :to-end="timer.expiresAt as string" :management="selectedManagement"/>
      </template>
    </template>


    <LoadSkeleton v-else :items="5" />
  </main>
</template>