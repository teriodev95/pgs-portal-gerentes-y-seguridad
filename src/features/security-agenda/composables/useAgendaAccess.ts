import { computed } from 'vue'
import { useStore } from '@/shared/stores'

/**
 * Quién ve la agenda: Seguridad siempre; Regional sólo si tiene ámbito
 * (gerencias cargadas por el layout). Sin ámbito no hay nada que agendar.
 */
export function useAgendaAccess() {
  const $store = useStore()

  const canUseAgenda = computed(() => {
    const tipo = $store.user?.tipo
    if (tipo === 'Seguridad') return true
    return tipo === 'Regional' && $store.gerencias.length > 0
  })

  return { canUseAgenda }
}
