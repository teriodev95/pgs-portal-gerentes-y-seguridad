import { computed, onBeforeMount, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { useToast } from 'vue-toast-notification'
import type { IIncident, IIncidentFormData } from '../types'
import { incidentService } from '../services/incident.service'
import { useIncidentErrorHandler } from './useIncidentErrorHandler'

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

export function useIncidentData() {
  // Services, Composables and Stores initialization
  const $store = useStore()
  const $toast = useToast()
  const { handleError } = useIncidentErrorHandler()

  // State definitions
  const incidents = ref<IIncident[]>([])
  const selectedIncident = ref<IIncident>()
  const isLoadingIncidents = ref(false)
  const isSavingIncident = ref(false)

  // Computed properties
  const user = computed(() => $store.user)
  const currentDate = computed(() => $store.currentDate)
  const isUserManager = computed(() => $store.isUserManager)
  const gerenciaSelected = computed(() => $store.gerenciaSelected)
  
  // Specific computed properties
  const hasIncidents = computed(() => incidents.value.length > 0)
  const incidentsCount = computed(() => incidents.value.length)

  const isFormValid = computed(() => 
    selectedIncident.value ? true : !isSavingIncident.value
  )

  // Methods
  async function fetchIncidents(): Promise<void> {
    if (!user.value?.usuarioId) return

    try {
      isLoadingIncidents.value = true
      const { data } = await incidentService.getIncidentByUserId({
        week: currentDate.value.week,
        year: currentDate.value.year,
        userID: user.value.usuarioId,
      })

      // Filter incidents for current week and year
      incidents.value = data.filter(
        (incident: IIncident) =>
          incident.anio === currentDate.value.year &&
          incident.semana === currentDate.value.week
      )
    } catch (error) {
      handleError(error, 'INCIDENTS_LOAD_FAILED')
    } finally {
      isLoadingIncidents.value = false
    }
  }

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

    isSavingIncident.value = true

    try {
      await incidentService.createIncident(incident)
      $toast.success('Incidente guardado correctamente')
      await fetchIncidents()
      return Promise.resolve()
    } catch (error) {
      handleError(error, 'INCIDENT_SAVE_FAILED')
      return Promise.reject(error)
    } finally {
      isSavingIncident.value = false
    }
  }

  function selectIncidentForEditing(incident: IIncident): void {
    selectedIncident.value = incident
  }

  function clearSelectedIncident(): void {
    selectedIncident.value = undefined
  }

  // Lifecycle hooks
  onBeforeMount(async () => {
    try {
      await fetchIncidents()
    } catch (error) {
      handleError(error, 'INCIDENT_INIT_FAILED')
    }
  })

  return {
    // State
    incidents,
    selectedIncident,
    isLoadingIncidents,
    isSavingIncident,
    
    // Computed - Basic
    user,
    currentDate,
    isUserManager,
    gerenciaSelected,
    
    // Computed - Specific
    hasIncidents,
    incidentsCount,
    isFormValid,
    
    // Methods
    fetchIncidents,
    saveIncident,
    selectIncidentForEditing,
    clearSelectedIncident
  }
}