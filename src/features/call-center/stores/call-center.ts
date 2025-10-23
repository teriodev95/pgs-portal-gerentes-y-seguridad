import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'
import type { ICallCenterReport } from '@/features/call-center/types'

const STORE_NAME = 'call-center'

/**
 * Store simplificado para Call Center
 * Solo maneja estado persistente, la lógica se delega a composables
 */
export const useCallCenterStore = defineStore(STORE_NAME, () => {
  // Estado persistente (datos que deben sobrevivir entre navegaciones)
  const selectedReport = ref<ICallCenterReport | null>(null)
  const activeGoToLoan = ref<boolean>(false)
  const loanID = ref<string>('')

  /**
   * Establece el reporte seleccionado
   */
  const setSelectedReport = (report: ICallCenterReport | null) => {
    selectedReport.value = report
  }

  /**
   * Activa la navegación hacia un préstamo
   */
  const setActiveGoToLoan = (active: boolean, loanId: string = '') => {
    activeGoToLoan.value = active
    loanID.value = loanId
  }

  /**
   * Limpia el estado del store
   */
  const resetState = () => {
    selectedReport.value = null
    activeGoToLoan.value = false
    loanID.value = ''
  }

  return {
    // Estado
    selectedReport: readonly(selectedReport),
    activeGoToLoan: readonly(activeGoToLoan),
    loanID: readonly(loanID),

    // Métodos
    setSelectedReport,
    setActiveGoToLoan,
    resetState
  }
})
