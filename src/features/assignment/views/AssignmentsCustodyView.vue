<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Check, RefreshCw, WalletCards } from 'lucide-vue-next'
import { ROUTE_NAME } from '@/router'
import { useStore } from '@/shared/stores'
import { assignmentService } from '@/features/assignment/services/assignment.service'
import { useNotification } from '@/shared/composables/useNotification'
import type { ICustodyAssignment, IUserVerificationPin } from '@/features/assignment/types'

import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import ValidationPin from '@/features/assignment/components/ValidationPin.vue'

type Destination = 'gerente' | 'admin'
type ValidationStatus = 'default' | 'success' | 'error'

const router = useRouter()
const $store = useStore()
const { showError } = useNotification()

const assignments = ref<ICustodyAssignment[]>([])
const inputRecipientPin = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const isVerifyingRecipientPin = ref(false)
const recipientErrorMessage = ref('')
const recipientStatus = ref<ValidationStatus>('default')
const recipientUser = ref<IUserVerificationPin>()
const selectionNotice = ref('')
const selectedDestination = ref<Destination>('gerente')
const selectedIds = ref<string[]>([])
const week = ref(0)
const year = ref(0)

const adminRoles = ['Administrativo', 'Oficina', 'Jefe de Admin', 'Sistemas']
const moneyFormatter = new Intl.NumberFormat('es-MX', {
  currency: 'MXN',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: 'currency',
})

const canUseCustody = computed(() => ['Seguridad', 'Regional'].includes($store.user?.tipo ?? ''))
const hasAssignments = computed(() => assignments.value.length > 0)
const custodyTotal = computed(() =>
  assignments.value.reduce((total, assignment) => total + assignment.amount, 0)
)
const selectedAssignments = computed(() =>
  assignments.value.filter((assignment) => selectedIds.value.includes(assignment.originAssignmentId))
)
const selectedAssignment = computed(() => selectedAssignments.value[0])
const selectedTotal = computed(() =>
  selectedAssignments.value.reduce((total, assignment) => total + assignment.amount, 0)
)
const isManagerDestination = computed(() => selectedDestination.value === 'gerente')
const isSelectionReadyForDestination = computed(() =>
  isManagerDestination.value ? selectedIds.value.length === 1 : selectedIds.value.length > 0
)
const canSave = computed(
  () =>
    isSelectionReadyForDestination.value &&
    recipientStatus.value === 'success' &&
    !isSaving.value
)
const selectedCountLabel = computed(() =>
  selectedIds.value.length === 1 ? '1 asignación' : `${selectedIds.value.length} asignaciones`
)
const availableCountLabel = computed(() =>
  assignments.value.length === 1 ? '1 asignación disponible' : `${assignments.value.length} asignaciones disponibles`
)
const destinationHelpText = computed(() => {
  if (isManagerDestination.value) {
    if (selectionNotice.value) return selectionNotice.value
    if (selectedIds.value.length === 0) return 'Selecciona una asignación para devolverla al gerente.'
    if (selectedIds.value.length > 1) return 'Para devolver al gerente solo puedes seleccionar una asignación.'

    const assignment = selectedAssignment.value
    return assignment
      ? `Se devolverá la asignación de ${assignment.agency} al gerente de ${assignment.derivedManagement}.`
      : 'Selecciona una asignación para devolverla al gerente.'
  }

  if (selectedIds.value.length === 0) {
    return 'Selecciona una o varias asignaciones para entregarlas a Administración.'
  }

  return `Administración recibirá ${selectedCountLabel.value}.`
})
const destinationHelpClass = computed(() => {
  if (isManagerDestination.value && selectedIds.value.length > 1) {
    return 'bg-red-50 text-red-700'
  }

  return isSelectionReadyForDestination.value
    ? 'bg-blue-50 text-blue-800'
    : 'bg-gray-50 text-gray-600'
})
const recipientPinInstruction = computed(() => {
  if (!isSelectionReadyForDestination.value) {
    return isManagerDestination.value
      ? 'Selecciona una asignación para validar el PIN del gerente'
      : 'Selecciona al menos una asignación para validar el PIN de Administración'
  }

  if (isManagerDestination.value) {
    return 'Ingresa el PIN del gerente que recibe esta asignación'
  }

  return selectedIds.value.length === 1
    ? 'Ingresa el PIN de quien recibe esta asignación en Administración'
    : 'Ingresa el PIN de quien recibe estas asignaciones en Administración'
})

function formatMoney(value: number) {
  return moneyFormatter.format(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('es-MX', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  })
}

