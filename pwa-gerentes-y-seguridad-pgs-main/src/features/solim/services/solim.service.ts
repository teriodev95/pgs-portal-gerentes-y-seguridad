import { createApiClientFromPreset } from '@/shared/services/core'
import type { ApiResponse, UpdateCheckStatus } from "../types"
import type { GetBaseProps } from "@/interfaces"

class SolimService {
  private apiClient = createApiClientFromPreset('elysia')

  async getLoanApplications({ year, managment, week }: GetBaseProps) {
    return this.apiClient.get<ApiResponse>(`/solicitudes/solicitudesByParams?gerencia=${managment}&semana=${week}&anio=${year}`)
  }

  async updateLoanApplicationStatus(updateCheckStatus: UpdateCheckStatus) {
    return this.apiClient.post(`/solicitudes/updateCheck`, updateCheckStatus)
  }
}

export const solimService = new SolimService()
