import { computed, onBeforeMount, ref } from 'vue'
import { solimService } from '../services/solim.service'
import { useSolimErrorHandler } from './useSolimErrorHandler'
import type {
  ApprovalType,
  ApprovalDialogForm,
  RevisionApproval,
  Solicitud,
  SolimRole,
  TablaCargosOption,
  UpdateCheckPayload
} from '../types'
import { useStore } from '@/shared/stores'
import { useToast } from 'vue-toast-notification'
import type { IAgencyBasicInfo } from '@/interfaces'

const ROLE_MAP: Record<string, SolimRole> = {
  gerente: 'gerente',
  regional: 'gerente',
  seguridad: 'seguridad'
}

const numberFromInput = (value: string): number | null => {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

const stringFromInput = (value: string): string | undefined => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function useSolimData() {
  const $store = useStore()
  const { handleError } = useSolimErrorHandler()
  const $toast = useToast()

  const loanRequests = ref<Solicitud[]>([])
  const selectedLoanRequest = ref<Solicitud | null>(null)
  const tablaCargosOptions = ref<TablaCargosOption[]>([])
  const selectedAgency = ref<string>('all')
  const isLoadingLoanRequests = ref(false)
  const isLoadingSelectedLoanRequest = ref(false)
  const isProcessingAction = ref(false)

  const currentApprovalType = computed<ApprovalType>(() => {
    const role = ($store.user?.tipo ?? '').trim().toLowerCase()
    return ROLE_MAP[role] ?? 'gerente'
  })

  const currentRoleLabel = computed(() =>
    currentApprovalType.value === 'seguridad' ? 'Seguridad' : 'Gerente'
  )

  const expectedPin = computed(() => String($store.authPin ?? $store.user?.pin ?? '').trim())

  const filteredLoanRequests = computed(() =>
    loanRequests.value.filter((request) => {
      const requirements = request.approval_requirements ?? request.revision?.approval_requirements
      const approvals = request.revision_aprobaciones ?? request.revision?.aprobaciones ?? []
      const currentApproval = approvals.find(
        (approval) => approval.tipo === currentApprovalType.value
      )

      return Boolean(requirements?.[currentApprovalType.value]) || currentApproval?.requerido === 1
    })
  )

  const hasLoanRequests = computed(() => filteredLoanRequests.value.length > 0)
  const loanRequestsCount = computed(() => filteredLoanRequests.value.length)
  const availableAgencies = computed<IAgencyBasicInfo[]>(() => {
    const seen = new Set<string>()
    return ($store.agencies ?? []).filter((agency) => {
      if (!agency?.agencia || seen.has(agency.agencia)) {
        return false
      }
      seen.add(agency.agencia)
      return true
    })
  })
  const currentApproval = computed<RevisionApproval | null>(() => {
    if (!selectedLoanRequest.value) {
      return null
    }

    const approvals =
      selectedLoanRequest.value.revision_aprobaciones ??
      selectedLoanRequest.value.revision?.aprobaciones ??
      []

    return (
      approvals.find((approval) => approval.tipo === currentApprovalType.value) ??
      null
    )
  })

  const canApproveSelected = computed(() => {
    const requirements = selectedLoanRequest.value?.approval_requirements ?? selectedLoanRequest.value?.revision?.approval_requirements
    return Boolean(currentApproval.value?.requerido) || Boolean(requirements?.[currentApprovalType.value])
  })

  async function fetchLoanRequests(): Promise<void> {
    try {
      isLoadingLoanRequests.value = true
      const response = await solimService.getLoanApplications({
        year: $store.currentDate.year,
        managment: $store.gerenciaSelected,
        week: $store.currentDate.week,
        agency: selectedAgency.value !== 'all' ? selectedAgency.value : undefined
      })
      
      if (response.data?.success) {
        loanRequests.value = response.data.data ?? []
      }
    } catch (error) {
      handleError(error, 'LOAN_REQUESTS_LOAD_FAILED')
    } finally {
      isLoadingLoanRequests.value = false
    }
  }

  async function fetchTablaCargosOptions(): Promise<void> {
    try {
      const response = await solimService.getTablaCargos()
      if (response.data?.success) {
        tablaCargosOptions.value = response.data.data ?? []
      }
    } catch (error) {
      handleError(error, 'LOAN_REQUESTS_LOAD_FAILED')
    }
  }

  async function fetchLoanRequestDetail(id: string): Promise<void> {
    try {
      isLoadingSelectedLoanRequest.value = true
      const response = await solimService.getLoanApplicationDetail(id)
      if (response.data?.success) {
        selectedLoanRequest.value = response.data.data
      }
    } catch (error) {
      handleError(error, 'LOAN_REQUEST_DETAILS_LOAD_FAILED')
    } finally {
      isLoadingSelectedLoanRequest.value = false
    }
  }

  function validatePin(pin: string): boolean {
    if (!expectedPin.value) {
      return true
    }

    return pin.trim() === expectedPin.value
  }

  function buildDecisionPayload(loanApprovalForm: ApprovalDialogForm) {
    if (loanApprovalForm.decision !== 'aprobado_con_ajuste') {
      return null
    }

    return {
      ...(loanApprovalForm.comentario.trim()
        ? { motivo: loanApprovalForm.comentario.trim() }
        : {}),
      ...(numberFromInput(loanApprovalForm.montoAutorizado) != null
        ? { monto_autorizado: numberFromInput(loanApprovalForm.montoAutorizado) }
        : {}),
      ...(numberFromInput(loanApprovalForm.incrementoAutorizado) != null
        ? { incremento_autorizado: numberFromInput(loanApprovalForm.incrementoAutorizado) }
        : {}),
      ...(stringFromInput(loanApprovalForm.nivelAutorizado)
        ? { nivel_autorizado: stringFromInput(loanApprovalForm.nivelAutorizado) }
        : {}),
      ...(numberFromInput(loanApprovalForm.plazoAutorizado) != null
        ? { plazo_autorizado: numberFromInput(loanApprovalForm.plazoAutorizado) }
        : {}),
      ...(numberFromInput(loanApprovalForm.tablaCargosIdSugerido) != null
        ? { tabla_cargos_id_sugerido: numberFromInput(loanApprovalForm.tablaCargosIdSugerido) }
        : {})
    }
  }

  async function processLoanRequest(loanApprovalForm: ApprovalDialogForm, id: string): Promise<void> {
    if (!loanApprovalForm.pin.trim()) {
      $toast.error('Captura tu PIN para registrar la decisión.')
      return
    }

    if (!validatePin(loanApprovalForm.pin)) {
      $toast.error('El PIN no coincide con tu sesión.')
      return
    }

    if (loanApprovalForm.decision === 'rechazado' && !loanApprovalForm.comentario.trim()) {
      $toast.error('Agrega un comentario para justificar el rechazo.')
      return
    }

    if (
      loanApprovalForm.decision === 'aprobado_con_ajuste' &&
      !loanApprovalForm.tablaCargosIdSugerido.trim()
    ) {
      $toast.error('Indica la tabla de cargos sugerida para el ajuste.')
      return
    }

    const decisionPayload = buildDecisionPayload(loanApprovalForm)
    const montoAutorizado = numberFromInput(loanApprovalForm.montoAutorizado)
    const incrementoAutorizado = numberFromInput(loanApprovalForm.incrementoAutorizado)
    const plazoAutorizado = numberFromInput(loanApprovalForm.plazoAutorizado)
    const tablaCargosIdSugerido = numberFromInput(loanApprovalForm.tablaCargosIdSugerido)
    const nivelAutorizado = stringFromInput(loanApprovalForm.nivelAutorizado)

    const payload: UpdateCheckPayload = {
      decision: loanApprovalForm.decision,
      userId: String($store.user?.usuarioId ?? $store.user?.usuario ?? ''),
      userName: [
        $store.user?.nombre,
        $store.user?.apellidoPaterno,
        $store.user?.apellidoMaterno
      ]
        .filter(Boolean)
        .join(' ')
        .trim(),
      notas: loanApprovalForm.comentario.trim() || undefined,
      pinValidado: true
    }

    if (tablaCargosIdSugerido != null) {
      payload.tablaCargosIdSugerido = tablaCargosIdSugerido
    }
    if (montoAutorizado != null) {
      payload.montoAutorizado = montoAutorizado
    }
    if (incrementoAutorizado != null) {
      payload.incrementoAutorizado = incrementoAutorizado
    }
    if (nivelAutorizado) {
      payload.nivelAutorizado = nivelAutorizado
    }
    if (plazoAutorizado != null) {
      payload.plazoAutorizado = plazoAutorizado
    }
    if (decisionPayload) {
      payload.decisionPayload = decisionPayload
    }

    try {
      isProcessingAction.value = true
      await solimService.updateLoanApplicationCheck(id, currentApprovalType.value, payload)
      $toast.success(`Revisión de ${currentRoleLabel.value.toLowerCase()} guardada.`)
      await fetchLoanRequests()
      await fetchLoanRequestDetail(id)
    } catch (error) {
      handleError(error, 'LOAN_REQUEST_APPROVAL_FAILED')
      throw error
    } finally {
      isProcessingAction.value = false
    }
  }

  async function saveApproval(loanApprovalForm: ApprovalDialogForm, id: string): Promise<void> {
    return processLoanRequest(loanApprovalForm, id)
  }

  async function selectLoanRequest(id: string): Promise<void> {
    await fetchLoanRequestDetail(id)
  }

  function clearSelectedLoanRequest(): void {
    selectedLoanRequest.value = null
  }

  onBeforeMount(async () => {
    if ($store.agencySelected) {
      selectedAgency.value = $store.agencySelected
    }
    await Promise.all([fetchLoanRequests(), fetchTablaCargosOptions()])
  })

  async function setSelectedAgency(agency: string): Promise<void> {
    selectedAgency.value = agency
    clearSelectedLoanRequest()
    await fetchLoanRequests()
  }

  return {
    loanRequests: filteredLoanRequests,
    selectedLoanRequest,
    tablaCargosOptions,
    selectedAgency,
    isLoadingLoanRequests,
    isLoadingSelectedLoanRequest,
    isProcessingAction,
    hasLoanRequests,
    loanRequestsCount,
    currentApproval,
    currentApprovalType,
    currentRoleLabel,
    canApproveSelected,
    availableAgencies,
    fetchLoanRequests,
    fetchTablaCargosOptions,
    setSelectedAgency,
    saveApproval,
    selectLoanRequest,
    clearSelectedLoanRequest
  }
}
