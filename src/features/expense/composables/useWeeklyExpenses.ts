import { computed, onBeforeMount, ref } from 'vue'
import { useStore } from '@/shared/stores'
import type { ExpenseFormData, WeeklyExpense } from '../types'
import { weeklyExpenseService } from '../services/expense.service'
import { useNotification } from '@/shared/composables/useNotification'

// Validation function
function validateExpenseData(expense: WeeklyExpense): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!expense.monto || expense.monto <= 0) {
    errors.push('El monto debe ser mayor a 0')
  }

  if (!expense.tipoGasto) {
    errors.push('El tipo de gasto es requerido')
  }

  if (expense.tipoGasto === 'GASOLINA' && (!expense.litros || expense.litros <= 0)) {
    errors.push('Los litros son requeridos para gastos de gasolina')
  }

  if (!expense.creadoPorId) {
    errors.push('Usuario no válido')
  }

  if (!expense.fecha) {
    errors.push('La fecha es requerida')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function useWeeklyExpenses() {
  // Services, Composables and Stores initialization
  const $store = useStore()
  const { showError } = useNotification()

  // State definitions
  const weeklyExpenses = ref<WeeklyExpense[]>([])
  const selectedExpense = ref<WeeklyExpense>()
  const isLoadingExpenses = ref(false)
  const isSavingExpense = ref(false)

  // Computed properties
  const user = computed(() => $store.user)
  const currentDate = computed(() => $store.currentDate)
  const isUserManager = computed(() => $store.isUserManager)
  const gerenciaSelected = computed(() => $store.gerenciaSelected)
  
  // Specific computed properties
  const hasExpenses = computed(() => weeklyExpenses.value.length > 0)
  const expensesCount = computed(() => weeklyExpenses.value.length)

  const isFormValid = computed(() => 
    selectedExpense.value ? true : !isSavingExpense.value
  )

  // Methods
  async function fetchWeeklyExpenses(): Promise<void> {
    if (!user.value?.usuarioId) return

    try {
      isLoadingExpenses.value = true
      const { data } = await weeklyExpenseService.getWeeklyExpenses(user.value.usuarioId, currentDate.value.week, currentDate.value.year)
      weeklyExpenses.value = data
    } catch (error) {
      console.error('Error fetching weekly expenses:', error)
    } finally {
      isLoadingExpenses.value = false
    }
  }

  async function saveExpense(formData: ExpenseFormData): Promise<void> {
    if (!user.value?.usuarioId) {
      showError('Usuario no autenticado')
      return Promise.reject(new Error('Usuario no autenticado'))
    }

    const currentDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })

    const expense: WeeklyExpense = {
      ...formData,
      creadoPorId: user.value.usuarioId,
      semana: currentDate.value.week,
      anio: currentDate.value.year,
      gerencia: isUserManager.value ? gerenciaSelected.value as string : '',
      fecha: currentDateStr,
    }

    // Validation before mutation
    const validation = validateExpenseData(expense)
    if (!validation.isValid) {
      validation.errors.forEach(error => showError(error))
      return Promise.reject(new Error(validation.errors.join(', ')))
    }

    isSavingExpense.value = true

    try {
      await weeklyExpenseService.createExpense(expense)
      await fetchWeeklyExpenses()
      return Promise.resolve()
    } catch (error) {
      console.error('Error saving expense:', error)
    } finally {
      isSavingExpense.value = false
    }
  }

  function selectExpenseForEditing(expense: WeeklyExpense): void {
    selectedExpense.value = expense
  }

  function clearSelectedExpense(): void {
    selectedExpense.value = undefined
  }

  // Lifecycle hooks
  onBeforeMount(async () => {
    await fetchWeeklyExpenses()
  })

  return {
    // State
    weeklyExpenses,
    selectedExpense,
    isLoadingExpenses,
    isSavingExpense,
    
    // Computed - Basic
    user,
    currentDate,
    isUserManager,
    gerenciaSelected,
    
    // Computed - Specific
    hasExpenses,
    expensesCount,
    isFormValid,
    
    // Methods
    fetchWeeklyExpenses,
    saveExpense,
    selectExpenseForEditing,
    clearSelectedExpense
  }
}