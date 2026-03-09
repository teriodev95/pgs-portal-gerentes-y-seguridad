import { createApiClientFromPreset } from '@/shared/services/core'
import type { GetBaseProps } from "@/interfaces"
import type {
  LoanRequestDetailResponse,
  LoanRequestsListResponse,
  ApprovalType,
  TablaCargosOptionsResponse,
  UpdateCheckPayload
} from '../types'

class SolimService {
  private apiClient = createApiClientFromPreset('elysia')

  async getLoanApplications({
    year,
    managment,
    week,
    agency
  }: GetBaseProps & { agency?: string }) {
    const params = new URLSearchParams()
    params.set('semana', String(week))
    params.set('anio', String(year))
    params.set('status_revision', 'pendiente')

    if (managment) {
      params.set('gerencia', managment)
    }

    if (agency) {
      params.set('agencia', agency)
    }

    return this.apiClient.get<LoanRequestsListResponse>(
      `/solicitudes-app?${params.toString()}`
    )
  }

  async getLoanApplicationDetail(id: string) {
    return this.apiClient.get<LoanRequestDetailResponse>(`/solicitudes-app/${id}`)
  }

  async getTablaCargos() {
    return this.apiClient.get<TablaCargosOptionsResponse>('/tabla-cargos')
  }

  async updateLoanApplicationCheck(id: string, type: ApprovalType, payload: UpdateCheckPayload) {
    return this.apiClient.patch(`/solicitudes-app/${id}/check/${type}`, payload)
  }
}

export const solimService = new SolimService()
