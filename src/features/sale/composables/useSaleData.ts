import { computed, onBeforeMount, ref } from 'vue'
import { useStore } from '@/shared/stores'
import type { SaleDetails, SaleFormData } from '../types'
import { salesService } from '../services/sale.service'
import { useSaleErrorHandler } from './useSaleErrorHandler'

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

export function useSaleData() {
  const $store = useStore()
  const { handleError, handleSuccess } = useSaleErrorHandler()

  const sales = ref<SaleDetails[]>([])
  const selectedSale = ref<SaleDetails>()
  const isLoadingSales = ref(false)
  const isSavingSale = ref(false)
  const isLoadingDetails = ref(false)

  const currentDate = computed(() => $store.currentDate)
  const gerenciaSelected = computed(() => $store.gerenciaSelected)
  
  const hasSales = computed(() => sales.value.length > 0)
  const salesCount = computed(() => sales.value.length)

  const isFormValid = computed(() => 
    selectedSale.value ? true : !isSavingSale.value
  )

  async function fetchSales(): Promise<void> {
    if (!gerenciaSelected.value) return

    try {
      isLoadingSales.value = true
      const response = await salesService.getSales(
        gerenciaSelected.value,
        currentDate.value.year,
        currentDate.value.week
      )
      
      sales.value = response.data
    } catch (error) {
      handleError(error, 'SALES_LOAD_FAILED')
    } finally {
      isLoadingSales.value = false
    }
  }

  async function saveSale(formData: SaleFormData): Promise<void> {
    if (!gerenciaSelected.value) {
      handleError(new Error('Gerencia no seleccionada'), 'VALIDATION_ERROR')
      return Promise.reject(new Error('Gerencia no seleccionada'))
    }

    if (formData.primerPago === 0) {
      handleError(new Error('El primer pago no puede ser 0'), 'VALIDATION_ERROR')
      return Promise.reject(new Error('El primer pago no puede ser 0'))
    }

    const saleData: SaleDetails = {
      ...formData,
      semana: currentDate.value.week,
      anio: currentDate.value.year,
      gerencia: gerenciaSelected.value,
    }

    const validation = validateSaleData(saleData)
    if (!validation.isValid) {
      validation.errors.forEach(error => handleError(new Error(error), 'VALIDATION_ERROR'))
      return Promise.reject(new Error(validation.errors.join(', ')))
    }

    isSavingSale.value = true

    try {
      await salesService.createSale(saleData)
      handleSuccess('Venta creada exitosamente')
      await fetchSales()
      return Promise.resolve()
    } catch (error) {
      handleError(error, 'SALE_SAVE_FAILED')
      return Promise.reject(error)
    } finally {
      isSavingSale.value = false
    }
  }

  function selectSaleForDetails(sale: SaleDetails): void {
    isLoadingDetails.value = true
    selectedSale.value = sale

    setTimeout(() => {
      isLoadingDetails.value = false
    }, 300)
  }

  function clearSelectedSale(): void {
    selectedSale.value = undefined
  }

  onBeforeMount(async () => {
    try {
      await fetchSales()
    } catch (error) {
      handleError(error, 'SALE_INIT_FAILED')
    }
  })

  return {
    sales,
    selectedSale,
    isLoadingSales,
    isSavingSale,
    isLoadingDetails,
    
    currentDate,
    gerenciaSelected,
    
    hasSales,
    salesCount,
    isFormValid,
    
    fetchSales,
    saveSale,
    selectSaleForDetails,
    clearSelectedSale
  }
}