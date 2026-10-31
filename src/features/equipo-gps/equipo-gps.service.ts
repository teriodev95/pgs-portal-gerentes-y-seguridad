import type { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios'
import { createApiClientFromPreset } from '@/shared/services/core/api-client'
import { useStore } from '@/shared/stores'
import type { DiaConDatos, EquipoRespuesta, RecorridoHoy, ResumenHoy, UltimaPosicion } from './equipo-gps.types'

// FAX valida la sesión de PGS en el mismo `pax-me` de Elysia, así que viaja el mismo
// Bearer `base64(usuario:pin)` que ya usan las llamadas a Elysia. Los GET a FAX no llevan
// autenticación por defecto; este cliente la agrega sólo para el rastreo.
const client = createApiClientFromPreset('fastApi')
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const store = useStore()
  if (store.user?.usuario && store.authPin) {
    ;(config.headers as AxiosRequestHeaders)['Authorization'] =
      `Bearer ${btoa(`${store.user.usuario}:${store.authPin}`)}`
  }
  return config
})

/** En dev se piden también los usuarios de prueba (GERDC100 / BRUNODIAZ), como en el monitor de MOX. */
function incluirPrueba(): boolean {
  const host = window.location.hostname
  return (
    import.meta.env.VITE_ENVIRONMENT === 'dev' ||
    host === 'localhost' ||
    host.includes('127.0.0.1') ||
    host.includes('pgs-dev.terio.dev')
  )
}

export const equipoGpsService = {
  async equipo(): Promise<EquipoRespuesta> {
    const { data } = await client.get<EquipoRespuesta>('/rastreo/monitor/equipo', {
      params: incluirPrueba() ? { incluir_prueba: true } : undefined,
      timeout: 20_000
    })
    return data
  },

  /** La ficha del mapa: qué hace ahora y cómo va el día, sin la ruta. */
  async resumenHoy(gerenteId: number): Promise<ResumenHoy> {
    const { data } = await client.get<ResumenHoy>(`/rastreo/monitor/equipo/${gerenteId}/hoy`, {
      params: { resumen: 1, ...(incluirPrueba() ? { incluir_prueba: true } : {}) },
      timeout: 20_000
    })
    return data
  },

  /** Un día anterior (hasta 30 días), misma ventana 07:00–20:00 y mismo alcance. */
  async recorridoDia(gerenteId: number, fecha: string): Promise<RecorridoHoy> {
    const { data } = await client.get<RecorridoHoy>(`/rastreo/monitor/equipo/${gerenteId}/dia`, {
      params: { fecha, ...(incluirPrueba() ? { incluir_prueba: true } : {}) },
      timeout: 30_000
    })
    return data
  },

  /** Los días con datos de los últimos 30: la tira de días sólo ofrece éstos. */
  async diasConDatos(gerenteId: number): Promise<DiaConDatos[]> {
    const { data } = await client.get<{ dias: DiaConDatos[] }>(`/rastreo/monitor/equipo/${gerenteId}/dias`, {
      params: incluirPrueba() ? { incluir_prueba: true } : undefined,
      timeout: 20_000
    })
    return data.dias
  },

  /** «En vivo»: la última captura con la estela de 15 min; se pide cada 15 s sólo con la pantalla visible. */
  async ultima(gerenteId: number): Promise<UltimaPosicion> {
    const { data } = await client.get<UltimaPosicion>(`/rastreo/monitor/equipo/${gerenteId}/ultima`, {
      params: { estela: 1, ...(incluirPrueba() ? { incluir_prueba: true } : {}) },
      timeout: 12_000
    })
    return data
  },

  async recorridoHoy(gerenteId: number): Promise<RecorridoHoy> {
    const { data } = await client.get<RecorridoHoy>(`/rastreo/monitor/equipo/${gerenteId}/hoy`, {
      params: incluirPrueba() ? { incluir_prueba: true } : undefined,
      timeout: 30_000
    })
    return data
  }
}

/** Mensaje para la pantalla a partir del error de axios; FAX responde `detail` en español. */
export function equipoGpsError(error: unknown, fallback: string): string {
  const response = (error as { response?: { status?: number; data?: { detail?: string } } })?.response
  if (response?.status === 401) return 'Tu sesión venció. Vuelve a entrar.'
  if (response?.status === 403) return response.data?.detail ?? 'Tu cuenta no tiene el módulo de rastreo de equipo.'
  if (response?.data?.detail) return response.data.detail
  if (!navigator.onLine) return 'Sin conexión. Se reintenta al volver la señal.'
  return fallback
}
