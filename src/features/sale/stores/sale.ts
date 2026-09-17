import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Disbursement, SaleDetails } from '../types'

const STORE_NAME = 'sale'

/**
 * Store para manejar el estado del módulo de ventas
 * Centraliza el estado de la lista de ventas y loading states
 *
 * NOTA: La lógica del drawer se maneja con useDrawer('sale')
 * de @/shared/composables para ser reutilizable en otras features
 */
export const useSaleStore = defineStore(STORE_NAME, () => {
  // ============================================
  // Estado - Lista de Ventas
  // ============================================
  const sales = ref<SaleDetails[]>([])
  const isLoadingSales = ref(false)
  const isSavingSale = ref(false)

  // Desembolsos de la semana que todavia no tienen venta
  const disbursements = ref<Disbursement[]>([])
  const isLoadingDisbursements = ref(false)

  // ============================================
  // Computed Properties
  // ============================================
  const hasSales = computed(() => sales.value.length > 0)
  const salesCount = computed(() => sales.value.length)
  const disbursementsCount = computed(() => disbursements.value.length)

  // ============================================
  // Métodos - Lista de Ventas
  // ============================================

  /**
   * Establece la lista de ventas
   */
  function setSales(newSales: SaleDetails[]) {
    sales.value = newSales
  }

  /**
   * Añade una venta a la lista
   */
  function addSale(sale: SaleDetails) {
    sales.value.push(sale)
  }

  /**
   * Actualiza una venta existente
   */
  function updateSale(updatedSale: SaleDetails) {
    const index = sales.value.findIndex(s => s.id === updatedSale.id)
    if (index !== -1) {
      sales.value[index] = updatedSale
    }
  }

  /**
   * Limpia la lista de ventas
   */
  function clearSales() {
    sales.value = []
  }

  /**
   * Establece el estado de carga de ventas
   */
  function setLoadingSales(loading: boolean) {
    isLoadingSales.value = loading
  }

  /**
   * Establece el estado de guardado de venta
   */
  function setSavingSale(saving: boolean) {
    isSavingSale.value = saving
  }

  /**
   * Establece los desembolsos disponibles de la semana
   */
  function setDisbursements(items: Disbursement[]) {
    disbursements.value = items
  }

  /**
   * Establece el estado de carga de desembolsos
   */
  function setLoadingDisbursements(loading: boolean) {
    isLoadingDisbursements.value = loading
  }

  // ============================================
  // Reset completo del store
  // ============================================

  /**
   * Reinicia todo el estado del store
   */
  function $reset() {
    sales.value = []
    isLoadingSales.value = false
    isSavingSale.value = false
    disbursements.value = []
    isLoadingDisbursements.value = false
  }

  return {
    // Estado
    sales,
    isLoadingSales,
    isSavingSale,
    disbursements,
    isLoadingDisbursements,

    // Computed
    hasSales,
    salesCount,
    disbursementsCount,

    // Métodos
    setSales,
    addSale,
    updateSale,
    clearSales,
    setLoadingSales,
    setSavingSale,
    setDisbursements,
    setLoadingDisbursements,

    // Reset
    $reset,
  }
})
