<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { useSoliFilterList } from '../composables/useSoliFilterList'
import type { SoliFilterListItem } from '../types/soliFilter.types'

// Components
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import FloatBtn from '@/shared/components/FloatBtn.vue'
import SoliFilterList from '../components/SoliFilterList.vue'
import SoliFilterDetailsScreen from '../components/SoliFilterDetailsScreen.vue'

const router = useRouter()
const { solicitudes, isLoading } = useSoliFilterList()
const selectedSolicitud = ref<SoliFilterListItem | null>(null)
const isDetailsOpen = ref(false)

function handleCreate(): void {
  router.push({ name: ROUTE_NAME.SOLI_FILTER_FORM })
}

function handleBack(): void {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}

function handleShowDetails(solicitud: SoliFilterListItem): void {
  selectedSolicitud.value = solicitud
  isDetailsOpen.value = true
}

function handleCloseDetails(): void {
  isDetailsOpen.value = false
  selectedSolicitud.value = null
}
</script>

<template>
  <!-- FAB outside MainCT to avoid overflow clipping -->
  <div data-dial-init class="group fixed bottom-[1.5rem] right-6 z-50">
    <FloatBtn type="primary" @click="handleCreate" />
  </div>

  <MainCT>
    <NavbarCT
      title="Solicitudes Filtro"
      :show-back-button="true"
      @back="handleBack"
    />

    <SoliFilterList
      :solicitudes="solicitudes"
      :is-loading="isLoading"
      @solicitud:select="handleShowDetails"
    />

    <SoliFilterDetailsScreen
      v-if="isDetailsOpen"
      :solicitud="selectedSolicitud"
      @close="handleCloseDetails"
    />
  </MainCT>
</template>
