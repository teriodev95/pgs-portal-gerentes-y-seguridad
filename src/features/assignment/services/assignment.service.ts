import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  INewAssignment,
  IUserVerificationPin,
  ICreateAssignment,
} from '@/features/assignment/types'

class AssignmentService {
  private apiClient = createApiClientFromPreset('fastApi')

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
}

export const assignmentService = new AssignmentService()