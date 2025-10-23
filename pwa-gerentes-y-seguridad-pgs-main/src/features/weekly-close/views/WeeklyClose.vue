<script lang="ts" setup>
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue'
import { ROUTE_NAME } from '@/router'
import { toCurrency } from '@/shared/utils'
import { useCierreSemanal } from '@/features/weekly-close/composables/useCierreSemanal'
import { useCierreSemanalModal } from '@/features/weekly-close/composables/useCierreSemanalModal'
import { useRouter } from 'vue-router'

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import EditFieldDialog from '@/features/weekly-close/components/EditFieldDialog.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import RevealCircle from '@/shared/components/RevealCircle.vue'
import SignForm from '@/features/weekly-close/components/SignForm.vue'
import ToolsIcon from '@/shared/components/icons/ToolsIcon.vue'
import WeeklyClosingHeader from '@/features/weekly-close/components/WeeklyClosingHeader.vue'
import WeeklyClosingSummary from '@/features/weekly-close/components/WeeklyClosingSummary.vue'

/**
 * ------------------------------------------
 *	Composables & Stores
 * ------------------------------------------
 */
const router = useRouter()

// Composable principal del cierre semanal
const {
  // Estado
  weeklyClose,
  agency,
  management,
  user,
  isClosingComplete,
  isLoading,
  isClosingLocked,
  error,

  // Métodos
  initializeWeeklyClose,
  navigateBack,
  resetWeeklyClose
} = useCierreSemanal()

// Composable para la gestión de modales
const {
  // Estado del modal
  showModal,
  modalLabel,
  modalValue,
  inputType,

  // Métodos del modal
  openModalAuto,
  closeModal,
  saveValueWithValidation
} = useCierreSemanalModal()

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */
const showForm = ref(false)
const showRevealCircle = ref(false)

/**
 * ------------------------------------------
 *	Computed
 * ------------------------------------------
 */
const userNavbarTop = computed(() => user.value?.usuario || '')

const navbarLabel = computed(() => {
  if (showForm.value) return 'Verificación'
  return `Cierre Semanal ${agency.value?.agencia || ''}`
})

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */
const navigateToCorrection = () => {
  if (!weeklyClose.value) return

  // For closure, we need to pass multiple amounts as comma-separated values
  const bonuses = weeklyClose.value.egresosGerente.bonosPagadosEnSemana
  const collectionCommission = weeklyClose.value.egresosGerente.comisionCobranzaPagadaEnSemana
  const salesCommission = weeklyClose.value.egresosGerente.comisionVentasPagadaEnSemana
  
  const amountsString = `${bonuses},${collectionCommission},${salesCommission}`

  router.push({
    name: ROUTE_NAME.RECORD_CORRECTION,
    params: {
      type: 'cierre',
      id: weeklyClose.value.id,
      amount: amountsString
    }
  })
}

/**
 * handleOnBack
 */
const handleOnBack = () => {
  if (showForm.value) {
    showForm.value = false
    return
  }
  navigateBack()
}

/**
 * saveValue - Método para guardar valor del modal
 * Ahora usa el composable del modal con validación
 */
const saveValue = (value: any) => {
  const success = saveValueWithValidation(value)
  if (success) {
    console.log('Valor guardado exitosamente:', value)
  }
}

/**
 * handleModalCancel - Maneja la cancelación del modal
 */
const handleModalCancel = () => {
  closeModal()
}

const handleCompletion = () => {
  showRevealCircle.value = true
  showForm.value = false
}

/**
 * Watch para el estado de cierre completado
 */
watch(() => isClosingComplete, (newValue) => {
  if (newValue) {
    showRevealCircle.value = true
    showForm.value = false
  }
})

/**
 * ------------------------------------------
 *	Lifecycle
 * ------------------------------------------
 */
onBeforeMount(async () => {
  await initializeWeeklyClose()
})

onUnmounted(() => {
  resetWeeklyClose()
})
</script>

<template>
  <EditFieldDialog 
    v-if="showModal" 
    :value="modalValue"
    :label="modalLabel" 
    :type="inputType" 
    @save:value="saveValue"
    @action:cancel="handleModalCancel" 
  />

  <main class="h-screen bg-slate-100" :class="{ 'overflow-hidden': showRevealCircle }">

    <RevealCircle 
      v-show="showRevealCircle" 
      type="success"
      main-text="Cierre semanal completado con éxito"
      :secondary-text="`Agencia: <b>${agency?.agencia}</b> - Gerencia: <b>${management}</b>`"
      sub-text="Resumen:" 
      :list="weeklyClose ? [
        `Comisión por cobranza: ${toCurrency(weeklyClose.egresosGerente.comisionCobranzaPagadaEnSemana)}`,
        `Comisión por ventas: ${toCurrency(weeklyClose.egresosGerente.comisionVentasPagadaEnSemana)}`,
        `Bonos: ${toCurrency(weeklyClose.egresosGerente.bonosPagadosEnSemana)}`,
      ] : []" 
      @action:cancel="showRevealCircle = false" 
    />

    <div class="block p-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop
          :label="navbarLabel"
          :user="userNavbarTop" 
          @onBack="handleOnBack" 
        />
      </div>
    </div>

    <div v-if="showForm" class="p-2">
      <SignForm @action:completed="handleCompletion"/>
    </div>

    <div class="space-y-2 p-2" v-else-if="weeklyClose && !isLoading">
      <div class="space-y-2 rounded-lg border bg-white p-4">
        <template v-if="!isClosingLocked">
          <h2 class="title">Acciones</h2>
          <p class="subtitle">
            Inicie el proceso de cierre semanal. Asegúrese de haber revisado todos los campos para
            obtener un cierre preciso
          </p>
        </template>

        <div v-else class="space-y-2">
          <p class="title flex items-center justify-between gap-2">
            Status 
            <span class="badget badget-success">Cerrado</span>
          </p>

          <button @click="navigateToCorrection"
            class="btn-primary w-full flex items-center justify-center gap-2">
            <ToolsIcon class="size-5" />
            Solicitar Correción
          </button>
        </div>
      </div>

      <WeeklyClosingHeader />

      <WeeklyClosingSummary @action:show-modal="openModalAuto" />

      <button 
        @click="showForm = true" 
        class="btn-primary flex w-full items-center justify-center gap-4"
        v-if="!isClosingLocked"
      >
        Continuar
      </button>
    </div>

    <LoadSkeleton v-else-if="isLoading" :items="6" class="mt-4" />

    <template v-else-if="!weeklyClose && !isLoading">
      <div class="mt-4 rounded-sm border bg-white p-4 text-center text-blue-800" v-if="error">
        <h2 class="text-lg">{{ error }}</h2>
      </div>
      <div class="mt-4 rounded-sm border bg-white p-4 text-center text-blue-800" v-else>
        <h2 class="text-lg">No hay datos que mostrar</h2>
      </div>
    </template>

  </main>
</template>