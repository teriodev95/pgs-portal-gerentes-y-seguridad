import { createApiClientFromPreset } from '@/shared/services/core'
import type { PendientesGerencia, RegistrarEntregaPayload } from '../types'

class PromissoryNoteService {
  private apiElysia = createApiClientFromPreset('elysia')

  /**
   * [GET] /pagares/pendientes -> Los pagares que el gerente trae sin retornar.
   *
   * Es la lista corta y exacta de lo que tiene en la mano. Antes esta pantalla
   * pedia `/pagares/search` por gerencia, que devuelve el historico completo
   * cortado a 50 por fecha de creacion: el gerente veia papel que no trae.
   */
  async getPendientes(gerencia: string) {
    const { data } = await this.apiElysia.get<{ data: PendientesGerencia }>('/pagares/pendientes', {
      params: { gerencia },
      meta: {
        errorNotification: {
          title: 'Error al cargar pagarés',
          message: 'No se pudieron cargar tus pagarés por entregar. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
    return data.data
  }

  /**
   * [PATCH] /pagares/by-id-sistemas/:idSistemas -> Registra la entrega al cliente.
   *
   * Va por `id_sistemas` y no por el id numerico porque es la llave que trae la
   * lista de pendientes, la misma con la que oficina marca el retorno.
   */
  async registrarEntrega(
    idSistemas: string,
    payload: RegistrarEntregaPayload,
    onSuccess?: () => void
  ) {
    const { data } = await this.apiElysia.patch<{ data: { updated_fields: string[] } }>(
      `/pagares/by-id-sistemas/${encodeURIComponent(idSistemas)}`,
      payload,
      {
        meta: {
          successNotification: {
            mainText: '¡Entrega registrada!',
            secondaryText: 'Oficina ya puede ver quién recibió el pagaré.',
            ctaText: 'Continuar',
            onClose: onSuccess
          },
          errorNotification: {
            title: 'Error al registrar la entrega',
            message: 'No se pudo guardar la entrega. Por favor, intenta nuevamente.',
            type: 'error'
          }
        }
      }
    )
    return data.data
  }
}

export const promissoryNoteService = new PromissoryNoteService()
