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

export interface IUserElysia {
  Agencia: string;
  Apellido_Materno: string;
  Apellido_Paterno: string;
  Created_at: string;
  Fecha_ingreso: string;
  Gerencia: string;
  Nombre: string;
  Numero_celular: string;
  Pin: number;
  Puede_cobrar: boolean;
  Puede_verificar_asignaciones: boolean;
  Status: boolean;
  sucursales: string[];
  Telegram_id: string;
  Tipo: string;
  token: string;
  Updated_at: string;
  Usuario: string;
  UsuarioID: number;
} 

export interface IAuthLogin {
  usuario: string
  pin: string
}

export type IUserType = 'Seguridad' | 'Regional' | 'Gerente' | string; 