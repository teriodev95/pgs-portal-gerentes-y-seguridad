import { describe, expect, it } from 'bun:test'
import { TEXTO_VENTA_OK, textoAvisoCarteraVirtual } from '../services/cartera-virtual'

describe('aviso de cartera virtual al registrar la venta', () => {
  it('coincide: el texto trae el préstamo del que sale', () => {
    const motivo = 'Cartera virtual AGM0000 · préstamo F-N-5218-A-mo · saldo $1,604 · coincide por nombre'
    expect(textoAvisoCarteraVirtual({ data: { coincide: true, motivo } })).toBe(
      `Aviso: el cliente está en una cartera virtual (${motivo}). Revísalo con Oficina antes de entregar.`
    )
  })
  it('sin coincidencia, sin respuesta o con error: texto normal (nunca bloquea)', () => {
    expect(textoAvisoCarteraVirtual({ data: { coincide: false, motivo: '' } })).toBe(TEXTO_VENTA_OK)
    expect(textoAvisoCarteraVirtual(null)).toBe(TEXTO_VENTA_OK)
    expect(textoAvisoCarteraVirtual({})).toBe(TEXTO_VENTA_OK)
  })
})
