import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  SoliFilterRequest,
  SoliFilterResponse,
  SoliFilterListResponse,
} from '../types/soliFilter.types'

class SoliFilterService {
  private apiClient = createApiClientFromPreset('elysia')

  async enviarSolicitud(request: SoliFilterRequest) {
    const formData = new FormData()

    formData.append('ine_cliente', request.ineCliente)
    formData.append('comprobante_cliente', request.comprobanteCliente)
    formData.append('ine_aval', request.ineAval)
    formData.append('comprobante_aval', request.comprobanteAval)

    formData.append('tabla_cargos_id', String(request.tablaCargosId))
    formData.append('agencia', request.agencia)
    formData.append('gerencia', request.gerencia)
    formData.append('semana', String(request.semana))
    formData.append('anio', String(request.anio))
    formData.append('tipo_credito', request.tipoCredito)

    return this.apiClient.post<SoliFilterResponse>('/solicitud-filtro', formData, {
      timeout: 60000,
    })
  }

  async getSolicitudes(gerencia: string) {
    return this.apiClient.get<SoliFilterListResponse>('/solicitud-filtro', {
      params: { gerencia },
    })
  }

  async getSolicitudById(id: number) {
    return this.apiClient.get<SoliFilterResponse>(`/solicitud-filtro/${id}`)
  }
}

export const soliFilterService = new SoliFilterService()
