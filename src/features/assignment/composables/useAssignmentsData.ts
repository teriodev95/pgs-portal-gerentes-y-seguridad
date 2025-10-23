import { computed, onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { assignmentService } from '../services/assignment.service'
import { useAssignmentErrorHandler } from './useAssignmentErrorHandler'
import { ROUTE_NAME } from '@/router'
import type { INewAssignment } from '../types'

export type AssignmentViewType = 'agency' | 'management'

export interface AssignmentData {
  assignments: INewAssignment[]
  incomes?: INewAssignment[]
  expenses?: INewAssignment[]
}

export function useAssignmentsData(viewType: AssignmentViewType) {
  // Services and Composables
  const $store = useStore()
  const $router = useRouter()
  const { handleError } = useAssignmentErrorHandler()

  // State
  const assignments = ref<INewAssignment[]>([])
  const incomes = ref<INewAssignment[]>([])
  const expenses = ref<INewAssignment[]>([])
  
  // Computed properties - Shared
  const currentDate = computed(() => $store.currentDate)
  const agencySelected = computed(() => $store.agencySelected)
  const gerenciaSelected = computed(() => $store.gerenciaSelected)
  const isLoading = computed(() => $store.loading)
  
  // Computed properties - View specific
  const hasAssignments = computed(() => {
    if (viewType === 'agency') {
      return assignments.value.length > 0
    }
    return incomes.value.length > 0 || expenses.value.length > 0
  })

  const assignmentData = computed((): AssignmentData => {
    if (viewType === 'agency') {
      return { assignments: assignments.value }
    }
    return {
      assignments: [],
      incomes: incomes.value,
      expenses: expenses.value
    }
  })

  // Methods - API calls
  async function fetchAgencyAssignments(): Promise<void> {
    if (!currentDate.value || !agencySelected.value) return

    try {
      const response = await assignmentService.getAssignmentsByAgency(
        agencySelected.value,
        currentDate.value.week,
        currentDate.value.year
      )
      assignments.value = response.data
    } catch (error) {
      handleError(error, 'ASSIGNMENT_LOAD_FAILED')
      throw error
    }
  }

  async function fetchManagementAssignments(): Promise<void> {
    if (!currentDate.value || !gerenciaSelected.value) return

    try {
      const [incomesResponse, expensesResponse] = await Promise.all([
        assignmentService.getAssignmentsAsIncome(
          gerenciaSelected.value as string,
          currentDate.value.week,
          currentDate.value.year
        ),
        assignmentService.getAssignmentsAsExpense(
          gerenciaSelected.value as string,
          currentDate.value.week,
          currentDate.value.year
        )
      ])

      incomes.value = incomesResponse.data
      expenses.value = expensesResponse.data
    } catch (error) {
      handleError(error, 'ASSIGNMENT_LOAD_FAILED')
      throw error
    }
  }

  // Methods - Shared logic
  async function loadAssignments(): Promise<void> {
    $store.loading = true
    
    try {
      if (viewType === 'agency') {
        await fetchAgencyAssignments()
      } else {
        await fetchManagementAssignments()
      }
    } finally {
      $store.loading = false
    }
  }

  function navigateToCorrection(assignment: INewAssignment): void {
    $router.push({
      name: ROUTE_NAME.RECORD_CORRECTION,
      params: {
        type: 'asignacion',
        id: assignment.id,
        amount: assignment.monto.toString()
      }
    })
  }

  function navigateToCreateAssignment(): void {
    $router.push({ name: ROUTE_NAME.MANAGER_ASSIGNMENTS_VIEW_CREATE })
  }

  // Lifecycle hooks
  onBeforeMount(async () => {
    await loadAssignments()
  })

  return {
    // State
    assignmentData,
    
    // Computed - Shared
    currentDate,
    agencySelected,
    gerenciaSelected,
    isLoading,
    hasAssignments,
    
    // Methods
    loadAssignments,
    navigateToCorrection,
    navigateToCreateAssignment,
    
    // For direct access if needed
    assignments: assignments.value,
    incomes: incomes.value,
    expenses: expenses.value
  }
}