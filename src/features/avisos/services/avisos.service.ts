import { createApiClientFromPreset } from '@/shared/services/core'
import type { Aviso, AvisosResponse, AvisosVista } from '../types/avisos.types'

interface ListParams {
  vista?: AvisosVista
  /** `siguiente` de la página anterior. */
  antes?: string | null
  limite?: number
}

class AvisosService {
  private apiClient = createApiClientFromPreset('elysia')

  async list({ vista, antes, limite }: ListParams = {}): Promise<AvisosResponse> {
    const params = new URLSearchParams({ dias: '30' })
    if (vista) params.set('vista', vista)
    if (antes) params.set('antes', antes)
    if (limite) params.set('limite', String(limite))

    const response = await this.apiClient.get<AvisosResponse & { success: boolean }>(`/avisos?${params}`)
    return {
      data: response.data?.data ?? [],
      no_leidos: response.data?.no_leidos ?? 0,
      siguiente: response.data?.siguiente ?? null
    }
  }

  async markRead(id: Aviso['id']): Promise<void> {
    await this.apiClient.patch(`/avisos/${encodeURIComponent(id)}/leido`)
  }

  async markAllRead(): Promise<void> {
    await this.apiClient.patch('/avisos/leidos')
  }
}

export const avisosService = new AvisosService()
