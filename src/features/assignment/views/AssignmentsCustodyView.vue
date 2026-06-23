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
const selectedAssignments = computed(() =>
  assignments.value.filter((assignment) => selectedIds.value.includes(assignment.originAssignmentId))
)
const selectedManagements = computed(() =>
  Array.from(new Set(selectedAssignments.value.map((assignment) => assignment.derivedManagement)))
)
const selectedTotal = computed(() =>
  selectedAssignments.value.reduce((total, assignment) => total + assignment.amount, 0)
)
const hasMixedManagementsForManager = computed(
  () => selectedDestination.value === 'gerente' && selectedManagements.value.length > 1
)
const canSave = computed(
  () =>
    selectedIds.value.length > 0 &&
    recipientStatus.value === 'success' &&
    !hasMixedManagementsForManager.value &&
    !isSaving.value
)

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
  selectedIds.value = isSelected(id)
    ? selectedIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedIds.value, id]
}

function resetRecipientValidation() {
  inputRecipientPin.value = ''
  recipientErrorMessage.value = ''
  recipientStatus.value = 'default'
  recipientUser.value = undefined
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
  if (!inputRecipientPin.value.trim()) {
    recipientStatus.value = 'error'
    recipientErrorMessage.value = 'El PIN es requerido'
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
          ? 'El PIN debe ser de Administracion'
          : 'El PIN debe ser de Gerente'
      recipientUser.value = undefined
      return
    }

    recipientUser.value = user
    recipientStatus.value = 'success'
    recipientErrorMessage.value = ''
  } catch (error) {
    recipientStatus.value = 'error'
    recipientErrorMessage.value = 'Error al validar PIN'
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

watch(selectedDestination, resetRecipientValidation)

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
          <p class="text-lg font-semibold text-gray-950">{{ formatMoney(selectedTotal) }}</p>
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
        description="No tienes partidas pendientes de la semana actual."
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
              class="inline-flex size-6 items-center justify-center rounded-md border"
              :class="isSelected(assignment.originAssignmentId)
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 text-transparent'"
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
            @click="selectedDestination = 'gerente'"
          >
            Gerente
          </button>
          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium"
            :class="selectedDestination === 'admin'
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-gray-200 text-gray-700'"
            @click="selectedDestination = 'admin'"
          >
            Administracion
          </button>
        </div>

        <div class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <span class="text-xs font-medium text-gray-600">{{ selectedIds.length }} partidas</span>
          <span class="text-sm font-semibold text-gray-950">{{ formatMoney(selectedTotal) }}</span>
        </div>

        <p v-if="hasMixedManagementsForManager" class="text-xs font-medium text-red-600">
          Selecciona una sola gerencia para devolver a gerente.
        </p>

        <ValidationPin
          label="PIN QUIEN"
          v-model:pin="inputRecipientPin"
          type="recipient"
          :status="recipientStatus"
          :user="recipientUser"
          :error-message="recipientErrorMessage"
          :is-verifying="isVerifyingRecipientPin"
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
