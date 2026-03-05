<script lang="ts" setup>
import { computed, onBeforeMount } from 'vue'
import { useWeeklyClose } from '@/features/weekly-close/composables/useWeeklyClose'
import { useCierreSemanalModal } from '@/features/weekly-close/composables/useCierreSemanalModal'
import { useRevealCircleStore } from '@/shared/stores/revealCircle'

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
const revealCircleStore = useRevealCircleStore()

// Composable principal del cierre semanal (REFACTORIZADO)
const {
  // Estado
  weeklyClose,
  agency,
  user,
  isLoading,
  isClosingLocked,
  error,

  // Métodos
  initializeWeeklyClose,
  navigateBack,
  navigateToSign,
  navigateToCorrection
} = useWeeklyClose()

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
 *	Computed
 * ------------------------------------------
 */
const userNavbarTop = computed(() => user.value?.usuario || '')

const navbarLabel = computed(() => {
  return `Cierre Semanal ${agency.value?.agencia || ''}`
})

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */

/**
 * handleOnBack - Navega hacia atrás
 */
const handleOnBack = () => {
  navigateBack()
}

/**
 * saveValue - Método para guardar valor del modal
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

/**
 * handleContinue - Navega a la vista de firma
 */
const handleContinue = () => {
  navigateToSign()
}

/**
 * ------------------------------------------
 *	Lifecycle
 * ------------------------------------------
 */
onBeforeMount(async () => {
  await initializeWeeklyClose()
})

// NO limpiamos el store en onUnmounted porque podemos navegar
// a WeeklyCloseSign.vue y necesitamos mantener los datos
// El reset se hace desde navigateBack() cuando volvemos al dashboard
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

    <!-- Weekly Close Content -->
    <div class="space-y-2 p-2" v-if="weeklyClose && !isLoading">
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
        @click="handleContinue"
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
      <EmptyCT v-if="error" message="Error al cargar datos" :description="error" />
      <EmptyCT
        v-else
        message="No hay datos que mostrar"
        description="No se encontró información del cierre semanal."
      />
    </div>
  </MainCT>
</template>
