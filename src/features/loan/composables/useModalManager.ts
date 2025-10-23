import { onMounted, ref } from 'vue'
import { ELEMENT_ID } from '@/shared/constants'
import { initModals, Modal } from 'flowbite'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

interface IModalInfo {
  title: string
  message: string
}

export function useModalManager() {
  const confirmId = ELEMENT_ID.CONFIRM
  
  // State
  const modalInfo = ref<IModalInfo>({
    title: '',
    message: ''
  })

  // Bottom sheet refs
  const notificationBottomSheet = ref<InstanceType<typeof VueBottomSheet>>()
  const settlementOptionsBottomSheet = ref<InstanceType<typeof VueBottomSheet>>()

  // Bottom sheet methods
  function openNotificationSheet() { notificationBottomSheet.value?.open() }
  function closeNotificationSheet() { notificationBottomSheet.value?.close() }
  function openSettlementOptionsSheet() { settlementOptionsBottomSheet.value?.open() }
  function closeSettlementOptionsSheet() { settlementOptionsBottomSheet.value?.close() }

  // Modal methods
  function showModal() {
    const targetElement = document.getElementById(confirmId)
    const modal = new Modal(targetElement)
    modal.show()
  }

  function setModalInfo(title: string, message: string) { modalInfo.value = { title, message }}

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
    notificationBottomSheet,
    settlementOptionsBottomSheet,
    
    // Methods
    openNotificationSheet,
    closeNotificationSheet,
    openSettlementOptionsSheet,
    closeSettlementOptionsSheet,
    showModal,
    setModalInfo
  }
}