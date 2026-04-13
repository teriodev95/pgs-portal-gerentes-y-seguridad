import type { RevisionStatus } from '../types'
import type { RutaSolicitudPasoId } from '../types'

/**
 * Cierre obligatorio en cualquier bloque narrativo de diagnóstico.
 * El back ya lo incluye al final de `filtrado.diagnostico`, pero se mantiene
 * aquí como fallback cuando no venga poblado.
 */
export const NEUTRAL_CLOSE =
  'Los resultados quedan registrados para revisión y decisión del personal autorizado.'

export type FiltradoTone = 'emerald' | 'amber' | 'rose' | 'slate'

export interface FiltradoHeading {
  title: string
  subtitle: string
  tone: FiltradoTone
}

/**
 * Titular neutro según el estado del filtrado/revisión.
 * El color `tone` se usa solo en un punto pequeño junto al titular y,
 * en el stepper, en el círculo del paso. Nunca en bordes ni fondos grandes.
 */
export function getFiltradoHeading(status?: RevisionStatus | string | null): FiltradoHeading {
  switch (status) {
    case 'sin_hallazgos':
    case 'aprobada':
      return {
        title: 'Sin observaciones técnicas',
        subtitle: 'Resultados a disposición del personal revisor',
        tone: 'emerald'
      }
    case 'con_hallazgos':
    case 'aprobada_con_ajuste':
    case 'aprobada_condicionada':
      return {
        title: 'Con observaciones técnicas',
        subtitle: 'Resultados pendientes de revisión del personal',
        tone: 'amber'
      }
    case 'requiere_correccion':
    case 'corregir':
    case 'rechazada':
      return {
        title: 'Con bloqueos técnicos',
        subtitle: 'Resultados pendientes de revisión del personal',
        tone: 'rose'
      }
    default:
      return {
        title: 'Analizando',
        subtitle: 'Resultado en proceso',
        tone: 'slate'
      }
  }
}

/**
 * `"no_aplica"` es un valor semántico del back: indica que el campo fue
 * intencionalmente marcado como sin contenido. Debe tratarse como vacío en UI.
 */
export function isNarrativeEmpty(value?: string | null): boolean {
  if (value == null) return true
  const normalized = value.trim().toLowerCase()
  return normalized === '' || normalized === 'no_aplica' || normalized === 'n/a'
}

/**
 * Copy neutro de cada paso de la ruta de la solicitud.
 * Las keys internas (`prevalidacion_app`, `filtrado`) se preservan para no
 * romper el contrato con el back, pero los textos visibles evitan jerga.
 */
export const STEP_COPY: Record<RutaSolicitudPasoId, { title: string; description: string }> = {
  prevalidacion_app: {
    title: 'Revisión inicial',
    description: 'Verificación automática de documentos e identidad antes de pasar a evaluación.'
  },
  filtrado: {
    title: 'Evaluación técnica',
    description: 'Análisis de historial, identidad y documentación registrado por el sistema.'
  },
  vistos_buenos: {
    title: 'Vistos buenos',
    description: 'Autorizaciones requeridas por el plan seleccionado.'
  }
}