function handleBack() {
  router.push({ name: ROUTE_NAME.MANAGER_ASSIGNMENTS_VIEW })
}

function isSelected(id: string) {
  return selectedIds.value.includes(id)
}

function toggleAssignment(id: string) {
  selectionNotice.value = ''

  if (isManagerDestination.value) {
    selectedIds.value = isSelected(id) ? [] : [id]
    return
  }

  selectedIds.value = isSelected(id)
    ? selectedIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedIds.value, id]
}

function selectDestination(destination: Destination) {
  selectedDestination.value = destination
}

function resetRecipientValidation() {
  inputRecipientPin.value = ''
  recipientErrorMessage.value = ''
  recipientStatus.value = 'default'
  recipientUser.value = undefined
}

function recipientBelongsToSelectedManagement(user: IUserVerificationPin) {
  if (!isManagerDestination.value) return true

  const management = selectedAssignment.value?.derivedManagement
  if (!management) return false

  return (
    user.gerencia === management ||
    user.gerenciasACargo?.some((gerencia) => gerencia.gerenciaid === management)
  )
}

async function loadCustody() {
  isLoading.value = true

  try {
    const response = await assignmentService.getCustodyAssignments()
    assignments.value = response.assignments
    week.value = response.week
    year.value = response.year
    selectedIds.value = selectedIds.value.filter((id) =>
      response.assignments.some((assignment) => assignment.originAssignmentId === id)
    )
  } catch (error) {
    console.error('CUSTODY_LOAD_FAILED', error)
    showError('No se pudo cargar el efectivo en custodia')
  } finally {
    isLoading.value = false
  }
}

async function validateRecipientPin() {
  if (!isSelectionReadyForDestination.value) {
    recipientStatus.value = 'error'
    recipientErrorMessage.value = isManagerDestination.value
      ? 'Selecciona una sola asignación antes de validar el PIN del gerente.'
      : 'Selecciona al menos una asignación antes de validar el PIN de Administración.'
    return
  }

  if (!inputRecipientPin.value.trim()) {
    recipientStatus.value = 'error'
    recipientErrorMessage.value = 'Ingresa el PIN de quien recibirá el efectivo.'
    return
  }

  try {
    isVerifyingRecipientPin.value = true
    const response = await assignmentService.verificationByPin(inputRecipientPin.value)
    const user = response.data
    const isValidRecipient =
      selectedDestination.value === 'admin'
        ? adminRoles.includes(user.tipo)
        : user.tipo === 'Gerente'

    if (!isValidRecipient) {
      recipientStatus.value = 'error'
      recipientErrorMessage.value =
        selectedDestination.value === 'admin'
          ? 'Para entregar a Administración, valida el PIN de un usuario administrativo.'
          : 'Para devolver al gerente, valida el PIN de un usuario Gerente.'
      recipientUser.value = undefined
      return
    }

    if (!recipientBelongsToSelectedManagement(user)) {
      const management = selectedAssignment.value?.derivedManagement
      recipientStatus.value = 'error'
      recipientErrorMessage.value = `Ese gerente no corresponde a ${management}. Valida el PIN del gerente de esa asignación.`
      recipientUser.value = undefined
      return
    }

    recipientUser.value = user
    recipientStatus.value = 'success'
    recipientErrorMessage.value = ''
  } catch (error) {
    recipientStatus.value = 'error'
    recipientErrorMessage.value = 'No se pudo validar el PIN. Revisa que esté correcto e intenta otra vez.'
    showError('Error al validar PIN del receptor')
  } finally {
    isVerifyingRecipientPin.value = false
  }
}

async function saveCustodyReturn() {
  if (!recipientUser.value || !canSave.value) return

  try {
    isSaving.value = true
    await assignmentService.returnCustodyAssignments({
      destino: selectedDestination.value,
      origen_asignacion_ids: selectedIds.value,
      quien_recibio: recipientUser.value.usuarioid,
    })
    selectedIds.value = []
    resetRecipientValidation()
    await loadCustody()
  } catch (error) {
    console.error('CUSTODY_RETURN_FAILED', error)
    showError('No se pudo registrar el retorno')
  } finally {
    isSaving.value = false
  }
}

watch(selectedDestination, (destination) => {
  resetRecipientValidation()

  if (destination === 'gerente' && selectedIds.value.length > 1) {
    selectedIds.value = [selectedIds.value[0]]
    selectionNotice.value = 'Para devolver al gerente se permite una sola asignación. Conservamos la primera selección.'
  } else {
    selectionNotice.value = ''
  }
})

