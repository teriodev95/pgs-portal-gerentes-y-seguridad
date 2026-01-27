import { computed, onBeforeMount } from 'vue'
import { useStore } from '@/shared/stores'
import { useToast } from 'vue-toast-notification'
import type { IIncident, IIncidentFormData } from '../types'
import { incidentService } from '../services/incident.service'
import { useIncidentErrorHandler } from './useIncidentErrorHandler'
import { useIncidentStore } from '../stores'

// Validation function
function validateIncidentData(incident: IIncident): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!incident.categoria) {
    errors.push('La categoría es requerida')
  }

  if (!incident.tipo) {
    errors.push('El tipo es requerido')
  }

  if (!incident.monto || incident.monto < 0) {
    errors.push('El monto debe ser mayor o igual a 0')
  }

  if (!incident.usuarioId) {
    errors.push('Usuario no válido')
  }

  if (!incident.fecha) {
    errors.push('La fecha es requerida')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Composable para la lógica de negocio de incidentes
 * El estado se maneja en el store (useIncidentStore)
 * Este composable solo contiene lógica de negocio pura
 */
export function useIncidentData() {
  // Services, Composables and Stores initialization
  const $store = useStore()
  const $toast = useToast()
  const { handleError } = useIncidentErrorHandler()
  const incidentStore = useIncidentStore()

  // Computed properties (datos del store global)
  const user = computed(() => $store.user)
  const currentDate = computed(() => $store.currentDate)
  const isUserManager = computed(() => $store.isUserManager)
  const gerenciaSelected = computed(() => $store.gerenciaSelected)

  // ============================================
  // Business Logic - Fetch Incidents
  // ============================================

  /**
   * Obtiene los incidentes del usuario para la semana actual
   */
  async function fetchIncidents(): Promise<void> {
    if (!user.value?.usuarioId) return

    try {
      incidentStore.setLoadingIncidents(true)
      const { data } = await incidentService.getIncidentByUserId({
        week: currentDate.value.week,
        year: currentDate.value.year,
        userID: user.value.usuarioId,
      })

      // Filter incidents for current week and year
      const filteredIncidents = data.filter(
        (incident: IIncident) =>
          incident.anio === currentDate.value.year &&
          incident.semana === currentDate.value.week
      )

      incidentStore.setIncidents(filteredIncidents)
    } catch (error) {
      handleError(error, 'INCIDENTS_LOAD_FAILED')
    } finally {
      incidentStore.setLoadingIncidents(false)
    }
  }

  // ============================================
  // Business Logic - Save Incident
  // ============================================

  /**
   * Guarda un nuevo incidente
   * Separa la responsabilidad: solo guarda, no refresca
   */
  async function saveIncident(formData: IIncidentFormData): Promise<void> {
    if (!user.value?.usuarioId) {
      handleError(new Error('Usuario no autenticado'), 'UNKNOWN_ERROR')
      return Promise.reject(new Error('Usuario no autenticado'))
    }

    const currentDateStr = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Mexico_City'
    })

    const incident: IIncident = {
      ...formData,
      usuarioId: user.value.usuarioId,
      semana: currentDate.value.week,
      anio: currentDate.value.year,
      gerencia: isUserManager.value ? gerenciaSelected.value as string : '',
      fecha: currentDateStr,
    }

    // Validation before mutation
    const validation = validateIncidentData(incident)
    if (!validation.isValid) {
      validation.errors.forEach(error => handleError(new Error(error), 'UNKNOWN_ERROR'))
      return Promise.reject(new Error(validation.errors.join(', ')))
    }

    incidentStore.setSavingIncident(true)

    try {
      await incidentService.createIncident(incident)
      $toast.success('Incidente guardado correctamente')
      // Refrescar la lista después de guardar
      await fetchIncidents()
      return Promise.resolve()
    } catch (error) {
      handleError(error, 'INCIDENT_SAVE_FAILED')
      return Promise.reject(error)
    } finally {
      incidentStore.setSavingIncident(false)
    }
  }

  // ============================================
  // Lifecycle hooks
  // ============================================

  onBeforeMount(async () => {
    try {
      await fetchIncidents()
    } catch (error) {
      handleError(error, 'INCIDENT_INIT_FAILED')
    }
  })

  // ============================================
  // Return
  // ============================================

  return {
    // Computed - Basic (datos del store global)
    user,
    currentDate,
    isUserManager,
    gerenciaSelected,

    // Methods
    fetchIncidents,
    saveIncident,
  }
}