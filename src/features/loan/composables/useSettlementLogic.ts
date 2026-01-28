import type { Liquidacion } from "@/features/settlements/types"
import type { ILoan } from '../types'
import { LOAN_MODAL_MESSAGES } from '../constants'

interface IModalManager {
  openWeeklyFeeDrawer: (tarifa: number, weeklyPayment: number) => void
  openSettlementOptionsDrawer: () => void
  showModal: () => void
  setModalInfo: (title: string, message: string) => void
}

interface INavigation {
  navigateToSettlements: (loanData: ILoan | undefined) => void
}

export function useSettlementLogic(
  modalManager: IModalManager,
) {
  
  function handleSettlementRequest(
    loanData: ILoan | undefined,
    isWeeklyFeePaid: () => boolean
  ) {
    if (!loanData) return

    try {
      const isPaid = isWeeklyFeePaid()

      if (!isPaid) {
        modalManager.openWeeklyFeeDrawer(loanData.tarifa, loanData.tarifa)
        return
      }

      modalManager.openSettlementOptionsDrawer()
    } catch (error) {
      console.error('Error checking weekly fee payment:', error)
      modalManager.openWeeklyFeeDrawer(loanData.tarifa, loanData.tarifa)
    }
  }

  function handleSettleWithoutDiscount(modalManager: IModalManager) {
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