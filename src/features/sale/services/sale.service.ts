import { createApiClientFromPreset } from '@/shared/services/core'
import type { Disbursement, SaleDetails } from "../types"

/** Lo que devuelve Elysia en /prestamos/borradores/sin-venta (snake_case). */
interface DisbursementResponse {
  prestamo_id: string
  solicitud_id: string | null
  estado_borrador: string
  nombre_cliente: string
  agencia: string
  gerencia: string
  tipo: 'Nuevo' | 'Renovación'
  nivel: string
  plazo: number
  monto: number
  primer_pago: number
  semana: number
  anio: number
}

class SalesService {
  private faxClient = createApiClientFromPreset('fastApi')
  private elysiaClient = createApiClientFromPreset('elysia')

  /** Desembolsos de la gerencia y semana que aun no se registraron como venta. */
  async getDisbursements(gerencia: string, anio: number, semana: number): Promise<Disbursement[]> {
    const { data } = await this.elysiaClient.get<{ data: DisbursementResponse[] }>(
      `/prestamos/borradores/sin-venta?gerencia=${gerencia}&anio=${anio}&semana=${semana}`,
      {
        meta: {
          errorNotification: {
            title: 'Error al cargar desembolsos',
            message: 'No se pudieron cargar los desembolsos de la semana. Puedes capturar la venta a mano.',
            type: 'error'
          }
        }
      }
    )

    return (data?.data ?? []).map((item) => ({
      prestamoId: item.prestamo_id,
      solicitudId: item.solicitud_id,
      estadoBorrador: item.estado_borrador,
      nombreCliente: item.nombre_cliente,
      agencia: item.agencia,
      gerencia: item.gerencia,
      tipo: item.tipo,
      nivel: item.nivel,
      plazo: item.plazo,
      monto: item.monto,
      primerPago: item.primer_pago,
      semana: item.semana,
      anio: item.anio
    }))
  }

  async createSale(sale: SaleDetails) {
    return this.faxClient.post(`/ventas/`, sale, {
      meta: {
        successNotification: {
          mainText: '¡Venta registrada!',
          secondaryText: 'La venta se ha creado exitosamente'
        },
        errorNotification: {
          title: 'Error al registrar venta',
          message: 'No se pudo registrar la venta. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getSales(managment: string, year: number, week: number) {
    return this.faxClient.get<SaleDetails[]>(`/ventas/?gerencia=${managment}&anio=${year}&semana=${week}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar ventas',
          message: 'No se pudieron cargar las ventas. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const salesService = new SalesService()
