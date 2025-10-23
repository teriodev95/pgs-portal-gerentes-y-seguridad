<script lang="ts" setup>
import { formatToHumanDate } from '@/shared/utils'
import { ROUTE_NAME } from '@/router'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

// Components
import MapWidget from '@/shared/components/MapWidget.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import NoPaymentFilters from '../components/NoPaymentFilters.vue'
import NoPaymentStats from '../components/NoPaymentStats.vue'
import NoPaymentsList from '../components/NoPaymentsList.vue'

// Composables
import { useNoPayments } from '../composables'

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
  noPaymentsExist,
  isFilterDisabled,
  filteredNoPayments,

  // Methods
  fetchAgencies,
  showMapLocation,
  selectVisit
} = useNoPayments()
</script>

<template>
  <main class="min-h-screen space-y-2 bg-slate-100">
    <!-- Header Navigation -->
    <div class="block p-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop label="No Pagos" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
      </div>
    </div>

    <!-- Filters Section -->
    <NoPaymentFilters
      :management-list="managementList || []"
      v-model:selected-management="selectedManagement"
      :agency-list="agencyList || []"
      v-model:selected-agency="selectedAgency"
      v-model:has-visit="hasVisit"
      :is-filter-disabled="isFilterDisabled"
      :is-user-manager="isUserManager"
      @management-change="fetchAgencies"
    />

    <!-- Stats Summary -->
    <NoPaymentStats
      :total-count="noPaymentsList?.length || 0"
      :filtered-count="filteredNoPayments?.length || 0"
    />

    <!-- No Payments List -->
    <NoPaymentsList
      :no-payments="filteredNoPayments"
      :is-loading="isLoading"
      :no-payments-exist="noPaymentsExist"
      @click:map-market="showMapLocation"
      @click:visit-selected="selectVisit"
    />

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
  </main>
</template>

<style lang="scss" scoped></style>