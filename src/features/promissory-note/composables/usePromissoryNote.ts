import { ref, computed } from 'vue'
import { useStore } from '@/shared/stores'
import { promissoryNoteService } from '../services/promissory-note.service'
import type { Pagare } from '../types'

export function usePromissoryNote() {
  const store = useStore()
  const pagares = ref<Pagare[]>([])
  const loading = ref(false)
  const selectedPagare = ref<Pagare | null>(null)

  const isDetailOpen = computed(() => selectedPagare.value !== null)

  const handleSelectPagare = (pagare: Pagare) => {
    selectedPagare.value = pagare
  }

  const closeDetail = () => {
    selectedPagare.value = null
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

  return {
    pagares,
    loading,
    selectedPagare,
    isDetailOpen,
    handleSelectPagare,
    closeDetail,
    loadPagares,
    handleUpdated
  }
}
