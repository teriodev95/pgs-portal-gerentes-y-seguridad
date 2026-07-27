// Agrupación POR SEMANA del historial de un crédito. Vive aquí (y no dentro
// del acordeón) porque la lista y el mapa cuentan la misma historia: si la
// semana quedó cubierta. Una sola regla, dos renders.

import { etiquetaMes, formatoRango, rangoSemana } from './calendario'
import { parseRemanenteAdelanto, TIPOS_NO_MONETARIOS } from './adelanto'
import type { IPayment } from '../types'

export type Cobertura = 'completa' | 'parcial' | 'sin-pago'

export interface SemanaGroup {
  key: string
  anio: number
  semana: number
  pagos: IPayment[]
  total: number
  cobertura: Cobertura
  adelantada: boolean
  remanenteSiguiente: number | null
  rango: string
  mes: string
}

/** Clave de semana: mismo formato en el acordeón y en el mapa */
export function claveSemana(pago: Pick<IPayment, 'anio' | 'semana'>): string {
  return `${pago.anio}-${pago.semana}`
}

export function agruparPorSemana(historial: IPayment[]): SemanaGroup[] {
  const map = new Map<string, SemanaGroup>()

  for (const pago of historial) {
    const key = claveSemana(pago)
    let grupo = map.get(key)
    if (!grupo) {
      grupo = { key, anio: pago.anio, semana: pago.semana, pagos: [], total: 0, cobertura: 'sin-pago', adelantada: false, remanenteSiguiente: null, rango: '', mes: '' }
      map.set(key, grupo)
    }
    grupo.pagos.push(pago)
  }

  for (const grupo of map.values()) {
    const monetarios = grupo.pagos.filter((p) => !TIPOS_NO_MONETARIOS.includes(p.tipo))
    grupo.total = monetarios.reduce((suma, p) => suma + p.monto, 0)

    const tarifa = grupo.pagos[0]?.tarifa ?? 0
    const liquidacion = grupo.pagos.some((p) => p.tipo === 'Liquidacion')
    grupo.adelantada = grupo.pagos.some((p) => p.tipo === 'Adelantado')

    // El último marcador de un adelanto puede dejar un abono para la semana
    // que sigue (etiqueta [remanente=] del marcador)
    const marcador = grupo.pagos.find((p) => p.tipo === 'Adelantado')
    grupo.remanenteSiguiente = parseRemanenteAdelanto(marcador)?.remanente ?? null

    // Identidad calendárica: rango mié–mar y mes, derivados de la fecha de
    // cualquier pago de la semana (los marcadores traen el miércoles)
    const rango = rangoSemana(grupo.pagos[0]?.fechaPago ?? '')
    grupo.rango = rango ? formatoRango(rango) : `Semana ${grupo.semana} / ${grupo.anio}`
    grupo.mes = rango ? etiquetaMes(rango) : String(grupo.anio)

    if (grupo.adelantada || liquidacion || (tarifa > 0 && grupo.total >= tarifa)) {
      grupo.cobertura = 'completa'
    } else if (grupo.total > 0) {
      grupo.cobertura = 'parcial'
    } else {
      grupo.cobertura = 'sin-pago'
    }
  }

  // Regla de adyacencia (la misma que aplican los triggers y vistas de BD):
  // el remanente que dejó la semana anterior cuenta para la cobertura de esta.
  // Ej.: remanente $137.50 + pago $43.75 = tarifa completa -> verde.
  for (const grupo of map.values()) {
    if (grupo.cobertura === 'completa') continue
    const anterior = map.get(`${grupo.anio}-${grupo.semana - 1}`)
    const remanente = anterior?.remanenteSiguiente
    if (!remanente) continue
    const tarifa = grupo.pagos[0]?.tarifa ?? 0
    if (tarifa > 0 && grupo.total + remanente >= tarifa) {
      grupo.cobertura = 'completa'
    } else if (grupo.total + remanente > 0) {
      grupo.cobertura = 'parcial'
    }
  }

  return [...map.values()].sort((a, b) => {
    if (a.anio !== b.anio) return b.anio - a.anio
    return b.semana - a.semana
  })
}

// Estado de la semana en palabras — la norma en silencio, la excepción con
// voz: las semanas cumplidas van en gris con un punto verde mínimo (si todo
// está bien, la lista se ve serena); solo las desviaciones llevan color.
export interface EstadoSemana {
  texto: string
  clase: string
  punto?: string
}

export function estadoSemana(grupo: SemanaGroup): EstadoSemana {
  if (grupo.adelantada) {
    return { texto: 'Cubierta por adelanto', clase: 'text-teal-700 font-medium' }
  }
  if (grupo.pagos.some((p) => p.tipo === 'Liquidacion')) {
    return { texto: 'Liquidó', clase: 'text-purple-700 font-medium' }
  }
  const tarifa = grupo.pagos[0]?.tarifa ?? 0
  if (grupo.cobertura === 'completa') {
    return {
      texto: grupo.total > tarifa ? 'Pagada con excedente' : 'Pagada',
      clase: 'font-light text-gray-400',
      punto: 'bg-green-500'
    }
  }
  if (grupo.cobertura === 'parcial') {
    return { texto: 'Pago parcial', clase: 'text-amber-600 font-medium' }
  }
  return { texto: 'Sin pago', clase: 'text-red-500 font-medium' }
}

/** Color sólido del pin en el mapa: mismo criterio que estadoSemana(), pero
 *  sobre un fondo pequeño que necesita contraste (el gris sutil de la lista
 *  no se lee sobre el tile del mapa) */
export function colorPinSemana(grupo: SemanaGroup | undefined): string {
  if (!grupo) return 'bg-gray-500'
  if (grupo.adelantada) return 'bg-teal-600'
  if (grupo.pagos.some((p) => p.tipo === 'Liquidacion')) return 'bg-purple-600'
  if (grupo.cobertura === 'completa') return 'bg-green-600'
  if (grupo.cobertura === 'parcial') return 'bg-amber-500'
  return 'bg-red-500'
}
