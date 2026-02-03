<script setup lang="ts">
import { computed, ref } from 'vue'
import { ROUTE_NAME } from '@/router'
import { useRouter } from 'vue-router'
import { useCallCenterStore } from '@/features/call-center/stores/call-center'
import type { ICallCenterReport } from '../types'
import type { ContactInfo } from './ContactInfoSection.vue'

// Components
import TextCT from '@/shared/components/ui/TextCT.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import ContactInfoSection from './ContactInfoSection.vue'

// Interfaces & Types
interface Emits {
  (event: 'action:close-bottom-sheet'): void
  (event: 'action:create-visit'): void
}

interface Props {
  report: ICallCenterReport
}

// Services and stores initialization
const $emits = defineEmits<Emits>()
const props = defineProps<Props>()
const $router = useRouter()
const $callCenterStore = useCallCenterStore()

// Refs to component instances
const clientSectionRef = ref<InstanceType<typeof ContactInfoSection>>()
const avalSectionRef = ref<InstanceType<typeof ContactInfoSection>>()

// Computed properties - Contact Info Objects
const clientContact = computed<ContactInfo>(() => ({
  label: 'Cliente',
  name: props.report.nombres_cliente,
  attendedBy: props.report.nombre_atiende_cliente,
  numCalls: props.report.num_llamadas_cliente,
  callUrl: props.report.url_llamada_cliente,
  observations: props.report.observaciones_cliente,
  questions: props.report.preguntas_cliente,
  callStatus: props.report.status_llamada_cliente
}))

const avalContact = computed<ContactInfo>(() => ({
  label: 'Aval',
  name: props.report.nombres_aval,
  attendedBy: props.report.nombre_atiende_aval,
  numCalls: props.report.num_llamadas_aval,
  callUrl: props.report.url_llamada_aval,
  observations: props.report.observaciones_aval,
  questions: props.report.preguntas_aval,
  callStatus: props.report.status_llamada_aval
}))

// Methods
/**
 * Reset all state flags and selections when the bottom sheet closes
 */
function resetSheetButtonFlags(): void {
  clientSectionRef.value?.reset()
  avalSectionRef.value?.reset()
}

/**
 * Navigate to the loan details page
 * @param id - Loan ID to navigate to
 */
function navigateToLoan(id: number | string): void {
  // Guardar en el store para navegación activa
  $callCenterStore.setActiveGoToLoan(true, `${id}`)

  // Emitir evento para que el componente padre maneje la navegación
  $emits('action:close-bottom-sheet')

  void $router.push({
    name: ROUTE_NAME.DASHBOARD_PRESTAMO,
    query: {
      prestamo: id
    }
  })
}

/**
 * Create a new visit
 */
function createNewVisit(): void {
  // Emitir evento para que el componente padre maneje la creación de visita
  $emits('action:create-visit')
}

// Expose Methods
defineExpose({
  resetSheetButtonFlags,
})
</script>

<template>
  <section class="container-bottom-sheet-data h-full">
    <div class="flex flex-col justify-between gap-4 pt-1 pb-4 h-full">
      <!-- Client Information Section -->
      <div class="space-y-4 flex-none">
        <!-- Loan ID Header -->
        <div>
          <TextCT variant="title" class="text-center">{{ report.prestamoId }}</TextCT>
          <hr class="line" />
        </div>

        <ContactInfoSection ref="clientSectionRef" :contact="clientContact" />
      </div>

      <!-- Aval Information Section -->
      <ContactInfoSection ref="avalSectionRef" :contact="avalContact" show-top-divider />

      <!-- Action Buttons Section -->
      <div class="space-y-2 flex-none">
        <BtnComponent full-width outline @click="navigateToLoan(`${report.prestamoId}`)">
          Detalles del préstamo
        </BtnComponent>

        <BtnComponent full-width @click="createNewVisit">
          Agregar visita
        </BtnComponent>
      </div>
    </div>
  </section>
</template>