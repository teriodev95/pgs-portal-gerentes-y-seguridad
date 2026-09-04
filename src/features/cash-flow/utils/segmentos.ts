import type { Cubos } from '../types/cashFlow.types'

export interface Segmento {
  clave: string
  etiqueta: string
  monto: number
  color: string // clase tailwind de fondo
}

export interface Barras {
  entradas: Segmento[]
  ubicaciones: Segmento[]
  totalEntradas: number
  totalUbicaciones: number
  /** Largo de referencia para que ambas barras midan igual. */
  total: number
}

/**
 * Dos barras del mismo largo: lo que entró y dónde está.
 * Un cubo negativo se pinta del lado de las entradas con la misma etiqueta.
 * El descuadre se pinta en rojo del lado corto. Mismo criterio que MOX.
 */
export function segmentosDe(c: Cubos): Barras {
  const entradas: Segmento[] = []
  const ubicaciones: Segmento[] = []

  const entrada = (clave: string, etiqueta: string, monto: number, color: string) => {
    if (monto > 0) entradas.push({ clave, etiqueta, monto, color })
  }
  const ubicacion = (clave: string, etiqueta: string, monto: number, color: string) => {
    if (monto > 0) ubicaciones.push({ clave, etiqueta, monto, color })
    else if (monto < 0) entradas.push({ clave, etiqueta, monto: -monto, color })
  }

  entrada('cobranza', 'Cobranza', c.cobranza_total, 'bg-blue-500')
  entrada('primer_pagos', 'Primeros pagos', c.primer_pagos, 'bg-teal-500')
  entrada('incidentes', 'Incidentes', c.otros_ingresos, 'bg-cyan-500')
  entrada('recibido', 'Recibido', c.recibido_otras_gerencias, 'bg-indigo-400')
  entrada('fondeo_oficina', 'Fondeo oficina', c.fondeo_oficina, 'bg-violet-400')

  ubicacion('en_campo', 'Campo', c.en_campo, 'bg-sky-400')
  ubicacion('con_gerente', 'Gerente', c.con_gerente, 'bg-emerald-500')
  ubicacion('en_custodia', 'Custodia', c.en_custodia, 'bg-amber-400')
  ubicacion('en_oficina', 'Oficina', c.entregado_oficina, 'bg-violet-600')
  ubicacion('gastado', 'Gastado', c.gastado, 'bg-slate-400')
  ubicacion('enviado', 'Enviado', c.enviado_otras_gerencias, 'bg-indigo-600')

  if (c.sin_cuadrar > 0) ubicaciones.push({ clave: 'sin_cuadrar', etiqueta: 'Descuadre', monto: c.sin_cuadrar, color: 'bg-rose-500' })
  if (c.sin_cuadrar < 0) entradas.push({ clave: 'sin_cuadrar', etiqueta: 'Descuadre', monto: -c.sin_cuadrar, color: 'bg-rose-500' })

  const suma = (s: Segmento[]) => Math.round(s.reduce((acc, x) => acc + x.monto, 0) * 100) / 100
  const totalEntradas = suma(entradas)
  const totalUbicaciones = suma(ubicaciones)
  return {
    entradas,
    ubicaciones,
    totalEntradas,
    totalUbicaciones,
    total: Math.max(totalEntradas, totalUbicaciones, 1),
  }
}
