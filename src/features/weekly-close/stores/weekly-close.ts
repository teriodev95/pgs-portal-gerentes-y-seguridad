// stores/cierreSemanal.ts
import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import type { IFastWeeklyClose, IWeeklyCloseWithIncome, IBonusSummary, IIngresosAgente } from '@/features/weekly-close/types'
import type { IAgencyDashboard } from '@/features/weekly-close/types'


export const useCierreSemanalStore = defineStore('cierre-semanal', () => {
  // Estado principal del cierre semanal
  const weeklyClose = ref<IWeeklyCloseWithIncome>()
  const securityPin = ref<string>('')
  const bonusInfo = ref<IBonusSummary>()
  const agentsIncome = ref<IAgencyDashboard>()

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
  const setBonusInfo = (data: IBonusSummary) => (bonusInfo.value = data)
  const setClosingComplete = (status: boolean) => (isClosingComplete.value = status)
  const setError = (errorMessage: string | null) => (error.value = errorMessage)
  const setLoading = (status: boolean) => (isLoading.value = status)
  const setSecurityPin = (pin: string) => securityPin.value = pin
  const setWeeklyClose = (data: IFastWeeklyClose | IWeeklyCloseWithIncome) => {
    // Si ya tiene ingresosAgente, usar tal como está
    if ('ingresosAgente' in data) {
      weeklyClose.value = data as IWeeklyCloseWithIncome
    } else {
      // Convertir IFastWeeklyClose a IWeeklyCloseWithIncome agregando ingresosAgente vacío
      weeklyClose.value = {
        ...data,
        ingresosAgente: {
          cobranzaPura: 0,
          montoExcedente: 0,
          liquidaciones: 0,
          multas: 0,
          otrosIngresos: 0,
          motivoOtrosIngresos: ''
        }
      }
    }
  }
  const setWeeklyClosingBonus = (bonus: number) => {
    if (!weeklyClose.value) return
    weeklyClose.value.egresosGerente.bonosPagadosEnSemana = bonus
  }


  const setAgentsIncome = (data: IAgencyDashboard) => {

    if (!weeklyClose.value) return

    console.log('AGENTS INCOME DATA', data)
    weeklyClose.value.ingresosAgente.cobranzaPura = data.totalCobranzaPura
    weeklyClose.value.ingresosAgente.montoExcedente = data.montoExcedente
    weeklyClose.value.ingresosAgente.liquidaciones = data.liquidaciones
    weeklyClose.value.ingresosAgente.multas = data.multas
    weeklyClose.value.ingresosAgente.otrosIngresos = 0

    agentsIncome.value = data
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
    bonusInfo: readonly(bonusInfo),

    // Getters
    hasRequiredData,
    isAgencyActive,
    isAgencyVacant,
    isClosingLocked,
    hasActiveBonuses,

    // Actions
    resetState,
    setAgentsIncome,
    setBonusInfo,
    setClosingComplete,
    setError,
    setLoading,
    setSecurityPin,
    setWeeklyClose,
    setWeeklyClosingBonus,
    updateNestedField,
    updateWeeklyCloseField,
  }
})
