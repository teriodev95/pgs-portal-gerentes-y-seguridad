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

/**
 * Evidencia de la visita de call center ligada a la actividad. Llega en
 * `GET /:id` y `GET /equipo`; el enlace público nunca la recibe.
 */
export interface AgendaActivityVisit {
  /**
   * Salen del JSON `log`, que viene vacío en buena parte del histórico: o los
   * dos traen valor o los dos son `null`.
   */
  status: string | null
  observaciones: string | null
  /** Instante ISO ya resuelto por el backend: se localiza una sola vez. */
  fecha: string
  /** Booleano a propósito: la agenda no muestra coordenadas. */
  tieneUbicacion: boolean
}

/** Visita registrada en FAX que todavía no existe como actividad del día. */
export interface AgendaUnlinkedVisit {
  visitaId: string
  /** Columnas nullable de `visitas`: el detalle se arma con lo que venga. */
  cliente: string | null
  prestamoId: string | null
  /** Instante ISO ya resuelto por el backend: se localiza una sola vez. */
  fecha: string
  status: string | null
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
  /** Sólo en las actividades con visita ligada. */
  visita: AgendaActivityVisit | null
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

/**
 * Agente de seguridad asignado a la agencia donde ocurre la actividad
 * (`GET /agencias/:agenciaId/contacto`). La respuesta es `null` cuando la plaza
 * está vacante, y eso no es un caso de borde: 120 de las 406 agencias no tienen
 * agente. Se muestra como un hecho, nunca como un error.
 *
 * Nunca viaja al enlace público: es el teléfono personal de una persona.
 */
export interface AgendaAgencyContact {
  nombre: string
  usuario: string
  celular: string
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

/** Precarga de la hoja de alta cuando la actividad llega desde otro módulo. */
export interface AgendaActivityDefaults {
  tipo?: string
  detalle?: string
  gerencia?: string
  agencia?: string
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
  /**
   * Liga la visita de call center; `null` la desliga. Al ligar, el servidor
   * mueve la actividad a `completada`: el front nunca manda el estado.
   */
  visitaId?: string | null
}
