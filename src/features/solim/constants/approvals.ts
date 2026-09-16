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
 * Regional cubre a Seguridad y Garantías porque hay sucursales sin seguridad
 * y ahí es el regional quien libera. Cada firma queda con su nombre.
 */
export const REVIEW_SCOPE: Record<ApprovalType, ApprovalType[]> = {
  gerente: ['gerente'],
  oficina: ['oficina'],
  garantias: ['garantias'],
  seguridad: ['seguridad', 'garantias'],
  regional: ['regional', 'seguridad', 'garantias'],
  direccion: ['direccion']
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
