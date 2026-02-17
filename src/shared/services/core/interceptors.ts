import type { InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import type { InterceptorConfig } from './types'

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
    onFulfilled: async (config: InternalAxiosRequestConfig) => {
      // Solo aplica si es una petición al API de Elysia y no tiene Authorization header ya establecido
      if (config.baseURL?.includes('elysia.xpress1.cc') &&
          !(config.headers as AxiosRequestHeaders)['Authorization']) {

        try {
          // Accede al store de manera dinámica
          const { useStore } = await import('@/shared/stores')
          const store = useStore()

          // Crear token Bearer con usuario:pin en base64
          if (store.user?.usuario && store.authPin) {
            const credentials = `${store.user.usuario}:${store.authPin}`
            const base64Credentials = btoa(credentials)
            ;(config.headers as AxiosRequestHeaders)['Authorization'] = `Bearer ${base64Credentials}`
          }
        } catch (error) {
          // Si no se puede acceder al store, continúa sin el token
          console.warn('Could not access Pinia store for Elysia auth:', error)
        }
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