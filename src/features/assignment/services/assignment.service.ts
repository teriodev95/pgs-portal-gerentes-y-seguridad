import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  INewAssignment,
  IUserVerificationPin,
  ICreateAssignment,
  ICustodyAssignmentsResponse,
  IReturnCustodyPayload,
} from '@/features/assignment/types'

interface ApiSuccess<T> {
  success: true
  message: string
  data: T
}

interface CustodyAssignmentApi {
  origen_asignacion_id: string
  monto: number
  /** lo que sigue en custodia tras retornos parciales; ausente en API vieja */
  saldo?: number
  agencia: string | null
  gerencia_derivada: string
  nivel: 'agente' | 'gerencia'
  semana: number
  anio: number
  estado: 'pendiente' | 'retornado'
  created_at: string
  agente: ICustodyAssignmentsResponse['assignments'][number]['agent']
  custodio: ICustodyAssignmentsResponse['assignments'][number]['custodian']
}

interface CustodyAssignmentsApiResponse {
  semana: number
  anio: number
  total: number
  asignaciones: CustodyAssignmentApi[]
}

function mapCustodyAssignments(data: CustodyAssignmentsApiResponse): ICustodyAssignmentsResponse {
  return {
    week: data.semana,
    year: data.anio,
    total: data.total,
    assignments: data.asignaciones.map((assignment) => ({
      originAssignmentId: assignment.origen_asignacion_id,
      amount: assignment.saldo ?? assignment.monto,
      originalAmount: assignment.monto,
      agency: assignment.agencia,
      derivedManagement: assignment.gerencia_derivada,
      level: assignment.nivel ?? 'agente',
      week: assignment.semana,
      year: assignment.anio,
      status: assignment.estado,
      createdAt: assignment.created_at,
      agent: assignment.agente,
      custodian: assignment.custodio,
    }))
  }
}

class AssignmentService {
  private apiClient = createApiClientFromPreset('fastApi')
  private elysiaClient = createApiClientFromPreset('elysia')

  async getAssignmentsByAgency(agency: string, week: number, anio: number) {
    return this.apiClient.get<INewAssignment[]>(`/asignaciones/?skip=0&limit=100&agencia=${agency}&semana=${week}&anio=${anio}`, {
      meta: {
        errorNotification: {
          title: 'Error al obtener asignaciones',
          message: 'No se pudieron cargar las asignaciones de la agencia. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getAssignmentsAsIncome(management: string, week: number, anio: number) {
    return this.apiClient.get<INewAssignment[]>(
      `/asignaciones/?skip=0&limit=100&gerencia_recibe=${management}&semana=${week}&anio=${anio}`,
      {
        meta: {
          errorNotification: {
            title: 'Error al obtener asignaciones de ingreso',
            message: 'No se pudieron cargar las asignaciones de ingreso. Por favor, intenta nuevamente.',
            type: 'error'
          }
        }
      }
    )
  }

  async getAssignmentsAsExpense(management: string, week: number, anio: number) {
    return this.apiClient.get<INewAssignment[]>(
      `/asignaciones/?skip=0&limit=100&gerencia_entrega=${management}&semana=${week}&anio=${anio}`,
      {
        meta: {
          errorNotification: {
            title: 'Error al obtener asignaciones de egreso',
            message: 'No se pudieron cargar las asignaciones de egreso. Por favor, intenta nuevamente.',
            type: 'error'
          }
        }
      }
    )
  }

  async verificationByPin(pin: string) {
    return this.apiClient.get<IUserVerificationPin>(`/usuarios/pin/${pin}`, {
      meta: {
        errorNotification: {
          title: 'Error al verificar PIN',
          message: 'No se pudo verificar el PIN ingresado. Verifica que sea correcto e intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async createAssignment(data: ICreateAssignment) {
    return this.apiClient.post<ICreateAssignment>(`/asignaciones/`, data, {
      meta: {
        successNotification: {
          mainText: '¡Asignación creada!',
          secondaryText: 'La asignación se ha registrado exitosamente'
        },
        errorNotification: {
          title: 'Error al crear asignación',
          message: 'No se pudo crear la asignación. Verifica los datos e intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getCustodyAssignments() {
    const response = await this.elysiaClient.get<ApiSuccess<CustodyAssignmentsApiResponse>>(
      '/asignaciones/custodia',
      {
        meta: {
          errorNotification: {
            title: 'Error al obtener custodia',
            message: 'No se pudo cargar el efectivo en custodia. Intenta nuevamente.',
            type: 'error'
          }
        }
      }
    )

    return mapCustodyAssignments(response.data.data)
  }

  async returnCustodyAssignments(payload: IReturnCustodyPayload) {
    return this.elysiaClient.post('/asignaciones/custodia/retornar', payload, {
      meta: {
        successNotification: {
          mainText: 'Efectivo retornado',
          secondaryText: 'El retorno quedó registrado correctamente'
        },
        errorNotification: {
          title: 'Error al retornar custodia',
          message: 'No se pudo registrar el retorno. Revisa la asignación seleccionada y el PIN del receptor.',
          type: 'error'
        }
      }
    })
  }
}

export const assignmentService = new AssignmentService()
