import { useStore } from '@/shared/stores'
import type { NavigationGuard } from 'vue-router'
import { ROUTE_NAME } from '.'

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
