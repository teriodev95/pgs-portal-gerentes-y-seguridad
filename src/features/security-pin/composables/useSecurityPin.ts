import { ref, computed } from 'vue'
import { useStore } from '@/shared/stores'
import type { IGerencia } from '@/interfaces'
import type { CircularTimerProps } from '../components/CircularTimer.vue'
import { securityPinService } from '../services/security.service'
import { useSecurityPinErrorHandler } from './useSecurityPinErrorHandler'
import { TIMER_CONFIG } from '../constants'

export function useSecurityPin() {
  // Services, Composables and Stores initialization
  const $store = useStore()
  const { handleError } = useSecurityPinErrorHandler()

  // State definitions
  const isLoading = ref(false)
  const selectedManagement = ref("")
  const timer = ref<CircularTimerProps>()

  // Computed properties
  const managementList = computed<IGerencia[]>(() => $store.gerencias)

  // Methods
  async function getPin(id: string): Promise<void> {
    selectedManagement.value = id
    isLoading.value = true

    try {
      console.log('Management seleccionado:', selectedManagement.value)
      const { data: currentPin } = await securityPinService.checkPinExists(selectedManagement.value)
      console.log('Respuesta del endpoint checkPinExists:', currentPin)

      if (currentPin.totalPins === 0) {
        const { data: newPin } = await securityPinService.createPin(selectedManagement.value)
        console.log('Respuesta del endpoint createPin:', newPin)
        console.log(newPin.createdAt)
        console.log(newPin.expiresAt)
        console.log(newPin.currentTime)

        timer.value = {
          pin: newPin.pin,
          createdAt: newPin.createdAt,
          expiresAt: newPin.expiresAt,
          currentTime: newPin.currentTime,
          warningThreshold: TIMER_CONFIG.WARNING_THRESHOLD_MINUTES,
          alertThreshold: TIMER_CONFIG.ALERT_THRESHOLD_MINUTES
        }
      } else {
        console.log('El pin ya existe para esta gerencia. No se crea uno nuevo.')
        console.log(currentPin)

        // Obtener el primer pin del diccionario
        const firstPin = Object.values(currentPin.pins)[0]

        timer.value = {
          pin: firstPin.pin,
          createdAt: firstPin.createdAt,
          expiresAt: firstPin.expiresAt,
          currentTime: currentPin.currentTime,
          warningThreshold: TIMER_CONFIG.WARNING_THRESHOLD_MINUTES,
          alertThreshold: TIMER_CONFIG.ALERT_THRESHOLD_MINUTES
        }
      }
    } catch (error) {
      handleError(error, 'PIN_LOAD_FAILED')
      throw error
    }
  }

  async function handleSelectManagement(id: string): Promise<void> {
    try {
      await getPin(id)
    } catch (error) {
      console.error("Error al manejar la selección de gerencia:", error)
      handleError(error, 'MANAGEMENT_SELECTION_FAILED')
    } finally {
      isLoading.value = false
    }
  }

  async function handleNewPin(): Promise<void> {
    if (selectedManagement.value) {
      try {
        isLoading.value = true
        await getPin(selectedManagement.value)
      } catch (error) {
        console.error("Error al generar nuevo pin:", error)
        handleError(error, 'PIN_CREATE_FAILED')
      } finally {
        isLoading.value = false
      }
    }
  }

  function clearSelection(): void {
    selectedManagement.value = ""
    timer.value = undefined
  }

  return {
    // State
    isLoading,
    selectedManagement,
    timer,

    // Computed
    managementList,

    // Methods
    handleSelectManagement,
    handleNewPin,
    clearSelection
  }
}