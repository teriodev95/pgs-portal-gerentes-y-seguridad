import { describe, expect, it } from 'bun:test'
import { totalEgresosAgente } from '../utils/weeklyCloseHelpers'

describe('total de egresos del agente en el cierre de agencia', () => {
  it('suma asignaciones previas, otros egresos y efectivo entregado', () => {
    // Antes `asignaciones || 0 + ...` devolvía solo las asignaciones (9000).
    expect(totalEgresosAgente({ asignaciones: 9000, otrosEgresos: 150, efectivoEntregadoCierre: 5898 })).toBe(15048)
  })

  it('sin asignaciones también suma lo demás', () => {
    expect(totalEgresosAgente({ asignaciones: 0, otrosEgresos: 150, efectivoEntregadoCierre: 5898 })).toBe(6048)
  })
})
