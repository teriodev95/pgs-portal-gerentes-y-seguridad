import { createApiClientFromPreset } from '@/shared/services/core'
import type { Liquidacion, settlementDetails } from '../types'

class SettlementsService {
  private apiClient = createApiClientFromPreset('main')
  private apiJavalin = createApiClientFromPreset('javalin')

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

  async createLiquidacion(data: Liquidacion) {
    return this.apiClient.post<string>(`/pwa/payoffs/create-one`, data)
  }
}

export const settlementsService = new SettlementsService()