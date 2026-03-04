import { ref, computed, watch } from 'vue'
import { useStore, useCsvLoaderStore } from '@/shared/stores'
import { useCreditFilter, type CreditFilters } from '@/shared/composables/useCreditFilter'
import { soliFilterService } from '../services/soliFilter.service'
import { usePhotoCapture } from './usePhotoCapture'
import { useSoliFilterErrorHandler } from './useSoliFilterErrorHandler'
import type {
  TipoCredito,
  SoliFilterResponse,
  SoliFilterRequest,
  PhotoField,
} from '../types/soliFilter.types'

export type ViewState = 'form' | 'loading' | 'result'

export function useSoliFilter() {
  const $store = useStore()
  const $csvLoaderStore = useCsvLoaderStore()
  const { handleError, handleNetworkError } = useSoliFilterErrorHandler()
  const {
    photos,
    previews,
    allPhotosReady,
    photosCount,
    setPhoto,
    removePhoto,
    resetPhotos,
  } = usePhotoCapture()

  // Credit filter
  const csvData = computed(() => $csvLoaderStore.csvData)
  const {
    getAvailableAmounts,
    getFilteredCreditOptions,
    isAmountSelectDisabled: isAmountDisabled,
  } = useCreditFilter(csvData)

  // Form fields
  const nivel = ref('NUEVO')
  const plazo = ref('16')
  const monto = ref(0)
  const primerPago = ref(0)
  const tipoCredito = ref<TipoCredito>('nuevo')

  // View state
  const viewState = ref<ViewState>('form')
  const response = ref<SoliFilterResponse | null>(null)

  // Store-derived values
  const agencia = computed(() => $store.agencySelected)
  const gerencia = computed(() => $store.gerenciaSelected)
  const semana = computed(() => $store.currentDate.week)
  const anio = computed(() => $store.currentDate.year)

  // Credit filter computeds
  const currentFilters = computed<CreditFilters>(() => ({
    plazo: plazo.value,
    nivel: nivel.value,
    monto: monto.value,
  }))

  const availableAmounts = computed(() =>
    getAvailableAmounts(currentFilters.value),
  )

  const filteredCreditOptions = computed(() =>
    getFilteredCreditOptions(currentFilters.value),
  )

  const isAmountSelectDisabled = computed(() =>
    isAmountDisabled(currentFilters.value),
  )

  // Derive tabla_cargos_id from CSV (column 0 = desconocida = numeric ID)
  const tablaCargosId = computed(() => {
    if (filteredCreditOptions.value.length > 0) {
      return Number(filteredCreditOptions.value[0].desconocida)
    }
    return null
  })

  // Watchers
  watch(filteredCreditOptions, (newValue) => {
    primerPago.value = newValue.length > 0
      ? Number(newValue[0].primerPago)
      : 0
  }, { immediate: true })

  watch(() => nivel.value, () => {
    monto.value = 0
    primerPago.value = 0
  })

  const isFormValid = computed(() => {
    return (
      allPhotosReady.value &&
      tablaCargosId.value !== null &&
      monto.value > 0 &&
      agencia.value !== '' &&
      gerencia.value !== ''
    )
  })

  async function submitSolicitud(): Promise<void> {
    if (!allPhotosReady.value) {
      handleError(null, 'PHOTOS_MISSING')
      return
    }
    if (!isFormValid.value) {
      handleError(null, 'FIELDS_MISSING')
      return
    }

    viewState.value = 'loading'

    try {
      const request: SoliFilterRequest = {
        ineCliente: photos.value.ineCliente!,
        comprobanteCliente: photos.value.comprobanteCliente!,
        ineAval: photos.value.ineAval!,
        comprobanteAval: photos.value.comprobanteAval!,
        tablaCargosId: tablaCargosId.value!,
        agencia: agencia.value ?? '',
        gerencia: gerencia.value ?? '',
        semana: semana.value,
        anio: anio.value,
        tipoCredito: tipoCredito.value,
      }

      const { data } = await soliFilterService.enviarSolicitud(request)
      response.value = data
      viewState.value = 'result'
    } catch (error) {
      handleNetworkError(error)
      viewState.value = 'form'
    }
  }

  function retryPhoto(campo: string): void {
    const fieldMap: Record<string, PhotoField> = {
      ine_cliente: 'ineCliente',
      comprobante_cliente: 'comprobanteCliente',
      ine_aval: 'ineAval',
      comprobante_aval: 'comprobanteAval',
    }
    const field = fieldMap[campo]
    if (field) {
      removePhoto(field)
    }
    viewState.value = 'form'
  }

  function resetForm(): void {
    resetPhotos()
    nivel.value = 'NUEVO'
    plazo.value = '16'
    monto.value = 0
    primerPago.value = 0
    tipoCredito.value = 'nuevo'
    response.value = null
    viewState.value = 'form'
  }

  return {
    // Photo capture
    photos,
    previews,
    allPhotosReady,
    photosCount,
    setPhoto,
    removePhoto,
    // Credit fields
    nivel,
    plazo,
    monto,
    primerPago,
    availableAmounts,
    isAmountSelectDisabled,
    tablaCargosId,
    // Form fields
    tipoCredito,
    // Context
    agencia,
    gerencia,
    semana,
    anio,
    // State
    viewState,
    response,
    isFormValid,
    // Actions
    submitSolicitud,
    retryPhoto,
    resetForm,
  }
}
