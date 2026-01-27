<script setup lang="ts">
import { APP_VERSION, ELEMENT_ID } from '@/shared/constants'
import { onMounted } from 'vue'
import { useAgencyData } from '@/features/home/composables/useAgencyData'
import { useCollections } from '@/features/home/composables/useCollections'
import { useUIState } from '@/features/home/composables/useUIState'
import { usePwaUpdate } from '@/shared/composables/usePwaUpdate'

// Components import
import AgencySlider from '@/features/home/components/AgencySlider.vue'
import CursorArrowIcon from '@/shared/components/icons/CursorArrowOutline.vue'
import DrawerLeft from '@/features/home/components/DrawerLeft.vue'
import FilterButton from '@/shared/components/FilterButton.vue'
import GerencySlider from '@/features/home/components/GerencySlider.vue'
import HomeMenu from '@/features/home/components/HomeMenu.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import PaymentWidget from '@/features/home/components/PaymentWidget.vue'
import SearchForm from '@/shared/components/forms/SearchForm.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'

// Constants
const DRAWER_ID = ELEMENT_ID.DRAWER_LEFT
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT

// Services, Composables and Stores initialization
const {
  isAgencySelectEnabled,
  agencies,
  agencySelected,
  gerencias,
  sucursales,
  handleAgencySelection
} = useAgencyData()

const {
  searchTerm,
  filterOptions,
  isLoading,
  filteredCollections,
  navigateToLoanDetails,
  fetchCollectionData,
  resetSearchTerm
} = useCollections()

const {
  isMenuVisible,
  setupSucursalesWatcher,
  handleMount
} = useUIState()

// Methods
async function onAgencySelection() {
  resetSearchTerm()
  await handleAgencySelection(fetchCollectionData)
}

// Setup watchers and lifecycle
setupSucursalesWatcher(sucursales)

// Lifecycle hooks
onMounted(() => {
  handleMount(sucursales.value)
})
</script>

<template>
  <!-- Side Navigation -->
  <DrawerLeft v-if="sucursales.length" />

  <MainCT>
    <!-- Top Navigation Bar -->
    <div class="sticky top-0 z-10 w-full bg-white p-2">
      <!-- Gerency Selector Area -->
      <div class="flex items-center gap-2">
        <!-- Drawer button Menu -->
        <button v-show="isMenuVisible" type="button" :data-drawer-target="DRAWER_ID" :data-drawer-show="DRAWER_ID"
          :aria-controls="DRAWER_ID"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden">
          <span class="sr-only">Open main menu</span>
          <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>

        <GerencySlider :gerencias="gerencias" />
      </div>

      <!-- Search and Filter Area -->
      <div class="flex items-stretch gap-2">
        <div class="flex-1">
          <SearchForm v-model="searchTerm" />
        </div>
        <FilterButton v-model="filterOptions" />
      </div>
    </div>

    <!-- Main Content Area -->
    <template v-if="filteredCollections.length">
      <div class="mt-4 px-2 pb-[10rem]">
        <PaymentWidget v-for="(collection, index) in filteredCollections"
          :key="`collection-${index}-${collection.prestamoId}`" :cobranza="collection"
          class="cursor-pointer hover:bg-slate-100" @click="() => navigateToLoanDetails(collection.prestamoId)" />
      </div>
    </template>

    <!-- Loading State -->
    <LoadSkeleton v-else-if="isLoading" :items="5" class="mt-4 px-2" />

    <!-- Empty State - Select Agency Prompt -->
    <EmptyCT v-else message="Seleccione una Agencia" />
  </MainCT>

  <!-- Fixed Menu -->
  <HomeMenu v-if="!isLoading && agencySelected" />

  <!-- Bottom Navigation -->
  <div class="fixed bottom-0 z-10 w-full bg-white">
    <!-- Agency Selector -->
    <div class="p-2">
      <AgencySlider :agencies="agencies" :can-select="isAgencySelectEnabled" @select-agency="onAgencySelection" />
    </div>

    <!-- App Version -->
    <div class="relative bg-blue-900 p-0.5 text-xs text-center text-white">
      <p>Versión: {{ APP_VERSION }} <span v-if="ENVIRONMENT === 'dev'" class="bg-green-600 p-0.5 rounded-sm">{{ ENVIRONMENT }}</span></p>
    </div>
  </div>
</template>

<style scoped>
ul::-webkit-scrollbar {
  display: none;
}

.element {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
}
</style>