watch(selectedIds, () => {
  resetRecipientValidation()

  if (!isManagerDestination.value || selectedIds.value.length !== 1) {
    selectionNotice.value = ''
  }
})

onMounted(async () => {
  if (!canUseCustody.value) {
    router.replace({ name: ROUTE_NAME.MANAGER_ASSIGNMENTS_VIEW })
    return
  }

  await loadCustody()
})
</script>

<template>
  <MainCT>
    <NavbarCT
      title="Efectivo en custodia"
      :show-back-button="true"
      @back="handleBack"
    />

    <SectionContainer>
      <div class="mb-3 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
        <div>
          <p class="text-xs font-medium text-gray-500">Semana {{ week || $store.currentDate.week }}</p>
          <p class="text-lg font-semibold text-gray-950">{{ formatMoney(custodyTotal) }}</p>
          <p class="text-[11px] font-medium text-gray-500">{{ availableCountLabel }}</p>
        </div>
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          :disabled="isLoading"
          @click="loadCustody"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': isLoading }" :stroke-width="1.8" />
        </button>
      </div>

      <LoadSkeleton v-if="isLoading" :items="6" />

      <EmptyCT
        v-else-if="!hasAssignments"
        message="No hay efectivo en custodia"
        description="No tienes asignaciones pendientes de la semana actual."
      />

      <div v-else class="space-y-2 pb-72">
        <button
          v-for="assignment in assignments"
          :key="assignment.originAssignmentId"
          type="button"
          class="w-full rounded-lg border bg-white p-3 text-left transition-colors"
          :class="isSelected(assignment.originAssignmentId)
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:bg-gray-50'"
          @click="toggleAssignment(assignment.originAssignmentId)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <WalletCards class="size-4 shrink-0 text-blue-700" :stroke-width="1.8" />
                <p class="truncate text-sm font-semibold text-gray-950">
                  {{ assignment.agency }}
                </p>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ assignment.agent?.nombre || assignment.agent?.usuario || 'Agente' }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-base font-semibold text-gray-950">{{ formatMoney(assignment.amount) }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(assignment.createdAt) }}</p>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
              <Building2 class="size-3" :stroke-width="1.8" />
              {{ assignment.derivedManagement }}
            </span>
            <span
              class="inline-flex size-6 items-center justify-center border"
              :title="isManagerDestination ? 'Selección única para gerente' : 'Selección múltiple para Administración'"
              :class="isSelected(assignment.originAssignmentId)
                ? `border-blue-600 bg-blue-600 text-white ${isManagerDestination ? 'rounded-full' : 'rounded-md'}`
                : `border-gray-300 text-transparent ${isManagerDestination ? 'rounded-full' : 'rounded-md'}`"
            >
              <Check class="size-4" :stroke-width="2" />
            </span>
          </div>
        </button>
      </div>
    </SectionContainer>

    <div
      v-if="hasAssignments"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)]"
    >
      <div class="mx-auto max-w-lg space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium"
            :class="selectedDestination === 'gerente'
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-200 text-gray-700'"
            @click="selectDestination('gerente')"
          >
            <span class="block">Gerente</span>
            <span class="block text-[11px] font-medium opacity-80">1 asignación</span>
          </button>
          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium"
            :class="selectedDestination === 'admin'
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-200 text-gray-700'"
            @click="selectDestination('admin')"
          >
            <span class="block">Administración</span>
            <span class="block text-[11px] font-medium opacity-80">varias asignaciones</span>
          </button>
        </div>

        <div class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <span class="text-xs font-medium text-gray-600">{{ selectedCountLabel }}</span>
          <span class="text-sm font-semibold text-gray-950">{{ formatMoney(selectedTotal) }}</span>
        </div>

        <p class="rounded-lg px-3 py-2 text-xs font-medium" :class="destinationHelpClass">
          {{ destinationHelpText }}
        </p>

        <ValidationPin
          label="PIN QUIEN"
          v-model:pin="inputRecipientPin"
          type="recipient"
          :status="recipientStatus"
          :user="recipientUser"
          :error-message="recipientErrorMessage"
          :instruction="recipientPinInstruction"
          :is-verifying="isVerifyingRecipientPin"
          :disabled="!isSelectionReadyForDestination"
          @validate="validateRecipientPin"
        />

        <button
          type="button"
          class="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500"
          :disabled="!canSave"
          @click="saveCustodyReturn"
        >
          {{ isSaving ? 'Guardando...' : 'Guardar retorno' }}
        </button>
      </div>
    </div>
  </MainCT>
</template>
