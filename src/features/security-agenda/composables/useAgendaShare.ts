import { useNotification } from '@/shared/composables/useNotification'
import { useShareData } from '@/shared/composables/useShareData'
import { formatShortDate } from '../utils/time'

interface ShareAgendaInput {
  fecha: string
  auditorNombre: string
  auditorUsuario: string
  totalActividades: number
  url: string
}

/** `Agenda 27/07 — Julio Luna (JLT.HDNEX) · 5 actividades` */
function buildShareText(input: ShareAgendaInput): string {
  const actividades = `${input.totalActividades} ${
    input.totalActividades === 1 ? 'actividad' : 'actividades'
  }`
  return `Agenda ${formatShortDate(input.fecha)} — ${input.auditorNombre} (${
    input.auditorUsuario
  }) · ${actividades}`
}

export function useAgendaShare() {
  const { shareData } = useShareData()
  const { showSuccess, showError } = useNotification()

  /** Comparte con la hoja nativa; si no hay, copia el enlace al portapapeles. */
  async function shareAgenda(input: ShareAgendaInput) {
    const text = buildShareText(input)
    const result = await shareData({ title: 'Agenda de seguridad', text, url: input.url })

    if (result.success) return
    await copyLink(`${text}\n${input.url}`)
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
