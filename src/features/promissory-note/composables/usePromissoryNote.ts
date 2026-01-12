import { ref, computed } from 'vue'
import { useStore } from '@/shared/stores'
import { promissoryNoteService } from '../services/promissory-note.service'
import type { Pagare } from '../types'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'

export function usePromissoryNote() {
  const store = useStore()
  const $router = useRouter()
  const pagares = ref<Pagare[]>([])
  const loading = ref(false)
  const selectedPagare = ref<Pagare | null>(null)

  const isDetailOpen = computed(() => selectedPagare.value !== null)

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleSelectPagare = (pagare: Pagare) => {
    selectedPagare.value = pagare
    scrollToTop()
  }

  const closeDetail = () => {
    selectedPagare.value = null
    scrollToTop()
  }

  const loadPagares = async () => {
    if (!store.gerenciaSelected) {
      console.warn('No hay gerencia seleccionada')
      return
    }

    try {
      loading.value = true
      pagares.value = await promissoryNoteService.getPagaresByGerencia(store.gerenciaSelected)
      console.log('Pagarés obtenidos:', pagares.value)
    } catch (error) {
      console.error('Error al obtener pagarés:', error)
    } finally {
      loading.value = false
    }
  }

  const handleUpdated = async () => {
    // Recargar la lista de pagarés después de actualizar
    if (!store.gerenciaSelected) return

    try {
      pagares.value = await promissoryNoteService.getPagaresByGerencia(store.gerenciaSelected)
    } catch (error) {
      console.error('Error al recargar pagarés:', error)
    }
  }

  const handleOnBack = () => {
  if (selectedPagare.value) {
    selectedPagare.value = null
    return
  }

  $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
  return {
    pagares,
    loading,
    selectedPagare,
    isDetailOpen,
    handleSelectPagare,
    handleOnBack,
    closeDetail,
    loadPagares,
    handleUpdated
  }
}
