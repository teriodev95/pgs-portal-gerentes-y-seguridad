<script lang="ts" setup>
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue'
import { ROUTE_NAME } from '@/router'
import { toCurrency } from '@/shared/utils'
import { useCierreSemanal } from '@/features/weekly-close/composables/useCierreSemanal'
import { useCierreSemanalModal } from '@/features/weekly-close/composables/useCierreSemanalModal'
import { useRevealCircleStore } from '@/shared/stores/revealCircle'
import { useRouter } from 'vue-router'

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import EditFieldDialog from '@/features/weekly-close/components/EditFieldDialog.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import SignForm from '@/features/weekly-close/components/SignForm.vue'
import ToolsIcon from '@/shared/components/icons/ToolsIcon.vue'
import WeeklyClosingHeader from '@/features/weekly-close/components/WeeklyClosingHeader.vue'
import WeeklyClosingSummary from '@/features/weekly-close/components/WeeklyClosingSummary.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import BadgetCT from '@/shared/components/ui/BadgetCT.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

/**
 * ------------------------------------------
 *	Composables & Stores
 * ------------------------------------------
 */
const router = useRouter()
const revealCircleStore = useRevealCircleStore()

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
  if (weeklyClose.value) {
    const summaryList = [
      `Comisión por cobranza: ${toCurrency(weeklyClose.value.egresosGerente.comisionCobranzaPagadaEnSemana)}`,
      `Comisión por ventas: ${toCurrency(weeklyClose.value.egresosGerente.comisionVentasPagadaEnSemana)}`,
      `Bonos: ${toCurrency(weeklyClose.value.egresosGerente.bonosPagadosEnSemana)}`
    ]

    revealCircleStore.showRevealCircle({
      type: 'success',
      mainText: 'Cierre semanal completado con éxito',
      secondaryText: `Agencia: <b>${agency.value?.agencia}</b> - Gerencia: <b>${management.value}</b>`,
      subText: 'Resumen:',
      list: summaryList
    })
  }
  showForm.value = false
}

/**
 * Watch para el estado de cierre completado
 */
watch(() => isClosingComplete.value, (newValue) => {
  if (newValue) {
    handleCompletion()
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
  <!-- Edit Field Dialog -->
  <EditFieldDialog
    v-if="showModal"
    :value="modalValue"
    :label="modalLabel"
    :type="inputType"
    @save:value="saveValue"
    @action:cancel="handleModalCancel"
  />

  <!-- Main Content -->
  <MainCT :class="{ 'overflow-hidden': revealCircleStore.isVisible }">
    <!-- Top Navigation Bar -->
    <NavbarCT
      :title="navbarLabel"
      :subtitle="userNavbarTop"
      :show-back-button="true"
      @back="handleOnBack"
    />

    <!-- Sign Form View -->
    <div v-if="showForm" class="p-2">
      <SignForm @action:completed="handleCompletion"/>
    </div>

    <!-- Weekly Close Content -->
    <div class="space-y-2 p-2" v-else-if="weeklyClose && !isLoading">
      <!-- Actions Card -->
      <CardContainer title="Importante">
        <template v-if="!isClosingLocked">
          <TextCT>
            Inicie el proceso de cierre semanal. Asegúrese de haber revisado todos los campos para
            obtener un cierre preciso
          </TextCT>
        </template>

        <div v-else class="space-y-2">
          <TextCT variant="title" class="flex items-center justify-between gap-2">
            Status
            <BadgetCT value="Cerrado" variant="green" />
          </TextCT>

          <BtnComponent @click="navigateToCorrection" full-width>
            <template #icon-left>
              <ToolsIcon class="size-5" />
            </template>
            Solicitar Correción
          </BtnComponent>
        </div>
      </CardContainer>

      <!-- Weekly Closing Header -->
      <WeeklyClosingHeader />

      <!-- Weekly Closing Summary -->
      <WeeklyClosingSummary @action:show-modal="openModalAuto" />

      <!-- Continue Button -->
      <button
        @click="showForm = true"
        class="btn-primary flex w-full items-center justify-center gap-4"
        v-if="!isClosingLocked"
      >
        Continuar
      </button>
    </div>

    <!-- Loading State -->
    <LoadSkeleton v-else-if="isLoading" :items="6" class="mt-4" />

    <!-- Empty/Error State -->
    <div v-else-if="!weeklyClose && !isLoading" class="p-2">
      <EmptyCT
        v-if="error"
        message="Error al cargar datos"
        :description="error"
      />
      <EmptyCT
        v-else
        message="No hay datos que mostrar"
        description="No se encontró información del cierre semanal."
      />
    </div>
  </MainCT>
</template>