import { createApiClientFromPreset } from '@/shared/services/core'
import type { IAdelantadoApiResponse } from '../types'

class PagosAdelantadosService {
  // Los pagos adelantados los atiende xpress-elysia; toda la lógica vive en
  // sp_marcar_semanas_adelantado (BD). El preview es un dry-run del MISMO SP:
  // el front no calcula nada. Errores de negocio (400) traen el mensaje del
  // SP listo para mostrarse — el Drawer los pinta inline, sin diálogo global.
  private apiClient = createApiClientFromPreset('elysia')

  async preview(pagoId: string, usuario: string) {
    return this.apiClient.get<IAdelantadoApiResponse>(
      `/pagos-adelantados/preview?pagoId=${encodeURIComponent(pagoId)}&usuario=${encodeURIComponent(usuario)}`,
      { meta: { skipErrorNotification: true } }
    )
  }

  async confirmar(pagoId: string, usuario: string) {
    return this.apiClient.post<IAdelantadoApiResponse>(
      `/pagos-adelantados`,
      { pagoId, usuario },
      { meta: { skipErrorNotification: true } }
    )
  }
}

export const pagosAdelantadosService = new PagosAdelantadosService()
