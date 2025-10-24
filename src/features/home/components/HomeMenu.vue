<script lang="ts" setup>
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'
import { onMounted, ref } from 'vue'

// Components
import FloatBtn from '@/shared/components/FloatBtn.vue'

// Interface - Props - Emits
import { useHomeMenu } from '@/features/home/components/useHomeMenu'

// Services, Composables and Stores initialization
const {
  agency,
  agencyMenuItems,
  currentWeek,
  formattedCurrentDate,
  generalMenuItems,
  registerBottomSheet,
  openAgencyActions,
  openGeneralActions,
  closeAgencyActions,
  closeGeneralActions,
  handleMenuItemClick
} = useHomeMenu()

// State definitions
const agencyActionsBottomSheet = ref<InstanceType<typeof VueBottomSheet> | undefined>()
const generalActionsBottomSheet = ref<InstanceType<typeof VueBottomSheet> | undefined>()

// Lifecycle hooks
onMounted(() => {
  if (agencyActionsBottomSheet.value) {
    registerBottomSheet('agency', agencyActionsBottomSheet.value)
  }
  if (generalActionsBottomSheet.value) {
    registerBottomSheet('general', generalActionsBottomSheet.value)
  }
})
</script>

<template>
  <!-- Agency Actions Bottom Sheet -->
  <vue-bottom-sheet ref="agencyActionsBottomSheet" :max-width="1000" :max-height="1500">
    <div class="space-y-4 p-6">
      <!-- Header -->
      <div class="text-center space-y-1">
        <p class="text-xl font-semibold">Opciones de agencia ({{ agency }})</p>
        <p class="text-sm text-gray-600">Semana #{{ currentWeek }}</p>
        <p class="text-sm text-gray-600">{{ formattedCurrentDate }}</p>
      </div>

      <hr class="border-gray-200" />

      <!-- Agency Menu Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div v-for="item in agencyMenuItems" :key="item.id"
          class="flex flex-col items-center cursor-pointer p-4 rounded-lg border transition-all duration-200" :class="{
            'opacity-50 pointer-events-none': item.disabled,
            'hover:shadow-md hover:border-blue-300 hover:bg-blue-50': !item.disabled,
            'bg-blue-50 border-blue-200': item.id === 'dashboard'
          }" @click="handleMenuItemClick(item, closeAgencyActions)">
          <div
            class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-3 transition-all duration-200">
            <component :is="item.icon" class="h-6 w-6 transition-colors duration-200" :class="{
              'text-blue-600': item.id === 'dashboard',
              'text-gray-600': item.id !== 'dashboard'
            }" :stroke-width="1.5" />
          </div>
          <h3 class="font-medium text-sm text-center mb-1">{{ item.title }}</h3>
          <p class="text-xs text-gray-500 text-center">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </vue-bottom-sheet>

  <!-- General Actions Bottom Sheet -->
  <vue-bottom-sheet ref="generalActionsBottomSheet" :max-width="1000" :max-height="1500">
    <div class="space-y-4 p-6">
      <!-- Header -->
      <div class="text-center space-y-1">
        <p class="text-xl font-semibold">Seleccione una acción</p>
        <p class="text-sm text-gray-600">Semana #{{ currentWeek }}</p>
        <p class="text-sm text-gray-600">{{ formattedCurrentDate }}</p>
      </div>

      <hr class="border-gray-200" />

      <!-- General Menu Grid -->
      <div class="grid grid-cols-3 gap-3">
        <div v-for="item in generalMenuItems" :key="item.id"
          class="flex flex-col items-center cursor-pointer p-3 rounded-lg transition-all duration-200" :class="{
            'opacity-50 pointer-events-none': item.disabled,
            'hover:bg-gray-50': !item.disabled,
            'bg-blue-50 border border-blue-200': item.id === 'gerencia'
          }" @click="handleMenuItemClick(item, closeGeneralActions)">
          <div
            class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-2 transition-all duration-200">
            <component :is="item.icon" class="h-5 w-5 transition-colors duration-200" :class="{
              'text-blue-600': item.id === 'gerencia',
              'text-gray-600': item.id !== 'gerencia'
            }" :stroke-width="1.5" />
          </div>
          <h3 class="text-xs font-medium text-center mb-1 leading-tight">{{ item.title }}</h3>
          <p class="text-xs text-gray-500 text-center leading-tight">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </vue-bottom-sheet>

  <!-- Float buttons -->
  <div data-dial-init class="fixed bottom-[6rem] right-6 z-40 flex items-center gap-4">
    <FloatBtn @click="openAgencyActions" type="secondary" :text="agency" />
    <FloatBtn @click="openGeneralActions" type="primary" />
  </div>
</template>

<style scoped>
/* Estilos adicionales para transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>