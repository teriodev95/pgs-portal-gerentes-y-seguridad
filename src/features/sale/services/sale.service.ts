import { createApiClientFromPreset } from '@/shared/services/core'
import type { ApprovedRequest, SaleDetails, SecurityStaff } from "../types"

/** Lo que devuelve Elysia en /solicitudes-app/listas-sin-venta (snake_case). */
interface ApprovedRequestResponse {
  solicitud_id: string
  status: string
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

  /** Solicitudes con todos los vistos buenos que aun no se registraron como venta. */
  async getApprovedRequests(gerencia: string, anio: number, semana: number): Promise<ApprovedRequest[]> {
    const { data } = await this.elysiaClient.get<{ data: ApprovedRequestResponse[] }>(
      `/solicitudes-app/listas-sin-venta?gerencia=${gerencia}&anio=${anio}&semana=${semana}`,
      {
        meta: {
          errorNotification: {
            title: 'Error al cargar solicitudes',
            message: 'No se pudieron cargar las solicitudes aprobadas. Puedes capturar la venta a mano.',
            type: 'error'
          }
        }
      }
    )

    return (data?.data ?? []).map((item) => ({
      solicitudId: item.solicitud_id,
      status: item.status,
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

  /** Seguridad y Regionales ligados a la gerencia (GerenciaID moderno, el de gerenciaSelected). */
  async getSecurityStaff(gerencia: string): Promise<SecurityStaff[]> {
    const { data } = await this.faxClient.get<SecurityStaff[]>(`/usuarios/seguridad?gerencia=${gerencia}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar Seguridad',
          message: 'No se pudo cargar quién de Seguridad o Regional cubre la gerencia.',
          type: 'error'
        }
      }
    })
    return data ?? []
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
