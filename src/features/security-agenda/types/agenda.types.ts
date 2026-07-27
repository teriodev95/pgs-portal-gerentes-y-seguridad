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
  /** Una gerencia puede no tener sucursal. */
  sucursalId: string | null
  agencias: string[]
}

export interface AgendaScope {
  gerencias: AgendaScopeGerencia[]
}

export interface AgendaActivity {
  id: number
  agendaId: number
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

/**
 * El enlace público no expone ids ni la auditoría de la actividad: sólo lo que
 * se muestra. No es un `AgendaActivity` recortado por gusto, el backend manda
 * exactamente estos campos.
 */
export type AgendaPublicActivity = Pick<
  AgendaActivity,
  | 'tipo'
  | 'tipoNombre'
  | 'detalle'
  | 'horaInicio'
  | 'horaFin'
  | 'prioridad'
  | 'gerencia'
  | 'agencia'
  | 'status'
>

/** Lo que el riel necesita: sirve a la agenda propia y a la vista pública. */
export type AgendaTimelineActivity = AgendaPublicActivity & Partial<AgendaActivity>

export interface Agenda {
  id: number
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
  id: number
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
  // Sin `auditorUsuario` a propósito: el enlace es público y ese dato es la mitad
  // del par usuario:pin con el que se autentica la plataforma.
  auditorNombre: string
  fecha: string
  status: AgendaStatus
  enviadaAt: string | null
  enviadaATiempo: boolean | null
  /** Máximo entre la cabecera y sus actividades: marca de frescura del enlace. */
  actualizadaEn: string | null
  actividades: AgendaPublicActivity[]
}

export interface AgendaShareLink {
  token: string
  url: string
}

export interface AgendaSendResult {
  id: number
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

/**
 * Body de `PUT /actividades/:id`. Sólo viaja lo que cambia, y `null` es la única
 * forma de limpiar un campo: omitirlo conserva el valor anterior.
 */
export interface AgendaActivityChanges
  extends Omit<Partial<AgendaActivityPayload>, 'detalle' | 'gerencia' | 'agencia'> {
  detalle?: string | null
  gerencia?: string | null
  agencia?: string | null
}
