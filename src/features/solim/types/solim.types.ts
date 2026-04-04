export type ApprovalType = 'gerente' | 'oficina' | 'garantias' | 'seguridad' | 'direccion'
export type SolimRole = 'gerente' | 'seguridad'
export type ApprovalDecision =
  | 'pendiente'
  | 'aprobado'
  | 'aprobado_con_ajuste'
  | 'rechazado'
  | 'no_aplica'
export type RevisionStatus =
  | 'pendiente'
  | 'aprobada'
  | 'aprobada_con_ajuste'
  | 'aprobada_condicionada'
  | 'rechazada'
  | 'corregir'
  | 'requiere_correccion'
  | 'sin_hallazgos'
  | 'con_hallazgos'

export type RutaSolicitudStatus = 'pendiente' | 'bloqueada' | 'completa'
export type RutaSolicitudPasoStatus = 'pendiente' | 'completo' | 'bloqueado' | 'no_aplica'
export type RutaSolicitudPasoId = 'prevalidacion_app' | 'filtrado' | 'vistos_buenos'

export interface RutaSolicitudPaso {
  id: RutaSolicitudPasoId
  orden: number
  status: RutaSolicitudPasoStatus
  total: number
  completos: number
  pendientes: number
}

export interface RutaSolicitud {
  version: string
  status: RutaSolicitudStatus
  paso_actual?: RutaSolicitudPasoId | null
  pasos: RutaSolicitudPaso[]
}

export interface ApprovalRequirements {
  version?: string
  gerente: boolean
  oficina: boolean
  garantias: boolean
  seguridad: boolean
  direccion: boolean
}

export interface TablaCargosSnapshot {
  version?: string
  id?: number | null
  monto_solicitado?: number | null
  cargo?: number | null
  total_pagar?: number | null
  tarifa_semanal?: number | null
  primer_pago?: number | null
  nivel?: string | null
  plazo_semanas?: number | null
  identificador?: string | null
  requiere?: Partial<Record<ApprovalType, boolean>>
}

export interface RevisionApproval {
  tipo: ApprovalType
  requerido: number
  decision: ApprovalDecision
  usuario_id?: string | null
  usuario_nombre?: string | null
  comentario?: string | null
  pin_validado: number
  pin_validado_at?: string | null
  monto_autorizado?: number | null
  incremento_autorizado?: number | null
  nivel_autorizado?: string | null
  plazo_autorizado?: number | null
  tabla_cargos_id_sugerido?: number | null
  decision_payload?: Record<string, unknown> | null
  created_at?: string | null
  updated_at?: string | null
  resolved_at?: string | null
}

export interface RevisionSummary {
  status: string
  reviewed_by?: string | null
  reviewed_at?: string | null
  motivo_rechazo?: string | null
  doc_invalido_detalle?: string | null
  diagnostico?: string | null
  resultado_revision?: Record<string, unknown> | null
  prevalidacion_app?: Record<string, unknown> | null
  approval_requirements?: ApprovalRequirements | null
  tabla_cargos_id_sugerido?: number | null
  tabla_cargos_snapshot?: TablaCargosSnapshot | null
  aprobaciones: RevisionApproval[]
}

export interface DocumentoImagen {
  tipo: string
  url?: string | null
  nombre_original?: string | null
  size?: number | null
  mime?: string | null
}

export interface DocumentosData {
  imagenes: DocumentoImagen[]
}

export interface Referencia {
  nombre?: string | null
  telefono?: string | null
  parentesco?: string | null
}

export interface ActivosElectrodomestico {
  marca?: string | null
  valor?: number | null
}

export interface ActivosData {
  vivienda_tipo?: string | null
  vivienda_pisos?: string | null
  vivienda_color?: string | null
  fotos_urls?: string[] | null
  vehiculo?: {
    tiene?: boolean
    marca?: string | null
    modelo?: string | null
    color?: string | null
    placas?: string | null
  } | null
  refrigerador?: ActivosElectrodomestico | null
  horno_microondas?: ActivosElectrodomestico | null
  lavadora_ropa?: ActivosElectrodomestico | null
  secadora_ropa?: ActivosElectrodomestico | null
  pantalla_tv?: ActivosElectrodomestico | null
  mini_componente?: ActivosElectrodomestico | null
  computadora?: ActivosElectrodomestico | null
  consola_videojuegos?: ActivosElectrodomestico | null
  otros?: string | null
  [key: string]: unknown
}

