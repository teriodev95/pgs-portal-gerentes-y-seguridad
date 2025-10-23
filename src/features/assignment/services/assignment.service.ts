import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  INewAssignment,
  IUserVerificationPin,
  ICreateAssignment,
} from '@/features/assignment/types'

class AssignmentService {
  private apiClient = createApiClientFromPreset('fastApi')

  async getAssignmentsByAgency(agency: string, week: number, anio: number) {
    return this.apiClient.get<INewAssignment[]>(`/asignaciones/?skip=0&limit=100&agencia=${agency}&semana=${week}&anio=${anio}`)
  }

  async getAssignmentsAsIncome(management: string, week: number, anio: number) {
    return this.apiClient.get<INewAssignment[]>(
      `/asignaciones/?skip=0&limit=100&gerencia_recibe=${management}&semana=${week}&anio=${anio}`
    )
  }

  async getAssignmentsAsExpense(management: string, week: number, anio: number) {
    return this.apiClient.get<INewAssignment[]>(
      `/asignaciones/?skip=0&limit=100&gerencia_entrega=${management}&semana=${week}&anio=${anio}`
    )
  }

  async verificationByPin(pin: string) {
    return this.apiClient.get<IUserVerificationPin>(`/usuarios/pin/${pin}`)
  }

  async createAssignment(data: ICreateAssignment) {
    return this.apiClient.post<ICreateAssignment>(`/asignaciones/`, data)
  }
}

export const assignmentService = new AssignmentService()