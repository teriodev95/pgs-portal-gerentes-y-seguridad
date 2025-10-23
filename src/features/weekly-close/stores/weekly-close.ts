// stores/cierreSemanal.ts
import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import type { IFastWeeklyClose, IBonusSummary } from '@/features/weekly-close/types'


export const useCierreSemanalStore = defineStore('cierre-semanal', () => {
  // Estado principal del cierre semanal
  const weeklyClose = ref<IFastWeeklyClose>()
  const securityPin = ref<string>('')
  const bonusInfo = ref<IBonusSummary>()

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

  // Métodos básicos para actualizar estado
  const setClosingComplete = (status: boolean) => (isClosingComplete.value = status)
  const setError = (errorMessage: string | null) => (error.value = errorMessage)
  const setLoading = (status: boolean) => (isLoading.value = status)
  const setWeeklyClose = (data: IFastWeeklyClose) => (weeklyClose.value = data)
  const setBonusInfo = (data: IBonusSummary) => (bonusInfo.value = data)
  const setSecurityPin = (pin: string) => securityPin.value = pin
  const setWeeklyClosingBonus = (bonus: number) => {
    if (!weeklyClose.value) return
    weeklyClose.value.egresosGerente.bonosPagadosEnSemana = bonus
  }

  // Método para limpiar el estado
  const resetState = () => {
    bonusInfo.value = undefined
    error.value = null
    isClosingComplete.value = false
    isLoading.value = false
    weeklyClose.value = undefined
  }

  // Método para actualizar campos específicos del cierre
  const updateWeeklyCloseField = <K extends keyof IFastWeeklyClose>(
    field: K,
    value: IFastWeeklyClose[K]
  ) => {
    if (!weeklyClose.value) return
    weeklyClose.value[field] = value
  }

  // Método tipado para actualizar campos anidados
  const updateNestedField = <
    T extends 'ingresosAgente' | 'egresosAgente' | 'egresosGerente',
    K extends keyof IFastWeeklyClose[T]
  >(
    section: T,
    field: K,
    value: IFastWeeklyClose[T][K]
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
    bonusInfo: readonly(bonusInfo),

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
    setBonusInfo,
    setWeeklyClosingBonus,
    updateNestedField,
    updateWeeklyCloseField,
  }
})
