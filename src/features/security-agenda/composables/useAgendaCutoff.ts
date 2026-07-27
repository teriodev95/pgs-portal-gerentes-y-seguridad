import { computed, onUnmounted, ref, type Ref } from 'vue'
import { CUTOFF_LABEL, CUTOFF_WARNING_MINUTES } from '../constants'
import { formatTimestampTime, minutesToCutoff } from '../utils/time'

import type { AgendaStatus } from '../types'

export interface AgendaCutoffSource {
  status: AgendaStatus
  enviadaAt: string | null
  enviadaATiempo: boolean | null
}

export type CutoffTone = 'pending' | 'warning' | 'late' | 'sent' | 'sent-late'

export interface CutoffState {
  tone: CutoffTone
  label: string
  detail: string
  classes: string
  /** Enviada a tiempo: una sola línea, sin ocupar espacio de más. */
  collapsed: boolean
}

const TONE_CLASSES: Record<CutoffTone, string> = {
  pending: 'bg-gray-50 border-gray-200 text-gray-900',
  warning: 'bg-amber-50 border-amber-600 text-amber-900',
  late: 'bg-red-50 border-red-600 text-red-900',
  sent: 'bg-green-50 border-green-600 text-green-900',
  'sent-late': 'bg-red-50 border-red-600 text-red-900'
}

/** Estado de envío de la agenda frente al corte de las 7:30. */
export function useAgendaCutoff(fecha: Ref<string>, source: Ref<AgendaCutoffSource | null>) {
  // Un tick por minuto mantiene viva la cuenta regresiva del corte.
  const tick = ref(0)
  const ticker = window.setInterval(() => (tick.value += 1), 60_000)
  onUnmounted(() => window.clearInterval(ticker))

  const state = computed<CutoffState>(() => {
    void tick.value
    const minutes = minutesToCutoff(fecha.value)
    const agenda = source.value

    if (agenda?.status === 'enviada') {
      const hora = formatTimestampTime(agenda.enviadaAt)
      return agenda.enviadaATiempo === false
        ? {
            tone: 'sent-late',
            label: `Enviada fuera de horario${hora ? ` ${hora}` : ''}`,
            detail: `El corte es a las ${CUTOFF_LABEL}.`,
            classes: TONE_CLASSES['sent-late'],
            collapsed: false
          }
        : {
            tone: 'sent',
            label: `Enviada${hora ? ` ${hora}` : ''}`,
            detail: '',
            classes: TONE_CLASSES.sent,
            collapsed: true
          }
    }

    if (minutes <= 0) {
      return {
        tone: 'late',
        label: 'Fuera de horario',
        detail: `El corte era a las ${CUTOFF_LABEL}. Envíala cuanto antes.`,
        classes: TONE_CLASSES.late,
        collapsed: false
      }
    }

    if (minutes <= CUTOFF_WARNING_MINUTES) {
      return {
        tone: 'warning',
        label: `Pendiente de enviar · faltan ${minutes} min`,
        detail: `El corte es a las ${CUTOFF_LABEL}.`,
        classes: TONE_CLASSES.warning,
        collapsed: false
      }
    }

    return {
      tone: 'pending',
      label: `Pendiente de enviar · corte ${CUTOFF_LABEL}`,
      detail: '',
      classes: TONE_CLASSES.pending,
      collapsed: false
    }
  })

  return { state }
}
