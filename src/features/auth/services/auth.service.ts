import { createApiClientFromPreset } from '@/shared/services/core'
import type { IAuthLogin, IUser } from '../types/auth.types'

class AuthService {
  private apiClient = createApiClientFromPreset('main')

  async authLogin(params: IAuthLogin) {
    return this.apiClient.post<IUser>('/pwa/login', params)
  }
}

export const authService = new AuthService()