<script lang="ts" setup>
import { formatToHumanDate } from '@/shared/utils'
import { ROUTE_NAME } from '@/router'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

// Components
import MapWidget from '@/shared/components/MapWidget.vue'
import NoPaymentFilters from '../components/NoPaymentFilters.vue'
import NoPaymentStats from '../components/NoPaymentStats.vue'
import NoPaymentsList from '../components/NoPaymentsList.vue'

// Composables
import { useNoPayments } from '../composables'
import MainCT from '@/shared/components/ui/MainCT.vue'
import { useRouter } from 'vue-router'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'

const $router = useRouter()

// Main composable
const {
  // State
  noPaymentsList,
  selectedVisit,
  isLoading,
  mapBottomSheet,

  // Map state
  mapCenter,
  mapMarker,
  mapZoom,

  // Filter state
  agencyList,
  selectedAgency,
  managementList,
  selectedManagement,
  hasVisit,

  // Computed
  isUserManager,
  hasPayments,
  hasPaymentsFiltered,
  isFilterDisabled,
  filteredNoPayments,

  // Methods
  fetchAgencies,
  showMapLocation,
  selectVisit,
  fetchNoPayments,
} = useNoPayments()

const handleManagementChange = async () => {
  await fetchAgencies()
  await fetchNoPayments()
}

function handleBack() {
  $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <MainCT>
    <NavbarCT title="No Pagos" show-back-button @click:back="handleBack" />

    <SectionContainer>
      <!-- Filters Section -->
      <NoPaymentFilters
        :agency-list="agencyList || []"
        :is-filter-disabled="isFilterDisabled"
        :is-user-manager="isUserManager"
        :management-list="managementList || []"
        v-model:has-visit="hasVisit"
        v-model:selected-agency="selectedAgency"
        v-model:selected-management="selectedManagement"
        @management-change="handleManagementChange"
        @agency-change="fetchNoPayments"
      />
  
      <!-- Stats Summary -->
      <NoPaymentStats
        :total-count="noPaymentsList?.length || 0"
        :filtered-count="filteredNoPayments?.length || 0"
      />
 

      <EmptyCT
        v-if="!isLoading && !hasPayments"
        message="No se encontraron *No pagos* en ninguna gerencia."/>
      
      <!-- No Payments List -->
       <template v-else>
         <NoPaymentsList
           :no-payments="filteredNoPayments"
           :is-loading="isLoading"
           :has-payments-filtered="hasPaymentsFiltered"
           @click:map-market="showMapLocation"
           @click:visit-selected="selectVisit"
         />
       </template>
    </SectionContainer>

    <!-- Map Bottom Sheet -->
    <vue-bottom-sheet ref="mapBottomSheet" :max-width="1000" :max-height="600">
      <main class="relative min-h-screen">
        <div class="fixed top-0 z-10 h-screen w-screen">
          <MapWidget v-model:center="mapCenter" :marker="mapMarker" v-model:zoom="mapZoom" readonly
            class="z-20 h-full w-full" />
        </div>

        <!-- Visit Details -->
        <Transition name="slide-fade">
          <div class="fixed bottom-1 z-30 w-full p-2" v-if="selectedVisit">
            <div class="rounded-md bg-white p-4">
              <ul class="spacey-2 list-none">
                <li class="flex justify-between gap-2">
                  <p>Prestamo</p>
                  <p class="font-bold text-blue-900">{{ selectedVisit.prestamoId }}</p>
                </li>
                <li class="flex justify-between gap-2">
                  <p>Fecha</p>
                  <p class="font-bold text-blue-900">
                    {{ formatToHumanDate(selectedVisit.fecha, true) }}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </main>
    </vue-bottom-sheet>
  </MainCT>
</template>