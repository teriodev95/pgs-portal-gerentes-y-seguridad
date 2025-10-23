import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useStore } from '@/shared/stores'
import { ROUTE_NAME } from '@/router'
import { authService } from '../services/auth.service'
import type { IAuthLogin } from '../types/auth.types'
import { useAuthErrorHandler } from './useAuthErrorHandler'
import { AUTH_CONSTANTS } from '../constants'

export function useAuthLogin() {
  // Services, Composables and Stores initialization
  const $router = useRouter()
  const $store = useStore()
  const $toast = useToast()
  const { handleAuthError, handleError } = useAuthErrorHandler()

  // State definitions
  const loginForm = ref<IAuthLogin>({
    ...AUTH_CONSTANTS.LOGIN_FORM_DEFAULTS
  })
  const isLoading = ref(false)

  // Methods
  async function handleLogin(): Promise<void> {
    if (!loginForm.value.username || !loginForm.value.password) {
      handleError(new Error('Form incomplete'), 'FORM_INCOMPLETE')
      return
    }

    try {
      isLoading.value = true

      const response = await authService.authLogin(loginForm.value)

      console.log('Login response:', response)

      // Store user data and authentication state
      $store.user = response.data
      $store.isAuth = true
      $store.saveData()

      if (!$store.isUserRoleValid) {
        handleError(new Error('Role not authorized'), 'ROLE_NOT_AUTHORIZED')
        return
      }

      $toast.success(AUTH_CONSTANTS.SUCCESS_MESSAGES.LOGIN_SUCCESS)
      await $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
    } catch (error) {
      handleAuthError(error)
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