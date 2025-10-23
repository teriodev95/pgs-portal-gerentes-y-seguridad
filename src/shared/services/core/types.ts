import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// Core API configuration interface
export interface ApiConfig {
  baseURL: string
  apiKey?: string
  headers?: Record<string, string>
  timeout?: number
}

// Interceptor configuration
export interface InterceptorConfig {
  request?: {
    onFulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
    onRejected?: (error: any) => any
  }
  response?: {
    onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
    onRejected?: (error: any) => any
  }
}

// Predefined API configurations
export interface ApiConfigurations {
  elysia: ApiConfig
  fastApi: ApiConfig
  hono: ApiConfig
  javalin: ApiConfig
  main: ApiConfig
  mainV2: ApiConfig
  n8nCreateComision: ApiConfig
  workerUploadExpenseImage: ApiConfig
  workerUploadVideo: ApiConfig
}

// Service factory function type
export type ServiceFactory<T = any> = () => T

// Service registry interface
export interface IServiceRegistry {
  register<T>(name: string, factory: ServiceFactory<T>): void
  get<T>(name: string): T | null
  getAll(): Record<string, any>
  has(name: string): boolean
  unregister(name: string): boolean
}

// API client factory interface
export interface IApiClientFactory {
  create(config: ApiConfig): AxiosInstance
  createFromPreset(preset: keyof ApiConfigurations): AxiosInstance
}