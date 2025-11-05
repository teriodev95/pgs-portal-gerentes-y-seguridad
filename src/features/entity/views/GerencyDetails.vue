<script lang="ts" setup>
import { ROUTE_NAME } from '@/router'

// Components
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import ManagementInformation from '@/features/entity/components/ManagementInformation.vue'

// Composables
import { useGerencyDetails } from '@/features/entity/composables/useGerencyDetails'

const { dashboardData, management, managementDebts, isLoading } = useGerencyDetails()
</script>

<template>
  <main class="min-h-screen bg-slate-100">
    <div
      v-if="management"
      class="block dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop :label="`Gerencia ${management}`" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
      </div>

      <SectionContainer v-if="dashboardData">
        <ManagementInformation
          :data="dashboardData"
          :management-debts="managementDebts"
          :is-loading="isLoading"
        />
      </SectionContainer>

      <LoadSkeleton v-else-if="isLoading" :items="6" class="mt-4" />

      <div class="mt-4 rounded-sm border bg-white p-4 text-center text-blue-900" v-else>
        <h2 class="text-lg">No hay datos que mostrar</h2>
      </div>
    </div>
  </main>
</template>
