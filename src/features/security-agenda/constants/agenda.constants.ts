import type { Component } from 'vue'
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  PlayCircle,
  XCircle
} from 'lucide-vue-next'
import type { AgendaActivityStatus, AgendaPriority } from '../types'

/**
 * Alto de una hora del riel. El alto del bloque es exactamente su duración, sin
 * pisos ni excepciones: 96 px la hora deja la actividad más corta que se puede
 * capturar —media hora, por los pasos del selector— en 48 px, por encima del
 * mínimo táctil de 44. Por eso no hace falta un alto mínimo.
 */
export const HOUR_ROW_HEIGHT = 96

/**
 * Jornada que acepta el backend (`JORNADA_INICIO`/`JORNADA_FIN`): fuera de
 * 6:00–22:00 la actividad se rechaza, así que el riel no la ofrece.
 */
export const DAY_START_HOUR = 6
export const DAY_END_HOUR = 22
/** Última hora en la que se puede empezar algo que termine dentro de la jornada. */
export const LAST_START_HOUR = DAY_END_HOUR - 1
/** Tope de duración del backend (`DURACION_MAXIMA_MINUTOS`). */
export const MAX_DURATION_MINUTES = 120

/** Ventana visible por defecto cuando la agenda todavía no tiene actividades. */
export const EMPTY_DAY_START_HOUR = 6
export const EMPTY_DAY_END_HOUR = 20

/** Corte de envío de la agenda. */
export const CUTOFF_HOUR = 7
export const CUTOFF_MINUTE = 30
export const CUTOFF_LABEL = '7:30 am'
/** Minutos previos al corte en los que la barra pasa a cuenta regresiva. */
export const CUTOFF_WARNING_MINUTES = 60

/** Granularidad del selector de horario. */
export const SLOT_MINUTES = 30
/** Duración precargada al abrir la hoja desde un hueco. */
export const DEFAULT_DURATION_MINUTES = 60

/**
 * Duraciones que el backend acepta, y son todas: pasos de media hora
 * (`PASO_MINUTOS`) hasta el tope de dos horas (`DURACION_MAXIMA_MINUTOS`). Se
 * derivan de esas dos constantes en vez de escribirse a mano para que la lista
 * no se quede corta si alguna se mueve. Hoy: 30, 60, 90 y 120.
 */
export const DURATION_OPTIONS: number[] = Array.from(
  { length: MAX_DURATION_MINUTES / SLOT_MINUTES },
  (_, index) => (index + 1) * SLOT_MINUTES
)

export const DETAIL_MAX_LENGTH = 255

/** Módulo que habilita la pestaña "Mi equipo". */
export const TEAM_MODULE = 'agenda-equipo'

/** Tipo de actividad que se liga con una visita del call center. */
export const VISIT_ACTIVITY_TYPE = 'VISITA_CALL_CENTER'

/** Duración del bloque que se crea al agregar una visita ya registrada. */
export const VISIT_DURATION_MINUTES = SLOT_MINUTES

/**
 * `detalle` de una visita: `"<cliente> — <prestamoId>"`. El préstamo viaja ahí
 * porque la actividad no tiene otro campo donde guardarlo, y sin él no se puede
 * registrar la visita en FAX.
 */
export const VISIT_DETAIL_SEPARATOR = ' — '

interface StatusStyle {
  label: string
  icon: Component
  /** Bloque vigente: el color lo manda el estado. */
  block: string
  /** Bloque pasado: se apaga fondo y borde, el texto se mantiene legible. */
  blockPast: string
  /** Color del segmento en la mini-franja del día del equipo. */
  stripe: string
}

export const STATUS_STYLE: Record<AgendaActivityStatus, StatusStyle> = {
  programada: {
    label: 'Programada',
    icon: Circle,
    block: 'bg-white border-gray-200 text-gray-900',
    blockPast: 'bg-gray-50 border-gray-100 text-gray-900',
    stripe: 'bg-gray-300'
  },
  en_curso: {
    label: 'En curso',
    icon: PlayCircle,
    block: 'bg-blue-50 border-blue-500 text-blue-900',
    blockPast: 'bg-blue-50/50 border-blue-200 text-blue-900',
    stripe: 'bg-blue-500'
  },
  completada: {
    label: 'Completada',
    icon: CheckCircle2,
    block: 'bg-green-50 border-green-600 text-green-900',
    blockPast: 'bg-green-50/50 border-green-200 text-green-900',
    stripe: 'bg-green-600'
  },
  no_se_realizo: {
    label: 'No se realizó',
    icon: XCircle,
    block: 'bg-red-50 border-red-600 text-red-900',
    blockPast: 'bg-red-50/50 border-red-200 text-red-900',
    stripe: 'bg-red-600'
  },
  en_revision: {
    label: 'En revisión',
    icon: AlertTriangle,
    block: 'bg-amber-50 border-amber-600 text-amber-900',
    blockPast: 'bg-amber-50/50 border-amber-200 text-amber-900',
    stripe: 'bg-amber-600'
  }
}

/** La prioridad NUNCA pinta el fondo del bloque: sólo punto de 8px + texto. */
export const PRIORITY_STYLE: Record<AgendaPriority, { label: string; dot: string }> = {
  alta: { label: 'Alta', dot: 'bg-red-500' },
  media: { label: 'Media', dot: 'bg-amber-500' },
  baja: { label: 'Baja', dot: 'bg-gray-400' }
}

export const PRIORITY_OPTIONS: AgendaPriority[] = ['baja', 'media', 'alta']

export const EMPTY_AGENDA_MESSAGE = 'Tu agenda de hoy está vacía'
export const EMPTY_AGENDA_DESCRIPTION =
  `Toca una hora para agregar tu primera actividad. Recuerda enviarla antes de las ${CUTOFF_LABEL}.`
