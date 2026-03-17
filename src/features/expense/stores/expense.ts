import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WeeklyExpense } from '../types'

const STORE_NAME = 'expense'

/**
 * Store para manejar el estado del módulo de gastos semanales
 * Centraliza el estado de la lista de gastos y loading states
 *
 * NOTA: La lógica del drawer se maneja con useDrawer('expense')
 * de @/shared/composables para ser reutilizable en otras features
 */
export const useExpenseStore = defineStore(STORE_NAME, () => {
  // ============================================
  // Estado - Lista de Gastos
  // ============================================
  const expenses = ref<WeeklyExpense[]>([])
  const isLoadingExpenses = ref(false)
  const isSavingExpense = ref(false)

  // ============================================
  // Computed Properties
  // ============================================
  const hasExpenses = computed(() => expenses.value.length > 0)
  const expensesCount = computed(() => expenses.value.length)

  // ============================================
  // Métodos - Lista de Gastos
  // ============================================

  /**
   * Establece la lista de gastos
   */
  function setExpenses(newExpenses: WeeklyExpense[]) {
    expenses.value = newExpenses
  }

  /**
   * Añade un gasto a la lista
   */
  function addExpense(expense: WeeklyExpense) {
    expenses.value.push(expense)
  }

  /**
   * Actualiza un gasto existente
   */
  function updateExpense(updatedExpense: WeeklyExpense) {
    const index = expenses.value.findIndex(e => e.gastoId === updatedExpense.gastoId)
    if (index !== -1) {
      expenses.value[index] = updatedExpense
    }
  }

  /**
   * Limpia la lista de gastos
   */
  function clearExpenses() {
    expenses.value = []
  }

  /**
   * Establece el estado de carga de gastos
   */
  function setLoadingExpenses(loading: boolean) {
    isLoadingExpenses.value = loading
  }

  /**
   * Establece el estado de guardado de gasto
   */
  function setSavingExpense(saving: boolean) {
    isSavingExpense.value = saving
  }

  // ============================================
  // Reset completo del store
  // ============================================

  /**
   * Reinicia todo el estado del store
   */
  function $reset() {
    expenses.value = []
    isLoadingExpenses.value = false
    isSavingExpense.value = false
  }

  return {
    // Estado
    expenses,
    isLoadingExpenses,
    isSavingExpense,

    // Computed
    hasExpenses,
    expensesCount,

    // Métodos
    setExpenses,
    addExpense,
    updateExpense,
    clearExpenses,
    setLoadingExpenses,
    setSavingExpense,

    // Reset
    $reset,
  }
})
