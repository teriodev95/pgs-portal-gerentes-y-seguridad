import { computed, ref, watch, onBeforeMount } from 'vue'
import { useCsvLoaderStore } from '@/shared/stores'
import { useStore } from '@/shared/stores'
import { useNotification } from '@/shared/composables/useNotification'
import type { ApprovedRequest, SaleFormData } from '../types'
import { useCreditFilter, type CreditFilters } from '@/shared/composables/useCreditFilter'

/** Hoy en zona local, YYYY-MM-DD. El 97 % de las ventas se capturan el mismo dia. */
const todayISO = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Plazo mas vendido (73 % de las ventas): viene puesto y se cambia con un toque. */
const DEFAULT_PLAZO = '16'

/**
 * Estado inicial del formulario de venta. Se construye cada vez para que
 * la fecha sea la de hoy y no la del dia en que se abrio la app.
 */
const buildDefaultForm = (): SaleFormData => ({
  fecha: todayISO(),
  agencia: "",
  nombreCliente: "",
  generadaPor: "",
  tipo: "Nuevo",
  nivel: "NUEVO",
  plazo: DEFAULT_PLAZO,
  monto: 0,
  primerPago: 0,
  solicitudId: null,
  prestamoId: null,
})

/** Que falta, en el orden en que aparece en pantalla. */
const REQUIRED_FIELDS: { key: keyof SaleFormData; label: string }[] = [
  { key: 'fecha', label: 'la fecha de la venta' },
  { key: 'generadaPor', label: 'quién generó la venta' },
  { key: 'agencia', label: 'la agencia' },
  { key: 'nombreCliente', label: 'el nombre del cliente' },
  { key: 'tipo', label: 'el tipo' },
  { key: 'nivel', label: 'el nivel' },
  { key: 'plazo', label: 'el plazo' },
  { key: 'monto', label: 'el monto' },
]

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
  const { showWarning } = useNotification()

  // Estado del formulario
  const saleForm = ref<SaleFormData>(buildDefaultForm())

  /** Con datos de la solicitud, el plan es el que ya autorizaron: el CSV no lo recalcula. */
  const isFromRequest = computed(() => Boolean(saleForm.value.solicitudId))

  // Inicializar filtro de créditos
  const csvData = computed(() => $csvLoaderStore.csvData)
  const { 
    getAvailableAmounts, 
    getFilteredCreditOptions, 
    getFirstPayment, 
    isAmountSelectDisabled: isAmountDisabled,
    getAvailableTerms,
    getAvailableLevels
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

  /** Plazos y niveles que existen en la tabla de cargos, no una lista fija. */
  const availableTerms = computed(() => getAvailableTerms())
  const availableLevels = computed(() => getAvailableLevels())

  // Watchers para efectos reactivos
  watch(
    filteredCreditOptions,
    newValue => {
      if (isFromRequest.value) return
      saleForm.value.primerPago = newValue.length > 0 
        ? Number(newValue[0].primerPago) 
        : 0
    },
    { immediate: true }
  )

  watch(
    () => saleForm.value.nivel,
    () => {
      if (isFromRequest.value) return
      saleForm.value.monto = 0
      saleForm.value.primerPago = 0
    }
  )

  // Un cliente nuevo siempre entra en nivel NUEVO: no hay que elegirlo
  watch(
    () => saleForm.value.tipo,
    (tipo) => {
      if (isFromRequest.value) return
      if (tipo === 'Nuevo') saleForm.value.nivel = 'NUEVO'
    }
  )

  // Si cambia el plazo y el monto elegido ya no existe en ese plan, se limpia
  watch(availableAmounts, (amounts) => {
    if (isFromRequest.value || !saleForm.value.monto) return
    if (!amounts.includes(String(saleForm.value.monto))) {
      saleForm.value.monto = 0
      saleForm.value.primerPago = 0
    }
  })

  /**
   * Valida que todos los campos requeridos estén completos.
   * Avisa que falta, no solo que algo falta.
   * @returns true si el formulario es válido
   */
  const validateForm = (): boolean => {
    const missing = REQUIRED_FIELDS.find(({ key }) => {
      const value = saleForm.value[key]
      return value === undefined || value === null || value === '' || value === 0
    })

    if (missing) {
      showWarning(`Falta ${missing.label}.`)
      return false
    }

    if (isNaN(saleForm.value.monto) || isNaN(saleForm.value.primerPago) || saleForm.value.primerPago <= 0) {
      showWarning('Ese monto no tiene primer pago en la tabla de cargos.')
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
   * Llena el formulario con la solicitud ya aprobada.
   * La fecha y quien genero la venta siguen siendo del gerente.
   */
  const applyRequest = (request: ApprovedRequest) => {
    saleForm.value = {
      ...buildDefaultForm(),
      fecha: saleForm.value.fecha,
      agencia: request.agencia,
      nombreCliente: request.nombreCliente,
      tipo: request.tipo,
      nivel: request.nivel as SaleFormData['nivel'],
      plazo: String(request.plazo),
      monto: request.monto,
      primerPago: request.primerPago,
      solicitudId: request.solicitudId,
    }
  }

  /**
   * Limpia el formulario a su estado inicial
   */
  const clearForm = () => {
    saleForm.value = buildDefaultForm()
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

  // Inicializar formulario al montar, sin borrar un desembolso ya aplicado
  onBeforeMount(() => {
    if (!isFromRequest.value) clearForm()
  })

  return {
    // Estado reactivo
    saleForm,
    availableAmounts,
    availableTerms,
    availableLevels,
    filteredCreditOptions,
    isAmountSelectDisabled,
    availableAgencies,
    isFromRequest,

    // Métodos
    submitForm,
    clearForm,
    applyRequest,
    updateField,
    validateForm
  }
}
