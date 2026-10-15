import type { ApprovalType, RevisionApproval, SolimRole, Solicitud, Suplencia } from '../types'

export const APPROVAL_LABELS: Record<ApprovalType, string> = {
  gerente: 'Gerente',
  oficina: 'Oficina',
  garantias: 'Garantías',
  seguridad: 'Seguridad',
  regional: 'Regional',
  direccion: 'Dirección'
}

/**
 * Qué checks puede firmar cada rol desde PGS.
 * Regional cubre a Gerente, Seguridad y Garantías: hay gerencias vacantes y
 * sucursales sin seguridad, y ahí es el regional quien libera. Cada firma
 * queda con su nombre y con el comentario de que cubrió el puesto.
 */
export const REVIEW_SCOPE: Record<ApprovalType, ApprovalType[]> = {
  gerente: ['gerente'],
  oficina: ['oficina'],
  garantias: ['garantias'],
  seguridad: ['seguridad', 'garantias'],
  regional: ['regional', 'gerente', 'seguridad', 'garantias'],
  direccion: ['direccion']
}

/** Comentario que deja constancia de que otro rol cubrió el check. */
export function coverageNote(signer: ApprovalType, covered: ApprovalType): string {
  return `Firma ${APPROVAL_LABELS[signer].toLowerCase()} a falta de ${APPROVAL_LABELS[covered].toLowerCase()}.`
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** 2026-10-25 → 25-oct, sin pasar por la zona horaria. */
export function shortDate(date: string): string {
  const [, month, day] = date.split('-').map(Number)
  return `${day}-${MONTHS[month - 1]}`
}

/** Suplencias que tocan la gerencia de la solicitud. */
function suplenciasIn(request: Solicitud, suplencias: Suplencia[]): Suplencia[] {
  const gerencia = request.gerencia
  return gerencia ? suplencias.filter((s) => s.gerencias.includes(gerencia)) : []
}

const scopeOf = (s: Suplencia) => REVIEW_SCOPE[s.ausente.tipo.toLowerCase() as SolimRole]

/**
 * Lo que firma el usuario en esta solicitud: lo de su rol y, si suple a alguien en esa
 * gerencia, también lo del rol del ausente. Lo propio va primero.
 */
export function scopeFor(request: Solicitud, role: ApprovalType, suplencias: Suplencia[] = []): ApprovalType[] {
  return [...new Set([...REVIEW_SCOPE[role], ...suplenciasIn(request, suplencias).flatMap(scopeOf)])]
}

/** La suplencia por la que el usuario puede firmar este check en esta solicitud, si la hay. */
export function suplenciaFor(request: Solicitud, tipo: ApprovalType, suplencias: Suplencia[]): Suplencia | undefined {
  return suplenciasIn(request, suplencias).find((s) => scopeOf(s).includes(tipo))
}

/** Constancia de la suplencia; va al inicio de las notas de la firma. */
export function suplenciaNote(signer: string, s: Suplencia): string {
  return `Firma ${signer} en suplencia de ${s.ausente.nombre} (hasta ${shortDate(s.hasta)}).`
}

export function getApprovals(request: Solicitud): RevisionApproval[] {
  return request.revision_aprobaciones ?? request.revision?.aprobaciones ?? []
}

export function isDecided(approval?: RevisionApproval | null): boolean {
  const d = approval?.decision
  return d === 'aprobado' || d === 'aprobado_con_ajuste' || d === 'rechazado'
}

/** Checks dentro del alcance del usuario que están requeridos y aún sin decisión. */
export function getPendingReviews(request: Solicitud, role: ApprovalType, suplencias: Suplencia[] = []): ApprovalType[] {
  const approvals = getApprovals(request)
  return scopeFor(request, role, suplencias).filter((tipo) => {
    const approval = approvals.find((a) => a.tipo === tipo)
    return approval?.requerido === 1 && !isDecided(approval)
  })
}
