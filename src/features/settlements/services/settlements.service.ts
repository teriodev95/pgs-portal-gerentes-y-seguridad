import { createApiClientFromPreset } from '@/shared/services/core'
import type { Liquidacion, settlementDetails, PayloadCreateSettlement, ISpecialSettlement, IPayloadSpecialSettlement } from '../types'

class SettlementsService {

  private apiJavalin = createApiClientFromPreset('javalin')
  private apiElysia = createApiClientFromPreset('elysia')
  private apiFax = createApiClientFromPreset('fastApi')

  async getLiquidacion(id: string) {
    const { data } = await this.apiJavalin.get<settlementDetails>(`/liquidaciones/prestamo/${id}`)
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
    return this.apiElysia.post<string>(`/liquidaciones/`, dataMapped)
  }


  async getSpecialSettlement(id : string) {
    return this.apiJavalin.get<ISpecialSettlement>(`/liquidaciones-especiales/prestamo/${id}`)    
  }

  async createSpecialSettlement(data: IPayloadSpecialSettlement) {
    return this.apiFax.post<string>(`/liquidaciones/especiales`, data)
  }
}

export const settlementsService = new SettlementsService()