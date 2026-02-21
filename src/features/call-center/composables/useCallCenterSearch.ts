import { ref } from 'vue'
import { useCallCenterService } from './useCallCenterService'
import type { ICallCenterSearchResult } from '../types'

/**
 * Composable para manejar la búsqueda de reportes del Call Center
 * Implementa debounce, cancelación de peticiones y estados de UI
 */
export const useCallCenterSearch = () => {
  const service = useCallCenterService()

  // ===================================
  // Estado
  // ===================================
  const searchQuery = ref('')
  const searchResults = ref<ICallCenterSearchResult[]>([])
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)
  const showResults = ref(false)

  // Controlador de aborto para cancelar peticiones previas
  let abortController: AbortController | null = null

  // Timer para debounce
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // ===================================
  // Métodos privados
  // ===================================

  /**
   * Ejecuta la búsqueda en el servidor
   */
  const executeSearch = async (query: string) => {
    // Cancelar búsqueda anterior si existe
    if (abortController) {
      abortController.abort()
    }

    // Validar query mínimo
    if (!query || query.trim().length < 3) {
      searchResults.value = []
      showResults.value = false
      isSearching.value = false
      return
    }

    try {
      isSearching.value = true
      searchError.value = null
      abortController = new AbortController()

      const results = await service.searchReportByName(query.trim())

      searchResults.value = results
      showResults.value = true
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        searchError.value = 'Error al buscar reportes'
        console.error('Search error:', error)
      }
    } finally {
      isSearching.value = false
      abortController = null
    }
  }

  // ===================================
  // Métodos públicos
  // ===================================

  /**
   * Maneja cambios en el input con debounce de 300ms
   */
  const handleSearchInput = (value: string) => {
    searchQuery.value = value

    // Limpiar timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Si el query es muy corto, limpiar resultados inmediatamente
    if (!value || value.trim().length < 3) {
      searchResults.value = []
      showResults.value = false
      isSearching.value = false
      return
    }

    // Mostrar estado de carga inmediatamente
    isSearching.value = true

    // Ejecutar búsqueda después del debounce
    debounceTimer = setTimeout(() => {
      executeSearch(value)
    }, 300)
  }

  /**
   * Limpia la búsqueda completamente
   */
  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    showResults.value = false
    searchError.value = null
    isSearching.value = false

    // Limpiar timers y controladores
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  /**
   * Oculta los resultados sin limpiar el query
   */
  const hideResults = () => {
    showResults.value = false
  }

  /**
   * Muestra los resultados si hay query y resultados disponibles
   */
  const revealResults = () => {
    if (searchQuery.value && searchResults.value.length > 0) {
      showResults.value = true
    }
  }

  return {
    // Estado
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    showResults,

    // Métodos
    handleSearchInput,
    clearSearch,
    hideResults,
    revealResults
  }
}
