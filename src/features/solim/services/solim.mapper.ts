import type {
  ApprovalDecision,
  ApprovalRequirements,
  RutaSolicitud,
  RutaSolicitudPaso,
  RutaSolicitudPasoId,
  RutaSolicitudPasoStatus,
  RutaSolicitudStatus,
  ApprovalType,
  DocumentosData,
  DocumentoImagen,
  LoanRequestDetailResponse,
  LoanRequestsListResponse,
  Referencia,
  RevisionApproval,
  RevisionStatus,
  RevisionSummary,
  Solicitud,
  TablaCargosSnapshot
} from '../types'

type AnyRecord = Record<string, any>

const APPROVAL_TYPES: ApprovalType[] = ['gerente', 'oficina', 'garantias', 'seguridad', 'direccion']
const APPROVAL_DECISIONS: ApprovalDecision[] = [
  'pendiente',
  'aprobado',
  'aprobado_con_ajuste',
  'rechazado',
  'no_aplica'
]

function asRecord(value: unknown): AnyRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as AnyRecord) : null
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return null
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function asBooleanNumber(value: unknown): number {
  return value === true || value === 1 ? 1 : 0
}

function normalizeApprovalType(value: unknown): ApprovalType {
  return APPROVAL_TYPES.includes(value as ApprovalType) ? (value as ApprovalType) : 'gerente'
}

function normalizeApprovalDecision(value: unknown): ApprovalDecision {
  return APPROVAL_DECISIONS.includes(value as ApprovalDecision) ? (value as ApprovalDecision) : 'pendiente'
}

function normalizeRevisionStatus(value: unknown): RevisionStatus {
  switch (value) {
    case 'aprobada':
    case 'aprobada_con_ajuste':
    case 'aprobada_condicionada':
    case 'rechazada':
    case 'corregir':
    case 'requiere_correccion':
    case 'sin_hallazgos':
    case 'con_hallazgos':
      return value
    default:
      return 'pendiente'
  }
}

function normalizeApprovalRequirements(value: unknown): ApprovalRequirements | null {
  const record = asRecord(value)
  if (!record) return null

  return {
    version: asString(record.version) ?? undefined,
    gerente: Boolean(record.gerente),
    oficina: Boolean(record.oficina),
    garantias: Boolean(record.garantias),
    seguridad: Boolean(record.seguridad),
    direccion: Boolean(record.direccion)
  }
}

function normalizeTablaSnapshot(value: unknown): TablaCargosSnapshot | null {
  const record = asRecord(value)
  if (!record) return null

  const requiere = asRecord(record.requiere)

  return {
    version: asString(record.version) ?? undefined,
    id: asNumber(record.id),
    monto_solicitado: asNumber(record.monto_solicitado),
    cargo: asNumber(record.cargo),
    total_pagar: asNumber(record.total_pagar),
    tarifa_semanal: asNumber(record.tarifa_semanal),
    primer_pago: asNumber(record.primer_pago),
    nivel: asString(record.nivel),
    plazo_semanas: asNumber(record.plazo_semanas),
    identificador: asString(record.identificador),
    requiere: requiere
      ? {
          gerente: Boolean(requiere.gerente),
          oficina: Boolean(requiere.oficina),
          garantias: Boolean(requiere.garantias),
          seguridad: Boolean(requiere.seguridad),
          direccion: Boolean(requiere.direccion)
        }
      : undefined
  }
}

function normalizeDocumentoImagen(value: unknown): DocumentoImagen | null {
  const record = asRecord(value)
  if (!record) return null

  const tipo = asString(record.tipo)
  if (!tipo) return null

  return {
    tipo,
    url: asString(record.url),
    nombre_original: asString(record.nombre_original),
    size: asNumber(record.size),
    mime: asString(record.mime)
  }
}

