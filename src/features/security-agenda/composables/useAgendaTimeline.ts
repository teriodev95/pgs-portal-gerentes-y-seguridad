import { computed, onUnmounted, ref, type Ref } from 'vue'
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  EMPTY_DAY_END_HOUR,
  EMPTY_DAY_START_HOUR,
  HOUR_ROW_HEIGHT,
  MIN_BLOCK_HEIGHT
} from '../constants'
import { isToday, nowMinutes, toMinutes } from '../utils/time'
import type { AgendaTimelineActivity } from '../types'

export type TimelineRow =
  | {
      kind: 'collapsed'
      key: string
      position: 'leading' | 'trailing'
      fromHour: number
      toHour: number
      startMinutes: number
    }
  | { kind: 'gap'; key: string; hour: number; startMinutes: number }
  | {
      kind: 'activity'
      key: string
      activity: AgendaTimelineActivity
      minHeight: number
      isPast: boolean
      startMinutes: number
    }
  | { kind: 'now'; key: string; startMinutes: number }

/**
 * Convierte las actividades del día en filas apilables.
 *
 * El riel es un flujo vertical (no posicionamiento absoluto): cada hora vacía
 * es una fila tocable de `HOUR_ROW_HEIGHT`, y cada actividad ocupa el alto
 * proporcional a su duración. Las horas que quedan cubiertas por una actividad
 * larga no generan fila propia: las cubre el alto del bloque.
 */
export function useAgendaTimeline(activities: Ref<AgendaTimelineActivity[]>, fecha: Ref<string>) {
  const expandedLeading = ref(false)
  const expandedTrailing = ref(false)

  // La línea del ahora avanza sola; sin pulso ni animación.
  const currentMinutes = ref(nowMinutes())
  const ticker = window.setInterval(() => (currentMinutes.value = nowMinutes()), 60_000)
  onUnmounted(() => window.clearInterval(ticker))

  const sorted = computed(() =>
    [...activities.value].sort((a, b) => toMinutes(a.horaInicio) - toMinutes(b.horaInicio))
  )

  const rows = computed<TimelineRow[]>(() => {
    const items = sorted.value
    const showsNow = isToday(fecha.value)

    const firstHour = items.length
      ? Math.floor(toMinutes(items[0].horaInicio) / 60)
      : EMPTY_DAY_START_HOUR

    const lastEnd = items.reduce((max, item) => Math.max(max, toMinutes(item.horaFin)), 0)
    const lastHour = items.length ? Math.ceil(lastEnd / 60) : EMPTY_DAY_END_HOUR

    // Horas que ya quedan pintadas por el alto de alguna actividad.
    const covered = new Set<number>()
    items.forEach((item) => {
      const from = Math.floor(toMinutes(item.horaInicio) / 60)
      const to = Math.ceil(toMinutes(item.horaFin) / 60)
      for (let hour = from; hour < to; hour++) covered.add(hour)
    })

    const result: TimelineRow[] = []

    // Antes del primer bloque
    if (firstHour > DAY_START_HOUR) {
      if (expandedLeading.value) {
        for (let hour = DAY_START_HOUR; hour < firstHour; hour++) result.push(gapRow(hour))
      } else {
        result.push({
          kind: 'collapsed',
          key: 'collapsed-leading',
          position: 'leading',
          fromHour: DAY_START_HOUR,
          toHour: firstHour - 1,
          startMinutes: DAY_START_HOUR * 60
        })
      }
    }

    // Cuerpo del día: los huecos ENTRE actividades quedan siempre visibles.
    for (let hour = firstHour; hour < lastHour; hour++) {
      const starting = items.filter((item) => Math.floor(toMinutes(item.horaInicio) / 60) === hour)

      if (starting.length) {
        starting.forEach((activity) => {
          const start = toMinutes(activity.horaInicio)
          const duration = Math.max(0, toMinutes(activity.horaFin) - start)
          result.push({
            kind: 'activity',
            // La vista pública no recibe ids; el backend no permite traslapes,
            // así que la hora de inicio identifica la fila igual de bien.
            key: `activity-${activity.horaInicio}`,
            activity,
            minHeight: Math.max(MIN_BLOCK_HEIGHT, (duration / 60) * HOUR_ROW_HEIGHT),
            isPast: showsNow && toMinutes(activity.horaFin) <= currentMinutes.value,
            startMinutes: start
          })
        })
        continue
      }

      if (!covered.has(hour)) result.push(gapRow(hour))
    }

    // Después del último bloque
    if (lastHour <= DAY_END_HOUR) {
      if (expandedTrailing.value) {
        for (let hour = lastHour; hour <= DAY_END_HOUR; hour++) result.push(gapRow(hour))
      } else {
        result.push({
          kind: 'collapsed',
          key: 'collapsed-trailing',
          position: 'trailing',
          fromHour: lastHour,
          toHour: DAY_END_HOUR,
          startMinutes: lastHour * 60
        })
      }
    }

    if (!showsNow) return result

    const index = result.findIndex((row) => row.startMinutes > currentMinutes.value)
    const nowRow: TimelineRow = {
      kind: 'now',
      key: 'now-line',
      startMinutes: currentMinutes.value
    }
    if (index === -1) result.push(nowRow)
    else result.splice(index, 0, nowRow)

    return result
  })

  return {
    rows,
    expandedLeading,
    expandedTrailing,
    expandLeading: () => (expandedLeading.value = true),
    expandTrailing: () => (expandedTrailing.value = true)
  }
}

function gapRow(hour: number): TimelineRow {
  return { kind: 'gap', key: `gap-${hour}`, hour, startMinutes: hour * 60 }
}
