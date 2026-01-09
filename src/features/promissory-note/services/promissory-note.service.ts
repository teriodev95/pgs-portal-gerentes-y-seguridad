import { createApiClientFromPreset } from '@/shared/services/core'
import type { Pagare, SearchPagaresPayload, ActualizarPagarePayload } from '../types'

class PromissoryNoteService {
  private apiElysia = createApiClientFromPreset('elysia')

  /**
   * [GET] /pagares -> Obtener pagarés por gerencia
   * Ejemplo: Obtener todos los pagarés de una gerencia específica
   */
  async getPagaresByGerencia(gerencia: string, page = 1, limit = 50) {
    const payload: SearchPagaresPayload = {
      filter: {
        type: 'rule',
        field: 'gerencia',
        operator: '=',
        value: gerencia
      },
      page,
      limit,
      sortBy: 'created_at',
      order: 'desc'
    }

    const { data } = await this.apiElysia.post<{ data: Pagare[] }>('/pagares/search', payload)
    return data.data
  }

  /**
   * [GET] /pagares/:id -> Obtener información completa de un pagaré específico
   */
  async getPagareById(id: string) {
    const { data } = await this.apiElysia.get<{ data: Pagare }>(`/pagares/${id}`)
    return data.data
  }

  /**
   * [PATCH] /pagares/:id -> Actualizar información del pagaré
   */
  async updatePagare(id: string, payload: ActualizarPagarePayload) {
    const { data } = await this.apiElysia.patch<{ data: { updated_fields: string[] } }>(
      `/pagares/${id}`,
      payload
    )
    return data.data
  }
}

export const promissoryNoteService = new PromissoryNoteService()
