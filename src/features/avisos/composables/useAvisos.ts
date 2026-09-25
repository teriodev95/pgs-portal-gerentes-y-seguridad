import { reactive, ref } from 'vue'
import { avisosService } from '../services/avisos.service'
import { useNotification } from '@/shared/composables/useNotification'
import type { Aviso, AvisosVista } from '../types/avisos.types'

/** Lo que dura el toast de "Marcar todo": hasta entonces se puede deshacer y no se manda nada a Elysia. */
const UNDO_MS = 5000

interface VistaState {
  avisos: Aviso[]
  siguiente: string | null
  isLoading: boolean
  hasError: boolean
  loaded: boolean
}

const emptyVista = (): VistaState => ({ avisos: [], siguiente: null, isLoading: false, hasError: false, loaded: false })

// Compartidos entre la campana de Home y la vista del buzón.
const noLeidos = ref(0)
const vistas = reactive<Record<AvisosVista, VistaState>>({
  pendientes: emptyVista(),
  historial: emptyVista()
})

export function useAvisos() {
  const { showSuccess } = useNotification()

  /** La campana solo necesita el contador. */
  async function fetchCount(): Promise<void> {
    try {
      noLeidos.value = (await avisosService.list({ limite: 1 })).no_leidos
    } catch (error) {
      // Se queda con el último contador; la campana no debe estorbar.
      console.warn('[avisos] contador', error)
    }
  }

  /** Primera página de la vista; con `more` agrega la siguiente. */
  async function fetchVista(vista: AvisosVista, more = false): Promise<void> {
    const state = vistas[vista]
    if (more && !state.siguiente) return
    state.isLoading = true
    try {
      const response = await avisosService.list({ vista, antes: more ? state.siguiente : null })
      state.avisos = more ? [...state.avisos, ...response.data] : response.data
      state.siguiente = response.siguiente
      state.hasError = false
      state.loaded = true
      noLeidos.value = response.no_leidos
    } catch (error) {
      state.hasError = true
      console.warn(`[avisos] ${vista}`, error)
    } finally {
      state.isLoading = false
    }
  }

  async function markRead(aviso: Aviso): Promise<void> {
    if (aviso.leido_at) return
    aviso.leido_at = new Date().toISOString()
    noLeidos.value = Math.max(0, noLeidos.value - 1)
    await avisosService.markRead(aviso.id).catch((error) => console.warn('[avisos] marcar leído', error))
  }

  function markAllRead(): void {
    const previous = vistas.pendientes.avisos
    const previousCount = noLeidos.value
    vistas.pendientes.avisos = []
    noLeidos.value = 0

    const timer = setTimeout(async () => {
      await avisosService.markAllRead().catch((error) => console.warn('[avisos] marcar todos', error))
      vistas.historial.loaded = false
    }, UNDO_MS)

    showSuccess('Avisos marcados como leídos · <strong class="underline">Deshacer</strong>', {
      duration: UNDO_MS,
      position: 'bottom',
      onClick: () => {
        clearTimeout(timer)
        vistas.pendientes.avisos = previous
        noLeidos.value = previousCount
      }
    })
  }

  return { noLeidos, vistas, fetchCount, fetchVista, markRead, markAllRead }
}
