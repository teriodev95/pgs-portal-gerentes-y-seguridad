import { ref, computed, watch, onBeforeMount } from 'vue'
import { useStore } from '@/shared/stores'
import { soliFilterService } from '../services/soliFilter.service'
import { usePhotoCapture } from './usePhotoCapture'
import { useSoliFilterErrorHandler } from './useSoliFilterErrorHandler'
import type {
  TipoCredito,
  SoliFilterResponse,
  SoliFilterRequest,
  PhotoField,
  TablaCargosItem,
} from '../types/soliFilter.types'

export type ViewState = 'form' | 'loading' | 'result'

export function useSoliFilter() {
  const $store = useStore()
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

  // Catalog
  const catalogo = ref<TablaCargosItem[]>([])
  const catalogoLoading = ref(false)

  // Form fields
  const nivel = ref('')
  const plazo = ref(0)
  const monto = ref(0)
  const tipoCredito = ref<TipoCredito>('nuevo')

  // View state
  const viewState = ref<ViewState>('form')
  const response = ref<SoliFilterResponse | null>(null)

  // Store-derived values
  const agencia = computed(() => $store.agencySelected)
  const gerencia = computed(() => $store.gerenciaSelected)
  const semana = computed(() => $store.currentDate.week)
  const anio = computed(() => $store.currentDate.year)

  // ── Cascading filter from catalog ──

  const niveles = computed(() => {
    const unique = [...new Set(catalogo.value.map((i) => i.nivel))]
    return unique.sort()
  })

  const plazos = computed(() => {
    if (!nivel.value) return []
    const filtered = catalogo.value.filter((i) => i.nivel === nivel.value)
    const unique = [...new Set(filtered.map((i) => i.plazo_semanas))]
    return unique.sort((a, b) => a - b)
  })

  const montos = computed(() => {
    const p = Number(plazo.value)
    if (!nivel.value || !p) return []
    const filtered = catalogo.value.filter(
      (i) => i.nivel === nivel.value && Number(i.plazo_semanas) === p,
    )
    return filtered.map((i) => i.monto_solicitado).sort((a, b) => a - b)
  })

  const registroSeleccionado = computed<TablaCargosItem | null>(() => {
    const p = Number(plazo.value)
    const m = Number(monto.value)
    if (!nivel.value || !p || !m) return null
    return (
      catalogo.value.find(
        (i) =>
          i.nivel === nivel.value &&
          Number(i.plazo_semanas) === p &&
          Number(i.monto_solicitado) === m,
      ) ?? null
    )
  })

  // ── Watchers for cascade reset ──

  watch(nivel, () => {
    plazo.value = 0
    monto.value = 0
  })

  watch(plazo, () => {
    monto.value = 0
  })

  // ── Validation ──

  const isFormValid = computed(() => {
    return (
      allPhotosReady.value &&
      registroSeleccionado.value !== null &&
      gerencia.value !== '' &&
      gerencia.value !== undefined
    )
  })

  // ── Fetch catalog ──

  async function fetchCatalogo(): Promise<void> {
    catalogoLoading.value = true
    try {
      const { data: res } = await soliFilterService.getTablaCargos()
      catalogo.value = Array.isArray(res.data) ? res.data : []
    } catch (error) {
      handleNetworkError(error)
      catalogo.value = []
    } finally {
      catalogoLoading.value = false
    }
  }

  onBeforeMount(() => {
    fetchCatalogo()
  })

  // ── Submit ──

  async function submitSolicitud(): Promise<void> {
    if (!allPhotosReady.value) {
      handleError(null, 'PHOTOS_MISSING')
      return
    }
    if (!isFormValid.value || !registroSeleccionado.value) {
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
        tablaCargosId: registroSeleccionado.value.id,
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
    nivel.value = ''
    plazo.value = 0
    monto.value = 0
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
    // Catalog
    catalogoLoading,
    niveles,
    plazos,
    montos,
    registroSeleccionado,
    // Credit fields
    nivel,
    plazo,
    monto,
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
