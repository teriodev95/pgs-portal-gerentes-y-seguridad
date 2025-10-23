export interface IUser {
  agencia?: string
  apellidoMaterno: string
  apellidoPaterno: string
  createdAt: string
  fechaIngreso: string
  gerencia?: string
  nombre: string
  numeroCelular: string
  pin: string | number
  puedeCobrar: boolean
  puedeVerificarAsignaciones: boolean
  status: boolean
  telegramId?: string
  tipo: IUserType
  updatedAt: string
  usuario: string
  usuarioId: number
}

export interface IAuthLogin {
  username: string
  password: string
}

export type IUserType = 'Seguridad' | 'Regional' | 'Gerente' | string; 