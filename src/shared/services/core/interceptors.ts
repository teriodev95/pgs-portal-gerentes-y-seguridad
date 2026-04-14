import type { InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import type { InterceptorConfig } from './types'
import { useStore } from '@/shared/stores'

// Default content-type interceptor (same as current implementation)
export const contentTypeInterceptor: InterceptorConfig = {
  request: {
    onFulfilled: (config: InternalAxiosRequestConfig) => {
      // Don't set Content-Type if it's already set or if data is FormData
      // FormData needs the browser to set multipart/form-data with boundary automatically
      if (!(config.headers as AxiosRequestHeaders)['Content-Type'] && !(config.data instanceof FormData)) {
        ;(config.headers as AxiosRequestHeaders)['Content-Type'] = 'application/json'
      }
      return config
    }
  }
}

// API Key interceptor for FastAPI
export const apiKeyInterceptor = (apiKey: string): InterceptorConfig => ({
  request: {
    onFulfilled: (config: InternalAxiosRequestConfig) => {
      if (config.method?.toLowerCase() === 'post' || config.method?.toLowerCase() === 'patch') {
        ;(config.headers as AxiosRequestHeaders)['X-API-Key'] = apiKey
      }
      return config
    }
  }
})

// Authorization header interceptor
export const authInterceptor = (token: string): InterceptorConfig => ({
  request: {
    onFulfilled: (config: InternalAxiosRequestConfig) => {
      ;(config.headers as AxiosRequestHeaders)['Authorization'] = `Bearer ${token}`
      return config
    }
  }
})

// Dynamic authorization interceptor for Elysia API
export const elysiaAuthInterceptor = (): InterceptorConfig => ({
  request: {
    onFulfilled: (config: InternalAxiosRequestConfig) => {
      // Solo aplica si es una petición al API de Elysia
      const isElysiaApi = config.baseURL?.includes('elysia.xpress1.cc') ||
                          config.url?.includes('elysia.xpress1.cc')

      console.log('[Elysia Auth Debug] isElysiaApi:', isElysiaApi, 'baseURL:', config.baseURL, 'url:', config.url)

      if (isElysiaApi && !(config.headers as AxiosRequestHeaders)['Authorization']) {
        try {
          // Accede al store de manera síncrona
          const store = useStore()

          console.log('[Elysia Auth Debug] Store loaded - user:', store.user?.usuario, 'hasPin:', !!store.authPin)

          // Crear token Bearer con usuario:pin en base64
          if (store.user?.usuario && store.authPin) {
            const credentials = `${store.user.usuario}:${store.authPin}`
            const base64Credentials = btoa(credentials)
            ;(config.headers as AxiosRequestHeaders)['Authorization'] = `Bearer ${base64Credentials}`

            console.log('[Elysia Auth] Authorization header added successfully for:', config.url)
            console.log('[Elysia Auth] Headers:', config.headers)
          } else {
            console.warn('[Elysia Auth] Missing credentials - usuario:', store.user?.usuario, 'pin:', store.authPin)
          }
        } catch (error) {
          // Si no se puede acceder al store, continúa sin el token
          console.error('[Elysia Auth] Error accessing Pinia store:', error)
        }
      } else if (isElysiaApi) {
        console.log('[Elysia Auth] Authorization header already exists:', (config.headers as AxiosRequestHeaders)['Authorization'])
      }
      return config
    }
  }
})

// Request logging interceptor (for development)
export const loggingInterceptor: InterceptorConfig = {
  request: {
    onFulfilled: (config: InternalAxiosRequestConfig) => {
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
      }
      return config
    }
  },
  response: {
    onFulfilled: (response) => {
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${response.status} ${response.config.url}`, response.data)
      }
      return response
    },
    onRejected: (error) => {
      if (import.meta.env.DEV) {
        console.error(`[API Error] ${error.config?.url}`, error)
      }
      return Promise.reject(error)
    }
  }
}

// Error handling interceptor
export const errorHandlerInterceptor: InterceptorConfig = {
  response: {
    onRejected: (error) => {
      // Add standardized error handling logic here
      if (error.response?.status === 401) {
        // Handle unauthorized - could redirect to login
        console.warn('Unauthorized access detected')
      }

      if (error.response?.status >= 500) {
        // Handle server errors
        console.error('Server error detected:', error.response.status)
      }

      return Promise.reject(error)
    }
  }
}

// Success notification interceptor
export const successNotificationInterceptor = (): InterceptorConfig => ({
  response: {
    onFulfilled: async (response) => {
      const config = response.config
      const method = config.method?.toLowerCase()

      // Solo para POST/PATCH/PUT exitosos
      if (!['post', 'patch', 'put'].includes(method || '')) {
        return response
      }

      // Skip si está explícitamente deshabilitado
      if (config.meta?.skipSuccessNotification) {
        return response
      }

      // Si hay configuración de notificación, mostrarla
      if (config.meta?.successNotification) {
        try {
          const { useRevealCircleStore } = await import('@/shared/stores/revealCircle')
          const revealCircleStore = useRevealCircleStore()

          revealCircleStore.showRevealCircle({
            type: 'success',
            mainText: config.meta.successNotification.mainText,
            secondaryText: config.meta.successNotification.secondaryText,
            list: config.meta.successNotification.list,
            subText: config.meta.successNotification.subText,
            ctaText: config.meta.successNotification.ctaText
          }, config.meta.successNotification.onClose)
        } catch (error) {
          console.warn('Could not show success notification:', error)
        }
      }

      return response
    }
  }
})

// Error notification interceptor
export const errorNotificationInterceptor = (): InterceptorConfig => ({
  response: {
    onRejected: async (error) => {
      const config = error.config
      const response = error.response

      // Skip si está explícitamente deshabilitado
      if (config?.meta?.skipErrorNotification) {
        return Promise.reject(error)
      }

      // Si hay configuración personalizada de error
      if (config?.meta?.errorNotification) {
        try {
          const { useErrorDialogStore } = await import('@/shared/stores/errorDialog')
          const errorDialogStore = useErrorDialogStore()

          const method = config.method?.toUpperCase() || 'REQUEST'
          const statusCode = response?.status || 0
          const statusText = response?.statusText || 'Error'

          // Extraer mensaje de error del backend si existe
          const backendMessage = response?.data?.message ||
                                response?.data?.error ||
                                response?.data?.detail ||
                                ''

          // Construir detalles con formato solicitado
          const details = `Request Method: [${method}] - Status Code: ${statusCode} ${statusText}${
            backendMessage ? `\n\nError: ${backendMessage}` : ''
          }`

          errorDialogStore.showError({
            title: config.meta.errorNotification.title,
            message: config.meta.errorNotification.message,
            type: config.meta.errorNotification.type || 'error',
            details
          })
        } catch (err) {
          console.warn('Could not show error notification:', err)
        }
      }

      return Promise.reject(error)
    }
  }
})