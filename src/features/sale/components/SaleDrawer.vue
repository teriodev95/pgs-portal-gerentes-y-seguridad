<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDrawer } from '@/shared/composables'
import { useSaleData } from '../composables'
import { useSaleStore } from '../stores'
import type { Disbursement, SaleDetails, SaleFormData } from '../types'
import { formatToHumanDate, toCurrency } from '@/shared/utils'

// Components
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import SaleForm from './SaleForm.vue'
import SaleOriginStep from './SaleOriginStep.vue'
import DisbursementPicker from './DisbursementPicker.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'
import DataField from '@/shared/components/DataField.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import ArrowLeftIcon from '@/shared/components/icons/ArrowLeftIcon.vue'

/** Pasos de la captura: de donde sale, cual desembolso y confirmar. */
type Step = 'origin' | 'pick' | 'form'

const STEP_COPY: Record<Step, { title: string; description: string }> = {
  origin: { title: 'Nueva venta', description: '¿De dónde sale esta venta?' },
  pick: { title: 'Elige el desembolso', description: 'Toca el crédito que vas a registrar como venta' },
  form: { title: 'Confirma la venta', description: 'Revisa los datos y registra la venta' },
}

// Stores & Composables
const saleStore = useSaleStore()
const saleDrawer = useDrawer<SaleDetails>('sale')
const { gerenciaSelected, saveSale, fetchDisbursements } = useSaleData()

// Estado del stepper
const step = ref<Step>('origin')
const selectedDisbursement = ref<Disbursement | null>(null)

// Computed
const isViewingDetails = computed(() => !!saleDrawer.selectedData.value)
const drawerTitle = computed(() =>
  isViewingDetails.value ? 'Detalles de la venta' : STEP_COPY[step.value].title
)
const drawerDescription = computed(() =>
  isViewingDetails.value
    ? 'Información completa de la venta registrada'
    : STEP_COPY[step.value].description
)
const stepNumber = computed(() => (step.value === 'origin' ? 1 : step.value === 'pick' ? 2 : 3))
const canGoBack = computed(() => !isViewingDetails.value && step.value !== 'origin')

// Al abrir en modo creación, buscar los desembolsos de la semana
watch(
  () => saleDrawer.isOpen.value,
  (isOpen) => {
    if (!isOpen || isViewingDetails.value) return
    resetStepper()
    void fetchDisbursements()
  }
)

// Methods
function resetStepper() {
  step.value = 'origin'
  selectedDisbursement.value = null
}

function handleOriginSelect(origin: 'disbursement' | 'manual') {
  step.value = origin === 'disbursement' ? 'pick' : 'form'
}

function handleDisbursementSelect(disbursement: Disbursement) {
  selectedDisbursement.value = disbursement
  step.value = 'form'
}

function handleBack() {
  if (step.value === 'form' && selectedDisbursement.value) {
    selectedDisbursement.value = null
    step.value = 'pick'
    return
  }
  step.value = 'origin'
  selectedDisbursement.value = null
}

async function handleSubmit(formData: SaleFormData) {
  try {
    await saveSale(formData)
    resetStepper()
    saleDrawer.reset()
  } catch (error) {
    // Error is handled in the composable
  }
}

function handleOpenChange(open: boolean) {
  if (!open) {
    resetStepper()
    saleDrawer.reset()
  }
}
</script>

<template>
  <Drawer :open="saleDrawer.isOpen.value" @update:open="handleOpenChange">
    <DrawerContent class="max-h-[90vh]">
      <div class="mx-auto w-full max-w-lg overflow-y-auto">
        <DrawerHeader>
          <!-- Volver y paso actual: el gerente siempre sabe dónde está -->
          <div v-if="!isViewingDetails" class="mb-1 flex items-center justify-between gap-3">
            <button v-if="canGoBack" type="button"
              class="-ml-1 flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
              @click="handleBack">
              <ArrowLeftIcon class="size-4" />
              Atrás
            </button>
            <span v-else />
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Paso {{ stepNumber }} de 3
            </span>
          </div>

          <DrawerTitle>{{ drawerTitle }}</DrawerTitle>
          <DrawerDescription>
            {{ drawerDescription }}
          </DrawerDescription>
        </DrawerHeader>

        <!-- View Details Mode -->
        <SectionContainer v-if="isViewingDetails && saleDrawer.selectedData.value">
          <DataField label="Fecha" :value="formatToHumanDate(saleDrawer.selectedData.value.fecha ?? '')" />
          <DataField label="Agencia" :value="saleDrawer.selectedData.value.agencia" />
          <DataField label="Cliente" :value="saleDrawer.selectedData.value.nombreCliente" />
          <DataField label="Tipo" :value="saleDrawer.selectedData.value.tipo" />
          <DataField label="Nivel" :value="saleDrawer.selectedData.value.nivel" />
          <DataField label="Plazo" :value="saleDrawer.selectedData.value.plazo" />
          <DataField label="Monto" :value="toCurrency(saleDrawer.selectedData.value.monto)" />
          <DataField label="1er Pago" :value="toCurrency(saleDrawer.selectedData.value.primerPago)" />
          <DataField v-if="saleDrawer.selectedData.value.prestamoId" label="Desembolso"
            :value="saleDrawer.selectedData.value.prestamoId" />
        </SectionContainer>

        <!-- Create Mode -->
        <SectionContainer v-else>
          <AlertMsg v-if="gerenciaSelected && step === 'origin'" type="info" label="Estás creando una venta"
            :message="`en la gerencia ${gerenciaSelected}`" />

          <!-- Paso 1: origen -->
          <SaleOriginStep v-if="step === 'origin'" :disbursement-count="saleStore.disbursementsCount"
            :is-loading="saleStore.isLoadingDisbursements" :has-gerencia="Boolean(gerenciaSelected)"
            @select="handleOriginSelect" />

          <!-- Paso 2: elegir desembolso -->
          <DisbursementPicker v-else-if="step === 'pick'" :disbursements="saleStore.disbursements"
            @select="handleDisbursementSelect" />

          <!-- Paso 3: confirmar -->
          <SaleForm v-else :is-saving="saleStore.isSavingSale" :disbursement="selectedDisbursement"
            @submit="handleSubmit" @change-disbursement="handleBack" />
        </SectionContainer>

        <!-- Footer for details view -->
        <DrawerFooter v-if="isViewingDetails">
          <Button variant="outline" @click="saleDrawer.close()">
            Cerrar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
