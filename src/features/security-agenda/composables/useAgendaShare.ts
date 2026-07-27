import { useNotification } from '@/shared/composables/useNotification'
import { useShareData } from '@/shared/composables/useShareData'
import { formatShortDate } from '../utils/time'

interface ShareAgendaInput {
  fecha: string
  auditorNombre: string
  totalActividades: number
  url: string
}

/**
 * `Agenda 27/07 — Julio Luna · 5 actividades`
 * Sin el usuario de acceso: este texto viaja con el enlace cuando lo reenvían.
 */
function buildShareText(input: ShareAgendaInput): string {
  const actividades = `${input.totalActividades} ${
    input.totalActividades === 1 ? 'actividad' : 'actividades'
  }`
  return `Agenda ${formatShortDate(input.fecha)} — ${input.auditorNombre} · ${actividades}`
}

export function useAgendaShare() {
  const { shareData, canShareNatively } = useShareData()
  const { showSuccess, showError } = useNotification()

  /** Comparte con la hoja nativa; si no hay (escritorio), copia el enlace. */
  async function shareAgenda(input: ShareAgendaInput) {
    const text = buildShareText(input)
    const payload = { title: 'Agenda de seguridad', text, url: input.url }

    // La decisión se toma antes de abrir la hoja: si se abre y el usuario la
    // cierra, cancelar es cancelar y no se copia nada a sus espaldas.
    if (!canShareNatively(payload)) {
      await copyLink(`${text}\n${input.url}`)
      return
    }

    await shareData(payload)
  }

  async function copyLink(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      showSuccess('Enlace copiado')
    } catch {
      showError('No pudimos copiar el enlace. Cópialo manualmente.')
    }
  }

  return { shareAgenda, copyLink, buildShareText }
}
