import { BASE_ERROR_MESSAGES } from '@/shared/constants/base-error-messages'

export const AUTH_ERROR_MESSAGES = {
  LOGIN_FAILED: 'Usuario o contraseña incorrectos',
  FORM_INCOMPLETE: 'Por favor complete todos los campos',
  ROLE_NOT_AUTHORIZED: 'No puedes ingresar a PGS porque tu cuenta no tiene el rol requerido. Solo usuarios con roles de Gerente, Seguridad o Regional pueden acceder a esta aplicación.',
  ...BASE_ERROR_MESSAGES
} as const

export type AuthErrorType = keyof typeof AUTH_ERROR_MESSAGES