import { describe, expect, it } from 'bun:test'
import { MSG_SEMANA_NO_DISPONIBLE, validarSemanaActual } from '../semana-validacion'

describe('validarSemanaActual', () => {
  it('acepta semana y año válidos de FAX', () => {
    expect(validarSemanaActual({ semana: 44, anio: 2026, desde: '2026-10-28', hasta: '2026-11-03' }))
      .toEqual({ semana: 44, anio: 2026 })
  })

  it('rechaza la semana 0 (valor inicial del store, nunca se guarda)', () => {
    expect(() => validarSemanaActual({ semana: 0, anio: 2026 })).toThrow(MSG_SEMANA_NO_DISPONIBLE)
  })

  it('rechaza año 0, semana fuera de rango y respuestas vacías o malformadas', () => {
    expect(() => validarSemanaActual({ semana: 44, anio: 0 })).toThrow(MSG_SEMANA_NO_DISPONIBLE)
    expect(() => validarSemanaActual({ semana: 54, anio: 2026 })).toThrow(MSG_SEMANA_NO_DISPONIBLE)
    expect(() => validarSemanaActual({ semana: 4.5, anio: 2026 })).toThrow(MSG_SEMANA_NO_DISPONIBLE)
    expect(() => validarSemanaActual({ anio: 2026 })).toThrow(MSG_SEMANA_NO_DISPONIBLE)
    expect(() => validarSemanaActual(null)).toThrow(MSG_SEMANA_NO_DISPONIBLE)
    expect(() => validarSemanaActual(undefined)).toThrow(MSG_SEMANA_NO_DISPONIBLE)
  })
})
