import type { ApprovalType, RevisionApproval, Solicitud } from '../types'

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

export function getApprovals(request: Solicitud): RevisionApproval[] {
  return request.revision_aprobaciones ?? request.revision?.aprobaciones ?? []
}

export function isDecided(approval?: RevisionApproval | null): boolean {
  const d = approval?.decision
  return d === 'aprobado' || d === 'aprobado_con_ajuste' || d === 'rechazado'
}

/** Checks dentro del alcance del rol que están requeridos y aún sin decisión. */
export function getPendingReviews(request: Solicitud, role: ApprovalType): ApprovalType[] {
  const approvals = getApprovals(request)
  return REVIEW_SCOPE[role].filter((tipo) => {
    const approval = approvals.find((a) => a.tipo === tipo)
    return approval?.requerido === 1 && !isDecided(approval)
  })
}
