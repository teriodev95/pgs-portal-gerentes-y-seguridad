<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useStore } from '@/shared/stores'
import type { IGerencia } from '@/interfaces'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import IconInfo from '@/shared/components/icons/InfoIcon.vue'
import { commonService } from '@/shared/services/modules'

// Interface - Props - Emits
interface GerencySliderProps {
  gerencias: IGerencia[]
}

defineProps<GerencySliderProps>()

// Services, Composables and Stores initialization
const $router = useRouter()
const $store = useStore()
const $toast = useToast()

// State definitions
const selectedManagement = computed(() => $store.gerenciaSelected)
const formatManagerName = computed(() => {
  return (fullName: string): string => {
    if (!fullName) return ''

    const words = fullName.split(' ')
    return words.slice(0, 2).join(' ')
  }
})

// Methods
async function selectManagement(managementId: string, navigateToDashboard = false) {
  // Update selected management in the store
  $store.gerenciaSelected = managementId
  $store.loading = true

  try {
    // Fetch agencies for the selected management
    const response = await commonService.getAgenciesCopy(managementId)
    $store.agencies = response.data

    // Reset agency data
    $store.resetAgencyData()

    // Navigate to dashboard if requested
    if (navigateToDashboard) {
      $router.push({
        name: ROUTE_NAME.DASHBOARD_GERENCY
      })
    }
  } catch (error) {
    console.error('Error loading agencies for management:', error)
    $toast.error('Error al cargar los datos')
  } finally {
    $store.loading = false
  }
}
</script>

<template>
  <ul class="text-md relative flex space-x-2 overflow-y-hidden overflow-x-scroll p-2">
    <li v-for="(management, index) in gerencias" :key="`management-${index}`" class="flex-shrink-0">
      <div class="flex flex-shrink-0 items-center gap-1">
        <!-- Management name and manager -->
        <button @click="() => selectManagement(management.gerencia)" :class="[
          management.gerencia === selectedManagement ? 'bg-slate-700 text-white' : 'bg-white',
          'flex cursor-pointer flex-col rounded-xl border px-4 py-1.5 text-[0.8rem] shadow-lg'
        ]" :aria-label="`Seleccionar gerencia ${management.gerencia}`">
          <span>{{ management.gerencia }}</span>
          <span class="flex-auto text-[0.4rem]">{{ formatManagerName(management.gerente) }}</span>
        </button>

        <!-- Details button -->
        <button @click="() => selectManagement(management.gerencia, true)" :class="[
          management.gerencia === selectedManagement ? 'bg-slate-700 text-white' : 'bg-white',
          'flex cursor-pointer gap-2 rounded-xl border px-4 py-2 shadow-lg'
        ]" aria-label="Ver detalles de la gerencia">
          <IconInfo class="h-6 w-6" />
        </button>
      </div>
    </li>
  </ul>
</template>