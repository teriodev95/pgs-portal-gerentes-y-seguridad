export const AUTH_ERROR_MESSAGES = {
  LOGIN_FAILED: 'Usuario o contraseña incorrectos',
  PIN_INVALID: 'PIN inválido. Intente nuevamente',
  PIN_REQUIRED: 'El PIN es requerido',
  USERNAME_REQUIRED: 'El nombre de usuario es requerido',
  PASSWORD_REQUIRED: 'La contraseña es requerida',
  FORM_INCOMPLETE: 'Por favor complete todos los campos',
  ROLE_NOT_AUTHORIZED: 'No puedes ingresar a PGS porque tu cuenta no tiene el rol requerido. Solo usuarios con roles de Gerente, Seguridad o Regional pueden acceder a esta aplicación.',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type AuthErrorType = keyof typeof AUTH_ERROR_MESSAGES