export const WEEKLY_CLOSE_ERROR_MESSAGES = {
  // General errors
  AGENCY_USER_DATA_UNAVAILABLE: 'Datos de agencia o usuario no disponibles',
  WEEKLY_CLOSE_LOAD_FAILED: 'Error cargando datos del cierre semanal',
  WEEKLY_CLOSE_SAVE_FAILED: 'Error guardando el cierre semanal',
  INCOMPLETE_DATA_ERROR: 'Datos incompletos para guardar el cierre',
  SAVE_VALUE_ERROR: 'Error al guardar el valor',

  // API errors
  WEEKLY_CLOSE_GET_FAILED: 'No se pudo obtener el cierre semanal',
  WEEKLY_CLOSE_CREATE_FAILED: 'No se pudo crear el cierre semanal',
  COMMISSION_CREATE_FAILED: 'No se pudo crear la comisión',

  // Modal and validation errors
  MODAL_CONFIG_NOT_FOUND: 'Configuración no encontrada para el campo',
  MODAL_CONTEXT_UNAVAILABLE: 'No hay contexto de modal o cierre semanal disponible',
  UPDATE_FUNCTION_NOT_FOUND: 'No se encontró función de actualización para el campo',
  MODAL_SAVE_ERROR: 'Error guardando valor del modal',
  VALIDATION_ERROR: 'Error de validación',

  // Security and PIN errors
  NO_SECURITY_PIN: 'No hay un PIN de seguridad Activo. Por favor, solicite uno.',
  INVALID_OR_EXPIRED_PIN: 'PIN incorrecto o caducado. Verifica con el encargado de seguridad.',
  INCORRECT_SECURITY_PIN: 'PIN de seguridad incorrecto',

  // Submission flow errors
  CONFIRMATION_REQUIRED: 'Debes confirmar el cierre semanal para continuar.',
  SUBMISSION_FAILED: 'Error al realizar el cierre semanal',

  // Camera and video errors
  VIDEO_UPLOAD_ERROR: 'Error al subir el video',
  VERIFICATION_ERROR: 'Error en la Verificación',
  VIDEO_UPLOAD_FALLBACK: 'hubo un error en la subida',

  // Network errors
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type WeeklyCloseErrorType = keyof typeof WEEKLY_CLOSE_ERROR_MESSAGES