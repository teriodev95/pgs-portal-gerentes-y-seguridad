<script setup lang="ts">
import { APP_VERSION } from '@/shared/constants'
import { onMounted, ref } from 'vue'
import { useAgencyData } from '@/features/home/composables/useAgencyData'
import { useCollections } from '@/features/home/composables/useCollections'
import { useUIState } from '@/features/home/composables/useUIState'

// Components import
import AgencySlider from '@/features/home/components/AgencySlider.vue'
import DrawerLeftMenu from '@/features/home/components/DrawerLeftMenu.vue'
import FilterButton from '@/shared/components/FilterButton.vue'
import GerencySlider from '@/features/home/components/GerencySlider.vue'
import HomeMenu from '@/features/home/components/HomeMenu.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import PaymentWidget from '@/features/home/components/PaymentWidget.vue'
import SearchForm from '@/shared/components/forms/SearchForm.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'

// Constants
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT

// State
const isDrawerOpen = ref(false)

// Services, Composables and Stores initialization
const {
  isAgencySelectEnabled,
  agencies,
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

function openDrawer() {
  isDrawerOpen.value = true
}

// Setup watchers and lifecycle
setupSucursalesWatcher(sucursales)

// Lifecycle hooks
onMounted(() => {
  handleMount(sucursales.value)
})
</script>

<template>
  <!-- Side Navigation Drawer -->
  <DrawerLeftMenu v-model:open="isDrawerOpen" />

  <MainCT>
    <!-- Top Navigation Bar. Comparte el gris de la hoja: en blanco se leía como
         una tercera superficie contra la lista y contra la barra de abajo. La
         separación la da la línea, no el color. -->
    <div class="sticky top-0 z-10 w-full border-b border-slate-200 bg-slate-100 px-2 pb-2 pt-1">
      <!-- Gerency Selector Area -->
      <div class="flex items-center gap-2">
        <!-- Drawer button Menu -->
        <button
          v-show="isMenuVisible"
          type="button"
          @click="openDrawer"
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
      <!-- El relleno de abajo libra la barra de agencias y la fila de FABs, que
           flotan sobre la lista. -->
      <div class="mt-4 px-2 pb-[11rem]">
        <PaymentWidget v-for="(collection, index) in filteredCollections"
          :key="`collection-${index}-${collection.prestamoId}`" :cobranza="collection"
          class="cursor-pointer hover:bg-slate-200" @click="() => navigateToLoanDetails(collection.prestamoId)" />
      </div>
    </template>

    <!-- Loading State -->
    <LoadSkeleton v-else-if="isLoading" :items="5" class="mt-4 px-2" />

    <!-- Empty State - Select Agency Prompt -->
    <EmptyCT v-else message="Seleccione una Agencia" />
  </MainCT>

  <!-- Fixed Menu. La fila se monta siempre: la condición de cada FAB vive en
       ella. El de agenda sólo depende de tener acceso a la agenda, y al abrir
       la app en la mañana —cuando todavía no hay agencia elegida y el corte de
       las 7:30 está encima— es justo cuando tiene que estar. -->
  <HomeMenu />

  <!-- Bottom Navigation -->
  <div class="fixed bottom-0 z-10 w-full bg-slate-100">
    <!-- La lista se disuelve al entrar bajo la barra. Sin esto el último
         renglón visible quedaba partido a la mitad y se leía como un error de
         dibujo, no como contenido que sigue abajo. -->
    <div class="pointer-events-none absolute bottom-full h-6 w-full bg-gradient-to-t from-slate-100" aria-hidden="true" />

    <!-- Agency Selector -->
    <div class="px-2 py-1">
      <AgencySlider :agencies="agencies" :can-select="isAgencySelectEnabled" @select-agency="onAgencySelection" />
    </div>

    <!-- App Version -->
    <div class="relative bg-blue-900 p-0.5 text-xs text-center text-white">
      <p>Versión: {{ APP_VERSION }} <span v-if="ENVIRONMENT === 'dev'" class="bg-green-600 p-0.5 rounded-sm">{{ ENVIRONMENT }}</span></p>
    </div>
  </div>
</template>
