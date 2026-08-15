import type { IUser } from '@/features/auth/types'

export const CASH_REPORT_MODULE = 'reporte-efectivo'

export const CASH_REPORT_BRANCHES = [
  { code: 'GERC', slug: 'capital', name: 'Capital' },
  { code: 'GERD', slug: 'dinero', name: 'Dinero' },
  { code: 'GERE', slug: 'efectivo', name: 'Efectivo' },
  { code: 'GERM', slug: 'moneda', name: 'Moneda' },
  { code: 'GERP', slug: 'plata', name: 'Plata' },
  { code: 'GERGC', slug: 'gocash', name: 'GoCash' },
  { code: 'GERDC', slug: 'dec', name: 'DEC' }
] as const

export const REPORT_DAYS = [
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
  'LUNES',
  'MARTES'
] as const

export type ReportDay = (typeof REPORT_DAYS)[number]
export type CashReportBranch = (typeof CASH_REPORT_BRANCHES)[number]

export function hasCashReportPermission(user: IUser | undefined): boolean {
  const pgsModules = Object.entries(user?.plataformas ?? {}).find(
    ([platform]) => platform.toLowerCase() === 'pgs'
  )?.[1]

  return pgsModules?.includes(CASH_REPORT_MODULE) ?? false
}

export function getCashReportBranches(user: IUser | undefined): CashReportBranch[] {
  const allowed = new Set((user?.sucursales ?? []).map((branch) => branch.toUpperCase()))
  return CASH_REPORT_BRANCHES.filter((branch) => allowed.has(branch.code))
}

export function getDefaultReportDay(): ReportDay {
  const weekday = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    weekday: 'long'
  })
    .format(new Date())
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  return REPORT_DAYS.includes(weekday as ReportDay) ? (weekday as ReportDay) : 'MARTES'
}
