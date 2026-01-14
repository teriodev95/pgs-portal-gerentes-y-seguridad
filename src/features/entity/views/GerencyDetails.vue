<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'

// Components
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import ManagementInformation from '@/features/entity/components/ManagementInformation.vue'

// Composables
import { useGerencyDetails } from '@/features/entity/composables/useGerencyDetails'

const router = useRouter()
const { dashboardData, management, managementDebts, isLoading } = useGerencyDetails()

// Computed
const navbarTitle = computed(() => management.value ? `Gerencia ${management.value}` : 'Gerencia')

// Methods
function handleBack() {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      :title="navbarTitle"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Content with Data -->
    <SectionContainer v-if="dashboardData && !isLoading">
      <ManagementInformation
        :data="dashboardData"
        :management-debts="managementDebts"
        :is-loading="isLoading"
      />
    </SectionContainer>

    <!-- Loading State -->
    <LoadSkeleton v-else-if="isLoading" :items="6" class="mt-4" />

    <!-- Empty State -->
    <EmptyCT
      v-else
      message="No hay datos que mostrar"
      description="No se encontraron datos disponibles para esta gerencia."
    />
  </MainCT>
</template>
