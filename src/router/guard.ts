import { useStore } from '@/shared/stores'
import type { NavigationGuard } from 'vue-router'
import { ROUTE_NAME } from '.'
import { getCashReportBranches, hasCashReportPermission } from '@/features/cash-report/cash-report.constants'

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

export const CashReportGuard: NavigationGuard = (_to, _from, next) => {
  const $store = useStore()
  const hasAccess = hasCashReportPermission($store.user) && getCashReportBranches($store.user).length > 0
  if (hasAccess) next()
  else next({ name: ROUTE_NAME.DASHBOARD_HOME })
}
