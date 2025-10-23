export const SOLIM_STATUS = {
  APPROVED: 'aproved', // Nota: mantener typo por compatibilidad API
  REJECTED: 'rejected'
} as const

export type SolimStatusType = typeof SOLIM_STATUS[keyof typeof SOLIM_STATUS]