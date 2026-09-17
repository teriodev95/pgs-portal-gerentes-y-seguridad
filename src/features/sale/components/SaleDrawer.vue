<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDrawer } from '@/shared/composables'
import { useSaleData } from '../composables'
import { useSaleStore } from '../stores'
import type { ApprovedRequest, SaleDetails, SaleFormData } from '../types'
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
import ApprovedRequestPicker from './ApprovedRequestPicker.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'
import DataField from '@/shared/components/DataField.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import ArrowLeftIcon from '@/shared/components/icons/ArrowLeftIcon.vue'

/** Pasos de la captura: de donde sale, cual solicitud y confirmar. */
type Step = 'origin' | 'pick' | 'form'

const STEP_COPY: Record<Step, { title: string; description: string }> = {
  origin: { title: 'Nueva venta', description: '¿De dónde sale esta venta?' },
  pick: { title: 'Elige la solicitud', description: 'Toca el crédito que vas a registrar como venta' },
  form: { title: 'Confirma la venta', description: 'Revisa los datos y registra la venta' },
}

interface Props {
  /** Llega desde el detalle de la solicitud: abre el paso de confirmar con ella puesta. */
  preselectSolicitudId?: string | null
}

const props = withDefaults(defineProps<Props>(), { preselectSolicitudId: null })

// Stores & Composables
const saleStore = useSaleStore()
const saleDrawer = useDrawer<SaleDetails>('sale')
const { gerenciaSelected, saveSale, fetchApprovedRequests } = useSaleData()

// Estado del stepper
const step = ref<Step>('origin')
const selectedRequest = ref<ApprovedRequest | null>(null)
const preselectFailed = ref(false)

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

// Al abrir en modo creación, buscar las solicitudes aprobadas de la semana
watch(
  () => saleDrawer.isOpen.value,
  (isOpen) => {
    if (!isOpen || isViewingDetails.value) return
    resetStepper()
    void fetchApprovedRequests()
  }
)

// Si se pidió una solicitud concreta, se coloca en cuanto la lista llega
watch(
  () => [saleStore.approvedRequests, saleStore.isLoadingRequests] as const,
  () => {
    if (!props.preselectSolicitudId || selectedRequest.value || saleStore.isLoadingRequests) return

    const match = saleStore.approvedRequests.find(
      (item) => item.solicitudId === props.preselectSolicitudId
    )

    if (match) {
      selectedRequest.value = match
      step.value = 'form'
      preselectFailed.value = false
      return
    }

    preselectFailed.value = true
  },
  { deep: true }
)

// Methods
function resetStepper() {
  step.value = 'origin'
  selectedRequest.value = null
  preselectFailed.value = false
}

function handleOriginSelect(origin: 'request' | 'manual') {
  step.value = origin === 'request' ? 'pick' : 'form'
}

function handleRequestSelect(request: ApprovedRequest) {
  selectedRequest.value = request
  step.value = 'form'
}

function handleBack() {
  if (step.value === 'form' && selectedRequest.value) {
    selectedRequest.value = null
    step.value = 'pick'
    return
  }
  step.value = 'origin'
  selectedRequest.value = null
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
          <DataField v-if="saleDrawer.selectedData.value.solicitudId" label="Origen" value="Solicitud de la app" />
        </SectionContainer>

        <!-- Create Mode -->
        <SectionContainer v-else>
          <AlertMsg v-if="gerenciaSelected && step === 'origin'" type="info" label="Estás creando una venta"
            :message="`en la gerencia ${gerenciaSelected}`" />

          <!-- La solicitud pedida desde su detalle ya no está disponible -->
          <AlertMsg v-if="preselectFailed && step === 'origin'" type="warning"
            label="Esa solicitud ya no está disponible"
            message="Puede que ya tenga venta o que sea de otra semana. Elige otra o captura a mano." />

          <!-- Paso 1: origen -->
          <SaleOriginStep v-if="step === 'origin'" :request-count="saleStore.approvedRequestsCount"
            :is-loading="saleStore.isLoadingRequests" :has-gerencia="Boolean(gerenciaSelected)"
            @select="handleOriginSelect" />

          <!-- Paso 2: elegir solicitud -->
          <ApprovedRequestPicker v-else-if="step === 'pick'" :requests="saleStore.approvedRequests"
            @select="handleRequestSelect" />

          <!-- Paso 3: confirmar -->
          <SaleForm v-else :is-saving="saleStore.isSavingSale" :request="selectedRequest"
            @submit="handleSubmit" @change-request="handleBack" />
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
