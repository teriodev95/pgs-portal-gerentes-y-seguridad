import { useStore } from '@/shared/stores'
import type { NavigationGuard } from 'vue-router'
import { ROUTE_NAME } from '.'
import { getCashReportBranches, hasCashReportPermission } from '@/features/cash-report/cash-report.constants'
import { AGENDA_RELEASED } from '@/features/security-agenda/constants'

export const AuthGuard: NavigationGuard = (to, from, next) => {
  const $store = useStore()

  if ($store.isAuth) next()
  else if ($store.user?.usuario)
    next({
      name: ROUTE_NAME.AUTH_PIN
    })
  else
    next({
      name: ROUTE_NAME.AUTH_LOGIN
    })
}

/**
 * La agenda no está autorizada todavía. Sin sus dos entradas ya no se llega
 * tocando, pero la URL seguía abriéndola: esto la cierra también ahí.
 */
export const AgendaGuard: NavigationGuard = (_to, _from, next) => {
  if (AGENDA_RELEASED) next()
  else next({ name: ROUTE_NAME.DASHBOARD_HOME })
}

export const CashReportGuard: NavigationGuard = (_to, _from, next) => {
  const $store = useStore()
  const hasAccess = hasCashReportPermission($store.user) && getCashReportBranches($store.user).length > 0
  if (hasAccess) next()
  else next({ name: ROUTE_NAME.DASHBOARD_HOME })
}
