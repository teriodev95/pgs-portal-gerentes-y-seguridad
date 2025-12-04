import { createApiClientFromPreset } from '@/shared/services/core'
import type { IAuthLogin, IUser, IUserElysia} from '../types/auth.types'

class AuthService {
  private apiElysia = createApiClientFromPreset('elysia')

  async authLogin(params: IAuthLogin) {
    const { data } = await this.apiElysia.post<IUserElysia>('/auth/usuario', params)
    const mappedUser: IUser = {
      agencia: data.Agencia,
      apellidoMaterno: data.Apellido_Materno,
      apellidoPaterno: data.Apellido_Paterno,
      createdAt: data.Created_at,
      fechaIngreso: data.Fecha_ingreso,
      gerencia: data.Gerencia,
      nombre: data.Nombre,
      numeroCelular: data.Numero_celular,
      pin: data.Pin,
      puedeCobrar: data.Puede_cobrar,
      puedeVerificarAsignaciones: data.Puede_verificar_asignaciones,
      status: data.Status,
      telegramId: data.Telegram_id,
      tipo: data.Tipo,
      updatedAt: data.Updated_at,
      usuario: data.Usuario,
      usuarioId: data.UsuarioID
    }
    return { 
      user: mappedUser,
      token: data.token
    } 
  }
}

export const authService = new AuthService()