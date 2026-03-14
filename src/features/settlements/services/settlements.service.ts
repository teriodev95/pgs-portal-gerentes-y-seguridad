import { createApiClientFromPreset } from '@/shared/services/core'
import type { Liquidacion, settlementDetails, PayloadCreateSettlement, ISpecialSettlement, IPayloadSpecialSettlement } from '../types'

class SettlementsService {

  private apiJavalin = createApiClientFromPreset('javalin')
  private apiElysia = createApiClientFromPreset('elysia')
  private apiFax = createApiClientFromPreset('fastApi')

  async getLiquidacion(id: string) {
    const { data } = await this.apiJavalin.get<settlementDetails>(`/liquidaciones/prestamo/${id}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar liquidación',
          message: 'No se pudo cargar la información de la liquidación. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
    const dataMapped: Liquidacion = {
      cargo: data.cargo,
      cliente: data.cliente,
      cobrado: data.cobrado,
      descuentoDinero: data.descuento_dinero,
      descuentoPorcentaje: data.descuento_porcentaje,
      entregado: data.monto_otorgado,
      identificador: data.identificador,
      liquidaCon: data.liquida_con,
      montoTotal: data.total_a_pagar,
      prestamoId: data.prestamo_id,
      saldo: data.saldo,
      semanasTranscurridas: data.semanas_transcurridas,
      semEntrega: `#${data.sem_entrega}-${data.anio_actual}`,
    }

    return dataMapped
  }

  async createSettlement(data: Liquidacion) {
    const dataMapped: PayloadCreateSettlement = {
      prestamo_id: data.prestamoId,
      recuperado_por: data.recuperadoPor as string,
      comentario: data.quienPago as string,
    }

    // El interceptor elysiaAuthInterceptor se encarga automáticamente de agregar el token
    return this.apiElysia.post<string>(`/liquidaciones/`, dataMapped, {
      meta: {
        successNotification: {
          mainText: 'Liquidación exitosa',
          secondaryText: `Se guardó con éxito la liquidación de ${data.cliente}`
        },
        errorNotification: {
          title: 'Error al crear liquidación',
          message: 'No se pudo procesar la liquidación. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }


  async getSpecialSettlement(id : string) {
    return this.apiJavalin.get<ISpecialSettlement>(`/liquidaciones-especiales/prestamo/${id}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar liquidación especial',
          message: 'No se pudo cargar la información de la liquidación especial. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async createSpecialSettlement(data: IPayloadSpecialSettlement) {
    return this.apiFax.post<string>(`/liquidaciones/especiales`, data, {
      meta: {
        successNotification: {
          mainText: '¡Liquidación especial procesada!',
          secondaryText: 'La liquidación especial se completó exitosamente'
        },
        errorNotification: {
          title: 'Error al crear liquidación especial',
          message: 'No se pudo procesar la liquidación especial. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const settlementsService = new SettlementsService()