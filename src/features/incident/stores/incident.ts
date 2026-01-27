import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IIncident } from '../types'

const STORE_NAME = 'incident'

/**
 * Store para manejar el estado del módulo de incidentes
 * Centraliza el estado de la lista de incidentes y loading states
 *
 * NOTA: La lógica del drawer se maneja con useDrawer('incident')
 * de @/shared/composables para ser reutilizable en otras features
 */
export const useIncidentStore = defineStore(STORE_NAME, () => {
  // ============================================
  // Estado - Lista de Incidentes
  // ============================================
  const incidents = ref<IIncident[]>([])
  const isLoadingIncidents = ref(false)
  const isSavingIncident = ref(false)

  // ============================================
  // Computed Properties
  // ============================================
  const hasIncidents = computed(() => incidents.value.length > 0)
  const incidentsCount = computed(() => incidents.value.length)

  // ============================================
  // Métodos - Lista de Incidentes
  // ============================================

  /**
   * Establece la lista de incidentes
   */
  function setIncidents(newIncidents: IIncident[]) {
    incidents.value = newIncidents
  }

  /**
   * Añade un incidente a la lista
   */
  function addIncident(incident: IIncident) {
    incidents.value.push(incident)
  }

  /**
   * Actualiza un incidente existente
   */
  function updateIncident(updatedIncident: IIncident) {
    const index = incidents.value.findIndex(i => i.id === updatedIncident.id)
    if (index !== -1) {
      incidents.value[index] = updatedIncident
    }
  }

  /**
   * Limpia la lista de incidentes
   */
  function clearIncidents() {
    incidents.value = []
  }

  /**
   * Establece el estado de carga de incidentes
   */
  function setLoadingIncidents(loading: boolean) {
    isLoadingIncidents.value = loading
  }

  /**
   * Establece el estado de guardado de incidente
   */
  function setSavingIncident(saving: boolean) {
    isSavingIncident.value = saving
  }

  // ============================================
  // Reset completo del store
  // ============================================

  /**
   * Reinicia todo el estado del store
   */
  function $reset() {
    incidents.value = []
    isLoadingIncidents.value = false
    isSavingIncident.value = false
  }

  return {
    // Estado
    incidents,
    isLoadingIncidents,
    isSavingIncident,

    // Computed
    hasIncidents,
    incidentsCount,

    // Métodos
    setIncidents,
    addIncident,
    updateIncident,
    clearIncidents,
    setLoadingIncidents,
    setSavingIncident,

    // Reset
    $reset,
  }
})
