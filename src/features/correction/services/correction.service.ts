import { createApiClientFromPreset } from '@/shared/services/core'
import type { CorrectionRequest } from '../types'

class CorrectionService {
  private apiClient = createApiClientFromPreset('hono')

  async correctionsCreateOne(correction: CorrectionRequest) {
    return this.apiClient.post(`/correcciones`, correction)
  }
}

export const correctionService = new CorrectionService()