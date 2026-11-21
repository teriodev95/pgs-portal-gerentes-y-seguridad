import { describe, expect, it } from 'bun:test'
import type { Cubos } from '../types/cashFlow.types'
import { segmentosDe } from '../utils/segmentos'

// Semana con $254 que el agente cobró después del cierre de la semana anterior y sigue trayendo:
// Elysia lo suma en entradas y en en_campo, así que cuadra en 0.
const cubos: Cubos = {
  cobranza_total: 10000,
  primer_pagos: 500,
  otros_ingresos: 0,
  pendiente_semana_anterior: 254,
  recibido_otras_gerencias: 0,
  fondeo_oficina: 0,
  entregado_oficina: 2000,
  en_campo: 2254,
  con_gerente: 6000,
  en_custodia: 0,
  en_oficina: 0,
  gastado: 500,
  enviado_otras_gerencias: 0,
  efectivo_a_entregar: 8254,
  entradas: 10754,
  ubicaciones: 10754,
  sin_cuadrar: 0,
}

describe('barras del flujo de efectivo con pendiente de la semana anterior', () => {
  it('el pendiente es una entrada junto a la cobranza y las barras miden lo mismo', () => {
    const barras = segmentosDe(cubos)
    expect(barras.entradas.map((s) => s.clave)).toEqual(['cobranza', 'pendiente', 'primer_pagos'])
    expect(barras.entradas[1]).toMatchObject({ etiqueta: 'Pendiente sem. anterior', monto: 254 })
    expect(barras.totalEntradas).toBe(cubos.entradas)
    expect(barras.totalUbicaciones).toBe(cubos.ubicaciones)
    expect(barras.entradas.some((s) => s.clave === 'sin_cuadrar')).toBe(false)
  })

  it('sin pendiente (o Elysia que aún no lo manda) no pinta el segmento', () => {
    const sinCampo: Partial<Cubos> = { ...cubos }
    delete sinCampo.pendiente_semana_anterior
    for (const c of [{ ...cubos, pendiente_semana_anterior: 0 }, sinCampo as Cubos]) {
      expect(segmentosDe(c).entradas.some((s) => s.clave === 'pendiente')).toBe(false)
    }
  })
})
