import { computed, onBeforeMount } from 'vue'
import { useStore } from '@/shared/stores'
import type { SaleDetails, SaleFormData } from '../types'
import { salesService } from '../services/sale.service'
import { useSaleStore } from '../stores'
import { useNotification } from '@/shared/composables/useNotification'

function validateSaleData(sale: SaleDetails): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!sale.fecha) {
    errors.push('La fecha es requerida')
  }
  
  if (!sale.agencia) {
    errors.push('La agencia es requerida')
  }
  
  if (!sale.nombreCliente || sale.nombreCliente.trim() === '') {
    errors.push('El nombre del cliente es requerido')
  }
  
  if (!sale.tipo) {
    errors.push('El tipo es requerido')
  }
  
  if (!sale.nivel) {
    errors.push('El nivel es requerido')
  }
  
  if (!sale.plazo) {
    errors.push('El plazo es requerido')
  }
  
  if (!sale.monto || sale.monto <= 0) {
    errors.push('El monto debe ser mayor a 0')
  }
  
  if (!sale.primerPago || sale.primerPago <= 0) {
    errors.push('El primer pago debe ser mayor a 0')
  }
  
  if (!sale.gerencia) {
    errors.push('La gerencia es requerida')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Composable para la lógica de negocio de ventas
 * El estado se maneja en el store (useSaleStore)
 * Este composable solo contiene lógica de negocio pura
 */
export function useSaleData() {
  // Services, Composables and Stores initialization
  const $store = useStore()
  const saleStore = useSaleStore()
  const { showError } = useNotification()

  // Computed properties (datos del store global)
  const currentDate = computed(() => $store.currentDate)
  const gerenciaSelected = computed(() => $store.gerenciaSelected)

  // ============================================
  // Business Logic - Fetch Sales
  // ============================================

  /**
   * Obtiene las ventas de la gerencia para la semana actual
   */
  async function fetchSales(): Promise<void> {
    if (!gerenciaSelected.value) return

    try {
      saleStore.setLoadingSales(true)
      const response = await salesService.getSales(
        gerenciaSelected.value,
        currentDate.value.year,
        currentDate.value.week
      )

      saleStore.setSales(response.data)
    } catch (error) {
      console.error('Error al cargar ventas:', error)
    } finally {
      saleStore.setLoadingSales(false)
    }
  }

  // ============================================
  // Business Logic - Save Sale
  // ============================================

  /**
   * Guarda una nueva venta
   * Separa la responsabilidad: solo guarda, no refresca
   */
  async function saveSale(formData: SaleFormData): Promise<void> {
    if (!gerenciaSelected.value) {
      console.error('Gerencia no seleccionada')
      return Promise.reject(new Error('Gerencia no seleccionada'))
    }

    if (formData.primerPago === 0) {
      console.error('El primer pago no puede ser 0')
      return Promise.reject(new Error('El primer pago no puede ser 0'))
    }

    const saleData: SaleDetails = {
      ...formData,
      semana: currentDate.value.week,
      anio: currentDate.value.year,
      gerencia: gerenciaSelected.value,
    }

    // Validation before mutation
    const validation = validateSaleData(saleData)
    if (!validation.isValid) {
      validation.errors.forEach(error => showError(error))
      return Promise.reject(new Error(validation.errors.join(', ')))
    }

    saleStore.setSavingSale(true)

    try {
      await salesService.createSale(saleData)
      // Refrescar la lista después de guardar
      await fetchSales()
      return Promise.resolve()
    } catch (error) {
      console.error('Error al guardar venta:', error)
      return Promise.reject(error)
    } finally {
      saleStore.setSavingSale(false)
    }
  }

  // ============================================
  // Lifecycle hooks
  // ============================================

  onBeforeMount(async () => {
    try {
      await fetchSales()
    } catch (error) {
      console.error('Error al inicializar ventas:', error)
    }
  })

  // ============================================
  // Return
  // ============================================

  return {
    // Computed - Basic (datos del store global)
    currentDate,
    gerenciaSelected,

    // Methods
    fetchSales,
    saveSale,
  }
}