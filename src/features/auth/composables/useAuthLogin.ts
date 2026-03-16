import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { ROUTE_NAME } from '@/router'
import { useNotification } from '@/shared/composables/useNotification'
import { authService } from '../services/auth.service'
import type { IAuthLogin } from '../types/auth.types'
import { AUTH_CONSTANTS } from '../constants'

export function useAuthLogin() {
  // Services, Composables and Stores initialization
  const $router = useRouter()
  const $store = useStore()
  const { showError, showSuccess } = useNotification()


  // State definitions
  const loginForm = ref<IAuthLogin>({
    ...AUTH_CONSTANTS.LOGIN_FORM_DEFAULTS
  })
  const isLoading = ref(false)

  // Methods
  async function handleLogin(): Promise<void> {
    if (!loginForm.value.usuario || !loginForm.value.pin) {
      showError('Formulario incompleto')
      return
    }

    try {
      isLoading.value = true

      console.log('Submitting login form:', loginForm.value)
      const { user, token } = await authService.authLogin(loginForm.value)

      console.log('Login response:', user)

      // Store user data and authentication state
      $store.user = user
      $store.elysiaToken = token
      $store.isAuth = true
      $store.saveData()

      if (!$store.isUserRoleValid) {
        showError('Role not authorized')
        return
      }

      showSuccess(AUTH_CONSTANTS.SUCCESS_MESSAGES.LOGIN_SUCCESS)
      await $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
    } catch (error: any) {
      showError(error.response?.data.error)
    } finally {
      isLoading.value = false
    }
  }

  function resetForm(): void {
    loginForm.value = {
      ...AUTH_CONSTANTS.LOGIN_FORM_DEFAULTS
    }
  }

  return {
    // State
    loginForm,
    isLoading,
    
    // Methods
    handleLogin,
    resetForm
  }
}