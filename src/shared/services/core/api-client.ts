import axios, { type AxiosInstance } from 'axios'
import type { ApiConfig, InterceptorConfig, IApiClientFactory, ApiConfigurations } from './types'
import {
  contentTypeInterceptor,
  apiKeyInterceptor,
  loggingInterceptor,
  errorHandlerInterceptor
} from './interceptors'

// Predefined API configurations based on current implementation
export const API_CONFIGURATIONS: ApiConfigurations = {
  main: {
    baseURL: 'https://sfast.xpress1.cc/xpress/v1',
    timeout: 90000
  },
  mainV2: {
    baseURL: 'https://sfast.xpress1.cc/api/v2',
    timeout: 90000
  },
  fastApi: {
    baseURL: 'https://fax-dev.xpress1.cc/api',
    apiKey: 'ua7Sj^e6Qn#7m7BDW#8oX9*52#KDqPuK',
    timeout: 60000
  },
  javalin: {
    baseURL: 'https://javalin.xpress1.cc/api',
    timeout: 10000
  },
  hono: {
    baseURL: 'https://xpress-correcciones-back-hono.clvrt.workers.dev',
    timeout: 10000
  },
  elysia: {
    baseURL: 'https://elysia.xpress1.cc/api/',
    timeout: 10000
  },
  workerUploadVideo: {
    baseURL: 'https://xpress-upload-r2-verificacion-cierres.clvrt.workers.dev',
    timeout: 10000
  },
  workerUploadExpenseImage: {
    baseURL: 'https://xpress-recibos-gastos-upload-imagen.clvrt.workers.dev/upload',
    timeout: 10000
  },
  n8nCreateComision: {
    baseURL: 'https://middleware-universal-n8n.clvrt.workers.dev/n8n/agencia',
    timeout: 10000
  }
}

class ApiClientFactory implements IApiClientFactory {
  create(config: ApiConfig): AxiosInstance {
    return ApiClientFactory.create(config)
  }

  createFromPreset(preset: keyof ApiConfigurations): AxiosInstance {
    return ApiClientFactory.createFromPreset(preset)
  }

  private static applyInterceptors(instance: AxiosInstance, interceptors: InterceptorConfig[]): void {
    interceptors.forEach(interceptor => {
      if (interceptor.request) {
        instance.interceptors.request.use(
          interceptor.request.onFulfilled,
          interceptor.request.onRejected
        )
      }

      if (interceptor.response) {
        instance.interceptors.response.use(
          interceptor.response.onFulfilled,
          interceptor.response.onRejected
        )
      }
    })
  }

  static create(config: ApiConfig): AxiosInstance {
    const axiosConfig = {
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: config.headers || {}
    }

    const instance = axios.create(axiosConfig)

    // Default interceptors for all instances
    const interceptors: InterceptorConfig[] = [
      contentTypeInterceptor,
      errorHandlerInterceptor
    ]

    // Add development logging in dev mode
    if (import.meta.env.DEV) {
      interceptors.push(loggingInterceptor)
    }

    // Add API key interceptor if provided
    if (config.apiKey) {
      interceptors.push(apiKeyInterceptor(config.apiKey))
    }

    this.applyInterceptors(instance, interceptors)

    return instance
  }

  static createFromPreset(preset: keyof ApiConfigurations): AxiosInstance {
    const config = API_CONFIGURATIONS[preset]
    if (!config) {
      throw new Error(`Unknown API preset: ${preset}`)
    }
    return this.create(config)
  }
}

// Export factory functions for convenience
export const createApiClient = (config: ApiConfig): AxiosInstance =>
  ApiClientFactory.create(config)

export const createApiClientFromPreset = (preset: keyof ApiConfigurations): AxiosInstance =>
  ApiClientFactory.createFromPreset(preset)

export { ApiClientFactory }