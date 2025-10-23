<script setup lang="ts">
import { computed, ref } from 'vue';
import { ROUTE_NAME } from '@/router'
import { useRouter } from 'vue-router'
import { useCallCenterStore } from '@/features/call-center/stores/call-center'
import type { ICallCenterReport, IQuestion } from '../types';

// Components
import PhoneIcon from '@/shared/components/icons/PhoneIcon.vue'
import HeadphonesIcon from '@/shared/components/icons/HeadPhonesIcon.vue'

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

// State definitions
const selectedAvalQuestion = ref<IQuestion>()
const selectedClientQuestion = ref<IQuestion>()
const isClientObservationsVisible = ref<boolean>(false)
const isAvalObservationsVisible = ref<boolean>(false)

// Computed properties
const isAvalQuestionSelected = computed(() => selectedAvalQuestion.value !== undefined)
const isClientQuestionSelected = computed(() => selectedClientQuestion.value !== undefined)
const hasClientAnsweredCall = computed(() => props.report.status_llamada_cliente === 'Contestado')
const hasAvalAnsweredCall = computed(() => props.report.status_llamada_aval === 'Contestado')

// Methods
/**
 * Reset all state flags and selections when the bottom sheet closes
 */
function resetSheetButtonFlags(): void {
  isClientObservationsVisible.value = false
  isAvalObservationsVisible.value = false
  selectedClientQuestion.value = undefined
  selectedAvalQuestion.value = undefined
}

/**
 * Handle selection of a client question
 * @param question - The selected question or undefined to clear selection
 */
function selectClientQuestion(question: IQuestion | undefined): void {
  selectedClientQuestion.value = question
}

/**
 * Handle selection of an aval question
 * @param question - The selected question or undefined to clear selection
 */
function selectAvalQuestion(question: IQuestion | undefined): void {
  selectedAvalQuestion.value = question
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
 * Toggle client observations visibility
 */
function toggleClientObservations(): void {
  isClientObservationsVisible.value = !isClientObservationsVisible.value
}

/**
 * Toggle aval observations visibility
 */
function toggleAvalObservations(): void {
  isAvalObservationsVisible.value = !isAvalObservationsVisible.value
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
    <div class="flex flex-col justify-between gap-4 px-4 pt-1 pb-4 h-full">
      <!-- Client Information Section -->
      <div class="space-y-4 flex-none">
        <!-- Loan ID Header -->
        <div>
          <h1 class="text-center text-lg font-bold text-blue-800">{{ report.prestamoId }}</h1>
          <hr class="line" />
        </div>

        <!-- Client Details -->
        <div>
          <p class="font-300 flex items-center justify-between text-gray-400 gap-4">
            Cliente
            <span class="font-md-700 text-blue-800 text-right">{{ report.nombres_cliente }}</span>
          </p>
          <p class="font-300 flex items-center justify-between text-gray-400 gap-4">
            Atendió
            <span class="font-md-700 text-blue-800 text-right">{{ report.nombre_atiende_cliente }}</span>
          </p>
        </div>

        <!-- Client Call Stats & Recording -->
        <div class="flex justify-end gap-4">
          <kbd
            class="flex items-center gap-1 rounded border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
            <PhoneIcon class="h-4 w-4" />
            <span>{{ report.num_llamadas_cliente }}</span>
          </kbd>

          <a v-if="report.url_llamada_cliente" :href="report.url_llamada_cliente" target="_blank"
            class="me-2 flex items-center gap-1 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <HeadphonesIcon class="h-4 w-4" /> Escuchar
          </a>
        </div>

        <!-- Client Observations -->
        <div v-if="!isClientObservationsVisible" @click="toggleClientObservations"
          class="flex h-16 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-2 shadow">
          <p class="font-300 text-gray-400">Observaciones</p>
        </div>

        <div v-else @click="toggleClientObservations"
          class="flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-2 shadow">
          <p class="font-md-700 text-blue-800">
            {{ report.observaciones_cliente || 'No se han registrado observaciones' }}
          </p>
        </div>

        <!-- Client Question Details -->
        <div v-if="isClientQuestionSelected" @click="selectClientQuestion(undefined)"
          class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-5 py-2 shadow">
          <p class="font-300 text-gray-400">{{ selectedClientQuestion?.pregunta }}</p>
          <p class="font-md-700 text-blue-800">R= {{ selectedClientQuestion?.respuesta }}</p>
        </div>

        <!-- Client Questions Grid -->
        <div v-else-if="hasClientAnsweredCall" class="grid grid-cols-5 gap-2">
          <div v-for="(question, index) in report.preguntas_cliente" :key="`client-question-${index}`"
            @click="selectClientQuestion(question)"
            class="flex h-16 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white shadow">
            <p class="font-300 text-gray-400">{{ `P${index + 1}` }}</p>
          </div>
        </div>
      </div>

      <!-- Aval Information Section -->
      <div class="space-y-4 flex-1">
        <hr class="line" />

        <!-- Aval Details -->
        <div>
          <p class="font-300 flex items-center justify-between text-gray-400 gap-4">
            Avál
            <span class="font-md-700 text-blue-800 text-right">{{ report.nombres_aval }}</span>
          </p>
          <p class="font-300 flex items-center justify-between text-gray-400 gap-4">
            Atendió
            <span class="font-md-700 text-blue-800 text-right">{{ report.nombre_atiende_aval }}</span>
          </p>
        </div>

        <!-- Aval Call Stats & Recording -->
        <div class="flex justify-end gap-4">
          <kbd
            class="flex items-center gap-1 rounded border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
            <PhoneIcon class="h-4 w-4" />
            <span>{{ report.num_llamadas_aval }}</span>
          </kbd>

          <a v-if="report.url_llamada_aval" :href="report.url_llamada_aval" target="_blank"
            class="me-2 flex items-center gap-1 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <HeadphonesIcon class="h-4 w-4" /> Escuchar
          </a>
        </div>

        <!-- Aval Observations -->
        <div v-if="!isAvalObservationsVisible" @click="toggleAvalObservations"
          class="flex h-16 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-2 shadow">
          <p class="font-300 text-gray-400">Observaciones</p>
        </div>

        <div v-else @click="toggleAvalObservations"
          class="flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-2 shadow">
          <p class="font-md-700 text-blue-800">
            {{ report.observaciones_aval || 'No se han registrado observaciones' }}
          </p>
        </div>

        <!-- Aval Question Details -->
        <div v-if="isAvalQuestionSelected" @click="selectAvalQuestion(undefined)"
          class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-5 py-2 shadow">
          <p class="font-300 text-gray-400">{{ selectedAvalQuestion?.pregunta }}</p>
          <p class="font-md-700 text-blue-800">R= {{ selectedAvalQuestion?.respuesta }}</p>
        </div>

        <!-- Aval Questions Grid -->
        <div v-else-if="hasAvalAnsweredCall" class="grid grid-cols-5 gap-2">
          <div v-for="(question, index) in report.preguntas_aval" :key="`aval-question-${index}`"
            @click="selectAvalQuestion(question)"
            class="flex h-16 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white shadow">
            <p class="font-300 text-gray-400">{{ `P${index + 1}` }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons Section -->
      <div class="space-y-2 flex-none">
        <button class="btn btn-primary-outline w-full" @click="navigateToLoan(`${report.prestamoId}`)">
          Detalles del préstamo
        </button>

        <button class="btn btn-primary w-full" @click="createNewVisit">
          Agregar visita
        </button>
      </div>
    </div>
  </section>
</template>