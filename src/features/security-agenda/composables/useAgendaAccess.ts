import { computed } from 'vue'
import { useStore } from '@/shared/stores'

/**
 * Quién hace agenda: Seguridad siempre; Regional sólo si tiene ámbito
 * (gerencias cargadas por el layout), que son las gerencias donde agenda.
 * El gerente agenda en su gerencia: sin ella el backend no le abre la agenda.
 */
export function useAgendaAccess() {
  const $store = useStore()

  const canUseAgenda = computed(() => {
    const tipo = $store.user?.tipo
    if (tipo === 'Seguridad') return true
    if (tipo === 'Gerente') return Boolean($store.user?.gerencia)
    return tipo === 'Regional' && $store.gerencias.length > 0
  })

  /** Agenda del gerente de la gerencia seleccionada, sólo lectura. */
  const canViewManagerAgenda = computed(() => {
    const tipo = $store.user?.tipo
    return (tipo === 'Seguridad' || tipo === 'Regional') && Boolean($store.gerenciaSelected)
  })

  return { canUseAgenda, canViewManagerAgenda }
}