export interface Solicitud {
  id: string
  agencia?: string | null
  gerencia?: string | null
  semana?: number | null
  anio?: number | null
  status?: string | null
  status_revision: RevisionStatus
  reviewed_by?: string | null
  reviewed_at?: string | null
  motivo_rechazo?: string | null
  doc_invalido_detalle?: string | null
  diagnostico?: string | null
  fecha_solicitud?: string | null
  updated_at?: string | null

  cliente_persona_id?: string | null
  cliente_nombres?: string | null
  cliente_ap_paterno?: string | null
  cliente_ap_materno?: string | null
  cliente_curp?: string | null
  cliente_rfc?: string | null
  cliente_telefono?: string | null
  cliente_email?: string | null
  cliente_fecha_nacimiento?: string | null
  cliente_genero?: string | null
  cliente_estado_civil?: string | null
  cliente_calle?: string | null
  cliente_no_exterior?: string | null
  cliente_no_interior?: string | null
  cliente_colonia?: string | null
  cliente_municipio?: string | null
  cliente_estado?: string | null
  cliente_cp?: string | null
  cliente_no_servicio?: string | null
  cliente_referencias?: Referencia[] | null
  cliente_activos?: ActivosData | null
  cliente_ocupacion?: string | null
  cliente_empresa?: string | null
  cliente_ingresos_mensuales?: number | null
  cliente_egresos_mensuales?: number | null

  aval_persona_id?: string | null
  aval_nombres?: string | null
  aval_ap_paterno?: string | null
  aval_ap_materno?: string | null
  aval_curp?: string | null
  aval_rfc?: string | null
  aval_telefono?: string | null
  aval_email?: string | null
  aval_fecha_nacimiento?: string | null
  aval_genero?: string | null
  aval_estado_civil?: string | null
  aval_calle?: string | null
  aval_no_exterior?: string | null
  aval_no_interior?: string | null
  aval_colonia?: string | null
  aval_municipio?: string | null
  aval_estado?: string | null
  aval_cp?: string | null
  aval_no_servicio?: string | null
  aval_referencias?: Referencia[] | null
  aval_activos?: ActivosData | null
  aval_ocupacion?: string | null
  aval_empresa?: string | null
  aval_ingresos_mensuales?: number | null
  aval_egresos_mensuales?: number | null

  monto_solicitado?: number | null
  plazo_semanas?: number | null
  nivel_cliente?: string | null
  tipo_credito?: string | null
  tabla_cargos_id?: number | null
  tarifa_semanal?: number | null
  primer_pago?: number | null
  cargo?: number | null
  total_pagar?: number | null
  gps_lat?: number | null
  gps_lng?: number | null

  documentos?: DocumentosData | null
  prevalidacion_app?: Record<string, unknown> | null
  approval_requirements?: ApprovalRequirements | null
  tabla_cargos_snapshot?: TablaCargosSnapshot | null
  revision?: RevisionSummary | null
  revision_aprobaciones?: RevisionApproval[] | null
  ruta_solicitud?: RutaSolicitud | null
}

export interface LoanRequestsListResponse {
  success: boolean
  data: Solicitud[]
  count?: number
}

export interface LoanRequestDetailResponse {
  success: boolean
  data: Solicitud
}

export interface TablaCargosOption {
  id: number
  monto_solicitado: number
  cargo: number
  total_pagar: number
  tarifa_semanal: number
  primer_pago: number
  nivel: string
  plazo_semanas: number
}

export interface TablaCargosOptionsResponse {
  success: boolean
  data: TablaCargosOption[]
}

export interface ApprovalDialogForm {
  decision: ApprovalDecision
  comentario: string
  tablaCargosIdSugerido: string
  montoAutorizado: string
  incrementoAutorizado: string
  nivelAutorizado: string
  plazoAutorizado: string
}

export interface UpdateCheckPayload {
  decision: ApprovalDecision
  userId: string
  userName: string
  notas?: string
  pinValidado: boolean
  montoAutorizado?: number | null
  incrementoAutorizado?: number | null
  nivelAutorizado?: string | null
  plazoAutorizado?: number | null
  tablaCargosIdSugerido?: number | null
  decisionPayload?: Record<string, unknown> | null
}
