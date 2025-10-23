import { computed, ref, watch, onBeforeMount } from 'vue'
import { useCsvLoaderStore } from '@/shared/stores'
import { useStore } from '@/shared/stores'
import type { SaleFormData } from '../types'
import { useCreditFilter, type CreditFilters } from '@/shared/composables/useCreditFilter'

/**
 * Estado inicial del formulario de venta
 */
const defaultSaleForm: SaleFormData = {
  fecha: "",
  agencia: "",
  nombreCliente: "",
  tipo: "Nuevo",
  nivel: "NUEVO",
  plazo: "12",
  monto: 0,
  primerPago: 0,
}

/**
 * Composable para manejar la lógica del formulario de ventas
 * @param isDisabled Estado de deshabilitación del formulario
 * @param onSave Callback para guardar la venta
 * @returns Objeto con estado y métodos del formulario
 */
export function useSaleForm(
  isDisabled: boolean = false,
  onSave?: (sale: SaleFormData) => void
) {
  const $store = useStore()
  const $csvLoaderStore = useCsvLoaderStore()

  // Estado del formulario
  const saleForm = ref<SaleFormData>({ ...defaultSaleForm })

  // Inicializar filtro de créditos
  const csvData = computed(() => $csvLoaderStore.csvData)
  const { 
    getAvailableAmounts, 
    getFilteredCreditOptions, 
    getFirstPayment, 
    isAmountSelectDisabled: isAmountDisabled 
  } = useCreditFilter(csvData)

  // Computed properties para filtros
  const currentFilters = computed<CreditFilters>(() => ({
    plazo: saleForm.value.plazo,
    nivel: saleForm.value.nivel,
    monto: saleForm.value.monto
  }))

  // Computed properties para opciones disponibles
  const availableAmounts = computed(() => 
    getAvailableAmounts(currentFilters.value)
  )

  const filteredCreditOptions = computed(() => 
    getFilteredCreditOptions(currentFilters.value)
  )

  const isAmountSelectDisabled = computed(() => 
    isAmountDisabled(currentFilters.value)
  )

  // Watchers para efectos reactivos
  watch(
    filteredCreditOptions,
    newValue => {
      saleForm.value.primerPago = newValue.length > 0 
        ? Number(newValue[0].primerPago) 
        : 0
    },
    { immediate: true }
  )

  watch(
    () => saleForm.value.nivel,
    () => {
      saleForm.value.monto = 0
      saleForm.value.primerPago = 0
    }
  )

  /**
   * Valida que todos los campos requeridos estén completos
   * @returns true si el formulario es válido
   */
  const validateForm = (): boolean => {
    const requiredFields = [
      saleForm.value.fecha,
      saleForm.value.agencia,
      saleForm.value.nombreCliente,
      saleForm.value.tipo,
      saleForm.value.nivel,
      saleForm.value.plazo
    ]

    const hasAllRequiredFields = requiredFields.every(field => field && field.toString().trim() !== '')
    const hasValidAmounts = !isNaN(saleForm.value.monto) && !isNaN(saleForm.value.primerPago)

    if (!hasAllRequiredFields) {
      alert('Por favor, complete todos los campos.')
      return false
    }

    if (!hasValidAmounts) {
      alert('Monto y Primer Pago deben ser números.')
      return false
    }

    return true
  }

  /**
   * Prepara y envía el formulario
   */
  const submitForm = () => {
    if (!validateForm()) return

    // Asegurar que los valores numéricos sean números
    const saleData: SaleFormData = {
      ...saleForm.value,
      monto: Number(saleForm.value.monto),
      primerPago: Number(saleForm.value.primerPago)
    }

    // Llamar callback si existe
    if (onSave) {
      onSave(saleData)
    }

    // Limpiar formulario después del envío
    clearForm()
  }

  /**
   * Limpia el formulario a su estado inicial
   */
  const clearForm = () => {
    saleForm.value = { ...defaultSaleForm }
  }

  /**
   * Actualiza un campo específico del formulario
   * @param field Campo a actualizar
   * @param value Nuevo valor
   */
  const updateField = <K extends keyof SaleFormData>(
    field: K, 
    value: SaleFormData[K]
  ) => {
    saleForm.value[field] = value
  }

  /**
   * Obtiene las agencias disponibles del store
   */
  const availableAgencies = computed(() => $store.agencies)

  // Inicializar formulario al montar
  onBeforeMount(() => {
    clearForm()
  })

  return {
    // Estado reactivo
    saleForm,
    availableAmounts,
    filteredCreditOptions,
    isAmountSelectDisabled,
    availableAgencies,
    
    // Métodos
    submitForm,
    clearForm,
    updateField,
    validateForm
  }
} 