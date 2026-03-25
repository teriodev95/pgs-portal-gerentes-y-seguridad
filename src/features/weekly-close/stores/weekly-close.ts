// stores/cierreSemanal.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { IWeeklyCloseWithIncome } from '@/features/weekly-close/types'


export const useCierreSemanalStore = defineStore('cierre-semanal', () => {
  // Estado principal del cierre semanal
  const weeklyClose = ref<IWeeklyCloseWithIncome>()
  const securityPin = ref<string>('')

  // Estados de control
  const isClosingComplete = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters computados
  const isClosingLocked = computed(() => weeklyClose.value?.agenciaCerrada ?? false)
  const isAgencyVacant = computed(() => weeklyClose.value?.statusAgencia === 'VACANTE')
  const isAgencyActive = computed(() => weeklyClose.value?.statusAgencia === 'ACTIVA')
  const hasActiveBonuses = computed(() => weeklyClose.value?.isSemanaBonos.pagoBono)
  const hasRequiredData = computed(
    () => weeklyClose.value
  )

  const setClosingComplete = (status: boolean) => (isClosingComplete.value = status)
  const setError = (errorMessage: string | null) => (error.value = errorMessage)
  const setLoading = (status: boolean) => (isLoading.value = status)
  const setSecurityPin = (pin: string) => securityPin.value = pin
  const setWeeklyClose = (data:  IWeeklyCloseWithIncome) => {
    // Si ya tiene ingresosAgente, usar tal como está
      weeklyClose.value = data as IWeeklyCloseWithIncome
  }

  // Método para limpiar el estado
  const resetState = () => {
    error.value = null
    isClosingComplete.value = false
    isLoading.value = false
    weeklyClose.value = undefined
  }

  // Método para actualizar campos específicos del cierre
  const updateWeeklyCloseField = <K extends keyof IWeeklyCloseWithIncome>(
    field: K,
    value: IWeeklyCloseWithIncome[K]
  ) => {
    if (!weeklyClose.value) return
    weeklyClose.value[field] = value
  }

  // Método tipado para actualizar campos anidados
  const updateNestedField = <
    T extends 'ingresosAgente' | 'egresosAgente' | 'egresosGerente',
    K extends keyof IWeeklyCloseWithIncome[T]
  >(
    section: T,
    field: K,
    value: IWeeklyCloseWithIncome[T][K]
  ) => {
    if (!weeklyClose.value) return
    weeklyClose.value[section][field] = value
  }

  return {
    // Estado
    error,
    isClosingComplete,
    isLoading,
    weeklyClose,
    securityPin,

    // Getters
    hasRequiredData,
    isAgencyActive,
    isAgencyVacant,
    isClosingLocked,
    hasActiveBonuses,

    // Actions
    resetState,
    setClosingComplete,
    setError,
    setLoading,
    setSecurityPin,
    setWeeklyClose,
    updateNestedField,
    updateWeeklyCloseField,
  }
})
