import type { AgendaSummary } from '../types'

/**
 * «Mi agenda» de un jefe (3-nov-2026, caso JFRP02): `GET /agendas-seguridad/` sin `auditorId`
 * le devuelve a jefe y oficina las agendas de todo su equipo, y tomar la primera mostraba la
 * de otro (SBAC01) como propia. Aquí se pide la propia (`auditorId` = usuario en sesión) y,
 * además, solo se acepta la que sea del usuario: si no hay, `null`, para que la cree. Nunca
 * la de otro. Esta es la única función para «lo mío»: la usan la vista y el botón del Home.
 */
export type ListarAgendas = (auditorId?: number) => Promise<AgendaSummary[]>

/** Solo la agenda cuyo dueño es el usuario en sesión. Sin usuario no hay «mía». */
export function soloLaMia(agendas: AgendaSummary[], usuarioId: number | undefined): AgendaSummary | null {
  if (!usuarioId) return null
  return agendas.find((a) => a.auditorId === usuarioId) ?? null
}

function esProhibido(error: unknown): boolean {
  return (error as { response?: { status?: number } })?.response?.status === 403
}

/**
 * Pide la agenda propia mandando el `usuarioId` y filtra por dueño. Un jefe que no es auditor
 * ni regional (p. ej. un gerente con el módulo de equipo) no está en su propio equipo y Elysia
 * le responde 403 a su propio id: en ese caso se lista sin `auditorId` y se filtra igual.
 */
export async function elegirMiAgenda(listar: ListarAgendas, usuarioId: number | undefined): Promise<AgendaSummary | null> {
  if (!usuarioId) return null
  let agendas: AgendaSummary[]
  try {
    agendas = await listar(usuarioId)
  } catch (error) {
    if (!esProhibido(error)) throw error
    agendas = await listar()
  }
  return soloLaMia(agendas, usuarioId)
}
