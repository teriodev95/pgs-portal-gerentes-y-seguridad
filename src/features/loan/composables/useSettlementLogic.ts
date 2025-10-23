import type { Liquidacion } from "@/features/settlements/types"
import type { ILoan } from '../types'
import { LOAN_MODAL_MESSAGES } from '../constants'

interface IModalManager {
  openNotificationSheet: () => void
  openSettlementOptionsSheet: () => void
  closeSettlementOptionsSheet: () => void
  showModal: () => void
  setModalInfo: (title: string, message: string) => void
}

interface INavigation {
  navigateToSettlements: (loanData: ILoan | undefined) => void
}

export function useSettlementLogic(
  modalManager: IModalManager,
  navigation: INavigation
) {
  
  function handleSettlementRequest(
    loanData: ILoan | undefined,
    isWeeklyFeePaid: () => boolean
  ) {
    if (!loanData) return

    if (!isWeeklyFeePaid()) {
      modalManager.openNotificationSheet()
      return
    }

    modalManager.openSettlementOptionsSheet()
  }

  function handleSettleWithoutDiscount(modalManager: IModalManager) {
    modalManager.closeSettlementOptionsSheet()
    modalManager.setModalInfo(
      LOAN_MODAL_MESSAGES.SETTLEMENT_WITHOUT_DISCOUNT.title,
      LOAN_MODAL_MESSAGES.SETTLEMENT_WITHOUT_DISCOUNT.message
    )
    modalManager.showModal()
  }

  function handleNavigateToSettlements(
    settlementData: Liquidacion | undefined,
    loanData: ILoan | undefined,
    modalManager: IModalManager,
    navigation: INavigation
  ) {
    if (!settlementData) return
    
    modalManager.closeSettlementOptionsSheet()

    /*
    if (settlementData.descuentoDinero < 1) {
      modalManager.setModalInfo(
        LOAN_MODAL_MESSAGES.SETTLEMENT_NOT_AVAILABLE.title,
        LOAN_MODAL_MESSAGES.SETTLEMENT_NOT_AVAILABLE.message
      )
      modalManager.showModal()
      return
    }
      */

    navigation.navigateToSettlements(loanData)
  }

  return {
    handleSettlementRequest,
    handleSettleWithoutDiscount,
    handleNavigateToSettlements
  }
}