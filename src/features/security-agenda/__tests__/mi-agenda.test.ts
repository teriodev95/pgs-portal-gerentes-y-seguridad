import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { elegirMiAgenda, soloLaMia } from '../services/mi-agenda'
import type { AgendaSummary } from '../types'

const resumen = (id: number, auditorId: number): AgendaSummary => ({
  id, auditorId, status: 'enviada', enviadaAt: '2026-11-03T20:57:00Z', enviadaATiempo: true, totalActividades: 11, completadas: 0
})
const JOSE = 788 // JFRP02, jefe sin agenda el 4-nov
const SERGIO = 789 // SBAC01, su agenda 1514 era la que salía como «Mi agenda»
const prohibido = Object.assign(new Error('403'), { response: { status: 403 } })

describe('Mi agenda de un jefe (caso JFRP02, 3-nov-2026)', () => {
  it('jefe sin agenda propia y la lista trae la de otro → null, nunca la de otro', async () => {
    const pedidos: Array<number | undefined> = []
    const listar = async (auditorId?: number) => { pedidos.push(auditorId); return auditorId === JOSE ? [] : [resumen(1514, SERGIO)] }
    expect(await elegirMiAgenda(listar, JOSE)).toBeNull()
    expect(pedidos).toEqual([JOSE]) // manda su usuarioId
    expect(soloLaMia([resumen(1514, SERGIO)], JOSE)).toBeNull()
  })
  it('jefe con la suya y la de otro en la lista → la suya', async () => {
    const lista = [resumen(1514, SERGIO), resumen(1520, JOSE)]
    expect(soloLaMia(lista, JOSE)?.id).toBe(1520)
    expect((await elegirMiAgenda(async () => lista, JOSE))?.id).toBe(1520)
  })
  it('si Elysia responde 403 al propio id (jefe que no es auditor ni regional), lista sin id y filtra igual', async () => {
    const pedidos: Array<number | undefined> = []
    const listar = async (auditorId?: number) => { pedidos.push(auditorId); if (auditorId) throw prohibido; return [resumen(1514, SERGIO), resumen(1520, JOSE)] }
    expect((await elegirMiAgenda(listar, JOSE))?.id).toBe(1520)
    expect(pedidos).toEqual([JOSE, undefined])
    await expect(elegirMiAgenda(async () => { throw new Error('red') }, JOSE)).rejects.toThrow('red')
  })
  it('sin usuario en sesión no hay «mía»', async () => {
    expect(await elegirMiAgenda(async () => [resumen(1514, SERGIO)], undefined)).toBeNull()
  })
  it('el FAB y la vista usan miAgenda; nadie toma [0] de listAgendas para «lo mío»', () => {
    const raiz = join(import.meta.dir, '..')
    const fab = readFileSync(join(raiz, 'components/AgendaFab.vue'), 'utf8')
    const composable = readFileSync(join(raiz, 'composables/useSecurityAgenda.ts'), 'utf8')
    expect(fab).toContain('securityAgendaService.miAgenda(')
    expect(fab).not.toContain('listAgendas(')
    expect(composable).toContain('securityAgendaService.miAgenda(fecha.value, usuarioId.value)')
    expect(composable).not.toMatch(/\[\w+\] = await securityAgendaService\.listAgendas\(fecha\.value\)/)
  })
})
