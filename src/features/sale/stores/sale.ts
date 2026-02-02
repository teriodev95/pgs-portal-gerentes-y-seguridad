import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SaleDetails } from '../types'

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

  // ============================================
  // Computed Properties
  // ============================================
  const hasSales = computed(() => sales.value.length > 0)
  const salesCount = computed(() => sales.value.length)

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
  }

  return {
    // Estado
    sales,
    isLoadingSales,
    isSavingSale,

    // Computed
    hasSales,
    salesCount,

    // Métodos
    setSales,
    addSale,
    updateSale,
    clearSales,
    setLoadingSales,
    setSavingSale,

    // Reset
    $reset,
  }
})
