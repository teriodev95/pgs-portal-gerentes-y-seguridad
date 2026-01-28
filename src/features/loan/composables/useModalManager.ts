import { onMounted, ref } from 'vue'
import { ELEMENT_ID } from '@/shared/constants'
import { initModals, Modal } from 'flowbite'
import { useDrawer } from '@/shared/composables'

interface IModalInfo {
  title: string
  message: string
}

interface WeeklyFeeData {
  tarifa: number
  weeklyPayment: number
}

export function useModalManager() {
  const confirmId = ELEMENT_ID.CONFIRM

  // State
  const modalInfo = ref<IModalInfo>({
    title: '',
    message: ''
  })

  // Drawers
  const weeklyFeeDrawer = useDrawer<WeeklyFeeData>('weeklyFee')
  const settlementOptionsDrawer = useDrawer('settlementOptions')

  // Drawer methods
  function openWeeklyFeeDrawer(tarifa: number, weeklyPayment: number) {
    weeklyFeeDrawer.openWith({ tarifa, weeklyPayment })
  }

  function openSettlementOptionsDrawer() {
    settlementOptionsDrawer.open()
  }

  // Modal methods
  function showModal() {
    const targetElement = document.getElementById(confirmId)
    const modal = new Modal(targetElement)
    modal.show()
  }

  function setModalInfo(title: string, message: string) {
    modalInfo.value = { title, message }
  }

  // Initialize modals on mount
  onMounted(() => {
    setTimeout(() => {
      initModals()
    }, 500)
  })

  return {
    // State
    confirmId,
    modalInfo,

    // Drawer methods
    openWeeklyFeeDrawer,
    openSettlementOptionsDrawer,

    // Modal methods
    showModal,
    setModalInfo
  }
}