import { computed, onBeforeMount } from 'vue'
import { useStore } from '@/shared/stores'
import type { WeeklyExpense, ExpenseFormData } from '../types'
import { weeklyExpenseService } from '../services/expense.service'
import { useExpenseStore } from '../stores'
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

/**
 * Composable para la lógica de negocio de gastos semanales
 * El estado se maneja en el store (useExpenseStore)
 * Este composable solo contiene lógica de negocio pura
 */
export function useExpenseData() {
  // Services, Composables and Stores initialization
  const $store = useStore()
  const expenseStore = useExpenseStore()
  const { showError } = useNotification()

  // Computed properties (datos del store global)
  const user = computed(() => $store.user)
  const currentDate = computed(() => $store.currentDate)
  const isUserManager = computed(() => $store.isUserManager)
  const gerenciaSelected = computed(() => $store.gerenciaSelected)

  // ============================================
  // Business Logic - Fetch Expenses
  // ============================================

  /**
   * Obtiene los gastos del usuario para la semana actual
   */
  async function fetchExpenses(): Promise<void> {
    if (!user.value?.usuarioId) return

    try {
      expenseStore.setLoadingExpenses(true)
      const { data } = await weeklyExpenseService.getWeeklyExpenses(
        user.value.usuarioId,
        currentDate.value.week,
        currentDate.value.year
      )
      expenseStore.setExpenses(data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      expenseStore.setLoadingExpenses(false)
    }
  }

  // ============================================
  // Business Logic - Save Expense
  // ============================================

  /**
   * Guarda un nuevo gasto
   * Separa la responsabilidad: solo guarda, no refresca
   */
  async function saveExpense(formData: ExpenseFormData): Promise<void> {
    if (!user.value?.usuarioId) {
      showError('Usuario no autenticado')
      return Promise.reject(new Error('Usuario no autenticado'))
    }

    const currentDateStr = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Mexico_City'
    })

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

    expenseStore.setSavingExpense(true)

    try {
      await weeklyExpenseService.createExpense(expense)
      // Refrescar la lista después de guardar
      await fetchExpenses()
      return Promise.resolve()
    } catch (error) {
      console.error('Error saving expense:', error)
      return Promise.reject(error)
    } finally {
      expenseStore.setSavingExpense(false)
    }
  }

  // ============================================
  // Lifecycle hooks
  // ============================================

  onBeforeMount(async () => {
    try {
      await fetchExpenses()
    } catch (error) {
      console.error('Error initializing expenses:', error)
    }
  })

  // ============================================
  // Return
  // ============================================

  return {
    // Computed - Basic (datos del store global)
    user,
    currentDate,
    isUserManager,
    gerenciaSelected,

    // Methods
    fetchExpenses,
    saveExpense,
  }
}