function normalizeDocumentos(value: unknown): DocumentosData | null {
  const record = asRecord(value)
  if (!record) return null

  const imagenes = asArray(record.imagenes)
    .map(normalizeDocumentoImagen)
    .filter(Boolean) as DocumentoImagen[]

  return { imagenes }
}

function normalizeReferencias(value: unknown): Referencia[] | null {
  const referencias = asArray(value)
    .map((item) => {
      const record = asRecord(item)
      if (!record) return null

      return {
        nombre: asString(record.nombre),
        telefono: asString(record.telefono),
        parentesco: asString(record.parentesco)
      }
    })
    .filter(Boolean) as Referencia[]

  return referencias.length ? referencias : null
}

function normalizeRutaSolicitudPasoStatus(value: unknown): RutaSolicitudPasoStatus {
  switch (value) {
    case 'completo':
    case 'bloqueado':
    case 'no_aplica':
      return value
    default:
      return 'pendiente'
  }
}

function normalizeRutaSolicitudStatus(value: unknown): RutaSolicitudStatus {
  switch (value) {
    case 'bloqueada':
    case 'completa':
      return value
    default:
      return 'pendiente'
  }
}

function normalizeRutaSolicitudPasoId(value: unknown): RutaSolicitudPasoId | null {
  switch (value) {
    case 'prevalidacion_app':
    case 'filtrado':
    case 'vistos_buenos':
      return value
    default:
      return null
  }
}

function normalizeRutaSolicitudPaso(value: unknown): RutaSolicitudPaso | null {
  const record = asRecord(value)
  if (!record) return null

  const id = normalizeRutaSolicitudPasoId(record.id)
  if (!id) return null

  return {
    id,
    orden: asNumber(record.orden) ?? 0,
    status: normalizeRutaSolicitudPasoStatus(record.status),
    total: asNumber(record.total) ?? 0,
    completos: asNumber(record.completos) ?? 0,
    pendientes: asNumber(record.pendientes) ?? 0
  }
}

function normalizeRutaSolicitud(value: unknown): RutaSolicitud | null {
  const record = asRecord(value)
  if (!record) return null

  const pasos = asArray(record.pasos)
    .map(normalizeRutaSolicitudPaso)
    .filter(Boolean) as RutaSolicitudPaso[]

  const pasoActual = normalizeRutaSolicitudPasoId(record.paso_actual)

  return {
    version: asString(record.version) ?? 'v1',
    status: normalizeRutaSolicitudStatus(record.status),
    paso_actual: pasoActual,
    pasos
  }
}

function normalizeApprovals(value: unknown): RevisionApproval[] {
  return asArray(value)
    .map((item) => {
      const record = asRecord(item)
      if (!record) return null

      return {
        tipo: normalizeApprovalType(record.tipo),
        requerido: asBooleanNumber(record.requerido),
        decision: normalizeApprovalDecision(record.decision),
        usuario_id: asString(record.usuario_id),
        usuario_nombre: asString(record.usuario_nombre),
        comentario: asString(record.comentario),
        pin_validado: asBooleanNumber(record.pin_validado),
        pin_validado_at: asString(record.pin_validado_at),
        monto_autorizado: asNumber(record.monto_autorizado),
        incremento_autorizado: asNumber(record.incremento_autorizado),
        nivel_autorizado: asString(record.nivel_autorizado),
        plazo_autorizado: asNumber(record.plazo_autorizado),
        tabla_cargos_id_sugerido: asNumber(record.tabla_cargos_id_sugerido),
        decision_payload: asRecord(record.decision_payload),
        created_at: asString(record.created_at),
        updated_at: asString(record.updated_at),
        resolved_at: asString(record.resolved_at)
      }
    })
    .filter(Boolean) as RevisionApproval[]
}

