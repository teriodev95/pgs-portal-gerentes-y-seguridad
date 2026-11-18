// Personal sin gerencia (FAX issue #11): Seguridad recibe `personal` y lo ve en un grupo aparte, al final;
// los grupos por sucursal de los gerentes quedan como estaban.
import { describe, expect, it } from 'bun:test'
import { agruparPorSucursal, etiqueta, GRUPO_PERSONAL, pasaFiltro } from '../equipo-gps.helpers'
import type { GerenteEquipo } from '../equipo-gps.types'

const persona = (id: number, gerencia: string | null, sucursal: string | null, puesto?: string): GerenteEquipo => ({
  id, nombre: `Persona ${id}`, usuario: `U${id}`, gerencia, sucursal, color: null, estado: 'activo', ubicacion: null,
  ...(puesto ? { puesto } : {})
})
const gerentes = [persona(1, 'GERGC001', 'GERGC'), persona(2, 'GERC001', 'GERC')]
const personal = [persona(804, null, 'GERGC', 'Seguridad'), persona(789, null, 'GERGC', 'Regional')]

describe('Personal sin gerencia', () => {
  it('sin personal, los grupos son los mismos de siempre', () => {
    expect(agruparPorSucursal(gerentes, 'todos', '').map((g) => g.codigo)).toEqual(['GERC', 'GERGC'])
  })
  it('el personal va en su grupo, al final, y no altera los de sucursal', () => {
    const grupos = agruparPorSucursal([...gerentes, ...personal], 'todos', '')
    expect(grupos.map((g) => g.codigo)).toEqual(['GERC', 'GERGC', GRUPO_PERSONAL.codigo])
    expect(grupos[1].gerentes.map((g) => g.id)).toEqual([1])
    expect(grupos[2]).toMatchObject({ nombre: 'Regionales y seguridad' })
    expect(grupos[2].gerentes.map((g) => g.id).sort()).toEqual([789, 804])
  })
  it('bajo el nombre va la gerencia o, sin ella, el puesto; la búsqueda lo encuentra', () => {
    expect(etiqueta(gerentes[0])).toBe('GERGC001')
    expect(etiqueta(personal[1])).toBe('Regional')
    expect(pasaFiltro(personal[1], 'todos', 'regional')).toBe(true)
    expect(pasaFiltro(personal[1], 'todos', 'null')).toBe(false)
  })
})
