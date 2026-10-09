import { useNotification } from '@/shared/composables/useNotification'
import { useShareData } from '@/shared/composables/useShareData'
import type { Agenda } from '../types'
import { renderAgendaImage } from '../utils/agendaImage'
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

  /**
   * Imagen de la agenda del día con la hoja nativa; sin ella (escritorio, o un
   * navegador que no comparte archivos) se descarga para mandarla a mano.
   */
  async function shareAgendaImage(agenda: Agenda, estado: string) {
    let blob: Blob
    try {
      blob = await renderAgendaImage({ agenda, activities: agenda.actividades, estado })
    } catch {
      showError('No pudimos generar la imagen de la agenda.')
      return
    }

    const file = new File([blob], `agenda-${agenda.fecha}.png`, { type: 'image/png' })
    if (canShareNatively({ files: [file] })) {
      await shareData({
        files: [file],
        title: 'Agenda',
        text: `Agenda ${formatShortDate(agenda.fecha)} — ${agenda.auditorNombre}`
      })
      return
    }

    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = file.name
    enlace.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    showSuccess('Imagen descargada')
  }

  async function copyLink(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      showSuccess('Enlace copiado')
    } catch {
      showError('No pudimos copiar el enlace. Cópialo manualmente.')
    }
  }

  return { shareAgenda, shareAgendaImage, copyLink, buildShareText }
}
