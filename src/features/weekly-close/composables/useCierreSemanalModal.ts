// composables/useCierreSemanalModal.ts
import { ref, computed } from 'vue'
import { useCierreSemanalStore } from '@/features/weekly-close/stores'
import { useWeeklyCloseErrorHandler } from './useWeeklyCloseErrorHandler'
import { WEEKLY_CLOSE_VALIDATION_MESSAGES } from '../constants'
import type {
  IWeeklyCloseWithIncome,ModalValue,
  ModalConfigKey,
  AllConfig
} from '../types'
import type { InputType } from '@/features/weekly-close/components/EditFieldDialog.vue'

/**
 * Composable para manejar la lógica de modales del cierre semanal
 * Separa la gestión de UI del store principal
 */
export const useCierreSemanalModal = () => {
  const store = useCierreSemanalStore()
  const { handleModalError, handleValidationError } = useWeeklyCloseErrorHandler()
  
  // Estado local del modal (no debe estar en el store global)
  const showModal = ref(false)
  const modalContext = ref<ModalConfigKey>()
  const modalLabel = ref('')
  const modalValue = ref<ModalValue>()
  const inputType = ref<InputType>()

  /**
   * Configuración de todos los campos editables del modal
   */
  const modalConfig = computed<AllConfig>(() => {
    if (!store.weeklyClose) return {} as AllConfig
    
    return {
      multas: {
        label: 'Multas',
        value: store.weeklyClose.ingresosAgente.multas ?? 0
      },
      otrosIngresosAgente: {
        label: 'Otros',
        value: store.weeklyClose.ingresosAgente.otrosIngresos ?? 0
      },
      comisionVentas: {
        label: 'Comisión por Ventas',
        value: store.weeklyClose.egresosGerente.comisionVentasPagadaEnSemana ?? 0
      },
      bonos: {
        label: 'Bonos',
        value: store.weeklyClose.egresosGerente.bonosPagadosEnSemana ?? 0
      },
      otrosEgresosAgente: {
        label: 'Otros',
        value: store.weeklyClose.egresosAgente.otrosEgresos ?? 0
      },
      motivoOtrosIA: {
        label: 'Motivo Otros',
        value: store.weeklyClose.ingresosAgente.motivoOtrosIngresos ?? ''
      },
      motivoOtrosEA: {
        label: 'Motivo Otros',
        value: store.weeklyClose.egresosAgente.motivoOtrosEgresos ?? ''
      },
      asignacionesPrevias: {
        label: 'Asignaciones Previas',
        value: store.weeklyClose.egresosAgente.asignacionesNumero ?? 0
      },
      efectivoEntregado: {
        label: 'Efectivo Entregado',
        value: store.weeklyClose.egresosAgente.efectivoEntregadoCierre ?? 0
      },
      comisionCobranza: {
        label: 'Comisión por Cobranza',
        value: store.weeklyClose.egresosGerente.comisionCobranzaPagadaEnSemana ?? 0
      }
    }
  })

  /**
   * Abre el modal para editar un campo específico
   */
  const openModal = (contexto: ModalConfigKey, type: InputType) => {
    const config = modalConfig.value[contexto]
    if (!config) {
      handleModalError(new Error(`Config not found for: ${contexto}`), contexto)
      return
    }

    modalContext.value = contexto
    modalLabel.value = config.label
    modalValue.value = config.value
    inputType.value = type
    showModal.value = true
  }

  /**
   * Cierra el modal y limpia el estado
   */
  const closeModal = () => {
    showModal.value = false
    modalContext.value = undefined
    modalLabel.value = ''
    modalValue.value = undefined
    inputType.value = undefined
  }

  /**
   * Mapeo de contextos a funciones de actualización
   */
  const contextMapping: Record<
    ModalConfigKey,
    (weeklyClose: IWeeklyCloseWithIncome, value: ModalValue) => void
  > = {
    bonos: (weeklyClose, value) => {
      weeklyClose.egresosGerente.bonosPagadosEnSemana = Number(value)
    },
    motivoOtrosEA: (weeklyClose, value) => {
      weeklyClose.egresosAgente.motivoOtrosEgresos = String(value)
    },
    motivoOtrosIA: (weeklyClose, value) => {
      weeklyClose.ingresosAgente.motivoOtrosIngresos = String(value)
    },
    multas: (weeklyClose, value) => {
      weeklyClose.ingresosAgente.multas = Number(value)
    },
    otrosEgresosAgente: (weeklyClose, value) => {
      weeklyClose.egresosAgente.otrosEgresos = Number(value)
    },
    otrosIngresosAgente: (weeklyClose, value) => {
      weeklyClose.ingresosAgente.otrosIngresos = Number(value)
    },
    efectivoEntregado: (weeklyClose, value) => {
      weeklyClose.egresosAgente.efectivoEntregadoCierre = Number(value)
    },
    asignacionesPrevias: (weeklyClose, value) => {
      weeklyClose.egresosAgente.asignacionesNumero = Number(value)
    }
  }

  /**
   * Guarda el valor editado en el modal
   */
  const saveValue = (value: ModalValue) => {
    if (!modalContext.value || !store.weeklyClose) {
      handleModalError(new Error('No modal context or weekly close available'))
      return
    }

    const updateFunction = contextMapping[modalContext.value]
    if (!updateFunction) {
      handleModalError(new Error(`Update function not found for: ${modalContext.value}`), modalContext.value)
      return
    }

    try {
      // Crear una copia profunda para evitar mutaciones directas
      const updatedWeeklyClose = JSON.parse(JSON.stringify(store.weeklyClose)) as IWeeklyCloseWithIncome
      updateFunction(updatedWeeklyClose, value)

      // Actualizar el store con los nuevos datos
      store.setWeeklyClose(updatedWeeklyClose)

      closeModal()
    } catch (error) {
      handleModalError(error, modalContext.value)
    }
  }

  /**
   * Valida el valor antes de guardarlo
   */
  const validateModalValue = (value: ModalValue, context: ModalConfigKey): string | null => {
    if (context === 'motivoOtrosEA' || context === 'motivoOtrosIA') {
      // Para campos de texto
      if (typeof value !== 'string') {
        return WEEKLY_CLOSE_VALIDATION_MESSAGES.INVALID_NUMBER
      }
      if (value.trim().length === 0) {
        return WEEKLY_CLOSE_VALIDATION_MESSAGES.MOTIVATION_REQUIRED
      }
      if (value.trim().length < 3) {
        return WEEKLY_CLOSE_VALIDATION_MESSAGES.MINIMUM_LENGTH
      }
      if (value.trim().length > 100) {
        return WEEKLY_CLOSE_VALIDATION_MESSAGES.MAXIMUM_LENGTH
      }
    } else {
      // Para campos numéricos
      const numValue = Number(value)
      if (isNaN(numValue)) {
        return WEEKLY_CLOSE_VALIDATION_MESSAGES.INVALID_NUMBER
      }
      if (numValue < 0) {
        return WEEKLY_CLOSE_VALIDATION_MESSAGES.INVALID_AMOUNT
      }
    }

    return null
  }

  /**
   * Guarda el valor con validación
   */
  const saveValueWithValidation = (value: ModalValue) => {
    if (!modalContext.value) return

    const validationError = validateModalValue(value, modalContext.value)
    if (validationError) {
      handleValidationError(new Error(validationError), modalContext.value)
      return false
    }

    saveValue(value)
    return true
  }

  /**
   * Obtiene el tipo de input apropiado para un contexto
   */
  const getInputTypeForContext = (context: ModalConfigKey): InputType => {
    const textFields: ModalConfigKey[] = ['motivoOtrosEA', 'motivoOtrosIA']
    return textFields.includes(context) ? 'text' : 'number'
  }

  /**
   * Abre el modal con configuración automática del tipo de input
   */
  const openModalAuto = (contexto: ModalConfigKey) => {
    const inputTypeAuto = getInputTypeForContext(contexto)
    openModal(contexto, inputTypeAuto)
  }

  return {
    // Estado del modal
    showModal: computed(() => showModal.value),
    modalContext: computed(() => modalContext.value),
    modalLabel: computed(() => modalLabel.value),
    modalValue: computed(() => modalValue.value),
    inputType: computed(() => inputType.value),

    // Configuración
    modalConfig,
    
    // Métodos principales
    openModal,
    openModalAuto,
    closeModal,
    saveValue,
    saveValueWithValidation,
    
    // Utilidades
    validateModalValue,
    getInputTypeForContext
  }
}