// Contrato de `xpress-elysia` bajo el prefijo `/agendas-seguridad`.
// Las respuestas viajan envueltas en `{ success, data }`; el service las desenvuelve.

export type AgendaStatus = 'borrador' | 'enviada'

export type AgendaActivityStatus =
  | 'programada'
  | 'en_curso'
  | 'no_se_realizo'
  | 'en_revision'
  | 'completada'

export type AgendaPriority = 'baja' | 'media' | 'alta'

export interface AgendaActivityType {
  clave: string
  nombre: string
}

export interface AgendaScopeGerencia {
  gerenciaId: string
  sucursalId: string
  agencias: string[]
}

export interface AgendaScope {
  gerencias: AgendaScopeGerencia[]
}

export interface AgendaActivity {
  id: string
  agendaId: string
  tipo: string
  tipoNombre: string
  detalle: string | null
  horaInicio: string
  horaFin: string
  prioridad: AgendaPriority
  gerencia: string | null
  agencia: string | null
  status: AgendaActivityStatus
  comentario: string | null
  motivoCambio: string | null
  creadaPorId: number | null
  actualizadaPorId: number | null
  actualizadaPor: string | null
  actualizadaEn: string | null
}

export interface Agenda {
  id: string
  auditorId: number
  auditorUsuario: string
  auditorNombre: string
  fecha: string
  status: AgendaStatus
  enviadaAt: string | null
  enviadaATiempo: boolean | null
  shareToken: string | null
  shareUrl: string | null
  actividades: AgendaActivity[]
}

/** Resumen que devuelven `GET /` y el bloque `agenda` de `GET /equipo`. */
export interface AgendaSummary {
  id: string
  status: AgendaStatus
  enviadaAt: string | null
  enviadaATiempo: boolean | null
  totalActividades: number
  completadas: number
}

export interface AgendaTeamMember {
  auditorId: number
  usuario: string
  nombre: string
  sucursales: string[]
  agenda: AgendaSummary | null
}

export interface AgendaPublic {
  auditorUsuario: string
  auditorNombre: string
  fecha: string
  status: AgendaStatus
  enviadaAt: string | null
  enviadaATiempo: boolean | null
  actividades: AgendaActivity[]
}

export interface AgendaShareLink {
  token: string
  url: string
}

export interface AgendaSendResult {
  id: string
  status: AgendaStatus
  enviadaAt: string
  enviadaATiempo: boolean
}

/** Body de `POST /actividades`; `PUT /actividades/:id` acepta el mismo shape parcial. */
export interface AgendaActivityPayload {
  auditorId?: number
  fecha: string
  tipo: string
  detalle?: string
  horaInicio: string
  horaFin: string
  prioridad?: AgendaPriority
  gerencia?: string
  agencia?: string
}