function normalizeRevision(raw: AnyRecord, approvalRequirements: ApprovalRequirements | null, aprobaciones: RevisionApproval[], tablaSnapshot: TablaCargosSnapshot | null): RevisionSummary {
  const revision = asRecord(raw.revision)
  const filtrado = asRecord(raw.filtrado)
  const planCredito = asRecord(raw.plan_credito)

  return {
    status: asString(revision?.status ?? filtrado?.status ?? raw.status_revision ?? raw.status) ?? 'pendiente',
    reviewed_by: asString(revision?.reviewed_by ?? filtrado?.filtered_by ?? raw.reviewed_by),
    reviewed_at: asString(revision?.reviewed_at ?? filtrado?.filtered_at ?? raw.reviewed_at),
    motivo_rechazo: asString(revision?.motivo_rechazo ?? filtrado?.motivo_rechazo ?? raw.motivo_rechazo),
    doc_invalido_detalle: asString(
      revision?.doc_invalido_detalle ?? filtrado?.doc_invalido_detalle ?? raw.doc_invalido_detalle
    ),
    diagnostico: asString(revision?.diagnostico ?? filtrado?.diagnostico ?? raw.diagnostico),
    resultado_revision: (revision?.resultado_revision ??
      filtrado?.resultado ??
      raw.resultado_revision ??
      null) as Record<string, unknown> | null,
    prevalidacion_app: (revision?.prevalidacion_app ?? raw.prevalidacion_app ?? null) as Record<string, unknown> | null,
    approval_requirements: approvalRequirements,
    tabla_cargos_id_sugerido: asNumber(
      revision?.tabla_cargos_id_sugerido ??
        planCredito?.tabla_cargos_id_sugerido ??
        filtrado?.resultado?.tabla_cargos_id_sugerido ??
        raw.tabla_cargos_id_sugerido
    ),
    tabla_cargos_snapshot: tablaSnapshot,
    aprobaciones
  }
}

