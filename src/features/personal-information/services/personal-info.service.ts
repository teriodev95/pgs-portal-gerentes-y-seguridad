// Service for personal information
import { createApiClientFromPreset } from '@/shared/services/core'
import type { UserContactInfo } from '../types'

class PersonalInfoService {
  private apiClient = createApiClientFromPreset('fastApi')

  /**
   * Get user contact information by username
   * @param username - Usuario (e.g., "ENRIQUE")
   * @returns User contact information
   */
  async getUserContactInfo(username: string) {
    return this.apiClient.get<UserContactInfo>(`/usuarios/contacto/${username}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar datos',
          message: 'No se pudieron cargar los datos personales. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const personalInfoService = new PersonalInfoService()
