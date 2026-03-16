import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  SoliFilterRequest,
  SoliFilterResponse,
  SoliFilterListResponse,
  TablaCargosResponse,
  ITablaCargosMcp
} from '../types/soliFilter.types'

class SoliFilterService {
  private apiClient = createApiClientFromPreset('elysia')
  private mcpClient = createApiClientFromPreset('mcp')

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
      meta: {
        errorNotification: {
          title: 'Error al enviar solicitud',
          message: 'No se pudo procesar la solicitud de filtro. Por favor, verifica los documentos e intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getSolicitudes(gerencia: string) {
    return this.apiClient.get<SoliFilterListResponse>('/solicitud-filtro', {
      params: { gerencia },
      meta: {
        errorNotification: {
          title: 'Error al cargar solicitudes',
          message: 'No se pudieron cargar las solicitudes de filtro. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getSolicitudById(id: number) {
    return this.apiClient.get<SoliFilterResponse>(`/solicitud-filtro/${id}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar solicitud',
          message: 'No se pudo cargar la información de la solicitud. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getTablaCargos() {
    return this.apiClient.get<TablaCargosResponse>('/tabla-cargos', {
      meta: {
        errorNotification: {
          title: 'Error al cargar tabla de cargos',
          message: 'No se pudo cargar la tabla de cargos. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async resubirDocumento(id: number, docKey: string, imagen: File) {
    const formData = new FormData()
    formData.append('imagen', imagen)

    return this.apiClient.patch(`/solicitud-filtro/${id}/documento/${docKey}`, formData, {
      timeout: 30000,
      meta: {
        errorNotification: {
          title: 'Error al resubir documento',
          message: 'No se pudo actualizar el documento. Por favor, verifica el archivo e intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }


  async obtenerCargosDesdeMCP(id: number) {
    const query = `
      SELECT
       *
      FROM tabla_cargos
      where id = ${id}
    `
    return this.mcpClient.post<ITablaCargosMcp>('/run_query', { query }, {
      meta: {
        errorNotification: {
          title: 'Error al cargar cargos desde MCP',
          message: 'No se pudieron obtener los cargos desde la base de datos. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const soliFilterService = new SoliFilterService()