export function normalizeSolicitud(value: unknown): Solicitud {
  const raw = asRecord(value) ?? {}
  const captura = asRecord(raw.captura)
  const operacion = asRecord(captura?.operacion)
  const cliente = asRecord(captura?.cliente)
  const aval = asRecord(captura?.aval)
  const credito = asRecord(captura?.credito)
  const documentos = normalizeDocumentos(raw.documentos ?? captura?.documentos)
  const gps = asRecord(captura?.gps)
  const clienteDomicilio = asRecord(cliente?.domicilio)
  const avalDomicilio = asRecord(aval?.domicilio)
  const clienteEmpleo = asRecord(cliente?.empleo)
  const avalEmpleo = asRecord(aval?.empleo)
  const autorizacion = asRecord(raw.autorizacion)
  const approvalRequirements = normalizeApprovalRequirements(
    raw.approval_requirements ?? autorizacion?.requirements ?? asRecord(raw.revision)?.approval_requirements
  )
  const aprobaciones = normalizeApprovals(
    raw.revision_aprobaciones ?? autorizacion?.aprobaciones ?? asRecord(raw.revision)?.aprobaciones
  )
  const tablaSnapshot = normalizeTablaSnapshot(
    raw.tabla_cargos_snapshot ?? asRecord(raw.plan_credito)?.snapshot ?? asRecord(raw.revision)?.tabla_cargos_snapshot
  )
  const rutaSolicitud = normalizeRutaSolicitud(raw.ruta_solicitud)
  const revision = normalizeRevision(raw, approvalRequirements, aprobaciones, tablaSnapshot)

  return {
    id: asString(raw.id) ?? '',
    agencia: asString(raw.agencia ?? operacion?.agencia),
    gerencia: asString(raw.gerencia ?? operacion?.gerencia),
    semana: asNumber(raw.semana ?? operacion?.semana),
    anio: asNumber(raw.anio ?? operacion?.anio),
    status: asString(raw.status),
    status_revision: normalizeRevisionStatus(raw.status_revision ?? asRecord(raw.filtrado)?.status ?? revision.status),
    reviewed_by: asString(raw.reviewed_by ?? revision.reviewed_by),
    reviewed_at: asString(raw.reviewed_at ?? revision.reviewed_at),
    motivo_rechazo: asString(raw.motivo_rechazo ?? revision.motivo_rechazo),
    doc_invalido_detalle: asString(raw.doc_invalido_detalle ?? revision.doc_invalido_detalle),
    diagnostico: asString(raw.diagnostico ?? revision.diagnostico),
    fecha_solicitud: asString(raw.fecha_solicitud ?? operacion?.fecha_solicitud),
    updated_at: asString(raw.updated_at ?? operacion?.updated_at),

    cliente_persona_id: asString(raw.cliente_persona_id ?? cliente?.persona_id),
    cliente_nombres: asString(raw.cliente_nombres ?? cliente?.nombres),
    cliente_ap_paterno: asString(raw.cliente_ap_paterno ?? cliente?.ap_paterno),
    cliente_ap_materno: asString(raw.cliente_ap_materno ?? cliente?.ap_materno),
    cliente_curp: asString(raw.cliente_curp ?? cliente?.curp),
    cliente_rfc: asString(raw.cliente_rfc ?? cliente?.rfc),
    cliente_telefono: asString(raw.cliente_telefono ?? cliente?.telefono),
    cliente_email: asString(raw.cliente_email ?? cliente?.email),
    cliente_fecha_nacimiento: asString(raw.cliente_fecha_nacimiento ?? cliente?.fecha_nacimiento),
    cliente_genero: asString(raw.cliente_genero ?? cliente?.genero),
    cliente_estado_civil: asString(raw.cliente_estado_civil ?? cliente?.estado_civil),
    cliente_calle: asString(raw.cliente_calle ?? clienteDomicilio?.calle),
    cliente_no_exterior: asString(raw.cliente_no_exterior ?? clienteDomicilio?.no_exterior),
    cliente_no_interior: asString(raw.cliente_no_interior ?? clienteDomicilio?.no_interior),
    cliente_colonia: asString(raw.cliente_colonia ?? clienteDomicilio?.colonia),
    cliente_municipio: asString(raw.cliente_municipio ?? clienteDomicilio?.municipio),
    cliente_estado: asString(raw.cliente_estado ?? clienteDomicilio?.estado),
    cliente_cp: asString(raw.cliente_cp ?? clienteDomicilio?.cp),
    cliente_no_servicio: asString(raw.cliente_no_servicio ?? cliente?.no_servicio),
    cliente_referencias: normalizeReferencias(raw.cliente_referencias ?? cliente?.referencias),
    cliente_activos: (raw.cliente_activos ?? cliente?.activos ?? null) as Solicitud['cliente_activos'],
    cliente_ocupacion: asString(raw.cliente_ocupacion ?? cliente?.ocupacion ?? clienteEmpleo?.ocupacion),
    cliente_empresa: asString(raw.cliente_empresa ?? cliente?.empresa ?? clienteEmpleo?.empresa),
    cliente_ingresos_mensuales: asNumber(raw.cliente_ingresos_mensuales ?? cliente?.ingresos_mensuales),
    cliente_egresos_mensuales: asNumber(raw.cliente_egresos_mensuales ?? cliente?.egresos_mensuales),

    aval_persona_id: asString(raw.aval_persona_id ?? aval?.persona_id),
    aval_nombres: asString(raw.aval_nombres ?? aval?.nombres),
    aval_ap_paterno: asString(raw.aval_ap_paterno ?? aval?.ap_paterno),
    aval_ap_materno: asString(raw.aval_ap_materno ?? aval?.ap_materno),
    aval_curp: asString(raw.aval_curp ?? aval?.curp),
    aval_rfc: asString(raw.aval_rfc ?? aval?.rfc),
    aval_telefono: asString(raw.aval_telefono ?? aval?.telefono),
    aval_email: asString(raw.aval_email ?? aval?.email),
    aval_fecha_nacimiento: asString(raw.aval_fecha_nacimiento ?? aval?.fecha_nacimiento),
    aval_genero: asString(raw.aval_genero ?? aval?.genero),
    aval_estado_civil: asString(raw.aval_estado_civil ?? aval?.estado_civil),
    aval_calle: asString(raw.aval_calle ?? avalDomicilio?.calle),
    aval_no_exterior: asString(raw.aval_no_exterior ?? avalDomicilio?.no_exterior),
    aval_no_interior: asString(raw.aval_no_interior ?? avalDomicilio?.no_interior),
    aval_colonia: asString(raw.aval_colonia ?? avalDomicilio?.colonia),
    aval_municipio: asString(raw.aval_municipio ?? avalDomicilio?.municipio),
    aval_estado: asString(raw.aval_estado ?? avalDomicilio?.estado),
    aval_cp: asString(raw.aval_cp ?? avalDomicilio?.cp),
    aval_no_servicio: asString(raw.aval_no_servicio ?? aval?.no_servicio),
    aval_referencias: normalizeReferencias(raw.aval_referencias ?? aval?.referencias),
    aval_activos: (raw.aval_activos ?? aval?.activos ?? null) as Solicitud['aval_activos'],
    aval_ocupacion: asString(raw.aval_ocupacion ?? aval?.ocupacion ?? avalEmpleo?.ocupacion),
    aval_empresa: asString(raw.aval_empresa ?? aval?.empresa ?? avalEmpleo?.empresa),
    aval_ingresos_mensuales: asNumber(raw.aval_ingresos_mensuales ?? aval?.ingresos_mensuales),
    aval_egresos_mensuales: asNumber(raw.aval_egresos_mensuales ?? aval?.egresos_mensuales),

    monto_solicitado: asNumber(raw.monto_solicitado ?? credito?.monto_solicitado ?? tablaSnapshot?.monto_solicitado),
    plazo_semanas: asNumber(raw.plazo_semanas ?? credito?.plazo_semanas ?? tablaSnapshot?.plazo_semanas),
    nivel_cliente: asString(raw.nivel_cliente ?? credito?.nivel_cliente ?? tablaSnapshot?.nivel),
    tipo_credito: asString(raw.tipo_credito ?? credito?.tipo_credito),
    tabla_cargos_id: asNumber(raw.tabla_cargos_id ?? credito?.tabla_cargos_id ?? asRecord(raw.plan_credito)?.tabla_cargos_id),
    tarifa_semanal: asNumber(raw.tarifa_semanal ?? credito?.tarifa_semanal ?? tablaSnapshot?.tarifa_semanal),
    primer_pago: asNumber(raw.primer_pago ?? credito?.primer_pago ?? tablaSnapshot?.primer_pago),
    cargo: asNumber(raw.cargo ?? credito?.cargo ?? tablaSnapshot?.cargo),
    total_pagar: asNumber(raw.total_pagar ?? credito?.total_pagar ?? tablaSnapshot?.total_pagar),
    gps_lat: asNumber(raw.gps_lat ?? gps?.lat),
    gps_lng: asNumber(raw.gps_lng ?? gps?.lng),

    documentos,
    prevalidacion_app: (raw.prevalidacion_app ?? revision.prevalidacion_app ?? null) as Record<string, unknown> | null,
    approval_requirements: approvalRequirements,
    tabla_cargos_snapshot: tablaSnapshot,
    revision,
    revision_aprobaciones: aprobaciones,
    ruta_solicitud: rutaSolicitud
  }
}

export function mapLoanRequestsListResponse(payload: unknown): LoanRequestsListResponse {
  const response = asRecord(payload) ?? {}
  const data = asArray(response.data).map(normalizeSolicitud)

  return {
    success: Boolean(response.success),
    data,
    count: asNumber(response.count) ?? data.length
  }
}

export function mapLoanRequestDetailResponse(payload: unknown): LoanRequestDetailResponse {
  const response = asRecord(payload) ?? {}

  return {
    success: Boolean(response.success),
    data: normalizeSolicitud(response.data)
  }
}
